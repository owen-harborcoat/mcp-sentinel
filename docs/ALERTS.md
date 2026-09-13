# Alerts: design, implementation and setup

## Decision boundary

Collection and judgment are separate. sentinel/scanner.py records test output and
metadata; sentinel/assessor.py decides whether to flag. The model sees tool content
as untrusted evidence. Its structured judgment must cite existing evidence IDs.
A hash delta does not automatically create an alert, and unchanged metadata does
not prevent one. No tool text can set recipients or execute another command.

Without credentials, assess_demo is a deterministic test double. Its provenance
is visible in scan detail and every alert. OpenRouter is the preferred live adapter;
it calls chat/completions with a strict JSON schema and require_parameters=true.
The actual returned model is recorded in provenance, including when using the free
router. Truncated, refused, malformed and invented-evidence responses fail the scan.
Gemini remains an optional direct adapter. See RESUME.md for actual live results.

## Durable state and delivery

SQLite persists scans, append-only events, alerts and delivery attempts.
A finding fingerprint includes target, runtime, assessor provenance, category and
cited evidence. Repeated identical evidence increments occurrences. Because the
agent chooses citations, changed citation sets may form separate alerts; this is
an explicit MVP limitation. Title rewording alone does not affect identity.

Alerts move open -> acknowledged -> resolved; resolved findings can be reopened.
New occurrences after resolution, or severity escalation, reopen the alert and
increment its generation. All lifecycle actions add timeline events.
Acknowledgment does not erase evidence. A clean scan does not automatically resolve
an earlier finding; resolution is a review decision.

New/reopened high or critical alerts attempt configured external channels only
when LIVE_NOTIFICATIONS=1. Otherwise both adapters record dry-run previews.
Browser notifications are separately opt-in, while the dashboard remains open.
Medium findings remain dashboard alerts without external delivery.

A unique (alert, generation, channel) claim prevents concurrent duplicate attempts.
Provider acceptance is recorded as accepted, not handset delivery. Network
timeouts/5xx/interrupted sends become unknown and are not automatically retried.
A dry-run claim can be promoted to one live attempt. Automatic retries, delivery
webhooks, escalation schedules and recipient management are outside this slice.
A manually reopened alert starts a new generation; use that deliberately because
a new notification attempt becomes possible.

Messages contain only severity and local alert ID. They never contain model text,
tool payloads, secrets or full evidence. Recipients come solely from server settings.
Resolved alerts and demo-assessed alerts cannot send externally.

## Keys after implementation

Copy .env.example only when .env is absent. Never overwrite existing credentials.
Keep the app bound to 127.0.0.1 with one worker. Restart after configuration changes.

- Local Wasmer SDK: no key needed. WASMER_API_KEY holds the user-provided token
  locally for future cloud work and is not consumed by the local sandbox.
- OpenRouter: set OPENROUTER_API_KEY and OPENROUTER_MODEL (default openrouter/free).
  Restart the app; configured OpenRouter is selected automatically. Free routing
  has variable latency/model availability and no paid-model fallback in this app.
  Only redacted synthetic fixture evidence is sent; keys never enter guest files.
- Gemini alternative: set GEMINI_API_KEY, retain/configure GEMINI_MODEL, restart, then select
  Gemini in the dashboard. Start with all four synthetic scenarios and inspect
  rationale/evidence. Free-tier eligibility and limits depend on the model/account.
- Telegram: create a bot through BotFather, start it in the intended chat, and
  configure TELEGRAM_BOT_TOKEN plus TELEGRAM_CHAT_ID. Preview first. Set
  LIVE_NOTIFICATIONS=1 only when ready for automatic messages to that fixed chat.
- Browser: click Enable browser notifications. No provider key or SMS fee.
- Twilio optional: configure TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID,
  TWILIO_API_KEY_SECRET, TWILIO_FROM_NUMBER and TWILIO_TO_NUMBER. Set
  TWILIO_CUSTOM_SMS_ENABLED=1 only for an account eligible for custom SMS and
  LIVE_NOTIFICATIONS=1 for sending. Trial templates cannot carry arbitrary alert
  bodies; free custom SMS is not promised.

The local .env, openrouter-api-key.txt and wasmer-access-token.txt are ignored by Git. Never place tokens
in client JS, screenshots, logs, issue bodies or commit messages.

## Source grounding

The [Wasmer JS runtime docs](https://docs.wasmer.io/runtime/js/) support local
sandbox execution with a Node SDK. [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing)
lists model-specific free tiers; [structured output](https://ai.google.dev/gemini-api/docs/generate-content/structured-output)
documents JSON schemas.
[Telegram bot FAQ](https://core.telegram.org/bots/faq) and
[sendMessage](https://core.telegram.org/bots/api#sendmessage) describe bot messaging.
[Twilio trial SMS](https://www.twilio.com/docs/usage/trials/try-out-sms) restricts
trial bodies to templates; [Messages API](https://www.twilio.com/docs/messaging/api/message-resource)
documents custom message requests for eligible accounts. These were discovered
and inspected through Exa on September 13, 2026.

OpenRouter references, inspected through Exa September 13, 2026:
[structured outputs](https://openrouter.ai/docs/guides/features/structured-outputs),
[free router](https://openrouter.ai/docs/guides/routing/routers/free-router).
