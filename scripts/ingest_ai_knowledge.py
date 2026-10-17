#!/usr/bin/env python3
"""Build a deterministic, governed knowledge package from approved local sources."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from copy import deepcopy
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from pypdf import PdfReader

PIPELINE_VERSION = "1.0.0"
ELIGIBLE_DECISIONS = {"approved", "approved-with-qualifications"}
SUPPORTED_FORMATS = {"pdf", "json"}
MIN_TEXT_CHARACTERS = 20


def sha256_bytes(value: bytes) -> str:
    return f"sha256:{hashlib.sha256(value).hexdigest()}"


def stable_slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def canonical_json(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode()


def language() -> dict[str, Any]:
    return {"code": "en", "isReferenceLanguage": True, "translationState": "original", "translatedFromId": None}


def permissions(source: dict[str, Any]) -> dict[str, Any]:
    translation_control = source["category"] == "translations"
    return {
        "classification": "public",
        "audiences": ["content-admin"] if translation_control else ["public", "assistant", "content-admin"],
        "allowedActions": ["admin-review"] if translation_control else ["retrieve", "summarize", "quote", "render-preview", "admin-review"],
        "consentRequired": False,
        "purposeRestriction": "Qualified project-information assistance",
    }


def qualification_for(source: dict[str, Any]) -> str:
    prohibited = ", ".join(source["prohibitedUses"])
    return f"Use only for: {', '.join(source['allowedUses'])}. Do not use for: {prohibited}."


def governance(source: dict[str, Any], as_of: date) -> dict[str, Any]:
    reviewed = source["lastVerifiedOn"]
    cadence = source["reviewCadenceDays"]
    valid_until = None
    if reviewed and cadence:
        valid_until = (date.fromisoformat(reviewed) + timedelta(days=cadence)).isoformat() + "T00:00:00.000Z"
    return {
        "state": "active",
        "owner": source["owner"],
        "steward": source["steward"],
        "approvedBy": source["approvalEvidence"],
        "approvedAt": f"{reviewed}T00:00:00.000Z" if reviewed else None,
        "validFrom": f"{source['effectiveDate']}T00:00:00.000Z" if source["effectiveDate"] else None,
        "validUntil": valid_until,
        "reviewedAt": f"{reviewed}T00:00:00.000Z" if reviewed else None,
        "reviewCadenceDays": cadence,
        "retrievalEligible": source["category"] != "translations",
        "qualification": qualification_for(source),
        "supersedesId": None,
    }


def pdf_units(path: Path) -> tuple[list[dict[str, Any]], list[str]]:
    reader = PdfReader(path)
    units, warnings = [], []
    for page_number, page in enumerate(reader.pages, 1):
        text = re.sub(r"\s+", " ", page.extract_text() or "").strip()
        if len(text) < MIN_TEXT_CHARACTERS:
            warnings.append(f"Page {page_number} has insufficient extractable text and was omitted.")
            continue
        units.append({"label": f"Page {page_number}", "page": page_number, "section": [], "text": text})
    return units, warnings


def json_units(path: Path) -> tuple[list[dict[str, Any]], list[str]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    units = []
    for key, value in data.items():
        if key == "schemaVersion":
            continue
        text = json.dumps(value, ensure_ascii=False, sort_keys=True)
        if len(text) >= MIN_TEXT_CHARACTERS:
            units.append({"label": f"JSON section: {key}", "page": None, "section": [key], "text": text})
    return units, []


def quarantine(source: dict[str, Any], reason_code: str, detail: str) -> dict[str, Any]:
    return {
        "sourceId": source["id"],
        "title": source["title"],
        "decision": source["decision"],
        "format": source["format"],
        "location": source["location"],
        "reasonCode": reason_code,
        "detail": detail,
        "requiresHumanReview": True,
    }


def build(repo: Path, as_of: date) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    register_path = repo / "content/data/ai-knowledge-sources.json"
    register = json.loads(register_path.read_text(encoding="utf-8"))
    documents, chunks, events, rejected, versions = [], [], [], [], []
    timestamp = f"{as_of.isoformat()}T00:00:00.000Z"

    for source in register["sources"]:
        if source["decision"] not in ELIGIBLE_DECISIONS:
            rejected.append(quarantine(source, "source-not-approved", "Only approved sources are eligible for ingestion."))
            continue
        if source["format"] not in SUPPORTED_FORMATS:
            rejected.append(quarantine(source, "unsupported-format", "Initial pipeline supports governed PDF and JSON files."))
            continue
        if not source["location"] or re.match(r"^https?://", source["location"]):
            rejected.append(quarantine(source, "non-local-location", "The source is not an approved local file."))
            continue

        path = (repo / source["location"]).resolve()
        try:
            path.relative_to(repo.resolve())
        except ValueError:
            rejected.append(quarantine(source, "unsafe-location", "Resolved path leaves the repository."))
            continue
        if not path.is_file():
            rejected.append(quarantine(source, "missing-file", "The registered source file does not exist."))
            continue

        raw_hash = sha256_bytes(path.read_bytes())
        try:
            units, warnings = pdf_units(path) if source["format"] == "pdf" else json_units(path)
        except Exception as error:  # fail closed and preserve review evidence
            rejected.append(quarantine(source, "parse-failed", str(error)))
            continue
        if not units:
            rejected.append(quarantine(source, "low-quality-input", "No unit passed the minimum text-quality threshold."))
            continue

        source_slug = stable_slug(source["id"])
        doc_id = f"doc-{source_slug}-{raw_hash[7:19]}"
        gov = governance(source, as_of)
        document = {
            "id": doc_id,
            "sourceId": source["id"],
            "title": source["title"],
            "documentType": "brochure" if source["format"] == "pdf" else "structured-data",
            "revision": source["effectiveDate"] or raw_hash[7:19],
            "contentHash": raw_hash,
            "canonicalLocation": source["location"],
            "mimeType": "application/pdf" if source["format"] == "pdf" else "application/json",
            "effectiveDate": source["effectiveDate"],
            "language": language(),
            "permissions": permissions(source),
            "governance": deepcopy(gov),
            "ingestion": {
                "parser": "pypdf" if source["format"] == "pdf" else "python-json",
                "parserVersion": PIPELINE_VERSION,
                "ingestedAt": timestamp,
                "status": "accepted-with-warnings" if warnings or source["decision"].endswith("qualifications") else "accepted",
                "warnings": warnings + (["Source qualifications must accompany every derived answer."] if source["decision"].endswith("qualifications") else []),
            },
        }
        documents.append(document)
        for ordinal, unit in enumerate(units):
            text_hash = sha256_bytes(unit["text"].encode("utf-8"))
            chunk_id = f"chk-{source_slug}-{ordinal + 1:03d}-{text_hash[7:19]}"
            chunks.append({
                "id": chunk_id,
                "documentId": doc_id,
                "sourceId": source["id"],
                "ordinal": ordinal,
                "text": unit["text"],
                "contentHash": text_hash,
                "locator": {
                    "label": unit["label"],
                    "pageStart": unit["page"],
                    "pageEnd": unit["page"],
                    "sectionPath": unit["section"],
                    "characterStart": 0,
                    "characterEnd": len(unit["text"]),
                },
                "language": language(),
                "topics": [source["category"]],
                "entityIds": [],
                "claimIds": [],
                "permissions": permissions(source),
                "governance": deepcopy(gov),
                "embedding": {"status": "not-requested", "model": None, "dimensions": None, "embeddedAt": None},
            })
        events.append({
            "id": f"evt-{source_slug}-activated-{raw_hash[7:15]}",
            "occurredAt": timestamp,
            "actor": source["steward"],
            "action": "activated",
            "recordType": "document",
            "recordId": doc_id,
            "reason": "Approved local source passed format, path, parser, and text-quality gates.",
            "beforeHash": None,
            "afterHash": raw_hash,
        })
        versions.append({"sourceId": source["id"], "documentId": doc_id, "revision": document["revision"], "contentHash": raw_hash})

    package = {
        "schemaVersion": "1.0.0",
        "packageId": f"kp-ingestion-{as_of.isoformat()}",
        "projectId": register["projectId"],
        "generatedAt": timestamp,
        "documents": documents,
        "chunks": chunks,
        "entities": [],
        "claims": [],
        "auditEvents": events,
    }
    package_hash = sha256_bytes(canonical_json(package))
    manifest = {
        "pipelineVersion": PIPELINE_VERSION,
        "generatedAt": timestamp,
        "registerHash": sha256_bytes(register_path.read_bytes()),
        "packageHash": package_hash,
        "acceptedSourceCount": len(documents),
        "chunkCount": len(chunks),
        "quarantinedSourceCount": len(rejected),
        "versions": versions,
    }
    report = {"pipelineVersion": PIPELINE_VERSION, "generatedAt": timestamp, "items": rejected}
    return package, manifest, report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", type=Path, default=Path.cwd())
    parser.add_argument("--as-of", type=date.fromisoformat, default=datetime.now(timezone.utc).date())
    parser.add_argument("--check", action="store_true", help="Fail if committed output differs from a fresh deterministic build.")
    args = parser.parse_args()
    output = args.repo / "content/generated"
    package, manifest, report = build(args.repo.resolve(), args.as_of)
    payloads = {
        output / "ai-knowledge-package.json": package,
        output / "ingestion-manifest.json": manifest,
        output / "ingestion-quarantine.json": report,
    }
    if args.check:
        mismatches = [str(path) for path, value in payloads.items() if not path.exists() or path.read_bytes() != canonical_json(value)]
        if mismatches:
            raise SystemExit("Generated ingestion artifacts are stale:\n" + "\n".join(mismatches))
        return
    output.mkdir(parents=True, exist_ok=True)
    for path, value in payloads.items():
        path.write_bytes(canonical_json(value))


if __name__ == "__main__":
    main()
