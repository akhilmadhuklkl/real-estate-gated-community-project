# Phase 3 data schema and migrations

## Decision record

- Task: T0058
- Owner and reviewer: AKHIL
- Baseline migration: `create_phase_3_core_schema`
- Data classification: canonical administrative data is private by default
- Status: complete in Preview and Production on 25 October 2026

## Schema boundary

All Phase 3 operational tables live in `app_private`. The schema is not included in
the Data API exposure list. `anon` and `authenticated` receive no schema or table
privileges. Row-level security is enabled and forced on every table as defense in
depth. T0059 will add reviewed identity-aware policies and server access paths; until
then, browser roles are denied by default.

## Domain map

| Domain | Canonical tables | Important controls |
| --- | --- | --- |
| Identity | `profiles`, `role_assignments` | Auth user reference, controlled roles, one active owner |
| Villas | `villas`, `villa_versions` | Verified commercial facts, lifecycle state, immutable version snapshots |
| Content | `content_items`, `content_versions` | Locale-aware versions and draft-to-archive lifecycle |
| Files | `media_assets`, `documents` | Hash, provenance, rights, scan, quarantine, retrieval eligibility |
| Enquiries | `enquiries`, `enquiry_status_history` | Consent, data minimization, assignment, retention and history |
| Visits | `visit_settings`, `visits`, `visit_status_history` | Scheduling bounds, ownership, consent and lifecycle history |
| Governance | `approvals`, `notification_outbox`, `audit_events` | One pending decision, idempotent delivery and append-only evidence |

Polymorphic approval subjects deliberately use a constrained subject type and UUID
instead of cross-table foreign keys. Application validation and approval services
must verify that the referenced subject exists before creating an approval.

## Migration workflow

1. Create migration files only through `supabase migration new`.
2. Reset the local stack from migrations and synthetic seed data.
3. Run schema contract tests, database linting, and security/performance advisors.
4. Apply the reviewed migration to Preview and run acceptance queries.
5. Apply the identical migration to Production only after Preview evidence passes.
6. Never repair migration history or edit an applied migration. Add a corrective
   forward migration instead.

## Rollback strategy

The baseline migration is intentionally additive. Before production contains real
data, rollback means restoring the pre-migration database snapshot or applying a
reviewed forward migration that removes the new schema. Once real data exists,
destructive rollback is prohibited: deploy a compatibility fix, preserve the data,
and restore from verified backup only when the incident plan authorizes it.

## Synthetic seed rule

`supabase/seed.sql` contains only synthetic villa and content records. It must never
contain a real email address, phone number, visitor message, user identifier, or
production export. Hosted Preview and Production are not seeded automatically.

## Acceptance evidence

- Preview received the baseline migration first, followed by the advisor-driven
  hardening migration.
- The same two migration files were then applied to Production without modification.
- Hosted migration history was normalized once during bootstrap so Preview,
  Production, and repository filenames share the exact same canonical versions.
- Each environment contains 16 canonical tables, 16 forced-RLS tables, 16 explicit
  temporary deny policies, zero browser-role table grants, and 67 indexes.
- Constraint probes confirmed that unverified commercial pricing is rejected and
  audit records cannot be deleted.
- Security advisors report zero findings in both environments.
- Performance advisors report only expected unused-index information because both
  new schemas intentionally contain no operational records yet.
- Docker Desktop did not become responsive during this task. The checked-in pgTAP
  contract remains the first local entry check for T0059; hosted Preview and
  Production acceptance queries passed.
