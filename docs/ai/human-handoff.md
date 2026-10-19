# Controlled human handoff

## Scope

The assistant routes an explicit human-contact request by purpose while preserving user control. It does not select a private person, send the conversation, promise availability, or treat a prepared action as receipt.

## Routing rules

| Route        | Human ownership shown to the visitor                | Current handling                                                                 |
| ------------ | --------------------------------------------------- | -------------------------------------------------------------------------------- |
| Sales        | Project enquiry coordinator                         | Approved WhatsApp draft or reviewed enquiry form                                 |
| Visit        | Visit coordinator                                   | Approved WhatsApp draft or reviewed visit form; no appointment promise           |
| Architecture | General project coordinator for architecture triage | No direct architect is exposed until a professional contact is approved          |
| Support      | General project support coordinator                 | Used for corrections, cancellation, rescheduling, and existing-request questions |

Support/correction intent takes precedence over other keywords. Architecture and visit routes require explicit matching language; other explicit handoff requests default to sales.

## Approved channel boundary

Only the separately approved WhatsApp destination is used for direct handoff. Brochure phone and email records remain unapproved for handoff routing. The generated WhatsApp message contains only the project name and selected route. It does not contain the conversation, contact details, form fields, dates, villa preferences, or inferred information.

Selecting **Review WhatsApp draft** opens the neutral text in WhatsApp. Nothing is sent until the visitor reviews and sends it there. The application never claims that opening the link confirms delivery.

The alternative **Continue to enquiry form** places a versioned, validated, non-sensitive draft in browser session storage. The form consumes it once. Identity, reply channel, and consent remain empty. The current endpoint validates a preview request but does not store or forward it.

## Unknown operational details

Working hours, response times, service levels, direct specialist identities, and visit availability are displayed as not confirmed. The assistant must not infer or promise them. T0046 can add professional contact cards only after publication permission and the relevant details are approved.

## Safety and recovery

- Users can change the route, edit the neutral summary, or clear it.
- No automatic messages, background requests, or conversation forwarding occur.
- No protected characteristics, financial profile, lead score, urgency score, or hidden classification is produced.
- Requests to modify an existing record still require an authenticated workflow when one becomes available; until then, support routing does not claim that a record was changed.
- If the approved WhatsApp configuration is unavailable, the direct action fails closed and the reviewed form path remains available.

## Verification

Automated tests cover all four routes, routing precedence, neutral message construction, missing-channel fail-closed behavior, explicit ownership, route correction, one-time draft transfer, unchecked consent, schema validation, and responsive presentation.
