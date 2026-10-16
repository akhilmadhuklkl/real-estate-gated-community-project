import { describe, expect, it } from "vitest";

import {
  isRetrievalEligible,
  rankVectorRecords,
  type KnowledgeChunk,
  type VectorRecord,
} from "./vector-retrieval";

const baseChunk: KnowledgeChunk = {
  id: "chk-one",
  documentId: "doc-one",
  sourceId: "KS-001",
  text: "villa garden",
  contentHash: "sha256:a",
  topics: ["villa"],
  locator: { label: "Page 1", pageStart: 1, pageEnd: 1, sectionPath: [] },
  permissions: {
    audiences: ["assistant"],
    allowedActions: ["retrieve"],
    consentRequired: false,
  },
  governance: {
    state: "active",
    retrievalEligible: true,
    qualification: "Historical brochure qualification",
    validUntil: "2027-01-08T00:00:00.000Z",
  },
};

const records: VectorRecord[] = [
  {
    id: "chk-villa",
    documentId: "doc-one",
    sourceId: "KS-001",
    text: "villa garden",
    contentHash: "sha256:a",
    topics: ["villa"],
    locator: baseChunk.locator,
    qualification: "qualified",
    citation: {
      sourceTitle: "Official brochure",
      effectiveDate: "2018-12-27",
      reviewedAt: "2026-10-10T00:00:00Z",
      validUntil: "2027-01-08T00:00:00Z",
      href: "/reference/glitz-pride/brochure.pdf",
    },
    vector: [1, 0],
  },
  {
    id: "chk-location",
    documentId: "doc-two",
    sourceId: "KS-002",
    text: "location road",
    contentHash: "sha256:b",
    topics: ["location"],
    locator: {
      ...baseChunk.locator,
      label: "JSON section: location",
      pageStart: null,
      pageEnd: null,
    },
    qualification: "qualified",
    citation: {
      sourceTitle: "Governed structured project content",
      effectiveDate: "2026-10-03",
      reviewedAt: "2026-10-11T00:00:00Z",
      validUntil: "2026-11-10T00:00:00Z",
      href: null,
    },
    vector: [0, 1],
  },
];

describe("vector retrieval governance", () => {
  it("accepts only active, qualified, unexpired, permitted chunks", () => {
    expect(isRetrievalEligible(baseChunk, new Date("2026-10-13"))).toBe(true);
    expect(
      isRetrievalEligible(
        {
          ...baseChunk,
          governance: { ...baseChunk.governance, state: "suspended" },
        },
        new Date("2026-10-13"),
      ),
    ).toBe(false);
    expect(
      isRetrievalEligible(
        {
          ...baseChunk,
          governance: {
            ...baseChunk.governance,
            validUntil: "2026-01-01T00:00:00.000Z",
          },
        },
        new Date("2026-10-13"),
      ),
    ).toBe(false);
    expect(
      isRetrievalEligible(
        {
          ...baseChunk,
          permissions: { ...baseChunk.permissions, consentRequired: true },
        },
        new Date("2026-10-13"),
      ),
    ).toBe(false);
  });

  it("ranks by cosine similarity with stable tie breaking", () => {
    const results = rankVectorRecords([1, 0], records, { topK: 2 });
    expect(results.map(({ id }) => id)).toEqual(["chk-villa", "chk-location"]);
    expect(results[0].score).toBeCloseTo(1);
  });

  it("applies source, document, topic, score, and top-k filters before returning evidence", () => {
    expect(
      rankVectorRecords([1, 0], records, { sourceIds: ["KS-002"] }),
    ).toHaveLength(1);
    expect(
      rankVectorRecords([1, 0], records, { documentIds: ["doc-two"] })[0].id,
    ).toBe("chk-location");
    expect(
      rankVectorRecords([1, 0], records, { topics: ["villa"] })[0].id,
    ).toBe("chk-villa");
    expect(
      rankVectorRecords([1, 0], records, { minimumScore: 0.5 }),
    ).toHaveLength(1);
    expect(rankVectorRecords([1, 0], records, { topK: 1 })).toHaveLength(1);
  });

  it("returns citations and qualifications without exposing vectors", () => {
    const [match] = rankVectorRecords([1, 0], records);
    expect(match.locator.label).toBe("Page 1");
    expect(match.qualification).toBe("qualified");
    expect(match.citation.sourceTitle).toBe("Official brochure");
    expect(match.citation.href).toBe("/reference/glitz-pride/brochure.pdf");
    expect(match).not.toHaveProperty("vector");
  });

  it("rejects empty or non-finite similarity results", () => {
    expect(rankVectorRecords([], records)).toEqual([]);
    expect(
      rankVectorRecords([1, 0], [{ ...records[0], vector: [Number.NaN, 0] }]),
    ).toEqual([]);
  });

  it("preserves restricted citation metadata without an opening link", () => {
    const match = rankVectorRecords([0, 1], records)[0];
    expect(match.citation.sourceTitle).toBe(
      "Governed structured project content",
    );
    expect(match.citation.href).toBeNull();
  });
});
