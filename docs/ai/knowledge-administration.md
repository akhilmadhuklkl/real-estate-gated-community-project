# Knowledge administration

## Purpose

T0047 adds a fail-closed local control plane for governed project knowledge. It supports validated uploads, independent approval, immutable versions, activation, re-index requests, audit history, and rollback without exposing an unauthenticated administration page on the public website.

## Security boundary

The command accepts credentials only from environment variables. Credentials must never be committed, written to the ledger, or passed as command-line arguments. Two roles are available:

- `content-editor` validates, stages, and submits a version.
- `content-reviewer` approves, activates, re-indexes, and rolls back a version.

The reviewer identity must differ from the editor identity. This separation remains mandatory even when one person performs both duties; use two explicitly named administrative identities and review the audit trail before activation.

Configure the current shell with `KNOWLEDGE_ADMIN_ACTOR`, `KNOWLEDGE_ADMIN_ROLE`, and `KNOWLEDGE_ADMIN_CREDENTIAL`. Configure the matching server-side comparison value as `KNOWLEDGE_EDITOR_CREDENTIAL` or `KNOWLEDGE_REVIEWER_CREDENTIAL`. Rotate these values if they are exposed.

## Workflow

Run commands from the repository root.

```powershell
pnpm admin:knowledge status
pnpm admin:knowledge stage --source KS-002 --file D:\approved-content\glitz-pride.json
pnpm admin:knowledge submit --version <version-id>
pnpm admin:knowledge approve --version <version-id> --reason "Reviewed against the approved owner source."
pnpm admin:knowledge activate --version <version-id>
pnpm admin:knowledge reindex --request <request-id>
pnpm admin:knowledge rollback --version <previous-version-id> --reason "Production verification failed."
```

The stage command permits only approved sources whose registered format is JSON or PDF. It enforces a 20 MB limit, verifies the file signature or JSON structure, rejects likely credential fields, records a SHA-256 hash, and stores an immutable copy under `content/administration/versions/`.

Activation copies the reviewed immutable version to the governed source path and creates a pending re-index request. Re-indexing runs the existing governed ingestion and local vector-index pipeline. A failed rebuild remains visible in the ledger and does not become a silent success.

Rollback accepts only a version that was previously reviewed and activated. It restores the immutable file, records the reason and actor, and creates a new re-index request.

## Operational limits

- This workflow is intentionally local and repository-controlled because production administrator authentication and durable private object storage are not configured.
- No administration route is included in the public application.
- The existing source register remains authoritative. Uploading a file cannot approve a pending source or broaden its permitted uses.
- Git version control should retain the ledger, version files, generated artifacts, and review history.
- A future authenticated administration interface may call the same workflow only after authorization, durable storage, CSRF protection, rate limiting, and audit-retention controls are approved.
