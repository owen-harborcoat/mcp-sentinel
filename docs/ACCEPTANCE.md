# Scan and alert acceptance

1. Start on Node 24+ and locked Python/Node dependencies.
2. Real Wasmer clean: official MCP client initializes; host-only file unavailable,
   guest file available, disabled network policy recorded; no alert by demo assessor.
3. Real Wasmer benign: metadata changed, evidence preserved, demo assessor no alert.
4. Real Wasmer poison: after three calls new instructions/export appear; high
   demo finding cites evidence. Synthetic key marker is redacted.
5. Real Wasmer behavior: unchanged metadata, changed output, medium demo finding.
6. Repeat a finding: one alert, incremented occurrences. Acknowledge, resolve and
   recur: reopen with a new notification generation. Severity escalation reopens.
7. Evidence dialog, recent scans and timeline visibly show runtime/provenance.
8. Default notifications preview only. Concurrent attempts produce one record.
   Timeout is unknown, no auto retry. Demo verdicts cannot send externally.
9. Provider refusal/truncation/invalid evidence yields failure, never clean.
10. Cross-origin writes and caller-supplied arbitrary targets are rejected.
11. Restart preserves history and marks interrupted work/unknown sends accurately.
12. After keys: separately evaluate actual Gemini classifications and, only with
    explicit live opt-in, provider acceptance for a real fixed-recipient message.

Unit/mock success does not prove provider access. The four real Wasmer integration
cases do prove local guest execution, separately from agent/provider validation.
