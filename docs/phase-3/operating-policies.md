# Phase 3 operating, privacy, and content policies

## Decision record

- Status: approved baseline
- Policy owner: AKHIL
- Applies to: Phase 3 design, implementation, testing, pilot, release, and operations
- Review trigger: before collecting real personal information, enabling a new role,
  adding an external integration, or changing a retention period

These policies define the minimum acceptable behaviour. They are engineering and
product controls, not a substitute for jurisdiction-specific legal review.

## Data-minimization policy

Collect only information required to answer an enquiry, arrange a requested visit,
or operate an authorized administrative account.

### Allowed visitor information when the feature is approved

- name;
- one chosen contact method;
- optional preferred contact time;
- selected villa or visit interest;
- visitor-written enquiry or reviewed handoff message;
- consent timestamp and policy version;
- operational status and assigned representative.

### Prohibited by default

- government identifiers;
- financial account or payment-card data;
- health, biometric, caste, religion, political, or other sensitive profiling data;
- background-check information;
- precise continuous location;
- unrequested contact-book information;
- hidden behavioural profiles;
- visitor questions, answers, or audio copied into AI training or knowledge sources.

Forms must explain purpose, required fields, retention, and the user’s next action.
Optional fields must remain visibly optional.

## Consent and communication policy

- A visitor must intentionally submit an enquiry or visit request.
- Preselected marketing consent is prohibited.
- The system must not send an assistant-composed message until the visitor or
  authorized staff member reviews and confirms it.
- Contact preference and consent scope must be respected across reminders and
  follow-up.
- Marketing communication requires a separate approved purpose and opt-out process.
- Administrative alerts must not include unnecessary contact or conversation content.

## Initial retention baseline

These periods remain configuration values and require legal and owner review before
real data collection.

| Record                                 |                               Initial maximum | Required handling                                                                    |
| -------------------------------------- | --------------------------------------------: | ------------------------------------------------------------------------------------ |
| Unsubmitted form or assistant draft    |                          Browser session only | Do not persist server-side.                                                          |
| Voice audio                            |                       Processing request only | Delete immediately after transcription or failure.                                   |
| New enquiry                            |                         90 days after closure | Delete or irreversibly anonymize unless an approved obligation requires longer.      |
| Visit request                          |           90 days after visit or cancellation | Delete contact content; retain only approved aggregate counts.                       |
| Administrative session security events |                                       30 days | Retain categorical evidence without passwords, tokens, or submitted content.         |
| Operational application logs           |                               30 days maximum | Exclude conversations, audio, contact data, secrets, and unique visitor identifiers. |
| Aggregate product and AI metrics       |                                       90 days | Use low-cardinality categories only.                                                 |
| Content and villa change history       | Product lifetime plus approved archive period | Retain authority and decision evidence without unnecessary personal content.         |
| Audit records for privileged actions   |                     365 days initial baseline | Restrict access and review the period before launch.                                 |
| Backups                                |                      30 days initial baseline | Encrypt, restrict, expire automatically, and include deletion propagation rules.     |

Deletion must cover active data, search indexes, exports, caches, and expiry from
backups according to the approved recovery design. Legal-hold exceptions require a
recorded owner decision and must not become a general retention shortcut.

## Access policy

- AKHIL is the only active administrator at initial launch.
- Public registration is disabled.
- New users require owner invitation, named identity, approved role, and revocable
  access.
- Shared administrator accounts are prohibited.
- Privileged actions require server authorization, not hidden buttons alone.
- Production access uses the minimum permission and is separate from development and
  preview access.
- Role changes, exports, deletions, publications, source activation, and recovery
  actions are audited.
- Lost-device, suspected-account, and staff-departure procedures must revoke sessions
  and credentials promptly.

## Content authority policy

Every published fact requires a named authority, verification date, lifecycle state,
and qualification when appropriate.

| Content                                           | Required authority                                 | Publication rule                                                    |
| ------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------- |
| Price and availability                            | AKHIL or later owner-approved commercial authority | Current verification date and confirmation notice required.         |
| Villa status and specifications                   | AKHIL or approved project authority                | Preserve effective date, history, and source evidence.              |
| Legal, approval, ownership, and completion claims | Approved authoritative document and reviewer       | Never infer from marketing material; publish only reviewed wording. |
| Contact route                                     | AKHIL                                              | Test destination and consent behaviour before publication.          |
| Images, plans, and brochure                       | Rights holder or approved owner evidence           | Rights state and usage scope required.                              |
| Amenities and location facts                      | Approved brochure, record, or owner confirmation   | Preserve qualifications and last review date.                       |
| AI answer                                         | Approved active knowledge sources                  | Cite evidence and retain normal guardrail treatment.                |

Conflicts use the highest-authority current source. Unresolved conflicts remain
unpublished and retrieval-ineligible.

## AI knowledge policy

- Upload does not imply approval.
- Extraction does not imply factual correctness.
- Reviewer approval does not bypass evaluation.
- Evaluation success does not bypass final owner activation.
- Only active, unexpired, permitted evidence may be retrieved.
- Changing commercial facts require confirmation even when cited.
- Missing evidence produces a safe limitation or handoff, not invented content.
- Model, provider, prompt, policy, language, retrieval, schema, or source changes
  require the approved evaluation gate.
- Raw enquiries, private notes, staff messages, and visitor conversations are never
  knowledge sources.

## Enquiry and visit policy

- Use synthetic records in development and automated tests.
- Real records exist only in the approved production system.
- Staff see only records needed for their assigned work.
- Exports require an authorized purpose and an audit event.
- Notes must remain factual, necessary, and free of sensitive profiling.
- Closed records follow the configured retention clock.
- The visitor may request correction or deletion through the approved contact route.
- Calendar and notification payloads contain the minimum necessary information.

## Analytics policy

Allowed measures include aggregate counts, status, safe topic, language, citation
count, response time, feedback category, handoff category, inventory state, content
freshness, enquiry stage, and visit stage.

Disallowed analytics include raw questions, raw answers, audio, message bodies,
contact details, IP addresses, precise location, fingerprinting, cross-site tracking,
or combining records to create unapproved visitor profiles.

No analytics or advertising cookie is enabled without a separately reviewed need,
consent mechanism, privacy notice, retention period, and opt-out behaviour.

## Incident and breach policy

1. Contain access and stop the affected workflow.
2. Preserve minimal security evidence without copying exposed content unnecessarily.
3. Revoke affected sessions, keys, or roles.
4. Assess scope, data type, environments, and recovery state.
5. Restore a known-good service or use the documented fallback.
6. Record owner decisions and required notifications.
7. Correct the cause and repeat security, privacy, recovery, and release gates.

Production secrets must never appear in source control, screenshots, issue text,
release notes, analytics, exported logs, or support messages.

## Policy-change rule

Any change that expands collected data, recipients, integrations, retention,
automated action, AI use, or administrator authority requires:

1. an updated policy decision;
2. threat and privacy review;
3. affected test and migration updates;
4. owner approval;
5. updated visitor or staff communication when applicable;
6. a new release gate before production activation.
