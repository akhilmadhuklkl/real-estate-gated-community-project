import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { env, pipeline } from "@huggingface/transformers";

const repo = resolve(process.cwd());
const index = JSON.parse(
  await readFile(resolve(repo, "content/generated/vector-index.json"), "utf8"),
);
const suite = JSON.parse(
  await readFile(
    resolve(repo, "content/evaluation/retrieval-evaluation-cases.json"),
    "utf8",
  ),
);
env.cacheDir = resolve(repo, ".cache/transformers");

const extractor = await pipeline("feature-extraction", index.model, {
  dtype: "q8",
});
let vectors;
try {
  const tensor = await extractor(
    suite.cases.map(({ query }) => query),
    { pooling: "mean", normalize: true },
  );
  vectors = tensor.tolist();
} finally {
  await extractor.dispose();
}

const dot = (left, right) =>
  left.reduce((total, value, i) => total + value * right[i], 0);
const stopWords = new Set([
  "the",
  "this",
  "that",
  "what",
  "which",
  "who",
  "how",
  "are",
  "is",
  "does",
  "there",
  "and",
  "for",
  "from",
  "into",
  "with",
]);
const tokens = (value) =>
  new Set(
    value
      .toLowerCase()
      .match(/[a-z0-9]+/g)
      ?.filter((token) => token.length > 2 && !stopWords.has(token)) ?? [],
  );
const hybridScore = (query, record, semanticScore) => {
  const queryTokens = tokens(query);
  const evidenceTokens = tokens(
    `${record.topics.join(" ")} ${record.locator.label} ${record.locator.sectionPath.join(" ")} ${record.text}`,
  );
  const overlap = [...queryTokens].filter((token) =>
    evidenceTokens.has(token),
  ).length;
  return (
    semanticScore + (queryTokens.size ? 0.25 * (overlap / queryTokens.size) : 0)
  );
};
const positive = suite.cases.filter(({ kind }) => kind === "positive");
const negative = suite.cases.filter(({ kind }) => kind === "negative");
const results = suite.cases.map((testCase, caseIndex) => {
  const ranked = index.records
    .map((record) => ({
      id: record.id,
      sourceId: record.sourceId,
      locator: record.locator,
      score: hybridScore(
        testCase.query,
        record,
        dot(vectors[caseIndex], record.vector),
      ),
    }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const expected = new Set(testCase.expectedChunkIds);
  const firstRelevantRank = ranked.findIndex(({ id }) => expected.has(id)) + 1;
  const top = ranked[0];
  const accepted = top && top.score >= suite.thresholds.minimumSimilarity;
  return {
    id: testCase.id,
    kind: testCase.kind,
    riskTier: testCase.riskTier,
    query: testCase.query,
    expectedChunkIds: testCase.expectedChunkIds,
    topMatches: ranked.slice(0, 3),
    firstRelevantRank: firstRelevantRank || null,
    hitAt1: testCase.kind === "positive" && firstRelevantRank === 1,
    hitAt3:
      testCase.kind === "positive" &&
      firstRelevantRank > 0 &&
      firstRelevantRank <= 3,
    rejected: testCase.kind === "negative" && !accepted,
    citationComplete: ranked
      .slice(0, 3)
      .every(({ locator, sourceId }) => Boolean(sourceId && locator?.label)),
  };
});

const rate = (count, total) => (total ? count / total : 0);
const positiveResults = results.filter(({ kind }) => kind === "positive");
const negativeResults = results.filter(({ kind }) => kind === "negative");
const metrics = {
  totalCases: results.length,
  positiveCases: positive.length,
  negativeCases: negative.length,
  hitAt1: rate(
    positiveResults.filter(({ hitAt1 }) => hitAt1).length,
    positiveResults.length,
  ),
  hitAt3: rate(
    positiveResults.filter(({ hitAt3 }) => hitAt3).length,
    positiveResults.length,
  ),
  meanReciprocalRank:
    positiveResults.reduce(
      (sum, result) =>
        sum + (result.firstRelevantRank ? 1 / result.firstRelevantRank : 0),
      0,
    ) / positiveResults.length,
  negativeRejectionRate: rate(
    negativeResults.filter(({ rejected }) => rejected).length,
    negativeResults.length,
  ),
  citationCompleteness: rate(
    results.filter(({ citationComplete }) => citationComplete).length,
    results.length,
  ),
};
const thresholds = suite.thresholds;
const checks = {
  hitAt1: metrics.hitAt1 >= thresholds.hitAt1,
  hitAt3: metrics.hitAt3 >= thresholds.hitAt3,
  meanReciprocalRank:
    metrics.meanReciprocalRank >= thresholds.meanReciprocalRank,
  negativeRejectionRate:
    metrics.negativeRejectionRate >= thresholds.negativeRejectionRate,
  citationCompleteness:
    metrics.citationCompleteness >= thresholds.citationCompleteness,
};
const report = {
  schemaVersion: "1.0.0",
  evaluatedAt: "2026-10-14T00:00:00.000Z",
  indexHash: index.indexHash,
  model: index.model,
  minimumSimilarity: thresholds.minimumSimilarity,
  metrics,
  thresholds,
  checks,
  passed: Object.values(checks).every(Boolean),
  results,
};
await writeFile(
  resolve(repo, "content/evaluation/retrieval-evaluation-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
console.log(JSON.stringify({ passed: report.passed, metrics, checks }));
if (!report.passed) process.exitCode = 1;
