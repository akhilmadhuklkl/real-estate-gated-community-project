# AI privacy and security baseline

## Scope

T0048 applies a fail-closed baseline to the property assistant, voice transcription, enquiry preview, and knowledge-administration workflows. The controls address current OWASP API risks for resource consumption and security configuration, together with generative-model risks for prompt injection, sensitive-information disclosure, and unbounded consumption.

## Trust boundaries

- Visitor questions, conversation history, recordings, form fields, uploaded files, retrieved text, translated text, and provider responses are untrusted.
- Only approved knowledge records can support project claims. Retrieved text is evidence and never an instruction.
- The assistant and preview endpoints are anonymous public services. They cannot book, send, store an enquiry, change project records, or perform an administrative action.
- Knowledge administration is not exposed as a web route. Its editor and reviewer commands require separate role credentials supplied through server-only environment variables.

## API controls

The public POST endpoints share these controls:

- same-origin enforcement for browser calls, with an explicit production-origin allowlist;
- strict content-type checks and streamed request-size limits;
- per-client, per-route fixed-window throttling with pseudonymous client keys;
- request identifiers and rate-limit response headers;
- `no-store`, MIME-sniffing, frame, referrer, cross-origin, and permissions headers;
- generic client errors and privacy-safe structured security events;
- no logging of questions, transcripts, contact fields, provider error messages, or raw network addresses.

The in-process limiter is a defensive application layer. Production deployment must also keep platform-level distributed rate limits, spending alerts, and abuse monitoring enabled because serverless instances do not share memory.

## Model controls

- The current question and every supplied history turn pass through the same policy evaluation before retrieval or generation.
- Injection matching normalizes Unicode and removes common zero-width characters before evaluation.
- Direct override, protected-prompt disclosure, role impersonation, encoded-instruction, and exfiltration requests are blocked.
- Common email, phone, national-identifier, credential, and private-record patterns are blocked before provider calls.
- Generated answers remain bounded by approved evidence, citations, qualifications, output-token limits, and disabled provider telemetry.

Pattern controls reduce routine abuse but cannot prove that every novel injection is harmless. Retrieval eligibility, least privilege, action isolation, and human review remain the primary controls.

## Personal data and retention

The project does not yet have an approved jurisdiction, controller record, data-residency decision, retention schedule, or rights-request workflow. KS-020 therefore remains pending and the application follows these restrictions:

- enquiry submission is preview-only and is neither stored nor delivered;
- assistant conversation history remains in the browser interaction and is not intentionally persisted by the application;
- voice files are deleted from the transcription provider in a `finally` cleanup after processing;
- security events contain request and route metadata only, not visitor content;
- no resident, visitor, buyer, booking, or private sales record enters the knowledge index.

Persistent personal-data processing must remain disabled until the owner approves the controller, purposes, lawful basis or consent flow, providers, locations, retention periods, access controls, deletion process, and user request channel.

## Incident response

For a suspected exposure or active abuse event:

1. Disable the affected endpoint or deployment and preserve privacy-safe request identifiers.
2. Revoke and rotate provider keys, administration credentials, and rate-limit salts that may be affected.
3. Suspend compromised knowledge versions and restore the last reviewed version.
4. Rebuild the governed package and vector index, then run the evaluation suite before restoration.
5. Review provider and platform metadata without copying user content into tickets or logs.
6. Notify the owner and obtain legal or privacy guidance before any external notification decision.

No response may claim that personal data was deleted from a third-party system without verified provider evidence.

## Remaining production decisions

Before accepting production personal data, the owner must approve jurisdiction, data residency, retention, incident authority, distributed rate-limit thresholds, provider spending limits, monitoring ownership, and notification procedures. Until then, the current no-persistence and preview-only restrictions are mandatory.
