export function eventLevel(event) {
  if (event.kind === 'SCAN_FAILED') return 'warning';
  if (event.kind !== 'AGENT_FLAGGED') return 'normal';
  return ['high', 'critical'].includes(event.severity) ? 'emergency' : 'warning';
}

export function timelineLayout(events, spacing = 30) {
  const ordered = [...events].sort((a, b) => a.id - b.id);
  const gap = Math.max(26, Math.min(100, Number.isFinite(spacing) ? spacing : 30));
  let cursor = 50, lastContextX = -Infinity;
  const nodes = ordered.map((event, i) => {
    const scanBoundary = i === 0 || event.scan_id !== ordered[i - 1].scan_id;
    if (scanBoundary) {
      // Lifecycle events may switch to an older scan for only one event. Reserve
      // label space between every context change, not only SCAN_STARTED events.
      cursor = Math.max(cursor + (i > 0 ? 38 : 0), lastContextX + 160);
      lastContextX = cursor;
    }
    const level = eventLevel(event), x = cursor;
    cursor += level === 'normal' ? gap : Math.max(166, gap);
    return {event, x, level, branchY: 48, scanBoundary};
  });
  return {
    width: Math.max(760, cursor + 160),
    nodes,
  };
}

export function scanContextLabel(event, scans, cases) {
  const scan = scans.find(item => item.id === event.scan_id);
  const name = scan && (cases[scan.scenario] || scan.scenario);
  const full = name || 'Scan ' + (event.scan_id?.slice(0, 8) || 'unknown');
  return {text: full.length > 24 ? full.slice(0, 23).trimEnd() + '…' : full, full};
}

export function preferredEvent(events, selectedId = null) {
  const ordered = [...events].sort((a, b) => a.id - b.id);
  return ordered.find(event => event.id === selectedId)
    || ordered.findLast(event => event.kind === 'AGENT_FLAGGED')
    || ordered.findLast(event => ['SCAN_FAILED', 'AGENT_CLEARED', 'SCAN_COMPLETED'].includes(event.kind))
    || ordered.at(-1)
    || null;
}

export function activeScanProgress(scans, events) {
  const scan = [...scans].filter(item => item.status === 'running')
    .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  if (!scan) return null;
  const ownEvents = events.filter(event => event.scan_id === scan.id).sort((a, b) => a.id - b.id);
  // Events can finish a scan after the overview snapshot was fetched.
  if (ownEvents.some(event => ['SCAN_COMPLETED', 'SCAN_FAILED'].includes(event.kind))) return null;
  return {scanId: scan.id, event: ownEvents.at(-1) || null};
}

export function tooltipPosition(anchor, width, height, viewportWidth, viewportHeight) {
  const edge = 12;
  const left = Math.max(edge, Math.min(anchor.left + anchor.width / 2 - width / 2, viewportWidth - width - edge));
  const above = anchor.top - height - 10;
  const top = Math.max(edge, Math.min(above >= edge ? above : anchor.bottom + 10, viewportHeight - height - edge));
  return {left, top};
}

export function dashboardStats(overview) {
  const scans = overview.scans || [], alerts = overview.alerts || [];
  const latest = [...scans].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const runtime = latest ? (latest.runtime === 'wasmer' ? 'Wasmer' : latest.runtime === 'demo' ? 'Historical simulation' : latest.runtime) : 'No scans yet';
  const provenance = latest?.result?.provenance;
  return {
    scans: overview.stats?.scans ?? scans.length,
    active: alerts.filter(alert => alert.status !== 'resolved').length,
    failed: scans.filter(scan => ['failed', 'interrupted'].includes(scan.status)).length,
    runtime,
    runtimeTitle: provenance ? `${runtime} · ${provenance}` : latest ? `${runtime} · ${latest.status}` : runtime,
  };
}

export function eventLabel(event) {
  const names = {
    SCAN_STARTED: 'Scan started', SANDBOX_STARTING: 'Sandbox starting', SANDBOX_TEST: 'Isolation tested',
    MCP_CONNECTED: 'MCP connected', TOOLS_DISCOVERED: 'Tools discovered', TOOL_TEST: 'Tool executed',
    METADATA_OBSERVED: 'Definitions compared', BEHAVIOR_TEST: 'Responses compared', WRITE_TEST: 'Write tested',
    DATA_ACCESS_TEST: 'Export tested', ASSESSMENT_STARTED: 'Assessment started', AGENT_FLAGGED: 'Finding',
    AGENT_CLEARED: 'Reviewed', SCAN_COMPLETED: 'Scan completed', SCAN_FAILED: 'Scan failed',
    ALERT_OPENED: 'Alert opened', ALERT_REPEATED: 'Alert repeated', ALERT_OPEN: 'Alert reopened',
    ALERT_RESOLVED: 'Alert resolved', ALERT_ACKNOWLEDGED: 'Alert acknowledged',
    NOTIFICATION_PREVIEW: 'Historical notification preview', NOTIFICATION_ACCEPTED: 'Notification accepted',
    NOTIFICATION_UNKNOWN: 'Delivery uncertain', NOTIFICATION_FAILED: 'Delivery failed',
  };
  return names[event.kind] || event.kind.replaceAll('_', ' ').toLowerCase();
}
