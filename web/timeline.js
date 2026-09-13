export function eventLevel(event) {
  if (event.kind === 'SCAN_FAILED') return 'warning';
  if (event.kind !== 'AGENT_FLAGGED') return 'normal';
  return ['high', 'critical'].includes(event.severity) ? 'emergency' : 'warning';
}

export function timelineLayout(events, spacing = 30) {
  const ordered = [...events].sort((a, b) => a.id - b.id);
  const gap = Math.max(22, Math.min(100, spacing));
  let cursor = 50;
  const nodes = ordered.map((event, i) => {
    const level = eventLevel(event), x = cursor;
    cursor += level === 'normal' ? gap : Math.max(155, gap);
    return {event, x, level, branchY: i % 2 === 0 ? 50 : 200};
  });
  return {
    width: Math.max(760, cursor + 100),
    nodes,
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
    NOTIFICATION_PREVIEW: 'Notification preview', NOTIFICATION_ACCEPTED: 'Notification accepted',
    NOTIFICATION_UNKNOWN: 'Delivery uncertain', NOTIFICATION_FAILED: 'Delivery failed',
  };
  return names[event.kind] || event.kind.replaceAll('_', ' ').toLowerCase();
}
