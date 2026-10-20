// @vitest-environment node

import { writeFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import catalogue from "../../docs/ai/concierge-evaluation-catalogue.json";
import dataset from "../../content/evaluation/assistant-response-evaluation-cases.json";
import {
  parseAssistantEvaluationDataset,
  runAssistantEvaluation,
} from "./assistant-evaluation";

describe("AI assistant release evaluation", () => {
  it("keeps the approved 500-case behavioural catalogue complete", () => {
    expect(catalogue.cases).toHaveLength(500);
    expect(new Set(catalogue.cases.map(({ caseId }) => caseId)).size).toBe(500);
    expect(
      catalogue.cases.filter(({ polarity }) => polarity === "positive"),
    ).toHaveLength(194);
    expect(
      catalogue.cases.filter(({ polarity }) => polarity === "negative"),
    ).toHaveLength(306);
    expect(
      catalogue.cases.every(
        ({ expectedMode, strictGuardrail, expectedBehaviour }) =>
          expectedMode && strictGuardrail && expectedBehaviour,
      ),
    ).toBe(true);
  });

  it("uses a reviewer-approved, unique executable response dataset", () => {
    const parsed = parseAssistantEvaluationDataset(dataset);
    expect(parsed.reviewedBy).toBe("AKHIL");
    expect(new Set(parsed.cases.map(({ id }) => id)).size).toBe(
      parsed.cases.length,
    );
    expect(new Set(parsed.cases.map(({ language }) => language))).toEqual(
      new Set(["en", "ml", "hi", "ar", "te", "ta", "kn"]),
    );
    expect(new Set(parsed.cases.map(({ category }) => category))).toEqual(
      new Set([
        "grounding",
        "multilingual",
        "policy",
        "privacy",
        "failure-recovery",
        "structured-preview",
      ]),
    );
  });

  it("passes every deterministic quality and safety gate", async () => {
    const report = await runAssistantEvaluation(dataset);
    const failures = report.results
      .filter(({ passed }) => !passed)
      .map(({ id, status, policy, retrieveCalls, generateCalls, checks }) => ({
        id,
        status,
        policy,
        retrieveCalls,
        generateCalls,
        checks,
      }));
    expect(failures).toEqual([]);
    expect(report.metrics.externalModelCalls).toBe(0);
    expect(Object.values(report.thresholdChecks).every(Boolean)).toBe(true);
    expect(report.passed).toBe(true);

    const reportPath = process.env.ASSISTANT_EVALUATION_REPORT_PATH;
    if (reportPath) {
      await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    }
  });
});
