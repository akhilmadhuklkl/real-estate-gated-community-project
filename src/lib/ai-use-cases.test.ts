import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const specification = readFileSync(
  resolve(process.cwd(), "docs/ai/concierge-use-cases.md"),
  "utf8",
);

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
});
