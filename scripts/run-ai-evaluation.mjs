import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const repo = resolve(process.cwd());
const responseReportPath = resolve(
  repo,
  "content/evaluation/assistant-evaluation-report.json",
);
const retrievalReportPath = resolve(
  repo,
  "content/evaluation/retrieval-evaluation-report.json",
);
const releaseReportPath = resolve(
  repo,
  "content/evaluation/ai-evaluation-release-report.json",
);
const packageRunner = process.env.npm_execpath;
if (!packageRunner) {
  throw new Error("Run this evaluation through the package script.");
}

function run(args, extraEnv = {}) {
  const result = spawnSync(process.execPath, [packageRunner, ...args], {
    cwd: repo,
    env: { ...process.env, ...extraEnv },
    encoding: "utf8",
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(["exec", "vitest", "run", "src/lib/ai-use-cases.test.ts"]);
run(["evaluate:retrieval"]);
run(["exec", "vitest", "run", "src/lib/assistant-evaluation.test.ts"], {
  ASSISTANT_EVALUATION_REPORT_PATH: responseReportPath,
});

const [catalogue, retrieval, response] = await Promise.all([
  readFile(
    resolve(repo, "docs/ai/concierge-evaluation-catalogue.json"),
    "utf8",
  ).then(JSON.parse),
  readFile(retrievalReportPath, "utf8").then(JSON.parse),
  readFile(responseReportPath, "utf8").then(JSON.parse),
]);
const report = {
  schemaVersion: "1.0.0",
  evaluatedAt: new Date().toISOString(),
  suites: {
    behaviouralCatalogue: {
      passed: catalogue.cases.length === 500,
      caseCount: catalogue.cases.length,
    },
    retrieval: {
      passed: retrieval.passed,
      caseCount: retrieval.metrics.totalCases,
      metrics: retrieval.metrics,
    },
    assistantResponse: {
      passed: response.passed,
      caseCount: response.datasetReview.caseCount,
      metrics: response.metrics,
    },
  },
};
report.passed = Object.values(report.suites).every(({ passed }) => passed);
await writeFile(releaseReportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(
  JSON.stringify({
    passed: report.passed,
    catalogueCases: report.suites.behaviouralCatalogue.caseCount,
    retrievalCases: report.suites.retrieval.caseCount,
    responseCases: report.suites.assistantResponse.caseCount,
  }),
);
if (!report.passed) process.exitCode = 1;
