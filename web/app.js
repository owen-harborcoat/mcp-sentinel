const $ = (id) => document.getElementById(id);
const state = {overview: {scans: [], alerts: [], deliveries: [], stats: {}}, events: [], cursor: 0, config: {}, seen: new Set(), notifications: false, ready: false};
const renderCache = {};
const labels = {clean: 'Clean support workflow', benign: 'Instruction clarification', poison: 'Delayed instruction poisoning', behavior: 'Behavior change · stable metadata'};
function el(tag, cls, text) { const node = document.createElement(tag); if (cls) node.className = cls; if (text != null) node.textContent = text; return node; }
function pill(text, cls = '') { return el('span', `pill ${cls}`, text); }
function time(value) { return new Date(value).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'}); }
function error(message) { $('error').textContent = message; $('error').hidden = !message; }
async function api(path, body) { const response = await fetch(`/api${path}`, body === undefined ? {} : {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)}); const value = await response.json(); if (!response.ok) throw new Error(typeof value.detail === 'string' ? value.detail : `Request failed (${response.status})`); return value; }
function button(text, action) { const node = el('button', 'secondary', text); node.type = 'button'; node.addEventListener('click', async () => {node.disabled = true; try {await action(); error(''); await refresh();} catch (e) {error(e.message);} finally {node.disabled = false;}}); return node; }
async function detail(id) {
  const scan = await api(`/scans/${id}`); $('detail-title').textContent = labels[scan.scenario] || 'Scan detail';
  const body = $('detail-body'); body.replaceChildren();
  body.append(pill(scan.runtime === 'wasmer' ? 'Wasmer execution' : 'Simulated execution'), document.createTextNode(' '), pill(scan.result?.provenance || scan.assessor));
  if (scan.error) body.append(el('p', 'error', scan.error));
  if (scan.result) {
    const j = scan.result.judgment; const summary = el('div', 'detail-summary');
    summary.append(pill(j.flag ? j.severity.toUpperCase() : 'NO ALERT', j.flag ? j.severity : 'good'), el('h3', '', j.title), el('p', '', j.rationale), el('p', '', `Recommended action: ${j.recommendation}`), el('p', '', `Cited evidence: ${j.evidence_ids.join(', ') || 'None'}`)); body.append(summary);
    for (const item of scan.result.evidence) { const d = el('details'); d.append(el('summary', '', `${item.id} · ${item.summary}`), el('pre', '', JSON.stringify(item.data, null, 2))); body.append(d); }
  } else if (!scan.error) body.append(el('p', 'empty', 'This scan is still collecting evidence.'));
  if (!$('detail-dialog').open) $('detail-dialog').showModal();
}
function renderAlerts() {
  const root = $('alert-list'); const filter = $('alert-filter').value;
  const signature = JSON.stringify([state.overview.alerts, filter, state.config.live_notifications]);
  if (renderCache.alerts === signature) return;
  renderCache.alerts = signature; root.replaceChildren();
  for (const a of state.overview.alerts) {
    const key = `${a.id}:${a.generation}`;
    if (state.ready && state.notifications && !state.seen.has(key) && a.status === 'open' && ['high', 'critical'].includes(a.severity)) {
      try {new Notification('Helix Sentinel', {body: `${a.severity.toUpperCase()} alert #${a.id}. Review the local dashboard.`, tag: key});} catch {state.notifications = false;}
    }
    state.seen.add(key);
  }
  const alerts = state.overview.alerts.filter(a => filter === 'all' || (filter === 'active' ? a.status !== 'resolved' : a.status === 'resolved'));
  $('alert-count').textContent = alerts.length; $('nav-alerts').textContent = state.overview.stats.open || 0;
  if (!alerts.length) root.append(el('p', 'empty', 'No alerts in this view. All observations remain in the timeline.'));
  for (const a of alerts) {
    const card = el('article', 'alert-card'); const top = el('div', 'alert-top'); top.append(pill(a.severity.toUpperCase(), a.severity), el('span', 'alert-meta', `#${a.id} · ${a.status} · ${a.occurrences} observation${a.occurrences === 1 ? '' : 's'}`));
    const actions = el('div', 'alert-actions'); actions.append(button('View evidence', () => detail(a.scan_id)));
    if (a.status === 'open') actions.append(button('Acknowledge', () => api(`/alerts/${a.id}/actions`, {action: 'acknowledge'})));
    if (a.status !== 'resolved') actions.append(button('Resolve', () => api(`/alerts/${a.id}/actions`, {action: 'resolve'})));
    else actions.append(button('Reopen', () => api(`/alerts/${a.id}/actions`, {action: 'reopen'})));
    if (['high', 'critical'].includes(a.severity) && a.status !== 'resolved') {
      const verb = state.config.live_notifications ? 'Send' : 'Preview';
      actions.append(button(`${verb} Telegram`, () => api(`/alerts/${a.id}/deliveries`, {channel: 'telegram'})), button(`${verb} SMS`, () => api(`/alerts/${a.id}/deliveries`, {channel: 'twilio'})));
    }
    card.append(top, el('h3', '', a.title), el('p', '', a.rationale), el('p', 'alert-meta', a.provenance.startsWith('demo') ? 'Demo assessor · deterministic test double' : a.provenance), actions); root.append(card);
  }
}
function renderScans() {
  const signature = JSON.stringify(state.overview.scans);
  if (renderCache.scans === signature) return;
  renderCache.scans = signature;
  const root = $('scan-list'); root.replaceChildren();
  if (!state.overview.scans.length) root.append(el('p', 'empty', 'Run a scan to start your execution history.'));
  for (const scan of state.overview.scans.slice(0, 7)) {
    const row = el('button', 'scan-row'); row.type = 'button'; const left = el('div'); left.append(el('div', 'scan-name', labels[scan.scenario]), el('div', 'scan-meta', `${scan.runtime === 'wasmer' ? 'Wasmer sandbox' : 'Simulation'} / ${scan.assessor === 'demo' ? 'Demo assessor' : scan.assessor === 'openrouter' ? 'OpenRouter' : 'Gemini'}`));
    const end = el('div', 'scan-end'); const judgment = scan.result?.judgment;
    end.append(pill(judgment ? judgment.flag ? 'Flagged' : 'Reviewed · no alert' : scan.status, judgment?.flag ? judgment.severity : scan.status === 'completed' ? 'good' : ''), el('time', '', time(scan.created_at)));
    row.append(left, end); row.addEventListener('click', () => detail(scan.id).catch(e => error(e.message))); root.append(row);
  }
}
function renderEvents() {
  const root = $('event-list'); const filter = $('event-filter').value; const term = $('search').value.toLowerCase();
  const signature = JSON.stringify([state.cursor, filter, term]);
  if (renderCache.events === signature) return;
  renderCache.events = signature; root.replaceChildren();
  const rows = state.events.filter(e => (filter === 'all' || e.kind.includes(filter)) && `${e.kind} ${e.detail}`.toLowerCase().includes(term)).slice(-500).reverse();
  $('timeline-empty').hidden = rows.length > 0;
  for (const e of rows) { const row = el('tr'); const kind = el('td'); kind.append(pill(e.kind.replaceAll('_', ' '), e.severity)); const scan = el('td'); const link = el('button', 'link-button', e.scan_id?.slice(0, 8) || '—'); link.type = 'button'; link.addEventListener('click', () => detail(e.scan_id).catch(err => error(err.message))); scan.append(link); row.append(el('td', '', time(e.ts)), kind, el('td', '', e.detail), scan); root.append(row); }
}
function render() {
  const o = state.overview; for (const key of ['scans', 'open', 'flagged']) $(`stat-${key}`).textContent = o.stats[key] || 0; $('stat-clear').textContent = o.stats.reviewed_clear || 0;
  $('run-scan').disabled = o.running; $('run-state').textContent = o.running ? 'Scan in progress' : 'Ready to scan'; $('run-scan').textContent = o.running ? 'Scanning…' : 'Run scan ↗';
  renderAlerts(); renderScans(); renderEvents(); const deliveries = $('delivery-list'); deliveries.replaceChildren();
  for (const d of o.deliveries.slice(0, 6)) {const row = el('div', 'delivery'); row.append(pill(d.channel), el('span', '', `Alert #${d.alert_id} · ${d.detail}`), el('span', '', d.status.replaceAll('_', ' '))); deliveries.append(row);}
  $('connection').textContent = 'Live monitoring'; $('connection').className = 'pill good'; $('updated').textContent = `Updated ${new Date().toLocaleTimeString()}`;
}
let refreshing = false;
async function refresh() {
  if (refreshing) return; refreshing = true;
  try {
    state.overview = await api('/overview');
    let more = true;
    while (more) {const page = await api(`/events?since_id=${state.cursor}&limit=500`); state.events.push(...page.events); state.cursor = page.next_since_id; more = page.events.length === 500;}
    state.events = state.events.slice(-500); render(); state.ready = true;
  } finally {refreshing = false;}
}
$('scan-form').addEventListener('submit', async (e) => {e.preventDefault(); $('run-scan').disabled = true; try {await api('/scans', {scenario: $('scenario').value, runtime: $('runtime').value, assessor: $('assessor').value}); error(''); await refresh();} catch (err) {error(err.message); $('run-scan').disabled = false;}});
$('alert-filter').addEventListener('change', renderAlerts); $('event-filter').addEventListener('change', renderEvents); $('search').addEventListener('input', renderEvents); $('close-dialog').addEventListener('click', () => $('detail-dialog').close());
$('assessor').addEventListener('change', () => {$('mode-note').textContent = $('assessor').value === 'demo' ? 'The demo assessor is deterministic and is not an LLM security judgment.' : `${$('assessor').value === 'openrouter' ? 'OpenRouter' : 'Gemini'} receives redacted synthetic test evidence and decides whether an alert is warranted.`;});
$('browser-notify').addEventListener('click', async () => {if (!('Notification' in window)) {error('Browser notifications are unavailable here. Dashboard alerts remain active.'); return;} const permission = await Notification.requestPermission(); state.notifications = permission === 'granted'; $('browser-state').textContent = state.notifications ? 'Browser alerts enabled for new high and critical findings while this page is open.' : 'Permission not granted. Dashboard alerts remain active.';});
try {state.config = await api('/config'); if (!state.config.openrouter_ready) $('assessor').value = 'demo'; $('assessor').dispatchEvent(new Event('change')); $('telegram-state').textContent = state.config.live_notifications && state.config.telegram_ready ? 'Live delivery enabled' : 'Preview · nothing sent'; $('twilio-state').textContent = state.config.live_notifications && state.config.twilio_ready ? 'Live delivery enabled' : 'Preview · nothing sent'; await refresh();} catch (e) {error(e.message); $('connection').textContent = 'Connection unavailable';}
setInterval(() => refresh().catch(e => {error(e.message); $('connection').textContent = 'Reconnecting';}), 1500);
