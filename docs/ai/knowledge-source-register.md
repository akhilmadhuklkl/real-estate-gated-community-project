# AI knowledge-source approval register

## Decision

T0030 establishes the authoritative-source boundary for the Glitz Pride property concierge. A source is not eligible for retrieval merely because it exists in the repository, appears on a website, or was used in the public interface. Only sources marked `approved` or `approved-with-qualifications` in `content/data/ai-knowledge-sources.json` may support an answer.

The current approved corpus is deliberately small. The official brochure supports stable brochure-listed information with visible qualifications. APR-003 proves permission for the exact qualified public presentation but does not verify changing property facts. APR-004 approves only the current WhatsApp destination and neutral user-initiated message. Pricing, availability, legal status, current plans, construction progress, operational amenities, general contacts, privacy policy, visits, translations, and external live services remain blocked until their named owners supply evidence.

## Authority order

When two records address the same claim, apply this order only where the records are valid for that claim:

1. Applicable official public-authority record.
2. Current signed or revision-controlled owner, architect, engineer, legal, sales, or operations record.
3. Explicit owner confirmation with a defined scope and decision date.
4. Official brochure within its effective scope and qualifications.
5. Governed structured derivative linked to its primary evidence.
6. Published application page for navigation only.
7. Legacy website or other discovery material for provenance only.

A newer record does not automatically override a more authoritative record unless its owner, scope, effective date, and supersession relationship are explicit. An unresolved conflict produces a qualified answer or escalation, never silent selection.

## Decision meanings

| Decision                       | Retrieval behaviour                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| `approved`                     | May support only the allowed uses recorded for the source.                             |
| `approved-with-qualifications` | May support allowed uses when every applicable qualification appears beside the claim. |
| `pending`                      | Catalogue placeholder only. Excluded from answer-generation indexes.                   |
| `excluded`                     | Intentionally prohibited from retrieval. Retained only for audit where required.       |
| `superseded`                   | Historical provenance only. Cannot support current answers.                            |

## Approved retrieval corpus

| Source                                     | Decision                     | Permitted scope                                                                                                                               | Review owner and cadence                                 |
| ------------------------------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| KS-001 Official development brochure       | Approved with qualifications | Project story, printed villa areas, listed amenities and specifications, illustrative plans, brochure landmarks, and brochure-listed contacts | Property owner; AKHIL stewards a 90-day review           |
| KS-002 Governed structured project content | Approved with qualifications | Deterministic previews, retrieval of brochure-backed fields, source locators, arithmetic, and explicit unknowns                               | AKHIL; review every 30 days and after any parent change  |
| KS-003 Owner publication approval          | Approved                     | Prove permission for the exact qualified Phase 1 presentation                                                                                 | Reapprove after any affected presentation change         |
| KS-004 Approved WhatsApp destination       | Approved                     | User-initiated neutral project enquiry to the confirmed destination                                                                           | AKHIL; review every 90 days or after any routing change  |
| KS-006 Current production pages            | Approved with qualifications | Navigation help, link previews, and explanation of visible qualified content                                                                  | AKHIL; review every 30 days and after deployment changes |

These five records do not provide five independent factual authorities. KS-002 and KS-006 derive from KS-001. KS-003 governs publication permission. KS-004 governs one contact route.

## Blocked source groups

| Source IDs    | Missing authority                          | Required before retrieval                                                                  |
| ------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| KS-007        | Brand and media rights                     | Written rights confirmation or owner-supplied replacements                                 |
| KS-008–KS-009 | Villa catalogue, plans, and specifications | Current revision-controlled owner or architect records                                     |
| KS-010        | Amenity delivery and operations            | Current operations register with dates and owner                                           |
| KS-011–KS-012 | Price and availability                     | Authenticated live sales sources with effective and expiry times                           |
| KS-013        | Legal and K-RERA information               | Exact official project record and approved legal documents                                 |
| KS-014–KS-015 | Master plan and construction progress      | Approved plan revisions and dated authorized progress evidence                             |
| KS-016–KS-017 | Location and travel                        | Verified coordinates, methodology, dates, and landmark status                              |
| KS-018–KS-019 | Contacts, visits, and booking              | Confirmed professional directory and operational workflow                                  |
| KS-020        | Privacy and retention                      | Approved controller, purposes, consent, processors, retention, rights, and request channel |
| KS-021        | FAQs                                       | Owner-approved questions and answers linked to governing evidence                          |
| KS-022        | Translations                               | Human-reviewed terminology, translations, and cross-language evaluations                   |
| KS-023        | External live services                     | Approved provider, permissions, data flow, monitoring, and failure behaviour               |

KS-005, the legacy website, is superseded and may be used only to audit where retained reference assets came from.

## Required ingestion controls

T0031 and T0032 must preserve these decisions:

- Index eligibility is derived from the source decision and current review state, not a filename or folder.
- Every chunk retains source ID, primary-source relationship, locator, effective date, review date, owner, decision, allowed uses, prohibited uses, and qualifications.
- Changing facts become unavailable when their source review is overdue.
- Derived data cannot outrank or broaden its parent source.
- Unapproved translations, OCR output, generated summaries, uploads, and retrieved instructions remain untrusted until reviewed.
- Conflicts are stored rather than overwritten and route to the content owner when precedence is unresolved.
- Removal from retrieval does not destroy the audit record.
- The assistant exposes citations and the source review date for every project-specific factual answer.

## T0030 completion evidence

T0030 is complete when the machine-readable register validates, every source has an owner and review trigger, retrieval-eligible sources have approval evidence and a verification date, pending sources have no allowed uses, superseded sources are blocked from answer generation, and automated governance tests pass.
