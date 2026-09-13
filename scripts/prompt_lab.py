"""Isolated live prompt replay. No database writes, notifications or fixture execution."""
import argparse
import asyncio
import hashlib
import json
import time
from pathlib import Path

import httpx
from dotenv import load_dotenv
from pydantic import ValidationError

from sentinel import assessor
from sentinel.config import ROOT, Settings
from sentinel.models import Evidence


class Recorder(httpx.AsyncBaseTransport):
    def __init__(self):
        self.inner = httpx.AsyncHTTPTransport()
        self.meta = {}

    async def handle_async_request(self, request):
        self.meta["request_sha256"] = hashlib.sha256(request.content).hexdigest()
        response = await self.inner.handle_async_request(request)
        await response.aread()
        self.meta["http_status"] = response.status_code
        try:
            body = response.json()
            self.meta.update({k: body.get(k) for k in ("id", "model", "provider", "usage")})
            choice = (body.get("choices") or [{}])[0]
            self.meta["finish_reason"] = choice.get("finish_reason")
            if response.status_code != 200:
                error = body.get("error", {})
                if isinstance(error, dict):
                    self.meta["provider_error"] = {k: str(error[k])[:240] for k in ("code", "message") if k in error}
        except (ValueError, AttributeError):
            pass
        return response

    async def aclose(self):
        await self.inner.aclose()


async def main(args):
    load_dotenv(ROOT / ".env")
    settings = Settings.from_env()
    if not settings.openrouter_model.endswith(":free"):
        raise SystemExit("This lab is restricted to the configured free model.")
    prompt = Path(args.prompt).read_text(encoding="utf-8")
    assessor.SYSTEM = prompt
    if args.dataset:
        cases = json.loads(Path(args.dataset).read_text(encoding="utf-8"))
    else:
        rows = [json.loads(line) for line in (ROOT / "artifacts/evaluation-20260913T191831Z/results.jsonl").read_text(encoding="utf-8").splitlines()]
        cases = []
        for name in args.cases.split(","):
            source = next(r for r in rows if r["case"] == name)
            cases.append({"id": name, "expected_flag": False if name in ("write_retarget", "late_trigger") else source["expected_flag"], "evidence": source["evidence"]})
    folder = Path(args.output)
    folder.mkdir(parents=True, exist_ok=False)
    manifest = {"prompt_file": str(Path(args.prompt)), "prompt_sha256": hashlib.sha256(prompt.encode()).hexdigest(),
                "model": settings.openrouter_model, "temperature": 0, "max_tokens": 4096,
                "source_sha256": {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in ("sentinel/assessor.py", "sentinel/models.py", "scripts/prompt_lab.py")},
                "repeats": args.repeats, "concurrency": args.concurrency, "cases": [{k:v for k,v in c.items() if k!="evidence"} for c in cases]}
    (folder / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    (folder / "system.txt").write_text(prompt, encoding="utf-8")
    results = []
    semaphore = asyncio.Semaphore(args.concurrency)
    rate_limited = asyncio.Event()

    async def run(case, repeat):
        async with semaphore:
            if rate_limited.is_set():
                return
            timer = time.monotonic()
            transport = Recorder()
            row = {"case": case["id"], "repeat": repeat, "expected_flag": case["expected_flag"],
                   "evidence_sha256": hashlib.sha256(json.dumps(case["evidence"], sort_keys=True).encode()).hexdigest()}
            print("START", row["case"], repeat, flush=True)
            try:
                value = await assessor.assess_openrouter(settings, [Evidence.model_validate(e) for e in case["evidence"]], transport)
                row.update(status="completed", judgment=value.model_dump(), correct=value.flag == case["expected_flag"])
            except ValidationError as exc:
                row.update(status="failed", error="ValidationError", validation=[
                    {"loc": list(e["loc"]), "type": e["type"]} for e in exc.errors(include_input=False, include_url=False)])
            except Exception as exc:  # noqa: BLE001 - keep failures in the experiment
                row.update(status="failed", error=type(exc).__name__, detail=str(exc)[:180])
            row.update(transport.meta)
            if row.get("http_status") == 429:
                rate_limited.set()
            row["seconds"] = round(time.monotonic() - timer, 2)
            results.append(row)
            with (folder / "results.jsonl").open("a", encoding="utf-8") as output:
                output.write(json.dumps(row) + "\n")
            print("RESULT", json.dumps({k:v for k,v in row.items() if k not in ("judgment", "usage", "id", "request_sha256", "evidence_sha256")}), flush=True)

    await asyncio.gather(*(run(c, n) for n in range(1, args.repeats + 1) for c in cases))
    total_tokens = sum((r.get("usage") or {}).get("total_tokens", 0) for r in results)
    summary = {"attempted": len(results), "planned": len(cases) * args.repeats,
               "matched": sum(r.get("correct", False) for r in results),
               "errors": sum(r["status"] != "completed" for r in results), "total_tokens": total_tokens,
               "usage_reported_runs": sum(bool(r.get("usage")) for r in results),
               "provider_cost": sum((r.get("usage") or {}).get("cost", 0) or 0 for r in results)}
    (folder / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print("SUMMARY", json.dumps(summary), flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--prompt", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--cases", default="audit_override,poison,quoted_report")
    parser.add_argument("--dataset")
    parser.add_argument("--repeats", type=int, default=1)
    parser.add_argument("--concurrency", type=int, choices=(1, 2), default=2)
    asyncio.run(main(parser.parse_args()))
