import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const load = <T>(path: string) =>
  JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T;
const suite = load<{
  cases: Array<{
    id: string;
    kind: string;
    riskTier: string;
    expectedChunkIds: string[];
  }>;
  thresholds: Record<string, number>;
}>("content/evaluation/retrieval-evaluation-cases.json");
const report = load<{
  indexHash: string;
  passed: boolean;
  metrics: Record<string, number>;
  thresholds: Record<string, number>;
  checks: Record<string, boolean>;
  results: Array<{ id: string; kind: string; citationComplete: boolean }>;
}>("content/evaluation/retrieval-evaluation-report.json");
const index = load<{
  indexHash: string;
  records: Array<{
    id: string;
    sourceId: string;
    citation: {
      sourceTitle: string;
      effectiveDate: string | null;
      reviewedAt: string;
      validUntil: string | null;
      href: string | null;
    };
  }>;
}>("content/generated/vector-index.json");

describe("retrieval evaluation release gate", () => {
  it("covers positive and negative scenarios across all risk tiers", () => {
    expect(
      suite.cases.filter(({ kind }) => kind === "positive").length,
    ).toBeGreaterThanOrEqual(15);
    expect(
      suite.cases.filter(({ kind }) => kind === "negative").length,
    ).toBeGreaterThanOrEqual(8);
    expect(new Set(suite.cases.map(({ riskTier }) => riskTier))).toEqual(
      new Set(["R0", "R1", "R2", "R3", "R4"]),
    );
  });

  it("uses unique case IDs and resolvable positive evidence", () => {
    expect(new Set(suite.cases.map(({ id }) => id)).size).toBe(
      suite.cases.length,
    );
    const chunkIds = new Set(index.records.map(({ id }) => id));
    for (const testCase of suite.cases.filter(
      ({ kind }) => kind === "positive",
    )) {
      expect(testCase.expectedChunkIds.length, testCase.id).toBeGreaterThan(0);
      testCase.expectedChunkIds.forEach((id) =>
        expect(chunkIds.has(id), `${testCase.id}:${id}`).toBe(true),
      );
    }
  });

  it("binds the report to the current index and every test case", () => {
    expect(report.indexHash).toBe(index.indexHash);
    expect(report.results.map(({ id }) => id)).toEqual(
      suite.cases.map(({ id }) => id),
    );
  });

  it("keeps thresholds synchronized and citations complete", () => {
    expect(report.thresholds).toEqual(suite.thresholds);
    expect(
      report.results.every(({ citationComplete }) => citationComplete),
    ).toBe(true);
  });

  it("keeps citation titles, review dates, validity, and safe links on every record", () => {
    for (const record of index.records) {
      expect(record.citation.sourceTitle.length, record.id).toBeGreaterThan(0);
      expect(record.citation.reviewedAt, record.id).toMatch(
        /^\d{4}-\d{2}-\d{2}T/,
      );
      expect(record.citation.validUntil, record.id).toMatch(
        /^\d{4}-\d{2}-\d{2}T/,
      );
      expect(record.citation.href, record.id).toBe(
        record.sourceId === "KS-001"
          ? "/reference/glitz-pride/brochure.pdf"
          : null,
      );
    }
  });

  it("passes every declared release check", () => {
    expect(report.passed).toBe(true);
    expect(Object.values(report.checks).every(Boolean)).toBe(true);
    for (const [metric, threshold] of Object.entries(suite.thresholds)) {
      if (metric === "minimumSimilarity") continue;
      expect(report.metrics[metric], metric).toBeGreaterThanOrEqual(threshold);
    }
  });
});
