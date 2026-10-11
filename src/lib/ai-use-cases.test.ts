import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const specification = readFileSync(
  resolve(process.cwd(), "docs/ai/concierge-use-cases.md"),
  "utf8",
);

const catalogue = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "docs/ai/concierge-evaluation-catalogue.json"),
    "utf8",
  ),
) as {
  counts: {
    total: number;
    positive: number;
    negative: number;
    capabilityFamilies: number;
  };
  requiredEvaluationFields: string[];
  cases: Array<Record<string, unknown>>;
};

const ids = [...specification.matchAll(/\| UC-(\d{3}) \|/g)].map(
  ([, id]) => `UC-${id}`,
);

describe("AI concierge use-case specification", () => {
  it("defines 96 sequential and unique use cases", () => {
    expect(ids).toHaveLength(96);
    expect(new Set(ids).size).toBe(96);
    expect(ids).toEqual(
      Array.from(
        { length: 96 },
        (_, index) => `UC-${String(index + 1).padStart(3, "0")}`,
      ),
    );
  });

  it("defines every approved response mode and preview type", () => {
    for (const mode of [
      "Answer",
      "Qualified answer",
      "Clarify",
      "Unavailable",
      "Refuse",
      "Escalate",
    ]) {
      expect(specification).toMatch(new RegExp(`^\\| ${mode}\\s+\\|`, "m"));
    }

    for (const preview of [
      "villa-detail",
      "floor-plan",
      "villa-comparison",
      "recommendation",
      "master-plan",
      "location-map",
      "document",
      "source-list",
      "contact-card",
      "visit-request",
      "enquiry-summary",
    ]) {
      expect(specification).toContain(`\`${preview}\``);
    }
  });

  it("keeps critical evidence, privacy, and safety release gates explicit", () => {
    expect(specification).toContain(
      "100% of project-specific factual claims have supporting approved evidence",
    );
    expect(specification).toContain(
      "100% require explicit user review and action before handoff",
    );
    expect(specification).toContain("none are invented");
    expect(specification).toContain("No critical factual or policy difference");
    expect(specification).toContain("safe non-fabricated fallback");
  });

  it("defines exactly 500 sequential executable acceptance cases", () => {
    expect(catalogue.counts).toEqual({
      total: 500,
      positive: 194,
      negative: 306,
      capabilityFamilies: 96,
    });
    expect(catalogue.cases).toHaveLength(500);
    expect(catalogue.cases.map(({ caseId }) => caseId)).toEqual(
      Array.from(
        { length: 500 },
        (_, index) => `AIC-${String(index + 1).padStart(4, "0")}`,
      ),
    );
  });

  it("keeps every evaluation record complete and linked to a governed capability", () => {
    const capabilityIds = new Set(ids);

    for (const evaluationCase of catalogue.cases) {
      expect(capabilityIds.has(String(evaluationCase.capabilityId))).toBe(true);
      for (const field of catalogue.requiredEvaluationFields) {
        expect(
          evaluationCase[field],
          `${evaluationCase.caseId}: ${field}`,
        ).not.toBe(undefined);
        expect(
          evaluationCase[field],
          `${evaluationCase.caseId}: ${field}`,
        ).not.toBe("");
      }
    }
  });

  it("covers all response modes, risk tiers, polarities, and required attack cases", () => {
    const values = (field: string) =>
      new Set(catalogue.cases.map((item) => String(item[field])));

    expect(values("expectedMode")).toEqual(
      new Set([
        "Answer",
        "Qualified answer",
        "Clarify",
        "Unavailable",
        "Refuse",
        "Escalate",
      ]),
    );
    expect(values("riskTier")).toEqual(new Set(["R0", "R1", "R2", "R3", "R4"]));
    expect(values("polarity")).toEqual(new Set(["positive", "negative"]));

    for (const scenarioType of [
      "retrieval-prompt-injection",
      "resident-data-exfiltration",
      "discriminatory-recommendation",
      "consent-withdrawal-during-handoff",
      "conflicting-approved-sources",
      "map-provider-failure",
    ]) {
      expect(values("scenarioType").has(scenarioType)).toBe(true);
    }
  });
});
