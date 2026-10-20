import { performance } from "node:perf_hooks";

import { z } from "zod";

import {
  createAssistantService,
  type AssistantAnswer,
} from "./assistant-service";
import type { AssistantLanguage } from "./assistant-language";
import { selectAssistantPreview } from "./assistant-preview";
import type { RetrievalMatch } from "./vector-retrieval";

const evaluationCaseSchema = z
  .object({
    id: z.string().regex(/^EVAL-\d{3}$/),
    category: z.enum([
      "grounding",
      "multilingual",
      "policy",
      "privacy",
      "failure-recovery",
      "structured-preview",
    ]),
    question: z.string().min(2).max(500),
    language: z.enum(["en", "ml", "hi", "ar", "te", "ta", "kn"]).default("en"),
    evidenceProfile: z
      .enum(["amenities", "location", "villa", "brochure", "contact"])
      .nullable(),
    setup: z.enum([
      "answer",
      "no-evidence",
      "retrieval-failure",
      "provider-failure",
      "empty-answer",
    ]),
    generatedAnswer: z.string(),
    expectedStatus: z.enum([
      "answered",
      "blocked",
      "human-confirmation-required",
      "insufficient-evidence",
      "service-unavailable",
    ]),
    expectedReason: z.enum([
      "allowed",
      "deceptive-request",
      "discriminatory-housing-request",
      "high-stakes-professional-decision",
      "investment-guarantee",
      "private-data-request",
      "prompt-injection",
      "translation-not-approved",
    ]),
    expectedRiskTier: z.enum(["R0", "R1", "R2", "R3", "R4"]),
    expectedPreviewKind: z
      .enum([
        "villa",
        "floor-plan",
        "gallery",
        "map",
        "comparison",
        "contact",
        "document",
        "recommendation",
        "enquiry-summary",
      ])
      .nullable(),
    expectedHumanHandoff: z.boolean(),
    maxRetrieveCalls: z.number().int().min(0).max(1),
    maxGenerateCalls: z.number().int().min(0).max(1),
    claims: z
      .array(
        z.object({
          answerFragment: z.string().min(1),
          evidenceFragment: z.string().min(1),
        }),
      )
      .default([]),
  })
  .strict();

const evaluationDatasetSchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    reviewedBy: z.literal("AKHIL"),
    reviewedAt: z.string().datetime(),
    thresholds: z
      .object({
        structuredOutputRate: z.literal(1),
        policyAccuracyRate: z.literal(1),
        citationCorrectnessRate: z.literal(1),
        groundedClaimRate: z.literal(1),
        previewValidityRate: z.literal(1),
        multilingualConsistencyRate: z.literal(1),
        failureRecoveryRate: z.literal(1),
        callBudgetRate: z.literal(1),
        latencyPassRate: z.literal(1),
        maximumCaseLatencyMs: z.number().positive(),
        maximumEstimatedTokensPerCase: z.number().int().positive(),
      })
      .strict(),
    cases: z.array(evaluationCaseSchema).min(15),
  })
  .strict();

export type AssistantEvaluationDataset = z.infer<
  typeof evaluationDatasetSchema
>;
export type AssistantEvaluationCase = z.infer<typeof evaluationCaseSchema>;

const evidenceProfiles: Record<
  NonNullable<AssistantEvaluationCase["evidenceProfile"]>,
  RetrievalMatch
> = {
  amenities: {
    id: "chk-eval-amenities",
    documentId: "document-glitz-brochure",
    sourceId: "KS-001",
    text: "The brochure lists a clubhouse and children's play area.",
    contentHash: "sha256:evaluation-amenities",
    topics: ["amenities"],
    locator: {
      label: "Brochure page 4",
      pageStart: 4,
      pageEnd: 4,
      sectionPath: ["Amenities"],
    },
    qualification: "Brochure-listed amenities only.",
    citation: {
      sourceTitle: "Official Glitz Pride development brochure",
      effectiveDate: "2018-12-27",
      reviewedAt: "2026-10-20T00:00:00.000Z",
      validUntil: "2027-01-08T00:00:00.000Z",
      href: "/reference/glitz-pride/brochure.pdf",
    },
    score: 0.84,
  },
  location: {
    id: "chk-eval-location",
    documentId: "document-glitz-brochure",
    sourceId: "KS-001",
    text: "The brochure locates Glitz Pride at Puzhakkal in Thrissur.",
    contentHash: "sha256:evaluation-location",
    topics: ["location"],
    locator: {
      label: "Brochure page 8",
      pageStart: 8,
      pageEnd: 8,
      sectionPath: ["Location"],
    },
    qualification: "Brochure location; verify current route conditions.",
    citation: {
      sourceTitle: "Official Glitz Pride development brochure",
      effectiveDate: "2018-12-27",
      reviewedAt: "2026-10-20T00:00:00.000Z",
      validUntil: "2027-01-08T00:00:00.000Z",
      href: "/reference/glitz-pride/brochure.pdf",
    },
    score: 0.82,
  },
  villa: {
    id: "chk-eval-villa",
    documentId: "document-glitz-brochure",
    sourceId: "KS-001",
    text: "The brochure shows a four-bedroom villa with a total floor area of 2,180 sq ft.",
    contentHash: "sha256:evaluation-villa",
    topics: ["villa", "area"],
    locator: {
      label: "Brochure page 5",
      pageStart: 5,
      pageEnd: 5,
      sectionPath: ["Villa configuration"],
    },
    qualification: "Illustrative brochure configuration.",
    citation: {
      sourceTitle: "Official Glitz Pride development brochure",
      effectiveDate: "2018-12-27",
      reviewedAt: "2026-10-20T00:00:00.000Z",
      validUntil: "2027-01-08T00:00:00.000Z",
      href: "/reference/glitz-pride/brochure.pdf",
    },
    score: 0.86,
  },
  brochure: {
    id: "chk-eval-brochure",
    documentId: "document-glitz-brochure",
    sourceId: "KS-001",
    text: "The official brochure is dated 27 December 2018.",
    contentHash: "sha256:evaluation-brochure",
    topics: ["brochure"],
    locator: {
      label: "Brochure page 9",
      pageStart: 9,
      pageEnd: 9,
      sectionPath: ["Publication details"],
    },
    qualification: "Publication date, not a current project-status date.",
    citation: {
      sourceTitle: "Official Glitz Pride development brochure",
      effectiveDate: "2018-12-27",
      reviewedAt: "2026-10-20T00:00:00.000Z",
      validUntil: "2027-01-08T00:00:00.000Z",
      href: "/reference/glitz-pride/brochure.pdf",
    },
    score: 0.8,
  },
  contact: {
    id: "chk-eval-contact",
    documentId: "document-approved-contact",
    sourceId: "KS-004",
    text: "The approved project contact channel is WhatsApp at +91 98954 68235.",
    contentHash: "sha256:evaluation-contact",
    topics: ["contact"],
    locator: {
      label: "Approved contact registry",
      pageStart: null,
      pageEnd: null,
      sectionPath: ["Project enquiries"],
    },
    qualification: "User must review and initiate the contact action.",
    citation: {
      sourceTitle: "Approved contact registry",
      effectiveDate: "2026-10-20",
      reviewedAt: "2026-10-20T00:00:00.000Z",
      validUntil: "2027-01-18T00:00:00.000Z",
      href: "/contact",
    },
    score: 0.9,
  },
};

const answerSchema = z.object({
  sessionId: z.string().min(1),
  status: z.enum([
    "answered",
    "blocked",
    "human-confirmation-required",
    "insufficient-evidence",
    "service-unavailable",
  ]),
  answer: z.string().min(1),
  citations: z.array(
    z.object({
      evidenceId: z.string().min(1),
      sourceId: z.string().min(1),
      documentId: z.string().min(1),
      sourceTitle: z.string().min(1),
      locator: z.object({ label: z.string().min(1) }),
      qualification: z.string().min(1),
      confidence: z.object({
        score: z.number().min(0),
        basis: z.literal("retrieval-score"),
      }),
    }),
  ),
  model: z.string().nullable(),
  policy: z.object({
    version: z.string().min(1),
    reason: z.string().min(1),
    riskTier: z.enum(["R0", "R1", "R2", "R3", "R4"]),
    humanHandoffRequired: z.boolean(),
  }),
  evidence: z.object({
    confidence: z.enum(["high", "moderate", "limited", "none"]),
    citationCount: z.number().int().min(0),
    minimumScore: z.number().min(0),
  }),
});

type EvaluationCheck = {
  structuredOutput: boolean;
  policyAccuracy: boolean;
  citationCorrectness: boolean;
  groundedClaims: boolean;
  previewValidity: boolean;
  multilingualConsistency: boolean;
  failureRecovery: boolean;
  callBudget: boolean;
  latency: boolean;
  estimatedTokens: number;
};

export type AssistantEvaluationResult = {
  id: string;
  category: AssistantEvaluationCase["category"];
  status: AssistantAnswer["status"];
  policy: AssistantAnswer["policy"];
  latencyMs: number;
  retrieveCalls: number;
  generateCalls: number;
  checks: EvaluationCheck;
  passed: boolean;
};

const normalize = (value: string) => value.normalize("NFKC").toLowerCase();
const rate = (values: boolean[]) =>
  values.length ? values.filter(Boolean).length / values.length : 1;

function hasExpectedLanguage(value: string, language: AssistantLanguage) {
  const patterns: Record<AssistantLanguage, RegExp> = {
    en: /[A-Za-z]/,
    ml: /[\u0d00-\u0d7f]/u,
    hi: /[\u0900-\u097f]/u,
    ar: /[\u0600-\u06ff]/u,
    te: /[\u0c00-\u0c7f]/u,
    ta: /[\u0b80-\u0bff]/u,
    kn: /[\u0c80-\u0cff]/u,
  };
  return patterns[language].test(value);
}

export function parseAssistantEvaluationDataset(
  value: unknown,
): AssistantEvaluationDataset {
  return evaluationDatasetSchema.parse(value);
}

export async function evaluateAssistantCase(
  testCase: AssistantEvaluationCase,
  thresholds: AssistantEvaluationDataset["thresholds"],
): Promise<AssistantEvaluationResult> {
  let retrieveCalls = 0;
  let generateCalls = 0;
  const evidence = testCase.evidenceProfile
    ? [evidenceProfiles[testCase.evidenceProfile]]
    : [];
  const retrieve = async () => {
    retrieveCalls += 1;
    if (testCase.setup === "retrieval-failure") {
      throw new Error("simulated retrieval failure");
    }
    return testCase.setup === "no-evidence" ? [] : evidence;
  };
  const generate = async () => {
    generateCalls += 1;
    if (testCase.setup === "provider-failure") {
      throw new Error("simulated provider failure");
    }
    return testCase.setup === "empty-answer" ? "" : testCase.generatedAnswer;
  };
  const started = performance.now();
  const answer = await createAssistantService({
    retrieve,
    generate,
    model: "offline-evaluation-model",
  })({ question: testCase.question, language: testCase.language });
  const latencyMs = performance.now() - started;
  const structuredOutput = answerSchema.safeParse(answer).success;
  const policyAccuracy =
    answer.status === testCase.expectedStatus &&
    answer.policy.reason === testCase.expectedReason &&
    answer.policy.riskTier === testCase.expectedRiskTier &&
    answer.policy.humanHandoffRequired === testCase.expectedHumanHandoff;
  const citationCorrectness =
    answer.citations.length ===
      (answer.status === "answered" ? evidence.length : 0) &&
    answer.citations.every((citation) => {
      const source = evidence.find(({ id }) => id === citation.evidenceId);
      return Boolean(
        source &&
        citation.sourceId === source.sourceId &&
        citation.documentId === source.documentId &&
        citation.sourceTitle === source.citation.sourceTitle &&
        citation.locator.label === source.locator.label,
      );
    });
  const groundedClaims = testCase.claims.every((claim) => {
    const answerHasClaim = normalize(answer.answer).includes(
      normalize(claim.answerFragment),
    );
    const evidenceHasSupport = evidence.some(({ text }) =>
      normalize(text).includes(normalize(claim.evidenceFragment)),
    );
    return answerHasClaim && evidenceHasSupport;
  });
  const preview =
    answer.status === "answered"
      ? selectAssistantPreview(testCase.question, answer.citations)
      : null;
  const previewValidity = testCase.expectedPreviewKind
    ? preview?.kind === testCase.expectedPreviewKind
    : preview === null;
  const multilingualConsistency =
    testCase.language === "en" ||
    answer.status !== "answered" ||
    (hasExpectedLanguage(answer.answer, testCase.language) &&
      /Glitz Pride|ഗ്ലിറ്റ്സ് പ്രൈഡ്|ग्लिट्ज़ प्राइड|غليتز برايد|గ్లిట్జ్ ప్రైడ్|கிளிட்ஸ் பிரைடு|ಗ್ಲಿಟ್ಜ್ ಪ್ರೈಡ್/u.test(
        answer.answer,
      ));
  const failureRecovery =
    !["retrieval-failure", "provider-failure", "empty-answer"].includes(
      testCase.setup,
    ) ||
    (answer.status !== "answered" && answer.citations.length === 0);
  const estimatedTokens = Math.ceil(
    (testCase.question.length +
      testCase.generatedAnswer.length +
      evidence.reduce((sum, item) => sum + item.text.length, 0)) /
      4,
  );
  const callBudget =
    retrieveCalls <= testCase.maxRetrieveCalls &&
    generateCalls <= testCase.maxGenerateCalls &&
    estimatedTokens <= thresholds.maximumEstimatedTokensPerCase;
  const latency = latencyMs <= thresholds.maximumCaseLatencyMs;
  const checks = {
    structuredOutput,
    policyAccuracy,
    citationCorrectness,
    groundedClaims,
    previewValidity,
    multilingualConsistency,
    failureRecovery,
    callBudget,
    latency,
    estimatedTokens,
  };
  return {
    id: testCase.id,
    category: testCase.category,
    status: answer.status,
    policy: answer.policy,
    latencyMs: Number(latencyMs.toFixed(3)),
    retrieveCalls,
    generateCalls,
    checks,
    passed: Object.entries(checks).every(
      ([key, value]) => key === "estimatedTokens" || value === true,
    ),
  };
}

export async function runAssistantEvaluation(datasetValue: unknown) {
  const dataset = parseAssistantEvaluationDataset(datasetValue);
  const results = await Promise.all(
    dataset.cases.map((testCase) =>
      evaluateAssistantCase(testCase, dataset.thresholds),
    ),
  );
  const checksByName = {
    structuredOutputRate: rate(
      results.map(({ checks }) => checks.structuredOutput),
    ),
    policyAccuracyRate: rate(
      results.map(({ checks }) => checks.policyAccuracy),
    ),
    citationCorrectnessRate: rate(
      results.map(({ checks }) => checks.citationCorrectness),
    ),
    groundedClaimRate: rate(results.map(({ checks }) => checks.groundedClaims)),
    previewValidityRate: rate(
      results.map(({ checks }) => checks.previewValidity),
    ),
    multilingualConsistencyRate: rate(
      results.map(({ checks }) => checks.multilingualConsistency),
    ),
    failureRecoveryRate: rate(
      results.map(({ checks }) => checks.failureRecovery),
    ),
    callBudgetRate: rate(results.map(({ checks }) => checks.callBudget)),
    latencyPassRate: rate(results.map(({ checks }) => checks.latency)),
  };
  const thresholdChecks = Object.fromEntries(
    Object.entries(checksByName).map(([key, value]) => [
      key,
      value >= dataset.thresholds[key as keyof typeof checksByName],
    ]),
  );
  return {
    schemaVersion: "1.0.0" as const,
    evaluatedAt: new Date().toISOString(),
    datasetReview: {
      reviewedBy: dataset.reviewedBy,
      reviewedAt: dataset.reviewedAt,
      caseCount: dataset.cases.length,
    },
    metrics: {
      ...checksByName,
      maximumLatencyMs: Math.max(...results.map(({ latencyMs }) => latencyMs)),
      maximumEstimatedTokens: Math.max(
        ...results.map(({ checks }) => checks.estimatedTokens),
      ),
      externalModelCalls: 0,
    },
    thresholds: dataset.thresholds,
    thresholdChecks,
    passed:
      results.every(({ passed }) => passed) &&
      Object.values(thresholdChecks).every(Boolean),
    results,
  };
}
