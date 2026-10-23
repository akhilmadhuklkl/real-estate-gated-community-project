# Phase 3 MVP scope and acceptance

## Decision record

- Status: approved for planning
- Product owner and final reviewer: AKHIL
- Baseline release: Version 1.0.0 (`v1.0.0`)
- Planned delivery window: 26 October–17 December 2026
- Implementation state: not started

This document defines the mandatory product boundary for Phase 3. It authorizes
planning and design only. No implementation, service provisioning, production data
collection, or paid subscription begins until AKHIL explicitly starts the applicable
tracker task.

## Objective

Transform the released public website and governed property guide into a secure owner
operations platform. Authorized users must be able to maintain property content,
villa inventory, approved AI knowledge, enquiries, visits, and operational evidence
without routine source-code edits, while preserving the public Version 1 experience.

## Primary users

1. **Owner — active in the MVP.** AKHIL has complete administrative, approval,
   security, release, export, retention, and user-management authority.
2. **Content manager — designed but inactive initially.** Can prepare public content,
   media, and documents but cannot publish without approval.
3. **Sales representative — designed but inactive initially.** Can handle assigned
   enquiries and visits but cannot change property facts or AI knowledge.
4. **AI reviewer — designed but inactive initially.** Can review sources, claims,
   evaluations, and index releases but cannot grant roles.
5. **Read-only auditor — designed but inactive initially.** Can inspect approved
   operational evidence without changing records.

Public visitors never receive administration access or self-registration.

## Mandatory capabilities

### 1. Secure administration

- Protected `/admin` experience with explicit sign-in and sign-out.
- Secure sessions, expiry, recovery, rate limits, and multi-factor readiness.
- Server-enforced permissions on every page, API route, record, export, and action.
- Owner-controlled invitations, role changes, suspension, and revocation.
- Accessible desktop and mobile navigation with loading, empty, error, offline, and
  permission-denied states.

### 2. Villa inventory

- Create, review, update, archive, and restore villa records.
- Manage names, types, bedrooms, areas, plans, specifications, construction status,
  availability status, pricing status, images, and verification dates.
- Retain change history, authority, approval, effective dates, and qualifications.
- Prevent unverified price or availability from appearing as a current fact.

### 3. Public content operations

- Manage approved homepage, community, amenities, gallery, location,
  specifications, contact, privacy, accessibility, and supporting page content.
- Use `Draft → Review → Approved → Published → Archived` lifecycle states.
- Preview before publication and restore a known-good version.
- Require owner approval for commercial facts, contact routes, legal statements,
  public documents, and material homepage changes.

### 4. Media and documents

- Validate allowed formats, file size, metadata, ownership, usage rights, authority,
  access level, expiry, and replacement history.
- Separate public media from protected administrative documents.
- Quarantine unsafe, unsupported, missing-rights, or unreviewed uploads.
- Preserve immutable hashes and source provenance for approved documents.

### 5. Governed AI knowledge operations

- Review extracted documents, chunks, claims, citations, qualifications, conflicts,
  permissions, expiry, language state, and retrieval eligibility.
- Keep every new upload outside the active knowledge index until human approval and
  evaluation pass.
- Rebuild versioned indexes deterministically and retain the last-known-good index.
- Require AKHIL approval before activating a source, index, model, provider, prompt,
  policy, language, or retrieval change.

### 6. Enquiry operations

- Capture only consented, necessary contact information.
- Assign, review, update, follow up, close, export, delete, and retain enquiries
  according to the approved policy.
- Record status history and staff actions without placing contact content in AI
  knowledge or operational metrics.
- Keep external sending and consequential follow-up under human control.

### 7. Visit scheduling

- Owner-managed operating hours, blackout dates, lead time, duration, and capacity.
- Visitor-requested slots with explicit confirmation, rescheduling, cancellation,
  reminders, and assigned representative.
- Prevent conflicting bookings and retain an auditable status history.

### 8. Notifications

- Notify authorized recipients about enquiries, visits, approvals, expiry, failed AI
  releases, provider incidents, security events, and recovery failures.
- Apply recipient permissions, quiet hours, retry limits, escalation, deduplication,
  and sensitive-content suppression.

### 9. Analytics and reporting

- Aggregate inventory, enquiry, visit, content freshness, AI quality, language,
  handoff, feedback, latency, reliability, and approved cost measures.
- Use documented metric definitions and role-aware filters and exports.
- Exclude raw conversations, voice audio, contact content, IP addresses, and unique
  visitor tracking from product analytics.

### 10. Audit, retention, backup, and recovery

- Record immutable administrative actions with actor, action, target, time, and safe
  categorical context.
- Enforce approved retention, deletion, expiry, legal-hold, and evidence rules.
- Back up database, protected storage, active knowledge index, and configuration.
- Prove restoration against approved recovery objectives before release.

## Compatibility requirements

- Version 1 public routes, visual identity, responsive experience, citations,
  multilingual support, voice input, handoff, accessibility, and safety behaviour
  remain backward compatible.
- Phase 3 must not change the preserved `v1.0.0` tag or its release evidence.
- Existing public content remains available during administration or provider
  failure.
- Database, identity, storage, notification, or AI service failure must degrade
  safely without exposing protected information.

## Explicit non-goals

The Phase 3 MVP does not include:

- public account registration or a resident social network;
- autonomous publication of uploaded content;
- autonomous outbound sales messages or negotiation;
- payment collection, property booking deposits, or legal contracts;
- guaranteed investment, financial, legal, construction, or availability advice;
- unreviewed CRM, advertising, or third-party data sharing;
- facial recognition, biometric identification, or invasive visitor profiling;
- an unrestricted autonomous agent that can change records or contact people;
- replacing the owner’s final authority with model output;
- native mobile applications.

These items require a separately approved future phase.

## Acceptance matrix

| Area           | Required acceptance evidence                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Scope          | All T0054–T0077 tasks retain an owner, dependencies, decisions, outcome, and measurable gate.                                    |
| Authentication | Valid owner access succeeds; invalid, expired, revoked, replayed, and rate-limited sessions fail safely.                         |
| Authorization  | Every role is denied actions outside its approved permission matrix at both UI and server boundaries.                            |
| Data           | Constraints, migrations, rollback, environment separation, retention, and deletion tests pass with synthetic data.               |
| Content        | Draft, review, approval, preview, publish, archive, version history, and rollback journeys pass.                                 |
| Villas         | Inventory, changing facts, verification dates, history, approval, and public qualification behave correctly.                     |
| Files          | Format, size, access, rights, malware, quarantine, replacement, expiry, and deletion controls pass.                              |
| AI knowledge   | Unapproved evidence cannot enter retrieval; approved rebuild, evaluation, activation, and rollback are reproducible.             |
| Enquiries      | Consent, minimization, assignment, access, status, export, retention, deletion, and human-controlled contact pass.               |
| Visits         | Availability, capacity, conflict prevention, confirmation, rescheduling, cancellation, and reminders pass.                       |
| Analytics      | Defined aggregate metrics are correct and excluded private content never appears in events or exports.                           |
| Audit          | Privileged actions are traceable and audit records cannot be changed through ordinary administration.                            |
| Recovery       | Database, file, index, and configuration restoration meets the approved objectives in a documented exercise.                     |
| Quality        | Functional, integration, security, privacy, accessibility, performance, migration, recovery, and browser gates pass.             |
| Operations     | Monitoring, alert ownership, support, runbooks, capacity, budget, incident, rollback, and launch communication are approved.     |
| Release        | The exact staged artifact passes owner UAT, pilot, smoke, migration, backup, rollback, and post-release checks before promotion. |

## Definition of done

Phase 3 is complete only when every mandatory capability is implemented, all release
gates pass, AKHIL accepts the owner pilot and operating guide, the exact tested
artifact is promoted, post-release verification succeeds, and the stable release is
preserved with its evidence and rollback point.
