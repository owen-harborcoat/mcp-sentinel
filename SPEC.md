# MCP Sentinel build specification

The product is an MCP sandbox testing and observability workspace. It runs an MCP
inside Wasmer, exercises its tools, collects behavioral and metadata evidence,
asks a scanning agent for a security judgment, and presents findings with a usable
alert lifecycle and execution timeline.

The latest user direction supersedes the earlier metadata-quarantine-only plan.
MCP-Scan and Vercel drift protection do not eliminate the value of an integrated
testing, investigation and monitoring workflow. Avoid novelty claims about the
individual primitives.

## Implemented flow

1. Select one of twelve owned Helix fixture scenarios. All support real Wasmer;
   simulation supports only the original four scenarios.
2. Start a fresh local Wasmer Python guest with explicit synthetic files, no host
   mounts, no injected credentials, disabled network and bounded execution/output.
3. Initialize through the official Python MCP client. Capture tools, execute three
   reads, discover again, repeat the same request, add a comment and read the ticket
   back: six fixed tool calls. Exercise synthetic export as a seventh call when
   exposed. The model does not select or execute this sequence.
4. Preserve event/evidence records. Hashes identify differences and duplicate
   findings; they do not decide whether instructions are harmful.
5. OpenRouter (or optional direct Gemini) assesses evidence under a strict response schema: flag, severity,
   category, title, rationale, cited evidence IDs, recommendation. Reject malformed
   responses, invented evidence references, and extra fields.
6. Flagged findings create/update alerts. Benign observations remain searchable
   in history. Provider or runtime failure produces a failed scan.
7. Display alerts, recent scans, evidence, logs and event timeline. Dashboard alert
   actions are acknowledge, resolve and reopen. High/critical findings can produce
   browser notifications or fixed-recipient external notification attempts.

## Acceptance

The harmless description-change case must finish without an alert under the demo
assessor; the stable-metadata behavior-change case must generate a finding. These
are fixture assertions, not guarantees about model decisions. Evaluate actual
live model decisions separately and report unexpected classifications.

A successful write acknowledgment followed by missing readback is a functional
discrepancy. Without evidence of a security boundary violation it is not an
actionable security finding. Keep correctness checks, collection coverage and
assessment failures separate from threat-detection results. The corrected baseline
is in docs/EVALUATION.md; an isolated prompt study is pending in docs/PROMPT_LAB.md.

Wasmer is real even with the demo assessor. Simulation is labeled separately.
The demo assessor is deterministic and must never be represented as an LLM.
No failed sandbox startup may silently fall back to host execution or simulation.

## Boundaries and next slice

Current target registration is fixed to Helix; no arbitrary URLs, packages,
commands or user uploads. No hosted fleet monitoring, scheduler, users/auth,
distributed workers, transparent MCP gateway or general exploit coverage yet.
Each scan produces at most one aggregate judgment; multiple findings per scan are
future work. The evidence UI shows JSON before/after; richer diff visualization is
a teammate extension. Host/network probes are specific observations, not proof
against every escape. The bridge records probe booleans without universally
enforcing them as startup gates; filesystem assertions exist in integration tests.
The unsuccessful socket probe alone cannot establish blocked egress. Do not
execute untrusted third-party MCP packages under the
current demo admission model.

The agent can judge severity but cannot choose recipients, enable channels,
execute host commands or change the Wasmer policy. Human triage remains possible.
Manual reopening changes alert state and generation but does not automatically
send an external notification. New/reopened/escalated findings from a scan can
attempt configured channels when live delivery is explicitly enabled.
