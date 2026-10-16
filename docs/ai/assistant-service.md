# Assistant service

## Purpose

The assistant service turns a visitor question into a qualified, source-backed answer. It is separate from the API route and chat interface so retrieval, generation, and guardrails can be tested independently.

## Provider

The first provider is Google Gemini using the stable `gemini-3.8-flash` model through the official AI SDK provider. The project uses the provider's free developer tier while traffic is low. Free-tier prompts may be used by the provider to improve its products, so the service blocks likely phone numbers, email addresses, and personal identifiers before retrieval or generation.

The server reads `GOOGLE_GENERATIVE_AI_API_KEY`. The value must never use a `NEXT_PUBLIC_` name, enter source control, or be sent to the browser.

## Grounding flow

1. Validate and normalize a question between 2 and 500 characters and at most six recent conversation turns.
2. Block likely personal data before any model call.
3. Retrieve up to three governed evidence chunks with a minimum score of `0.45`.
4. Return a deterministic not-confirmed response when no evidence passes the threshold.
5. Send only the question and approved evidence to the model.
6. Return citations assembled from retrieval metadata rather than model-generated citations.
7. Attach the source title, document ID, page or section locator, effective date, last review date, validity date, qualification, and a conservative retrieval-score confidence label.
8. Add an opening link only when the governed document is public, permits public preview, and has an explicit application route. Restricted or non-renderable sources receive no link.
9. Preserve a caller-supplied session identifier or create a new opaque identifier.
10. Translate retrieval and provider failures into safe retry responses without exposing internal errors.

The versioned policy in `assistant-policy.ts` prohibits unsupported claims about pricing, availability, construction status, legal status, approvals, guarantees, and current contact validity. Evidence is marked as untrusted data rather than instructions. Deterministic R3 and R4 rules refuse or escalate the highest-risk requests before retrieval or generation.

## Service boundary

`createAssistantService` accepts injected retrieval and generation functions. Production wiring will connect the existing local vector index and the Gemini generator. Tests use deterministic substitutes and therefore do not consume provider quota or require a secret.

Every response includes the applied policy version, risk tier, reason code, and human-handoff requirement. This metadata is intended for evaluation and interface decisions; protected model instructions remain server-only.

Answered responses also include an evidence summary. Confidence is derived from retrieval similarity and lexical relevance, not from model certainty: `high` begins at `0.80`, `moderate` at `0.60`, and lower accepted scores are `limited`. The overall label uses the weakest attached citation so the interface does not overstate mixed evidence. Empty generation, no qualifying evidence, refusals, and service failures expose `none`, zero citations, and no document link.

## Operational limits

- Free-tier quotas are provider-controlled and may change.
- A rate-limit or provider outage must be translated to a user-safe retry response at the API layer.
- Sensitive enquiries must use the dedicated contact workflow rather than the assistant.
- Provider usage and answer quality must be monitored before public traffic is increased.
