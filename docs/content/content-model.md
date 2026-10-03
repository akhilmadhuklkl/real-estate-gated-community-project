# Project content model

**Task:** T0008 - Model project content

**Owner:** AKHIL

**Status:** Completed

**Resumed:** 3 October 2026

## Purpose

The production application needs one structured content contract for web pages, search, comparisons, enquiries, and the future property assistant. The contract separates factual content from presentation so the preserved mockup can guide the interface without becoming production source code.

## Files

- `content/schema/project-content.schema.json` defines the versioned JSON contract.
- `content/data/glitz-pride.json` contains the first brochure-backed development record.
- `docs/content/content-register.md` remains the approval and rights register.
- `project-assets/official/Glitz_Brochure.pdf` is the current authoritative development source, subject to publication approval.

## Model areas

| Area | Production use | Key safeguards |
| --- | --- | --- |
| Project and branding | Metadata, headings, project story, structured data | Name, tagline, developer, and claims require approval. |
| Villa types | Catalogue, details, comparison, plans, recommendations | Unknown rooms, pricing, availability, and legal data remain null or unknown. |
| Amenities | Lifestyle pages, master plan, previews | Delivery state is explicit and defaults to unknown. |
| Specifications | Specification page, cited answers | Each category retains page-level evidence and approval state. |
| Location | Map, landmark cards, directions, assistant previews | Coordinates, distances, names, and measurement method require current verification. |
| Contacts | Call, email, messaging, visit booking, human handoff | Publication consent, ownership, hours, and routing must be confirmed. |
| Media | Galleries, hero media, floor plans, maps | Every asset needs accessible text, rights status, and source evidence. |
| Documents | Downloads, knowledge ingestion, citations | Version, date, owner, approval, and supersession are mandatory. |

## Governance rules

1. Every publishable record has a stable identifier, approval state, evidence, and last-reviewed date.
2. `awaiting-approval` and `development-reference` records may be used only in local or clearly labelled preview environments.
3. Only `approved` records may appear in production.
4. Missing values remain `null` or `unknown`. The application must not infer prices, availability, room counts, legal facts, completion dates, or contact ownership.
5. Derived values must state the calculation in their evidence note. The brochure villa total of 2,220 sq. ft. is derived from 1,410 plus 810 sq. ft.
6. Source wording that may be ambiguous is retained and flagged. The brochure's "Shuttle court" label requires owner clarification before publication.
7. Superseded records remain auditable but must not appear as current.
8. Production components consume this contract. The mockup remains unchanged as the approved visual reference.

## Phase 1 ownership workflow

Phase 1 will use repository-managed JSON content. Every change must update the relevant record, retain evidence, pass schema validation, and be reviewed with the associated task. A content-management system remains a later decision for administrative workflows; adopting one must preserve the same identifiers, approval states, and evidence metadata.

## Brochure coverage recorded

- Project name, developer, positioning, architect, and nature-led narrative
- Seven brochure-labelled amenities or amenity groups
- One unnamed villa plan with ground and first-floor areas
- Five specification categories
- Project address, brochure coordinates, and 18 landmark distances
- Kerala and Dubai contact records
- Brochure media references and the brochure document record

## Remaining decisions

- Confirm final project and developer display names.
- Approve publication rights for the brochure, logo, copy, renders, plans, and contacts.
- Confirm villa type names, room counts, plot data, availability, prices, and disclaimers.
- Confirm delivered versus proposed amenity states.
- Verify the project coordinates, landmark distances, and distance methodology.
- Confirm current contact channels, routing, consent wording, and operating hours.
- Choose repository-managed content or a content-management system before T0009 is complete.

## Acceptance evidence for T0008

The schema validates, representative records cover every model area, approval rules are documented, and the Phase 1 repository-managed workflow is recorded. Owner-dependent approvals remain tracked under T0004 and do not permit production publication until resolved.
