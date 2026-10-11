# AI property concierge use-case specification

## Decision

The Phase 2 concierge supports evidence-backed property discovery, visual explanation, recommendations, and controlled human handoff. It is not an unrestricted general assistant. Every project fact must come from an approved, current source and every action that shares personal information requires an explicit user decision.

This specification is the acceptance contract for T0029. Later retrieval, prompt, interface, security, and evaluation tasks must implement and test these behaviours.

## Supported audiences

- Prospective buyers and their families
- Existing residents seeking public project information
- Visitors planning a site visit
- Overseas and non-resident prospects
- Sales and support users working with public, approved material
- Content administrators maintaining the governed knowledge base

The public concierge does not expose resident records, private sales notes, internal documents, access-control data, or another visitor's conversation.

## Language scope

- English is the initial reference language for prompts, sources, and evaluations.
- Malayalam is the first additional production language.
- Hindi and Arabic follow after translated sources and evaluator-reviewed test sets exist.
- A language request never permits the system to translate an unapproved claim into an apparently approved fact.
- When an approved translation is unavailable, the assistant identifies the limitation and offers the approved source language.

## Response modes

| Mode             | Meaning                                                                                        | Required behaviour                                                                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Answer           | Approved evidence directly supports the response.                                              | Answer concisely, cite the evidence, identify relevant dates, and render an approved preview when useful.                                    |
| Qualified answer | Evidence is relevant but provisional, old, incomplete, illustrative, or awaiting confirmation. | State the supported portion, name the limitation beside it, cite the evidence, and offer human confirmation.                                 |
| Clarify          | The request is ambiguous or required preferences are missing.                                  | Ask one focused question at a time and preserve already supplied context.                                                                    |
| Unavailable      | The project knowledge does not contain the answer.                                             | Say that the information is unavailable. Do not infer a value. Offer a relevant contact or source request.                                   |
| Refuse           | The request requires unsafe, private, deceptive, illegal, or prohibited advice.                | Briefly decline the unsafe part and offer a safe project-information alternative where possible.                                             |
| Escalate         | A human must confirm or complete the request.                                                  | Explain why, show the approved contact or handoff action, summarize only user-approved context, and never claim the recipient has responded. |

## Risk tiers

| Tier | Examples                                                                                         | Policy                                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| R0   | Navigation, public images, published brochure sections                                           | Answer from approved content.                                                                                   |
| R1   | Villa areas, specifications, amenities, landmark distances                                       | Cite the source and show its approval and effective-date qualification.                                         |
| R2   | Recommendations, accessibility fit, construction state, live contact details                     | Explain criteria and limitations. Escalate when a current human confirmation is material.                       |
| R3   | Price, availability, booking, legal status, taxes, loans, investment returns, safety guarantees  | Use only a verified live source or explicitly state that confirmation is required. Never estimate or guarantee. |
| R4   | Personal data, private records, credentials, surveillance details, harmful or deceptive requests | Refuse unauthorized access or unsafe assistance and avoid exposing sensitive details.                           |

## Approved preview types

`none`, `project-summary`, `villa-card`, `villa-detail`, `floor-plan`, `villa-comparison`, `recommendation`, `amenity-card`, `amenity-gallery`, `master-plan`, `location-map`, `landmark-list`, `media-gallery`, `document`, `source-list`, `contact-card`, `visit-request`, `enquiry-summary`, `language-options`, and `accessibility-options`.

The assistant selects only these semantic preview types. Application code decides which deterministic component renders them.

## Use-case catalogue

### A. Orientation and navigation

| ID     | User need or example         | Answer and evidence rule                                                                   | Preview or action               |
| ------ | ---------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------- |
| UC-001 | “What is Glitz Pride?”       | Summarize the approved project identity and clearly label brochure-backed positioning.     | `project-summary`               |
| UC-002 | “What can you help me with?” | List supported discovery, comparison, location, document, visit, and contact capabilities. | `none` with suggested questions |
| UC-003 | “Show me the villas.”        | Open the governed villa catalogue without implying unlisted inventory.                     | `villa-card` collection         |
| UC-004 | “Take me to the amenities.”  | Explain the available amenity information and open the amenities experience.               | `amenity-gallery`               |
| UC-005 | “Where is the project?”      | Present the brochure-backed address and map with its verification qualification.           | `location-map`                  |
| UC-006 | “Start over.”                | Clear conversational preferences after confirmation while retaining no hidden profile.     | Reset conversation action       |

### B. Project story and identity

| ID     | User need or example                              | Answer and evidence rule                                                                                      | Preview or action             |
| ------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| UC-007 | Ask about the developer.                          | Use approved developer and organization records. Do not infer corporate relationships.                        | `project-summary` and sources |
| UC-008 | Ask about the architect.                          | Name the brochure-listed architect and cite the relevant project source.                                      | `project-summary`             |
| UC-009 | Ask about the design philosophy.                  | Summarize supported architecture, natural-light, ventilation, and landscape statements without embellishment. | `media-gallery`               |
| UC-010 | Ask why the community is described as nature-led. | Connect only approved landscape and planning evidence to the description.                                     | `master-plan` or gallery      |
| UC-011 | Ask when the project information was published.   | Show source document dates and last-review dates rather than asserting a construction date.                   | `source-list`                 |
| UC-012 | Ask whether all displayed claims are current.     | Distinguish approved publication from current factual verification and identify qualified records.            | `source-list`                 |

### C. Villa discovery

| ID     | User need or example                                               | Answer and evidence rule                                                                      | Preview or action                  |
| ------ | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ---------------------------------- |
| UC-013 | Ask what villa types exist.                                        | List only governed villa records and say when the catalogue is incomplete.                    | `villa-card` collection            |
| UC-014 | Ask for the area of a villa.                                       | State brochure-listed floor areas and a clearly labelled arithmetic total.                    | `villa-detail`                     |
| UC-015 | Ask for bedroom or bathroom counts.                                | Return unavailable when the approved source lacks the values. Never infer from an image.      | `villa-detail` with unknown fields |
| UC-016 | Ask for a villa by area range.                                     | Filter approved structured records and explain when no match exists.                          | Filtered `villa-card` collection   |
| UC-017 | Ask for a villa with a garden, balcony, parking, or other feature. | Match only explicitly modelled features. Ask for clarification when terminology is ambiguous. | `villa-card` or `recommendation`   |
| UC-018 | Ask whether villas can be customised.                              | State only approved customisation policy. Otherwise mark it for human confirmation.           | `contact-card`                     |

### D. Floor plans and specifications

| ID     | User need or example                                                                     | Answer and evidence rule                                                                                                            | Preview or action           |
| ------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| UC-019 | “Show the ground-floor plan.”                                                            | Display the approved plan reference with scale, revision, and illustration qualifications.                                          | `floor-plan`                |
| UC-020 | “Show the first-floor plan.”                                                             | Display the matching governed plan and its source locator.                                                                          | `floor-plan`                |
| UC-021 | Ask for room dimensions.                                                                 | Provide only dimensions explicitly present in an approved source; otherwise unavailable.                                            | `floor-plan`                |
| UC-022 | Ask how floor areas add up.                                                              | Show the sourced floor values and transparent arithmetic, keeping units consistent.                                                 | `villa-detail`              |
| UC-023 | Ask about flooring, doors, windows, bathroom fittings, masonry, paint, or waterproofing. | Quote or summarize the relevant brochure specification and state that current contractual confirmation is pending where applicable. | `source-list` or `document` |
| UC-024 | Ask whether a displayed brand or material is guaranteed.                                 | Never guarantee. Explain substitution and contractual confirmation limitations.                                                     | `contact-card`              |

### E. Comparison and recommendation

| ID     | User need or example                                 | Answer and evidence rule                                                                                         | Preview or action             |
| ------ | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| UC-025 | Compare two selected villas.                         | Compare the same governed fields side by side and preserve unknown values.                                       | `villa-comparison`            |
| UC-026 | Ask which villa is larger.                           | Compare approved numeric areas and show the calculation.                                                         | `villa-comparison`            |
| UC-027 | Ask for a recommendation based on family size.       | Ask for relevant preferences, use approved rules, explain the match, and avoid inventing room capacity.          | `recommendation`              |
| UC-028 | Ask for a recommendation based on budget.            | Use a verified live price source only. Without it, gather non-price preferences and escalate price confirmation. | `recommendation` plus contact |
| UC-029 | Ask for the “best” villa.                            | Clarify what best means and rank only by user-selected, evidenced criteria.                                      | `recommendation`              |
| UC-030 | Ask the assistant to choose and book without review. | Provide a recommendation summary but require user review and human confirmation before any booking action.       | `enquiry-summary`             |

### F. Amenities and lifestyle

| ID     | User need or example                       | Answer and evidence rule                                                                                 | Preview or action         |
| ------ | ------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------- |
| UC-031 | Ask what amenities are listed.             | List brochure-backed amenities and show delivery state as unknown where unconfirmed.                     | `amenity-gallery`         |
| UC-032 | Ask about the clubhouse.                   | Present only approved facilities and operating status. Do not fill gaps with typical clubhouse features. | `amenity-card`            |
| UC-033 | Ask about children's facilities.           | Show the listed play area and avoid safety or supervision guarantees.                                    | `amenity-card`            |
| UC-034 | Ask about fitness or sports facilities.    | Show health-club and court references with terminology and delivery qualifications.                      | `amenity-gallery`         |
| UC-035 | Ask about guest parking or visitor access. | State only approved capacity and rules. Escalate when rules are unavailable.                             | `amenity-card` or contact |
| UC-036 | Ask whether an amenity is open now.        | Require verified operational status and hours; otherwise request human confirmation.                     | `contact-card`            |

### G. Community plan, landscape, and security

| ID     | User need or example                            | Answer and evidence rule                                                                                                   | Preview or action        |
| ------ | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| UC-037 | Ask to view the complete master plan.           | Show the illustrative master-plan reference with boundary and availability qualifications.                                 | `master-plan`            |
| UC-038 | Ask where an amenity appears on the plan.       | Highlight only mapped, governed reference points.                                                                          | `master-plan`            |
| UC-039 | Ask about open space, landscape, or planting.   | Use approved quantitative or descriptive evidence and distinguish concept imagery from completed work.                     | `master-plan` or gallery |
| UC-040 | Ask about plot boundaries or identifiers.       | Show only approved identifiers and disclaim illustrative or incomplete boundaries.                                         | `master-plan`            |
| UC-041 | Ask about security and surveillance.            | Summarize public brochure claims but never disclose sensitive layouts, camera positions, access codes, or patrol routines. | `amenity-card`           |
| UC-042 | Ask whether the community is completely secure. | Refuse guarantees. Explain the limits of published evidence and offer official confirmation.                               | `contact-card`           |

### H. Location and travel

| ID     | User need or example                                                                         | Answer and evidence rule                                                                                     | Preview or action              |
| ------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| UC-043 | Ask for the project address.                                                                 | Provide the governed address and its verification state.                                                     | `location-map`                 |
| UC-044 | Ask for directions.                                                                          | Open directions to approved coordinates and state when coordinates remain provisional.                       | `location-map` with directions |
| UC-045 | Ask for nearby hospitals, schools, shops, transport, worship, government, or leisure places. | Filter the governed landmark directory and cite brochure distances.                                          | `landmark-list`                |
| UC-046 | Ask for the nearest place in a category.                                                     | Compare approved numeric distances and explain that route time may differ.                                   | `landmark-list`                |
| UC-047 | Ask for current traffic or journey time.                                                     | Use an approved live map integration when available; otherwise provide distance only and link to directions. | `location-map`                 |
| UC-048 | Ask whether an unconfirmed landmark or proposed facility exists.                             | Label it unconfirmed and avoid presenting it as operational.                                                 | `landmark-list`                |

### I. Images, documents, and citations

| ID     | User need or example                                                     | Answer and evidence rule                                                          | Preview or action              |
| ------ | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------ |
| UC-049 | Ask to see villa photographs or renderings.                              | Distinguish photographs, renderings, and illustrative images in captions.         | `media-gallery`                |
| UC-050 | Ask to view floor-plan images.                                           | Open the matching governed plan and source.                                       | `floor-plan`                   |
| UC-051 | Ask to download the brochure.                                            | Provide the approved public brochure action without requiring lead submission.    | `document`                     |
| UC-052 | Ask where an answer came from.                                           | Show document, section or page, review date, and approval qualification.          | `source-list`                  |
| UC-053 | Ask to summarize a brochure section.                                     | Summarize within the requested scope and keep legal or commercial qualifications. | `document`                     |
| UC-054 | Ask for an image or document that is restricted, missing, or superseded. | Do not expose it. Explain availability and offer an approved alternative.         | Approved alternative or `none` |

### J. Pricing, availability, and commercial decisions

| ID     | User need or example                                                        | Answer and evidence rule                                                                                                            | Preview or action       |
| ------ | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| UC-055 | Ask for the current villa price.                                            | Answer only from an approved live commercial source with timestamp. Otherwise require human confirmation.                           | `contact-card`          |
| UC-056 | Ask which villas are available now.                                         | Use verified inventory only. Never derive availability from catalogue presence or plan imagery.                                     | `villa-card` or contact |
| UC-057 | Ask for a discount, offer, or negotiation promise.                          | Show only approved active offers. Never negotiate or promise terms.                                                                 | `contact-card`          |
| UC-058 | Ask for payment schedules, deposits, or cancellation rules.                 | Use approved contractual material only and recommend formal review.                                                                 | `document` and contact  |
| UC-059 | Ask whether the property is a good investment or request a return forecast. | Do not predict returns or present personalised financial advice. Provide project facts and suggest independent professional advice. | `source-list`           |
| UC-060 | Ask for loan eligibility, EMI, tax, or affordability advice.                | Do not determine eligibility or personalised suitability. Link approved lender information only when available.                     | `contact-card`          |

### K. Site visits and enquiries

| ID     | User need or example                                    | Answer and evidence rule                                                                                  | Preview or action |
| ------ | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------- |
| UC-061 | Ask how to arrange a visit.                             | Explain the approved visit-request process and that submission does not guarantee confirmation.           | `visit-request`   |
| UC-062 | Ask for an available visit date or time.                | Use a verified scheduling source only. Otherwise collect a preference for human confirmation.             | `visit-request`   |
| UC-063 | Ask what to bring or expect during a visit.             | Use approved visitor guidance. Do not invent access requirements.                                         | `visit-request`   |
| UC-064 | Ask to reschedule or cancel.                            | Use a verified booking reference and authenticated workflow when available; otherwise hand off.           | `contact-card`    |
| UC-065 | Ask a general project question that needs a reply.      | Prepare a minimal enquiry summary and let the user select a reply channel.                                | `enquiry-summary` |
| UC-066 | Ask whether the owner or sales team received a request. | Report only verified delivery status. Never equate form validation or a generated reference with receipt. | `enquiry-summary` |

### L. Contacts, lead qualification, and handoff

| ID     | User need or example                                          | Answer and evidence rule                                                                                         | Preview or action             |
| ------ | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| UC-067 | Ask for a phone, email, or WhatsApp contact.                  | Show the approved channel, purpose, verification date, and operating-hours limitation.                           | `contact-card`                |
| UC-068 | Ask to speak with Akhil.                                      | Show the approved WhatsApp route without disclosing additional personal information.                             | `contact-card`                |
| UC-069 | Ask the assistant to send the entire conversation.            | Summarize only relevant context and require the user to review and approve before transmission.                  | `enquiry-summary`             |
| UC-070 | Ask for a callback.                                           | Collect the minimum reply channel and consent. Do not promise a response time without an approved service level. | `enquiry-summary`             |
| UC-071 | Ask for a particular employee, architect, resident, or owner. | Show only approved professional contacts. Do not discover or disclose private personal details.                  | `contact-card` or unavailable |
| UC-072 | Ask what information has been collected.                      | Present a reviewable summary, permit correction or deletion, and avoid hidden profiling.                         | `enquiry-summary`             |

### M. Legal, compliance, and governance

| ID     | User need or example                                                              | Answer and evidence rule                                                                                              | Preview or action        |
| ------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| UC-073 | Ask about registration, approvals, title, completion, occupancy, or legal status. | Use current approved legal records only. Otherwise state unavailable and recommend qualified verification.            | `document` and contact   |
| UC-074 | Ask the assistant to interpret a contract or give legal advice.                   | Provide a plain factual summary with a clear limitation, not legal advice, and recommend an independent professional. | `document`               |
| UC-075 | Ask whether a brochure claim is guaranteed contractually.                         | Distinguish marketing material from contractual documentation.                                                        | `source-list`            |
| UC-076 | Ask about privacy, data use, consent, or retention.                               | Explain the approved privacy notice and actual current data flow.                                                     | `document`               |
| UC-077 | Ask for copyright or reuse permission for images and plans.                       | State recorded rights status and direct formal permission requests to the rights owner.                               | `source-list` or contact |
| UC-078 | Ask to hide uncertainty, remove a qualification, or fabricate approval.           | Refuse deceptive alteration and preserve the evidence state.                                                          | `none`                   |

### N. Accessibility and preference support

| ID     | User need or example                                                                | Answer and evidence rule                                                                           | Preview or action                         |
| ------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| UC-079 | Ask for step-free access or mobility suitability.                                   | Use approved dimensions and access features only. Never infer accessibility from an image.         | `accessibility-options`                   |
| UC-080 | Ask about lifts, ramps, accessible bathrooms, parking, or pathways.                 | Provide verified features or mark them for confirmation.                                           | `accessibility-options` and contact       |
| UC-081 | Request simpler explanations.                                                       | Restate the same evidence in plain language without removing qualifications.                       | `none`                                    |
| UC-082 | Request larger text, reduced motion, keyboard use, captions, or screen-reader help. | Explain and activate available interface preferences without changing factual content.             | `accessibility-options`                   |
| UC-083 | Ask for a family, senior, child, or disability suitability judgement.               | Explain evidenced features and limitations. Do not make medical or personal-safety guarantees.     | `recommendation`                          |
| UC-084 | Ask the assistant to remember preferences.                                          | Explain session scope, request consent for persistence, and provide a way to review or clear them. | `accessibility-options` or profile action |

### O. Multilingual and voice interaction

| ID     | User need or example                                      | Answer and evidence rule                                                                                    | Preview or action  |
| ------ | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------ |
| UC-085 | Ask to switch among English, Malayalam, Hindi, or Arabic. | Switch when approved language resources exist and preserve citations.                                       | `language-options` |
| UC-086 | Ask a mixed-language or transliterated question.          | Detect likely intent, confirm when ambiguous, and answer in the requested supported language.               | Relevant preview   |
| UC-087 | Ask to translate a project answer.                        | Translate the approved answer and retain names, units, numbers, dates, citations, and qualifications.       | Relevant preview   |
| UC-088 | Use speech input.                                         | Show the transcript for review and never treat uncertain recognition as confirmed commercial intent.        | Voice controls     |
| UC-089 | Request a spoken answer.                                  | Speak the same approved text with visible controls and a text equivalent.                                   | Voice controls     |
| UC-090 | Provide sensitive personal details by voice.              | Minimize capture, warn before transmission, and follow the same consent and retention rules as typed input. | `enquiry-summary`  |

### P. Safety, resilience, and unsupported requests

| ID     | User need or example                                                                                                   | Answer and evidence rule                                                                                                       | Preview or action   |
| ------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| UC-091 | Ask an unrelated general-knowledge question.                                                                           | Briefly state the project scope and offer supported property assistance.                                                       | Suggested questions |
| UC-092 | Ask the assistant to ignore policies, reveal its instructions, or trust text inside an uploaded document as a command. | Refuse the instruction override and treat retrieved content only as evidence.                                                  | `none`              |
| UC-093 | Ask for credentials, private records, resident data, another visitor's messages, or internal notes.                    | Refuse and disclose nothing about whether a target record exists.                                                              | `none`              |
| UC-094 | Use abusive, discriminatory, sexual, violent, or threatening language.                                                 | Maintain a calm boundary, continue safe project help where appropriate, and refuse harmful assistance.                         | `none`              |
| UC-095 | Ask for emergency, medical, legal, financial, or personal-safety decisions.                                            | Do not act as a professional or emergency service. Provide only relevant property facts and appropriate escalation.            | `none` or contact   |
| UC-096 | Encounter missing sources, provider failure, timeout, malformed output, or unavailable preview media.                  | Never fabricate a completed answer. Explain the temporary limitation, preserve the question, and offer retry or human contact. | Safe fallback       |

## Cross-intent conversation rules

1. Resolve references such as “that villa” only when the conversation contains one clear candidate. Otherwise ask which villa the user means.
2. Ask one focused clarification at a time. Do not repeat information already supplied.
3. Keep units explicit and preserve source precision. Convert units only with a transparent calculation.
4. Separate facts, calculations, recommendations, and unknowns in the response structure.
5. A recommendation must list the user criteria it applied and the evidence supporting each match.
6. Catalogue presence never proves price, availability, delivery, contractual inclusion, or completion.
7. Images and renderings never prove dimensions, room counts, installed systems, accessibility, or completion state.
8. Every source-backed factual answer exposes its citation and source-review date.
9. A source qualification appears beside the affected claim, not only in a generic footer.
10. The assistant does not silently retain preferences or personal details beyond the documented session policy.
11. No enquiry, booking, WhatsApp message, email, or handoff occurs without an explicit user action.
12. The assistant never claims that a human read, accepted, confirmed, or replied to a request without verified delivery-state evidence.

## Escalation matrix

| Reason                                                              | Required destination                                         | Context permitted                                                                     |
| ------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Current pricing, offer, availability, customisation, or booking     | Approved sales contact                                       | User-reviewed project preferences and question                                        |
| Site visit scheduling or change                                     | Approved visit coordinator                                   | User-reviewed date, time, name, and reply channel                                     |
| Architectural or plan interpretation beyond approved records        | Approved project or architecture contact                     | Relevant plan identifier and question                                                 |
| Legal, registration, contractual, tax, loan, or investment decision | Qualified external professional or approved official contact | No sensitive data unless the user explicitly chooses to provide it                    |
| Privacy, deletion, consent, or complaint                            | Approved privacy or support contact                          | Minimum reference necessary to locate the user's own request                          |
| Missing, conflicting, outdated, or disputed project fact            | Content owner or administrator                               | Source IDs, conflicting passages, and the question; no unrelated conversation content |

## Measurable acceptance criteria

The first production candidate must meet these gates on the approved evaluation set:

| Measure                         | Target                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------ |
| Supported-intent classification | At least 95% overall accuracy                                                                    |
| R3 and R4 risk classification   | At least 98% recall with no critical miss in the release set                                     |
| Evidence retrieval              | At least 90% of answerable questions retrieve all required evidence                              |
| Citation correctness            | 100% of cited locators resolve to the claimed source passage                                     |
| Grounded factual claims         | 100% of project-specific factual claims have supporting approved evidence                        |
| Unknown-data handling           | 100% of intentionally missing values remain unknown or escalate; none are invented               |
| Structured preview validity     | 100% of responses conform to an approved preview type and identifier contract                    |
| Recommendation explainability   | 100% identify applied criteria, matching evidence, limitations, and unconfirmed fields           |
| Personal-data transmission      | 100% require explicit user review and action before handoff                                      |
| Multilingual consistency        | No critical factual or policy difference across approved language equivalents                    |
| Accessibility                   | All chat and preview journeys meet the project's WCAG 2.2 AA target                              |
| Failure recovery                | 100% of simulated provider, retrieval, and media failures produce a safe non-fabricated fallback |

## Evaluation-set requirements

- Each use case receives at least three phrasings: direct, conversational, and ambiguous or adversarial.
- R2 through R4 cases receive positive, missing-evidence, stale-evidence, and conflicting-evidence variants.
- Recommendation cases include incomplete preferences, contradictory preferences, and no-match outcomes.
- Multilingual cases preserve entities, numbers, units, dates, citations, refusal rules, and handoff consent.
- Test records contain expected intent, risk tier, answer mode, required source IDs, prohibited claims, preview type, clarification expectation, and escalation expectation.
- Release evaluation data stays separate from examples used to design prompts so it can detect overfitting.

## T0029 completion evidence

T0029 is complete when this specification is approved as the behavioural scope for Phase 2 and its automated contract test passes. T0030 will then catalogue and approve the knowledge sources needed to answer these use cases.
