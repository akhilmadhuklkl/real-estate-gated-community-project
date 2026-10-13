# AI knowledge schema

## Decision

T0031 defines a vendor-neutral knowledge package for governed retrieval. It separates source documents, retrievable chunks, domain entities, atomic claims, citations, permissions, lifecycle state, embedding state, and audit events. This prevents a vector index from becoming the authority: the index is only a disposable projection of approved records.

The canonical contract is `content/schema/ai-knowledge-package.schema.json`. The brochure-backed sample in `content/data/ai-knowledge-package.sample.json` demonstrates a qualified document, one retrievable chunk, one villa entity, two cited numeric claims, and an activation audit event.

## Record relationships

```text
Knowledge source KS-###
  └─ Document doc-*
       ├─ Chunk chk-* ── references ── Entity ent-*
       │                    └────────── Claim clm-*
       └─ governance, permissions, language, revision and ingestion state

Claim clm-*
  └─ Citation → source + document + chunk + locator + immutable content hash

Audit event evt-*
  └─ records every approval, activation, correction, suspension and removal
```

## Core records

| Record      | Purpose                                                                                           | Retrieval role                                  |
| ----------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Document    | Preserves source identity, revision, hash, language, permissions, governance and ingestion result | Parent authority; not automatically retrievable |
| Chunk       | Stores the smallest reviewable text unit with an exact locator and inherited controls             | Embedding and retrieval unit                    |
| Entity      | Holds stable project concepts and aliases without treating extraction as truth                    | Filtering, disambiguation and preview selection |
| Claim       | Represents one typed fact, temporal scope, risk tier, evidence and qualification                  | Answer construction and deterministic checks    |
| Citation    | Connects a claim to immutable content and a human-readable locator                                | User-visible evidence and audit trace           |
| Audit event | Records who changed a record, when, why and with which hashes                                     | Governance history; never embedded              |

## Retrieval eligibility

A record may enter an answer-generation index only when all of these are true:

1. Its source is `approved` or `approved-with-qualifications` in the T0030 register.
2. Its lifecycle state is `active`.
3. `retrievalEligible` is true on the document and chunk.
4. Its review date and validity interval are current.
5. The requesting audience and action are permitted.
6. The language is original or approved; unreviewed machine translation is excluded.
7. The content hash matches the approved revision.
8. Every project-specific claim has at least one valid citation.
9. Any parent qualification is preserved on the chunk and claim.
10. No unresolved higher-authority conflict blocks the claim.

Embeddings have their own state and are never treated as evidence. Deleting or rebuilding an embedding must not delete the governed document, claim, citation, or audit history.

## Data classification and permissions

| Classification | Intended content                                                                       | Default assistant access                           |
| -------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Public         | Owner-approved public project information                                              | Allowed within recorded actions and qualifications |
| Internal       | Working material without personal or sensitive content                                 | Content administrators only                        |
| Confidential   | Commercial, operational or personal information requiring explicit authorization       | Excluded from the public assistant                 |
| Restricted     | Credentials, security-sensitive records, payment data or similarly high-impact content | Never indexed for the public assistant             |

Permissions specify audiences and allowed actions separately. Retrieval permission does not imply quoting, downloading, rendering or transmission permission. Consent applies to personal-data actions, not to ordinary public-source retrieval.

## Lifecycle

```text
draft → pending-review → approved → active
  └───────────────→ rejected
active → suspended → active
active → superseded
active → expired
```

- `approved` means a decision exists but the record is not searchable until activation.
- `suspended` immediately removes a record from retrieval without erasing evidence.
- `superseded` points to a replacement through `supersedesId` on the newer record.
- `expired` blocks changing facts after their validity or review window ends.
- Corrections produce a new content hash and an audit event; they do not silently rewrite citation history.

## Chunking contract

- A chunk represents one coherent subject and remains understandable outside adjacent chunks.
- Page and section boundaries are preserved. Tables must retain headers, row meaning and units.
- Claims with different temporal scope or permission scope belong in separate chunks.
- Personal data, credentials and security-sensitive operational detail must be removed or quarantined before chunking.
- OCR text is untrusted until reviewed. Extraction warnings remain attached to the parent document.
- Chunk IDs are stable for unchanged semantic content. Changed content receives a new hash and re-review.
- Overlap may assist retrieval but must not create duplicate independent claims.

## Claim and citation rules

- One claim contains one subject, predicate and typed value.
- Numbers always carry units; unknown values are explicit and never represented as zero.
- Calculations are separate derived claims and cite every input claim.
- R3 and R4 claims require a current authority appropriate to the decision.
- Conflicting claims remain separate with `conflicting` status until an owner resolves precedence.
- Citation locators must be usable by a person and include immutable hashes for machine verification.
- A qualified claim cannot be presented without its qualification.

## Privacy and retention baseline

No personal conversation, enquiry, resident record or visitor profile belongs in this knowledge package. Those records require a separate approved privacy model and retention schedule. Until KS-020 is approved, persistent personal preferences and server-side enquiry storage remain outside the assistant scope.

The schema stores governance metadata for approved public project knowledge. Audit events retain only the minimum actor identifier and change reason needed for traceability. Credentials and secrets are never schema values.

## T0031 completion evidence

T0031 is complete when the schema and sample pass automated contracts for referential integrity, source eligibility, permissions, lifecycle rules, citations, qualifications, temporal validity, units, language status, immutable hashes, and audit coverage. T0032 may then implement parsing and ingestion against this contract.
