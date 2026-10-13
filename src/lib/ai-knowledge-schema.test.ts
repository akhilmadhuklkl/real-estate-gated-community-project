import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

type GovernedRecord = {
  id: string;
  sourceId?: string;
  permissions: {
    classification: string;
    audiences: string[];
    allowedActions: string[];
    consentRequired: boolean;
  };
  governance: {
    state: string;
    owner: string;
    steward: string;
    reviewedAt: string | null;
    validUntil: string | null;
    retrievalEligible: boolean;
    qualification: string | null;
  };
};

type KnowledgePackage = {
  schemaVersion: string;
  packageId: string;
  projectId: string;
  documents: Array<
    GovernedRecord & {
      contentHash: string;
      language: { translationState: string };
    }
  >;
  chunks: Array<
    GovernedRecord & {
      documentId: string;
      contentHash: string;
      entityIds: string[];
      claimIds: string[];
      language: { translationState: string };
      embedding: { status: string };
    }
  >;
  entities: GovernedRecord[];
  claims: Array<
    GovernedRecord & {
      subjectEntityId: string;
      status: string;
      riskTier: string;
      value: { type: string; value: unknown; unit: string | null };
      citations: Array<{
        sourceId: string;
        documentId: string;
        chunkId: string;
        locator: string;
        contentHash: string;
      }>;
    }
  >;
  auditEvents: Array<{
    id: string;
    action: string;
    recordId: string;
    reason: string;
    afterHash: string | null;
  }>;
};

const knowledge = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "content/data/ai-knowledge-package.sample.json"),
    "utf8",
  ),
) as KnowledgePackage;

const sources = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "content/data/ai-knowledge-sources.json"),
    "utf8",
  ),
) as {
  sources: Array<{ id: string; decision: string }>;
};

const approvedSourceIds = new Set(
  sources.sources
    .filter(({ decision }) =>
      ["approved", "approved-with-qualifications"].includes(decision),
    )
    .map(({ id }) => id),
);

const sha256 = /^sha256:[a-f0-9]{64}$/;

describe("AI knowledge package schema", () => {
  it("uses stable package identity and unique record identifiers", () => {
    expect(knowledge.schemaVersion).toBe("1.0.0");
    expect(knowledge.packageId).toMatch(/^kp-[a-z0-9-]+$/);
    expect(knowledge.projectId).toBe("glitz-pride");

    const ids = [
      ...knowledge.documents,
      ...knowledge.chunks,
      ...knowledge.entities,
      ...knowledge.claims,
      ...knowledge.auditEvents,
    ].map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps every reference resolvable", () => {
    const documentIds = new Set(knowledge.documents.map(({ id }) => id));
    const chunkIds = new Set(knowledge.chunks.map(({ id }) => id));
    const entityIds = new Set(knowledge.entities.map(({ id }) => id));
    const claimIds = new Set(knowledge.claims.map(({ id }) => id));

    for (const chunk of knowledge.chunks) {
      expect(documentIds.has(chunk.documentId), chunk.id).toBe(true);
      chunk.entityIds.forEach((id) => expect(entityIds.has(id), id).toBe(true));
      chunk.claimIds.forEach((id) => expect(claimIds.has(id), id).toBe(true));
    }

    for (const claim of knowledge.claims) {
      expect(entityIds.has(claim.subjectEntityId), claim.id).toBe(true);
      for (const citation of claim.citations) {
        expect(documentIds.has(citation.documentId), claim.id).toBe(true);
        expect(chunkIds.has(citation.chunkId), claim.id).toBe(true);
        expect(citation.locator.length, claim.id).toBeGreaterThan(0);
      }
    }
  });

  it("permits retrieval only from active approved sources", () => {
    for (const record of [...knowledge.documents, ...knowledge.chunks]) {
      if (!record.governance.retrievalEligible) continue;
      expect(record.governance.state, record.id).toBe("active");
      expect(approvedSourceIds.has(String(record.sourceId)), record.id).toBe(
        true,
      );
      expect(record.permissions.audiences, record.id).toContain("assistant");
      expect(record.permissions.allowedActions, record.id).toContain(
        "retrieve",
      );
      expect(record.governance.reviewedAt, record.id).toBeTruthy();
      expect(record.governance.validUntil, record.id).toBeTruthy();
    }
  });

  it("keeps qualifications and approved language state on retrievable records", () => {
    for (const record of [...knowledge.documents, ...knowledge.chunks]) {
      if (!record.governance.retrievalEligible) continue;
      expect(record.governance.qualification, record.id).toBeTruthy();
      expect(["original", "approved"]).toContain(
        (record as (typeof knowledge.documents)[number]).language
          .translationState,
      );
    }
  });

  it("requires typed units, citations, and matching immutable hashes for numeric claims", () => {
    const chunkHashes = new Map(
      knowledge.chunks.map(({ id, contentHash }) => [id, contentHash]),
    );

    for (const claim of knowledge.claims) {
      expect(claim.citations.length, claim.id).toBeGreaterThan(0);
      if (claim.value.type === "number") {
        expect(claim.value.unit, claim.id).toBeTruthy();
      }
      for (const citation of claim.citations) {
        expect(citation.contentHash, claim.id).toMatch(sha256);
        expect(citation.contentHash, claim.id).toBe(
          chunkHashes.get(citation.chunkId),
        );
        expect(approvedSourceIds.has(citation.sourceId), claim.id).toBe(true);
      }
    }
  });

  it("separates embedding state from evidence and records activation", () => {
    expect(
      knowledge.chunks.every(
        ({ embedding }) => embedding.status === "not-requested",
      ),
    ).toBe(true);
    expect(
      knowledge.documents.every(({ contentHash }) => sha256.test(contentHash)),
    ).toBe(true);
    expect(
      knowledge.chunks.every(({ contentHash }) => sha256.test(contentHash)),
    ).toBe(true);

    const activatedIds = new Set(
      knowledge.auditEvents
        .filter(({ action }) => action === "activated")
        .map(({ recordId }) => recordId),
    );
    for (const document of knowledge.documents.filter(
      ({ governance }) => governance.state === "active",
    )) {
      expect(activatedIds.has(document.id), document.id).toBe(true);
    }
  });

  it("keeps public retrieval free of consent-gated or sensitive records", () => {
    for (const record of [
      ...knowledge.documents,
      ...knowledge.chunks,
      ...knowledge.entities,
      ...knowledge.claims,
    ]) {
      if (!record.governance.retrievalEligible) continue;
      expect(record.permissions.classification, record.id).toBe("public");
      expect(record.permissions.consentRequired, record.id).toBe(false);
    }
  });
});
