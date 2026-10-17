import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";
type Source = {
  id: string;
  title: string;
  category: string;
  authorityTier: string;
  decision:
    | "approved"
    | "approved-with-qualifications"
    | "pending"
    | "excluded"
    | "superseded";
  owner: string;
  steward: string;
  location: string | null;
  format: string;
  effectiveDate: string | null;
  lastVerifiedOn: string | null;
  reviewCadenceDays: number | null;
  allowedUses: string[];
  prohibitedUses: string[];
  approvalEvidence: string | null;
  reviewTrigger: string;
  notes: string;
};

const register = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "content/data/ai-knowledge-sources.json"),
    "utf8",
  ),
) as {
  schemaVersion: string;
  registerId: string;
  projectId: string;
  asOfDate: string;
  governance: Record<string, string>;
  sources: Source[];
};

const retrievalEligible = register.sources.filter(({ decision }) =>
  ["approved", "approved-with-qualifications"].includes(decision),
);

describe("AI knowledge-source approval register", () => {
  it("uses the governed register identity and required policy set", () => {
    expect(register.schemaVersion).toBe("1.0.0");
    expect(register.registerId).toBe("glitz-pride-ai-knowledge-sources");
    expect(register.projectId).toBe("glitz-pride");
    expect(register.asOfDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Object.keys(register.governance).sort()).toEqual([
      "conflictRule",
      "derivedRule",
      "expiryRule",
      "pendingRule",
      "retrievalRule",
    ]);
  });

  it("catalogues 23 sequential and unique source records", () => {
    expect(register.sources).toHaveLength(23);
    expect(register.sources.map(({ id }) => id)).toEqual(
      Array.from(
        { length: 23 },
        (_, index) => `KS-${String(index + 1).padStart(3, "0")}`,
      ),
    );
  });

  it("requires evidence and verification for every retrieval-eligible source", () => {
    expect(retrievalEligible.map(({ id }) => id)).toEqual([
      "KS-001",
      "KS-002",
      "KS-003",
      "KS-004",
      "KS-006",
      "KS-022",
    ]);

    for (const source of retrievalEligible) {
      expect(source.approvalEvidence, source.id).toBeTruthy();
      expect(source.lastVerifiedOn, source.id).toBeTruthy();
      expect(source.allowedUses.length, source.id).toBeGreaterThan(0);
    }
  });

  it("prevents pending and superseded records from supporting answers", () => {
    for (const source of register.sources.filter(({ decision }) =>
      ["pending", "superseded", "excluded"].includes(decision),
    )) {
      expect(source.allowedUses, source.id).toEqual(
        source.id === "KS-005"
          ? ["audit provenance of retained reference assets"]
          : [],
      );
      if (source.id === "KS-005") {
        expect(source.prohibitedUses).toContain("answer generation");
      }
    }
  });

  it("keeps every high-risk changing fact behind an unavailable live source", () => {
    for (const sourceId of [
      "KS-010",
      "KS-011",
      "KS-012",
      "KS-013",
      "KS-015",
      "KS-018",
      "KS-019",
      "KS-020",
      "KS-023",
    ]) {
      expect(register.sources.find(({ id }) => id === sourceId)?.decision).toBe(
        "pending",
      );
    }
  });

  it("assigns every source an owner, steward, review trigger, and prohibition", () => {
    for (const source of register.sources) {
      expect(source.owner.length, source.id).toBeGreaterThan(0);
      expect(source.steward, source.id).toBe("AKHIL");
      expect(source.reviewTrigger.length, source.id).toBeGreaterThan(0);
      expect(source.prohibitedUses.length, source.id).toBeGreaterThan(0);
      expect(source.id, source.id).toMatch(/^KS-\d{3}$/);
      expect(source.title.length, source.id).toBeGreaterThan(0);
      expect(source.category.length, source.id).toBeGreaterThan(0);
      expect(source.authorityTier.length, source.id).toBeGreaterThan(0);
      expect(source.format.length, source.id).toBeGreaterThan(0);
      if (source.reviewCadenceDays !== null) {
        expect(source.reviewCadenceDays, source.id).toBeGreaterThan(0);
      }
    }
  });
});
