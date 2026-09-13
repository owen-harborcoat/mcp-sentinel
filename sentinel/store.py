"""Durable events, atomic alert deduplication and at-most-one delivery attempts."""
import json
import sqlite3
from contextlib import contextmanager
from datetime import UTC, datetime
from pathlib import Path

from sentinel.models import SEVERITIES


def now():
    return datetime.now(UTC).isoformat()


class Store:
    def __init__(self, path):
        self.path = str(path)
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as db:
            db.executescript("""
            PRAGMA journal_mode=WAL;
            CREATE TABLE IF NOT EXISTS scans(id TEXT PRIMARY KEY, scenario TEXT, runtime TEXT,
                assessor TEXT, status TEXT, created_at TEXT, completed_at TEXT, result TEXT, error TEXT);
            CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT,
                scan_id TEXT, kind TEXT, severity TEXT, detail TEXT, data TEXT);
            CREATE TABLE IF NOT EXISTS alerts(id INTEGER PRIMARY KEY AUTOINCREMENT,
                fingerprint TEXT UNIQUE, scan_id TEXT, severity TEXT, title TEXT, rationale TEXT,
                recommendation TEXT, evidence_ids TEXT, status TEXT, occurrences INTEGER,
                generation INTEGER, created_at TEXT, updated_at TEXT, provenance TEXT);
            CREATE TABLE IF NOT EXISTS deliveries(id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert_id INTEGER, generation INTEGER, channel TEXT, status TEXT, detail TEXT,
                provider_id TEXT, created_at TEXT, updated_at TEXT,
                UNIQUE(alert_id,generation,channel));
            """)
            db.execute("UPDATE scans SET status='interrupted', error='Process stopped during scan' "
                       "WHERE status='running'")
            db.execute("UPDATE deliveries SET status='unknown', detail='Interrupted during delivery; "
                       "check provider before retrying' WHERE status='sending'")

    @contextmanager
    def connect(self):
        db = sqlite3.connect(self.path, timeout=10)
        db.row_factory = sqlite3.Row
        try:
            with db:
                yield db
        finally:
            db.close()

    @staticmethod
    def decode(row, fields=()):
        value = dict(row)
        for key in fields:
            if value.get(key):
                value[key] = json.loads(value[key])
        return value

    def event(self, scan_id, kind, detail, severity="info", data=None):
        with self.connect() as db:
            db.execute("INSERT INTO events(ts,scan_id,kind,severity,detail,data) VALUES(?,?,?,?,?,?)",
                       (now(), scan_id, kind, severity, detail, json.dumps(data or {})))

    def create_scan(self, scan_id, request):
        with self.connect() as db:
            db.execute("INSERT INTO scans VALUES(?,?,?,?,?,?,?,?,?)",
                       (scan_id, request.scenario, request.runtime, request.assessor,
                        "running", now(), None, None, None))

    def finish_scan(self, scan_id, result=None, error=None):
        with self.connect() as db:
            db.execute("UPDATE scans SET status=?,completed_at=?,result=?,error=? WHERE id=?",
                       ("failed" if error else "completed", now(),
                        json.dumps(result) if result is not None else None, error, scan_id))

    def scans(self):
        with self.connect() as db:
            rows = db.execute("SELECT * FROM scans ORDER BY created_at DESC LIMIT 100").fetchall()
        return [self.decode(r, ("result",)) for r in rows]

    def scan(self, scan_id):
        with self.connect() as db:
            row = db.execute("SELECT * FROM scans WHERE id=?", (scan_id,)).fetchone()
        return self.decode(row, ("result",)) if row else None

    def events(self, since=0, limit=200):
        with self.connect() as db:
            rows = db.execute("SELECT * FROM events WHERE id>? ORDER BY id LIMIT ?",
                              (since, limit)).fetchall()
        return [self.decode(r, ("data",)) for r in rows]

    def alerts(self):
        with self.connect() as db:
            rows = db.execute("SELECT * FROM alerts ORDER BY updated_at DESC LIMIT 200").fetchall()
        return [self.decode(r, ("evidence_ids",)) for r in rows]

    def alert(self, alert_id):
        with self.connect() as db:
            row = db.execute("SELECT * FROM alerts WHERE id=?", (alert_id,)).fetchone()
        return self.decode(row, ("evidence_ids",)) if row else None

    def upsert_alert(self, scan_id, fingerprint, judgment, provenance):
        stamp = now()
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            old = db.execute("SELECT * FROM alerts WHERE fingerprint=?", (fingerprint,)).fetchone()
            if old:
                reopening = (old["status"] == "resolved" or
                             SEVERITIES[judgment.severity] > SEVERITIES[old["severity"]])
                db.execute("""UPDATE alerts SET scan_id=?,severity=?,title=?,rationale=?,
                    recommendation=?,evidence_ids=?,occurrences=occurrences+1,status=?,
                    generation=generation+?,updated_at=? WHERE id=?""",
                    (scan_id, judgment.severity, judgment.title, judgment.rationale,
                     judgment.recommendation, json.dumps(judgment.evidence_ids),
                     "open" if reopening else old["status"], int(reopening), stamp, old["id"]))
                alert_id = old["id"]
            else:
                cur = db.execute("""INSERT INTO alerts(fingerprint,scan_id,severity,title,rationale,
                    recommendation,evidence_ids,status,occurrences,generation,created_at,updated_at,
                    provenance) VALUES(?,?,?,?,?,?,?,'open',1,1,?,?,?)""",
                    (fingerprint, scan_id, judgment.severity, judgment.title, judgment.rationale,
                     judgment.recommendation, json.dumps(judgment.evidence_ids), stamp, stamp, provenance))
                alert_id = cur.lastrowid
        return self.alert(alert_id), old is None or reopening

    def transition(self, alert_id, action):
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            row = db.execute("SELECT * FROM alerts WHERE id=?", (alert_id,)).fetchone()
            if not row:
                raise KeyError(alert_id)
            target = {"acknowledge": "acknowledged", "resolve": "resolved", "reopen": "open"}[action]
            if action == "acknowledge" and row["status"] != "open":
                raise ValueError("Only open alerts can be acknowledged")
            if action == "reopen" and row["status"] != "resolved":
                raise ValueError("Only resolved alerts can be reopened")
            db.execute("UPDATE alerts SET status=?,updated_at=?,generation=generation+? WHERE id=?",
                       (target, now(), int(action == "reopen"), alert_id))
        self.event(row["scan_id"], "ALERT_" + target.upper(), f"Alert #{alert_id} {target}")
        return self.alert(alert_id)

    def claim_delivery(self, alert, channel, live):
        stamp = now()
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            row = db.execute("SELECT * FROM deliveries WHERE alert_id=? AND generation=? AND channel=?",
                             (alert["id"], alert["generation"], channel)).fetchone()
            if row and not (live and row["status"] == "dry_run"):
                return dict(row), False
            status = "sending" if live else "dry_run"
            if row:
                db.execute("UPDATE deliveries SET status=?,updated_at=? WHERE id=?",
                           (status, stamp, row["id"]))
                delivery_id = row["id"]
            else:
                cur = db.execute("""INSERT INTO deliveries(alert_id,generation,channel,status,
                    detail,provider_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)""",
                    (alert["id"], alert["generation"], channel, status,
                     "Preview only; no external message sent" if not live else "Submitting",
                     None, stamp, stamp))
                delivery_id = cur.lastrowid
        return {"id": delivery_id, "status": status}, True

    def finish_delivery(self, delivery_id, status, detail, provider_id=None):
        with self.connect() as db:
            db.execute("UPDATE deliveries SET status=?,detail=?,provider_id=?,updated_at=? WHERE id=?",
                       (status, detail, provider_id, now(), delivery_id))

    def deliveries(self):
        with self.connect() as db:
            return [dict(r) for r in db.execute("SELECT * FROM deliveries ORDER BY id DESC LIMIT 100")]
