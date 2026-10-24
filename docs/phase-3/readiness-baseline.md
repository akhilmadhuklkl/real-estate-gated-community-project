# Phase 3 implementation readiness baseline

## Readiness status

Phase 3 is ready to begin T0054 and T0055 acceptance. Application implementation,
infrastructure provisioning, production data collection, and paid-service activation
remain paused until AKHIL explicitly authorizes the applicable tracker task.

## Approved initial operating model

- AKHIL is the only active owner account at initial launch.
- Public registration is disabled.
- Additional roles exist in the permission design but remain inactive until invited.
- Every consequential publication, role, export, deletion, AI activation, migration,
  recovery, and release decision remains under owner control.
- Development and testing use synthetic, non-personal records only.

## Role-permission baseline

| Capability                                   |    Owner     | Content manager |         Sales         | AI reviewer |    Auditor     |
| -------------------------------------------- | :----------: | :-------------: | :-------------------: | :---------: | :------------: |
| Manage users and roles                       |     Yes      |       No        |          No           |     No      |       No       |
| Approve and publish public content           |     Yes      |  Prepare only   |          No           |     No      |      View      |
| Manage villa facts                           |     Yes      |  Prepare only   |     View assigned     |    View     |      View      |
| Approve price and availability               |     Yes      |       No        |     Propose only      |     No      |      View      |
| Review AI sources and evaluations            |     Yes      | Propose sources |          No           |   Review    |      View      |
| Activate AI knowledge or model release       |     Yes      |       No        |          No           |  Recommend  |      View      |
| Manage enquiries and visits                  |     Yes      |       No        |     Assigned only     |     No      | View aggregate |
| Export personal information                  | Yes, audited |       No        | Assigned and approved |     No      |       No       |
| View audit and recovery evidence             |     Yes      |   Own actions   |      Own actions      | Own actions |   Read only    |
| Execute backup restore or production release |     Yes      |       No        |          No           |     No      |       No       |

The server is authoritative. UI visibility never replaces authorization.

## Editable information inventory

The administration platform may manage these approved categories:

1. villa identity, type, areas, rooms, plans, specifications, construction state,
   availability state, pricing state, qualifications, and verification dates;
2. homepage, community, amenities, gallery, location, specifications, contact,
   privacy, accessibility, and supporting page content;
3. images, plans, brochures, documents, alt text, rights state, authority, access,
   expiry, and replacement history;
4. approved knowledge documents, chunks, claims, citations, permissions, languages,
   qualifications, review dates, index versions, and activation records;
5. consented enquiries, visits, assignments, statuses, reminders, follow-up, and
   deletion state;
6. users, roles, notification preferences, security state, and audit evidence;
7. aggregate operational measures and approved cost configuration.

Secrets, raw provider credentials, production environment values, raw visitor
conversations, voice audio, and unrestricted logs are not editable content.

## Administration information architecture

```text
Admin overview
├── Villas
│   ├── Inventory
│   ├── Verification queue
│   └── Change history
├── Website content
│   ├── Drafts and reviews
│   ├── Published versions
│   └── Media and documents
├── AI knowledge
│   ├── Source review
│   ├── Extracted claims
│   ├── Evaluation results
│   └── Index and release history
├── Enquiries
│   ├── Assigned work
│   ├── Follow-up
│   └── Retention and deletion
├── Site visits
│   ├── Availability
│   ├── Requests
│   └── Calendar and reminders
├── Reports
│   ├── Property operations
│   ├── AI quality and reliability
│   └── Privacy-safe exports
└── Settings
    ├── Users and roles
    ├── Notifications
    ├── Policies and retention
    ├── Audit history
    └── Backup and recovery
```

Each area requires responsive desktop and mobile behaviour plus loading, empty,
validation, permission-denied, conflict, service-unavailable, and recovery states.

## Service-selection gates

No vendor is approved or provisioned by this document. T0056–T0057 must compare
candidate services using these mandatory criteria.

| Service        | Mandatory selection criteria                                                                                                                                                            |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Database       | Relational constraints, transactions, backups, point-in-time or tested restore, encryption, region, migration support, row-level protection, export, portability, and predictable cost. |
| Authentication | Secure sessions, owner invitation, recovery, multi-factor support, revocation, audit events, server verification, abuse controls, and no public registration by default.                |
| File storage   | Private-by-default objects, signed access, antivirus integration path, size/type controls, versioning, lifecycle deletion, backup, rights metadata, and separate public delivery.       |
| Notifications  | Verified sender, consent-aware templates, delivery status, retries, suppression, rate limits, sandbox mode, minimal payloads, and predictable limits.                                   |
| Monitoring     | Health, errors, latency, availability, alerts, access control, privacy-safe fields, retention controls, and export without raw visitor content.                                         |
| AI capacity    | Server-only credentials, approved models, rate and budget limits, regional and privacy review, failure handling, provider monitoring, and repeatable pilot support.                     |

Selection must record rejected alternatives, cost assumptions, exit strategy, and
which responsibilities belong to the provider versus AKHIL.

## Environment baseline

| Environment | Data                                       | Access                           | Purpose                                                                                       |
| ----------- | ------------------------------------------ | -------------------------------- | --------------------------------------------------------------------------------------------- |
| Local       | Synthetic only                             | AKHIL’s development machine      | Coding, unit tests, schema work, and safe fixtures.                                           |
| Preview     | Synthetic or explicitly approved test data | Authenticated reviewers          | Integration, migrations, security, accessibility, UAT, AI evaluation, and recovery rehearsal. |
| Production  | Approved real operational data only        | Least-privilege production roles | Public product and authorized owner operations.                                               |

- Credentials, databases, storage buckets, notification senders, and web origins are
  environment-specific.
- Production records are never copied into local development.
- Migrations run in preview with backup and rollback evidence before production.
- Preview cannot send real visitor communication.
- Production changes use the exact accepted artifact.

## Mandatory security baseline

- server-side authentication and authorization;
- secure, expiring, revocable sessions and multi-factor readiness;
- no public administration signup;
- login, recovery, upload, export, and write-operation rate limits;
- request schemas, size limits, origin checks, and safe error responses;
- encrypted transport and provider-managed encryption at rest;
- secret management outside source and client bundles;
- private-by-default files and time-bounded authorized access;
- file-type verification, malware-scanning path, quarantine, and rights review;
- database constraints, least-privilege service roles, and row-level protection;
- audit events for privileged operations;
- automated retention and tested deletion;
- dependency, static, dynamic, authorization, abuse, accessibility, and privacy tests;
- encrypted backups and documented restoration;
- incident, rollback, key rotation, and account-revocation runbooks.

Any critical or high-severity finding blocks release. A medium finding requires an
owner-approved remediation date and compensating control.

## Budget and purchasing policy

- Planning and local evaluation may prefer free allowances.
- Free service is not itself an acceptance criterion.
- No paid plan, domain, message, database, storage, monitoring, or AI capacity change
  is authorized without AKHIL reviewing the monthly base cost, usage-based exposure,
  limit controls, cancellation, data export, and recovery implications.
- Cost telemetry is enabled only with verified provider rates.
- Budget alerts must exist before real traffic or personal-data collection.
- Service exhaustion must fail safely without losing existing public content.

## Pre-implementation checklist

- [x] Version 1.0.0 is tagged and preserved.
- [x] Phase 3 tasks T0054–T0077 exist in the tracker.
- [x] Scope, non-goals, users, capabilities, and acceptance evidence are defined.
- [x] Privacy, consent, retention, access, content authority, analytics, and incident
      baselines are defined.
- [x] Initial roles and owner-only activation are defined.
- [x] Editable information categories and administration navigation are defined.
- [x] Environment separation and synthetic-data requirements are defined.
- [x] Security baseline and service-selection criteria are defined.
- [x] Purchasing and budget authority are defined.
- [x] AKHIL explicitly authorizes implementation of the first active task.
- [x] T0056 records the selected architecture and threat model.
- [ ] T0057 records approved services, regions, limits, and costs before provisioning.

## Phase 3 release gate

The release is blocked unless all of the following pass on the exact candidate:

1. formatting, lint, static types, unit, component, schema, and production build;
2. migration forward, rollback, backup, and full restoration tests;
3. authentication, session, role, record, export, upload, and abuse authorization;
4. privacy, consent, retention, deletion, analytics, and audit verification;
5. public website regression, accessibility, performance, desktop, and mobile tests;
6. villa, content, media, AI publication, enquiry, visit, notification, and reporting
   integration journeys;
7. full Phase 2 AI evaluation plus new knowledge-publishing and model-release cases;
8. isolated preview security review and owner UAT using synthetic data;
9. owner pilot, training, operating guide, support ownership, and launch approval;
10. production migration backup, smoke checks, monitoring, alert, rollback, and
    post-release verification;
11. stable version preservation with release evidence and a tested rollback point.

## Start condition

The next implementation action is allowed only after AKHIL explicitly says to begin
T0054. Until then, the released public application and production services remain
unchanged.
