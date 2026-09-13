# OpenRouter setup and live verification

**Update:** the expanded 30-run evaluation found serious misses and invalid assessments.
See [EVALUATION.md](EVALUATION.md). The initial smoke results below are historical
and do not establish reliability.

September 13, 2026. The supplied key is saved in ignored .env. Both original token
files are ignored and a credential-value check found no secrets in commit-eligible
files. The key is used only in the Authorization header to OpenRouter's fixed API
endpoint; it is not included in prompts, guest files, logs or the dashboard.

The local server now uses OPENROUTER_MODEL=dots-studio/dots-3-note-preview:free.
The example environment pins the same model. OpenRouter is selected automatically
when configured. Gemini remains optional; it is not needed for this setup.
Telegram/SMS are still disabled (LIVE_NOTIFICATIONS=0); preview records are not sends.

## Live evidence

All rows below used real Wasmer execution and a real OpenRouter assessment.
The actual returned model was dots-studio/dots-3-note-preview:free in every row.
The first two were selected by the free router; the last two used the model ID
directly. This is four fixture classifications, not a detection-rate benchmark.

| Scenario | Scan ID | Actual verdict |
|---|---|---|
| Clean | f1dc0e3825f54575b0693f1fb03b3109 | No alert |
| Stable metadata, changed behavior | c6d2cdb10b824587b6668ea0025fe8fd | High, behavior |
| Delayed poisoning | 295e2e1967744568955358b8a5994c7b | Critical, data_access |
| Harmless instruction edit | 3cbf886d62894855baa68711453e6af0 | No alert |

The initial random-router poisoning assessment selected nex-agi/nex-n2.5-mini:free
and incorrectly cleared the case (scan d5f1e160b126478e87a639fa22b10d80). It remains
in history. A separate direct nex-n2.5-pro probe was cancelled after excessive
latency without a completed judgment. This is why the demo setup pins the model
above instead of relying on random free routing. A total 95-second assessment
deadline now prevents indefinite waits, with no silent demo or paid fallback.

Model severity and rationale are its judgments. In particular, the poisoning
response used strong exfiltration language: this fixture returned a synthetic
key marker, not a real SSH key, and these results do not prove actual credential
theft. The clean/benign model wording also overstates what isolated probes prove;
the sandbox checks remain bounded observations. Do not present generated prose
as independently established fact. No model verdict was changed to match a fixture.

Complete records remain in local SQLite and ignored artifacts:
artifacts/openrouter-live-validation.json and
artifacts/openrouter-pinned-validation.json.

## API behavior and validation

The adapter uses chat/completions, strict JSON Schema and require_parameters=true.
Local Pydantic validation rejects invalid judgments and invented evidence IDs.
Refusal, truncation, tool-call output, HTTP error and missing model attribution
fail the scan. Returned model attribution is preserved separately from the
configured router name. The browser shows actual provenance in scan detail/alerts.

35 automated tests passed, including four real Wasmer scenarios and eight
OpenRouter API/service tests. Ruff and JS syntax checks passed. Browser inspection
confirmed OpenRouter selected by default, live verdicts and notification previews.
Actual provider calls were tested separately from the automated mock suite.

Free routing is still available by setting OPENROUTER_MODEL=openrouter/free;
it can select different models with different latency and judgment quality.
No app-managed paid fallback exists. Free service availability and rate limits
can change; test the pinned model again during rehearsal.

Official references inspected through Exa:
[Free router](https://openrouter.ai/docs/guides/routing/routers/free-router),
[structured output](https://openrouter.ai/docs/guides/features/structured-outputs).
