import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const load = <T>(path: string) =>
  JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T;

const knowledge = load<{
  documents: Array<{
    id: string;
    sourceId: string;
    contentHash: string;
    governance: { retrievalEligible: boolean; qualification: string };
    permissions: { allowedActions: string[] };
  }>;
  chunks: Array<{
    id: string;
    documentId: string;
    sourceId: string;
    ordinal: number;
    text: string;
    contentHash: string;
    locator: { pageStart: number | null; label: string };
    governance: { retrievalEligible: boolean; qualification: string };
    permissions: { allowedActions: string[] };
    embedding: { status: string };
  }>;
  auditEvents: Array<{ action: string; recordId: string }>;
}>("content/generated/ai-knowledge-package.json");

const manifest = load<{
  pipelineVersion: string;
  acceptedSourceCount: number;
  chunkCount: number;
  quarantinedSourceCount: number;
  versions: Array<{ sourceId: string; contentHash: string }>;
}>("content/generated/ingestion-manifest.json");
const quarantine = load<{
  items: Array<{
    sourceId: string;
    reasonCode: string;
    requiresHumanReview: boolean;
  }>;
}>("content/generated/ingestion-quarantine.json");

describe("governed ingestion artifacts", () => {
  it("accepts approved evidence and translation-control sources", () => {
    expect(knowledge.documents.map(({ sourceId }) => sourceId).sort()).toEqual([
      "KS-001",
      "KS-002",
      "KS-022",
    ]);
    expect(manifest.acceptedSourceCount).toBe(3);
    expect(manifest.quarantinedSourceCount).toBeGreaterThan(0);
  });

  it("preserves PDF page locators and deterministic chunk order", () => {
    const pages = knowledge.chunks.filter(
      ({ sourceId }) => sourceId === "KS-001",
    );
    expect(pages).toHaveLength(9);
    expect(pages.map(({ locator }) => locator.pageStart)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
    expect(pages.map(({ ordinal }) => ordinal)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8,
    ]);
  });

  it("uses immutable hashes that match every normalized chunk", () => {
    for (const chunk of knowledge.chunks) {
      const hash = createHash("sha256").update(chunk.text).digest("hex");
      expect(chunk.contentHash).toBe(`sha256:${hash}`);
    }
    expect(
      manifest.versions.every(({ contentHash }) =>
        /^sha256:[a-f0-9]{64}$/.test(contentHash),
      ),
    ).toBe(true);
  });

  it("propagates qualifications and retrieval permissions", () => {
    for (const record of [...knowledge.documents, ...knowledge.chunks]) {
      expect(record.governance.qualification.length).toBeGreaterThan(20);
      if (record.sourceId === "KS-022") {
        expect(record.governance.retrievalEligible).toBe(false);
        expect(record.permissions.allowedActions).toEqual(["admin-review"]);
      } else {
        expect(record.governance.retrievalEligible).toBe(true);
        expect(record.permissions.allowedActions).toContain("retrieve");
      }
    }
  });

  it("quarantines non-approved and unsupported inputs for human review", () => {
    const byId = new Map(quarantine.items.map((item) => [item.sourceId, item]));
    expect(byId.get("KS-005")?.reasonCode).toBe("source-not-approved");
    expect(byId.get("KS-007")?.reasonCode).toBe("source-not-approved");
    expect(byId.get("KS-003")?.reasonCode).toBe("unsupported-format");
    expect(
      quarantine.items.every(({ requiresHumanReview }) => requiresHumanReview),
    ).toBe(true);
  });

  it("keeps indexing separate and emits an activation event per accepted document", () => {
    expect(
      knowledge.chunks.every(
        ({ embedding }) => embedding.status === "not-requested",
      ),
    ).toBe(true);
    const activated = new Set(
      knowledge.auditEvents
        .filter(({ action }) => action === "activated")
        .map(({ recordId }) => recordId),
    );
    expect(knowledge.documents.every(({ id }) => activated.has(id))).toBe(true);
  });
});
