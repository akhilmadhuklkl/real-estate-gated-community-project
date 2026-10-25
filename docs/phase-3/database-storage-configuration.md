# Phase 3 database and storage configuration

## Decision record

- Task: T0057
- Owner and reviewer: AKHIL
- Configuration date: 25 October 2026
- Status: complete; local configuration and isolated hosted environments are provisioned
- Selected data region: South Asia (Mumbai), `ap-south-1`
- Selected application function region: Mumbai, `bom1`
- Selected provider: managed Supabase PostgreSQL and Storage

## Environment isolation

| Environment | Application boundary                                    | Data boundary                          | Permitted data                             | Credential boundary                            |
| ----------- | ------------------------------------------------------- | -------------------------------------- | ------------------------------------------ | ---------------------------------------------- |
| Local       | Local Next.js on port 3000                              | Local Supabase stack                   | Synthetic records and files only           | Local generated keys only                      |
| Preview     | Protected Vercel preview                                | `glitz-pride-community-preview` (`zaiojauixrxhvlkodmcw`) in Mumbai    | Synthetic or explicitly approved test data | Preview-scoped publishable configuration  |
| Production  | Public production deployment and protected admin routes | `glitz-pride-community-production` (`vojpsnffnlsnydntrpoc`) in Mumbai | Approved operational data only             | Production-only publishable configuration |

The preview and production projects must never share a database, storage buckets,
project URL, publishable key, secret key, database password, backup destination, or
webhook secret. Production records must never be copied into preview or local.

## Plan and cost decision

The connected organization currently reports a recurring project cost of USD 0.
The Free plan allows two active projects, which fits one preview project and one
production project. The documented limits relevant to this MVP are 500 MB database
size per project, 1 GB file storage across the organization, 5 GB egress, and a
maximum 50 MB file size.

The Free plan is acceptable for initial implementation and controlled evaluation,
but it is not the final production recovery posture:

- inactive Free projects can pause after one week;
- provider-managed daily backups are not included;
- a database backup never restores Storage objects;
- the four-hour recovery-time target and 24-hour recovery-point target are not
  accepted until the independent export and restore drill in T0067 succeeds.

Before collecting real personal information, upgrade production to a plan with
provider-managed daily backups or approve and verify an independent daily logical
export that meets the recovery objectives. This is a release gate.

## Local service configuration

The repository pins the Supabase CLI and browser/server client packages. Run:

```powershell
pnpm install --frozen-lockfile
pnpm exec supabase start
pnpm exec supabase status
```

The local project uses PostgreSQL 17, requires explicit grants for Data API access,
and caps global file uploads at 50 MiB. Local Auth email is captured by the local
mail interface; it is not delivered to real recipients.

Docker is required to start the full local service. Generated local credentials are
development-only and must not be copied into preview or production. Docker Desktop
was installed but its engine did not become responsive during the final verification
window on 25 October 2026; the checked-in configuration and automated validation pass,
and the local runtime smoke test should be repeated before T0058 migration work begins.

## Storage boundaries

| Bucket                | Visibility  |  Limit | Allowed content                    | Rule                                                       |
| --------------------- | ----------- | -----: | ---------------------------------- | ---------------------------------------------------------- |
| `public-media`        | Public read | 10 MiB | PDF and approved web image formats | Only immutable, approved derivatives receive a public path |
| `protected-originals` | Private     | 25 MiB | PDF and approved web image formats | Authorized server access or short-lived signed URL only    |
| `quarantine`          | Private     | 25 MiB | PDF and approved web image formats | Owner-restricted; never used by public pages or retrieval  |
| `recovery-export`     | Private     | 50 MiB | Database/object export formats     | Owner-restricted recovery packages and manifests only      |

Public download does not mean public upload. Upload, replace, move, copy, and delete
operations remain policy-controlled. Storage upsert policies must include insert,
select, and update permissions. T0057 created and verified the four bucket records in
both hosted projects. T0058 will add application tables and explicit RLS policies
through reviewed migrations, preview first and then production.

## Environment variables

| Variable                               | Exposure                      | Local                  | Preview                 | Production                 |
| -------------------------------------- | ----------------------------- | ---------------------- | ----------------------- | -------------------------- |
| `DATA_ENVIRONMENT`                     | Server configuration          | `local`                | `preview`               | `production`               |
| `NEXT_PUBLIC_SUPABASE_URL`             | Browser-safe identifier       | Local API URL          | Preview project URL     | Production project URL     |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe, RLS constrained | Local generated key    | Preview publishable key | Production publishable key |
| `SUPABASE_SECRET_KEY`                  | Server-only secret            | Local generated secret | Deferred                | Deferred                   |

No hosted secret key is configured because T0057 does not require privileged server
access. If a later server-only feature requires one, it must be stored as a Vercel
Secret. It must never use a public prefix, enter browser code, appear in logs, or be
copied between environments. Preview and production values are scoped separately in
Vercel. Pulling hosted secrets to a developer machine is not part of the workflow.

## Provisioning checklist

1. Target organization confirmed: `akhilmadhuklkl's Org`.
2. `glitz-pride-community-preview` created in `ap-south-1` at USD 0.
3. `glitz-pride-community-production` created in `ap-south-1` at USD 0.
4. Only non-secret project identifiers are recorded in implementation evidence.
5. Separate Vercel Preview and Production variables are configured.
6. Public registration remains disabled before Auth is enabled for the application.
7. Apply T0058 migrations to preview first, run security and performance advisors,
   then apply the exact reviewed migration to production.
8. Verify public-bucket reads, private-bucket denial, signed access, upload limits,
   and environment isolation.
9. Complete database and object export/restore evidence before real-data release.

## Current platform changes accounted for

- New tables are not assumed to be reachable through the Data API. Every exposed
  table needs an explicit grant as well as RLS.
- GraphQL is not assumed to be enabled or introspectable.
- Modern TLS support is required for database, Auth, Storage, and Data API clients.
- Views that are exposed later must use invoker security or remain in an unexposed
  schema.

## Acceptance evidence

Both Mumbai cloud projects are active and healthy. Each contains the four expected
bucket records with the documented visibility, size limits, and MIME restrictions.
Vercel contains separate Preview and Production values for `DATA_ENVIRONMENT`, the
project URL, and the browser-safe publishable key. No privileged hosted key is needed
or configured. Both projects returned zero security and zero performance advisor
findings. Repository validation passes and no secret value is committed.

T0057 is complete. The remaining local Docker smoke test is a documented entry gate
for T0058 and does not weaken the verified hosted isolation or storage configuration.
