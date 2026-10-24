# Phase 3 managed-service decision record

## Decision

Use the existing Vercel-hosted Next.js application as the application and API
boundary. Select Supabase as the preferred managed PostgreSQL, administrator identity,
and object-storage platform. Select Resend as the preferred transactional email
provider. Retain the current approved language-model provider for the grounded
assistant.

Status: architecture selected, provisioning and purchasing deferred to T0057.

## Evaluation criteria

The comparison used the approved Phase 3 gates: security, relational integrity,
identity controls, private storage, backup and restoration, environment isolation,
portability, operational effort, predictable early cost, and safe degradation.

## Selected services

| Capability             | Preferred service                                          | Reason for selection                                                                                                                        | Portability and exit                                                                                                                                       |
| ---------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application and API    | Vercel with Next.js Route Handlers and Functions           | Preserves the production platform, tested deployment promotion, rollback, CDN delivery, and framework integration                           | Application remains standard Next.js and TypeScript. Keep provider configuration outside domain logic and retain a documented deployment export path.      |
| Relational database    | Supabase managed PostgreSQL                                | Full PostgreSQL constraints and transactions, RLS, migration tooling, managed backups on paid plans, and standard SQL portability           | Maintain SQL migrations and scheduled logical exports. Avoid provider-specific logic in core domain tables unless documented.                              |
| Administrator identity | Supabase Auth                                              | Integrates server-verified sessions with PostgreSQL authorization and supports invitation, session control, and multi-factor authentication | Keep application roles in domain tables and authorization services. Provide a user and role export and a recovery process independent of interface access. |
| Files                  | Supabase Storage                                           | Private-by-default policy model integrates with authenticated users and RLS; supports signed access and separate buckets                    | Retain object hashes, metadata, and a portable object manifest. Perform independent object export because database backups do not contain file bytes.      |
| Transactional email    | Resend                                                     | Verified-domain sending, idempotency keys, delivery events, retries, and a focused email API                                                | Use provider-neutral notification intents and templates. Store delivery state by internal notification ID so another sender can replace the adapter.       |
| AI generation          | Current approved provider                                  | Version 1 evaluation and failure behaviour already exist                                                                                    | Preserve the server-only provider interface, evaluation suite, and last-known-good configuration. A future independent fallback requires a new pilot.      |
| Monitoring             | Vercel and provider telemetry plus application-safe events | Extends existing operational evidence without adding visitor-content telemetry                                                              | Keep low-cardinality events in an application contract that can export to another monitoring service.                                                      |

## Important current constraints

- Supabase database backups do not include Storage object bytes. File recovery needs a
  separate export or copy and a hash manifest.
- New Supabase projects may require explicit Data API exposure and grants. The design
  does not rely on automatic exposure.
- Tables in exposed schemas require explicit grants and RLS. Policies alone do not
  remove broad grants.
- The Supabase service role bypasses RLS and therefore remains server-only and
  exceptional.
- Supabase free projects need regular logical exports. Paid backup retention and
  point-in-time recovery depend on the selected plan.
- Vercel Functions should run close to the selected database region. T0057 records
  the exact compatible region before configuration.
- Resend sending requires an approved and verified domain. Preview sends must use a
  sandbox or allowlisted test destination.

## Alternatives considered

| Alternative                                                | Decision                  | Reason                                                                                                                                                                    |
| ---------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep repository JSON as the Phase 3 database               | Rejected                  | Cannot safely support concurrent enquiries, visits, role-based administration, retention, or durable audit.                                                               |
| Vercel Blob plus a separate database and identity provider | Rejected for MVP          | Adds policy, credential, backup, and recovery boundaries without a clear product benefit at the current scale.                                                            |
| Neon PostgreSQL plus separate identity and storage         | Viable fallback           | Strong PostgreSQL option, but separate identity and file services add integration and operational work. Reconsider if Supabase cost, region, or portability review fails. |
| Firebase                                                   | Rejected for primary data | The product requires relational constraints, transactional lifecycle rules, portable SQL, and conflict-safe scheduling.                                                   |
| Auth-only specialist plus separate PostgreSQL              | Deferred                  | May offer stronger identity specialization but adds cost and another critical dependency for a single-owner MVP.                                                          |
| Provider-default authentication email                      | Rejected for production   | Production needs an owned sending domain, controlled templates, delivery evidence, and a replaceable notification adapter.                                                |
| Autonomous agent with administrative tools                 | Rejected                  | Phase 3 requires owner-controlled publication and consequential actions. Model output cannot grant authority or mutate records without reviewed workflows.                |

## Provider responsibility and owner responsibility

| Provider responsibility                                                              | AKHIL responsibility                                                                                      |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Operate managed infrastructure according to the selected plan and published controls | Configure least privilege, RLS, sessions, origins, buckets, senders, retention, alerts, and budget limits |
| Encrypt managed transport and storage according to provider service design           | Keep credentials out of source and clients, rotate them, and restrict account access                      |
| Offer documented backup, export, logs, and recovery capabilities                     | Perform exports, object backup, restore drills, evidence review, and incident decisions                   |
| Deliver service health and usage information                                         | Monitor safe application signals and respond to failures or quota risk                                    |
| Process approved requests sent to the service                                        | Minimize payloads, obtain consent, enforce policy, and avoid prohibited content                           |

## Cost and purchasing boundary

T0056 does not authorize a purchase. T0057 must record the current base price,
included limits, usage exposure, budget alerts, cancellation behaviour, export cost,
backup capability, and recovery impact for each environment. Free allowances may be
used for isolated development only when they meet the required security and recovery
tests. Production personal information must not begin on an unapproved plan.

## Sources reviewed on 24 October 2026

- Supabase Auth overview: <https://supabase.com/docs/guides/auth>
- Supabase row-level security: <https://supabase.com/docs/guides/database/postgres/row-level-security>
- Supabase Storage access control: <https://supabase.com/docs/guides/storage/security/access-control>
- Supabase database backups: <https://supabase.com/docs/guides/platform/backups>
- Supabase breaking-change changelog: <https://supabase.com/changelog?types=breaking-change>
- Vercel Functions: <https://vercel.com/docs/functions>
- Vercel function regions: <https://vercel.com/docs/functions/configuring-functions/region>
- Vercel environment variables: <https://vercel.com/docs/environment-variables>
- Resend email API and idempotency: <https://resend.com/features/email-api>
- Resend webhooks: <https://www.resend.com/features/webhooks>

T0057 must recheck these sources because capabilities, limits, and prices can change.
