# AI observability

## Purpose

The property guide records operational measurements without retaining visitor questions, assistant answers, audio, contact details, session IDs, IP addresses, or unique identifiers. The measurements support pilot review, incident detection, cost control, and release decisions.

## Signals

The assistant route emits these numeric measurements:

| Metric                             | Meaning                                             | Useful aggregation                                   |
| ---------------------------------- | --------------------------------------------------- | ---------------------------------------------------- |
| `glitz.ai.requests`                | One accepted assistant request                      | Sum grouped by status, language, topic, or risk tier |
| `glitz.ai.duration_ms`             | End-to-end server duration                          | Average, p95, and maximum                            |
| `glitz.ai.citation_count`          | Approved citations attached to a response           | Average and minimum by status                        |
| `glitz.ai.input_tokens_estimated`  | Approximate input tokens from character count       | Sum                                                  |
| `glitz.ai.output_tokens_estimated` | Approximate output tokens from character count      | Sum                                                  |
| `glitz.ai.estimated_cost_usd`      | Approximate cost when approved rates are configured | Sum                                                  |
| `glitz.ai.unanswered`              | Insufficient-evidence response                      | Sum grouped by safe topic                            |
| `glitz.ai.handoffs`                | Response requiring human confirmation               | Sum grouped by topic and risk tier                   |
| `glitz.ai.feedback`                | Helpful or needs-improvement selection              | Sum grouped by rating and answer status              |
| `glitz.ai.voice_requests`          | Voice transcription attempt                         | Sum grouped by outcome and language                  |
| `glitz.ai.voice_duration_ms`       | Voice route duration                                | Average and p95                                      |
| `glitz.ai.voice_audio_bytes`       | Uploaded recording size before immediate disposal   | Average and maximum                                  |

The safe topic taxonomy is limited to amenities, contact, documents, location, site visit, villa, and other. The classifier uses the question only in memory and records the category, never the text.

## Privacy controls

- Metric tags are fixed, low-cardinality categories.
- Feedback contains only rating, language, answer status, risk tier, and preview kind.
- Feedback schemas reject additional conversation content.
- Structured observability events contain aggregate measurements and categorical fields only.
- Provider telemetry remains disabled.
- Audio is removed after transcription and is never included in observability output.
- Observability failures cannot block an assistant response.

Operational logs should be retained for no more than 30 days. Aggregate metrics may be retained for up to 90 days for pilot comparison. Shorter platform limits take precedence. No export should contain conversation or contact content.

## Initial alert thresholds

Use these pilot thresholds after at least 20 requests unless the condition is an absolute failure count:

| Signal                     | Review threshold                                              | Action                                                                       |
| -------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Service unavailable        | More than 3 events in 15 minutes or more than 10% of requests | Check provider health, credentials, and retrieval runtime                    |
| p95 duration               | Above 10 seconds for 15 minutes                               | Check provider latency, cold starts, and retrieval duration                  |
| Insufficient evidence      | Above 30% by a safe topic                                     | Review missing or stale knowledge sources                                    |
| Needs-improvement feedback | Above 30% with at least 10 ratings                            | Review affected status, language, and preview category                       |
| R3/R4 handoff or refusal   | Sudden two-times increase over the prior seven-day baseline   | Review abuse patterns and guardrail regressions without opening user content |
| Estimated cost             | Above the owner-approved daily budget                         | Reduce traffic, model calls, or output limits before raising the budget      |
| Voice provider failures    | More than 3 events in 15 minutes                              | Keep typed input available and check transcription provider health           |

## Hosted metrics and free fallback

The production deployment uses the official server-side metric helper. It safely becomes a no-op where hosted Custom Metrics are unavailable. Privacy-safe JSON events are still written to function logs, so the application retains a usable no-cost operational trail.

After a production request reaches each route, discover the available schema before querying:

```text
vc metrics schema glitz.ai.requests
vc metrics glitz.ai.requests -a sum --group-by status --since 24h
vc metrics glitz.ai.duration_ms -a p95 --group-by status --since 24h
vc metrics glitz.ai.feedback -a sum --group-by rating --since 7d
vc metrics glitz.ai.unanswered -a sum --group-by topic --since 7d
```

Hosted metric queries depend on the deployment plan and project configuration. Function logs remain the baseline evidence when Custom Metrics are not enabled.

## Cost configuration

Token values are conservative character-based estimates, not provider billing records. Cost is emitted only when both `AI_INPUT_COST_USD_PER_MILLION_TOKENS` and `AI_OUTPUT_COST_USD_PER_MILLION_TOKENS` contain non-negative owner-approved rates. Blank or invalid rates suppress the cost metric rather than reporting a misleading zero.

## Pilot review

During T0052, review the dashboard or structured logs daily. Record only aggregate counts, rates, p95 duration, safe topics, and categorized feedback in the pilot evidence. Any investigation that requires conversation content needs a separate consented process and is outside this observability design.
