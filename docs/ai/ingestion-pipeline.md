# Governed knowledge ingestion pipeline

## Purpose

The T0032 pipeline turns approved local project sources into a deterministic knowledge package for retrieval. It fails closed: an input that is pending, superseded, unsupported, remote, missing, outside the repository, unreadable, or too sparse is recorded in quarantine and never enters the retrievable package.

## Initial supported formats

| Registered format                                         | Parser             | Unit of citation      | Decision                                    |
| --------------------------------------------------------- | ------------------ | --------------------- | ------------------------------------------- |
| `pdf`                                                     | `pypdf`            | One extracted page    | Supported                                   |
| `json`                                                    | Python JSON parser | One top-level section | Supported                                   |
| Website, approval record, plans, feeds, and other formats | None               | None                  | Quarantined until a reviewed adapter exists |

Only sources marked `approved` or `approved-with-qualifications` in `content/data/ai-knowledge-sources.json` can pass the approval gate. A supported format does not override source governance.

## Pipeline stages

1. Load the governed source register.
2. Enforce approval, supported-format, local-path, repository-boundary, and file-existence gates.
3. Parse PDF pages or governed JSON sections.
4. Normalize whitespace, create stable identifiers, and calculate SHA-256 hashes.
5. Copy source permissions, qualification, owner, steward, review dates, and expiry into every document and chunk.
6. Reject units below the text-quality threshold and quarantine a source when no usable unit remains.
7. Write the package, version manifest, quarantine report, and activation audit events.

The package intentionally leaves embeddings in `not-requested`; vector indexing belongs to T0033 and must not change the evidence text or its hash.

## Run and verify

Use Python 3 with the pinned ingestion dependency:

```powershell
python -m pip install -r scripts/requirements-ingestion.txt
python scripts/ingest_ai_knowledge.py --repo . --as-of 2026-10-13
python scripts/ingest_ai_knowledge.py --repo . --as-of 2026-10-13 --check
```

`--as-of` makes timestamps and output reproducible. The check mode performs no writes and fails if the committed outputs are missing or stale.

## Outputs and rejection workflow

- `content/generated/ai-knowledge-package.json`: retrievable documents and page/section chunks.
- `content/generated/ingestion-manifest.json`: pipeline version, input/output hashes, counts, and immutable source-version entries.
- `content/generated/ingestion-quarantine.json`: rejected source, reason code, detail, and explicit human-review requirement.

Quarantine is not deletion. A steward must correct the source register or input, obtain any missing approval, review the result, and run the pipeline again. Old manifests remain available through version control, preserving the complete version trail.

## Operational guarantees

- No pending, excluded, or superseded source is retrievable.
- Remote URLs are not fetched by this pipeline.
- Resolved paths cannot leave the repository.
- Every accepted document and chunk carries its source ID, immutable hash, locator, permissions, lifecycle, and qualification.
- Identical inputs and `--as-of` values produce byte-identical artifacts.
- Parsing errors become reviewable quarantine records rather than partial silent ingestion.
