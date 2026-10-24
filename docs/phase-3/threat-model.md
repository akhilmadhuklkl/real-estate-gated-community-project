# Phase 3 threat model

## Scope and method

This threat model covers the public website, protected administration interface,
Next.js server boundary, managed database and identity, object storage, notification
delivery, governed knowledge publication, model-provider calls, audit evidence,
backups, and deployment process.

The model uses STRIDE categories and adds privacy, abuse, availability, and recovery
risks. Risk is evaluated before controls. Critical and high residual risk blocks
release. Medium residual risk requires an owner-approved remediation date and a
documented compensating control.

## Assets to protect

- administrator identity, sessions, roles, and recovery methods;
- enquiry and visit contact information;
- unpublished property facts, commercial data, documents, and media;
- approved public content and villa status;
- governed knowledge sources, evaluations, active index, and rollback index;
- audit, retention, deletion, consent, and release evidence;
- database, storage, notification, model, deployment, and recovery credentials;
- application availability and the integrity of Version 1 public behaviour.

## Threat actors

- anonymous attacker or automated bot;
- authenticated user attempting actions outside the assigned role;
- compromised administrator browser, device, mailbox, or session;
- malicious or unsafe uploaded file;
- compromised dependency, build step, provider credential, or webhook sender;
- accidental owner error, misconfiguration, migration defect, or deletion;
- provider outage, capacity exhaustion, regional failure, or billing suspension;
- untrusted content attempting prompt injection through the knowledge pipeline.

## Threat register

| ID    | Category               | Threat and affected boundary                                                                               | Inherent risk | Required controls                                                                                                                                              | Residual target | Verification                                                        |
| ----- | ---------------------- | ---------------------------------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------- |
| TM-01 | Spoofing               | Credential stuffing or stolen owner session enters `/admin`                                                | Critical      | No public signup, strong password, TOTP readiness, login limits, secure cookies, short expiry, session revocation, recent authentication for sensitive actions | Medium          | Invalid, expired, revoked, replayed, and rate-limited session tests |
| TM-02 | Elevation              | User-editable metadata or hidden interface control grants a stronger role                                  | Critical      | Server-controlled roles, central permission matrix, database grants, RLS, no authorization from user metadata                                                  | Low             | Role-action denial matrix at UI, API, and database layers           |
| TM-03 | Tampering              | Direct record request changes another record or bypasses lifecycle state                                   | Critical      | Opaque identifiers, resource-scoped authorization, optimistic version check, constraints, RLS, transactional audit                                             | Low             | Cross-record and illegal-transition integration tests               |
| TM-04 | Tampering              | Unapproved content or villa fact becomes public                                                            | Critical      | Draft-review-approval-publication states, owner-only activation, current verification date, atomic published-version pointer                                   | Low             | Lifecycle and rollback tests with rejected drafts                   |
| TM-05 | Prompt injection       | Uploaded content attempts to alter policy or expose private material                                       | High          | Quarantine, extraction isolation, claim review, permission labels, injection evaluation, no tools during extraction, owner activation                          | Medium          | Malicious-source evaluation catalogue and activation denial         |
| TM-06 | Information disclosure | Service role, API key, session token, or recovery secret appears in browser, source, log, export, or error | Critical      | Provider secret store, server-only modules, redaction, safe errors, secret scanning, least privilege, rotation runbook                                         | Low             | Bundle scan, repository scan, log scan, error-path tests            |
| TM-07 | Information disclosure | Authenticated user reads enquiries, documents, or exports outside assigned scope                           | Critical      | RLS, explicit grants, assignment scope, owner approval for exports, short-lived signed URLs, export audit                                                      | Low             | Member and non-member database policy tests                         |
| TM-08 | Upload abuse           | Polyglot, oversized, executable, or malicious file enters storage or public delivery                       | High          | Extension and signature validation, size limit, generated object name, private quarantine, scan path, rights review, safe content disposition                  | Medium          | File corpus tests and quarantine verification                       |
| TM-09 | Repudiation            | Privileged user denies changing a role, fact, publication, export, or deletion                             | High          | Append-only audit event with actor, action, target, result, time, request correlation, before and after hashes where safe                                      | Low             | Audit completeness and mutation-denial tests                        |
| TM-10 | Denial of service      | Login, search, export, upload, assistant, or scheduling endpoints exhaust compute or provider quota        | High          | Layered rate limits, bounded inputs, pagination, timeouts, concurrency limits, budgets, backpressure, cached public pages                                      | Medium          | Abuse, load, quota-exhaustion, and safe-degradation tests           |
| TM-11 | Integrity              | Concurrent villa, content, enquiry, or visit writes overwrite newer state                                  | High          | Version column, conditional update, transaction, uniqueness and exclusion constraints, conflict response                                                       | Low             | Concurrent-write and booking-conflict tests                         |
| TM-12 | Duplicate side effect  | Retry sends the same email or activates the same release twice                                             | High          | Transactional outbox, deterministic idempotency key, unique constraint, leased job, provider idempotency                                                       | Low             | Replay and timeout-after-send tests                                 |
| TM-13 | Web attack             | CSRF causes an authenticated owner to publish, export, invite, or delete                                   | Critical      | SameSite cookies, origin validation, CSRF token on state change, POST-only actions, recent authentication                                                      | Low             | Cross-origin request tests                                          |
| TM-14 | Web attack             | Stored or reflected script executes through rich text, file metadata, or AI output                         | High          | Structured content model, server sanitization, output encoding, restrictive CSP, safe markdown renderer, no raw HTML                                           | Low             | XSS payload suite and CSP verification                              |
| TM-15 | Injection              | SQL, filter, path, header, or template input alters a query or downstream request                          | High          | Parameterized queries, schema validation, fixed templates, generated storage paths, header allowlist                                                           | Low             | Injection corpus and malformed-request tests                        |
| TM-16 | Webhook spoofing       | Forged delivery webhook changes notification status or triggers work                                       | High          | Signature and timestamp verification, raw-body verification, replay window, event identifier uniqueness                                                        | Low             | Invalid signature and replay tests                                  |
| TM-17 | Privacy                | Contact or conversation content enters analytics, logs, AI knowledge, or email alerts                      | Critical      | Event schema allowlist, redaction, aggregate metrics, content-free alerts, no raw conversation or audio retention                                              | Low             | Telemetry inspection and prohibited-field tests                     |
| TM-18 | Privacy                | Data remains after retention expiry or deletion request                                                    | High          | Retention jobs, deletion ledger, index and cache propagation, export tracking, backup expiry, legal-hold control                                               | Medium          | Time-travel retention and end-to-end deletion tests                 |
| TM-19 | Supply chain           | Dependency or build workflow exfiltrates secrets or changes production artifact                            | High          | Lockfile, pinned actions, reviewed dependency updates, minimal CI permissions, protected production environment, tested-artifact promotion                     | Medium          | Dependency scan, workflow review, provenance and promotion checks   |
| TM-20 | Migration              | Schema deployment corrupts data or makes application and database incompatible                             | Critical      | Forward and rollback migration, preview rehearsal, pre-migration backup, compatibility window, maintenance mode                                                | Medium          | Restore rehearsal and previous-version compatibility test           |
| TM-21 | Backup failure         | Database restore succeeds but protected files or active index remain missing or inconsistent               | Critical      | Independent object backup, hash manifest, versioned index package, coordinated restore runbook                                                                 | Medium          | Full preview restoration with object-hash and citation checks       |
| TM-22 | Availability           | Database, identity, storage, notification, model, or hosting provider fails                                | High          | Static public fallback, fail-closed writes, bounded queue, last-known-good index, known-good deployment, status monitoring                                     | Medium          | Provider-failure drills and public regression checks                |
| TM-23 | Misconfiguration       | Preview sends real email or connects to production data                                                    | Critical      | Separate projects and keys, allowlisted preview recipients, environment assertions, production-only secret names                                               | Low             | Build-time and runtime environment-isolation tests                  |
| TM-24 | Insider error          | Owner performs irreversible deletion, publication, role change, or restore accidentally                    | High          | Confirmation with target summary, recent authentication, soft delete where valid, four-eyes-ready workflow, audit, tested rollback                             | Medium          | Destructive-action usability and recovery tests                     |
| TM-25 | Business integrity     | Stale price, availability, legal, or completion claim appears current                                      | High          | Named authority, verification and expiry dates, qualifications, owner approval, safe public fallback                                                           | Low             | Expiry and changing-fact tests                                      |

## Abuse cases that must fail safely

1. An anonymous visitor requests an administrative route or Data API table.
2. An authenticated content manager calls an owner-only API directly.
3. A revoked session repeats an earlier publication request.
4. A cross-site page submits an owner action using the owner’s browser cookies.
5. An upload uses a permitted extension with an invalid or executable file signature.
6. A document contains instructions to ignore policy and publish private data.
7. Two users reserve the same capacity-constrained visit slot concurrently.
8. A notification request times out after the provider accepted the email.
9. A forged webhook reports delivery or requests replay.
10. A database restore omits storage objects that existed at the restore point.
11. Preview configuration accidentally references a production project or sender.
12. A provider quota is exhausted while the public website receives normal traffic.

## Security test gates

- Authentication tests cover sign-in, sign-out, expiry, revocation, recovery,
  replay, brute force, and multi-factor readiness.
- Authorization tests execute every role against every privileged action and include
  direct API and database attempts.
- Storage tests cover type, signature, size, path, rights, quarantine, signed access,
  replacement, expiry, and deletion.
- Privacy tests assert that forbidden fields cannot enter logs, analytics,
  notifications, knowledge, exports, or lower environments.
- Publication tests prove that an unapproved source, claim, index, model, prompt, or
  policy cannot become active.
- Recovery tests restore database, objects, configuration inventory, and knowledge
  index into preview and verify the application end to end.
- Any critical or high residual finding blocks release.

## Review triggers

Review this threat model before enabling a new role, external integration, data
category, retention period, public upload, model provider, automated action,
production region, or recovery method. Review it again after any material incident.
