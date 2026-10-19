# Lead qualification and controlled handoff

## Purpose

The property guide can prepare a minimal, reviewable enquiry summary when a visitor explicitly asks for a callback, site visit, enquiry, or human conversation. It does not silently create a lead, score a person, promise contact, or transmit the conversation.

## Data flow

1. The assistant detects an explicit handoff request in the current conversation.
2. Deterministic rules extract only the request type, approved villa interest, an unambiguous ISO date, and a broad time preference.
3. The notes are generated only from those neutral fields; free-form chat text is not copied. Email addresses and phone numbers are removed if redaction is needed elsewhere. The assistant does not infer identity, affordability, urgency, demographics, or sales value.
4. An evidence-scoped `enquiry-summary` preview shows captured and missing fields. The visitor can edit or clear every prepared value.
5. Only when the visitor selects **Continue to enquiry form** is the validated non-sensitive draft placed in browser session storage.
6. The contact form consumes and immediately removes that one-time draft. Full name, one reply channel, and consent remain empty and must be entered by the visitor.
7. The current enquiry endpoint validates the form and returns a preview reference. It does not store or forward details, and the interface states this limitation.

## Guardrails

- No automatic submission, background handoff, hidden profiling, lead score, or contact promise.
- No protected characteristics, family status, health information, budget, finance, or inferred purchasing power in qualification.
- No personal contact details carried from the assistant conversation into the draft.
- No draft survives beyond the browser session, and the visitor can clear it before continuing.
- Consent is never copied, inferred, or preselected.
- Form validation, a local reference, or a prepared summary must never be described as confirmed receipt.
- Public brochure access and ordinary property answers remain available without lead capture.

## Verification

Automated tests cover explicit intent detection, non-lead questions, neutral preference extraction, contact-detail removal, schema validation, evidence binding, editing, deletion, one-time form prefill, and consent remaining unchecked.
