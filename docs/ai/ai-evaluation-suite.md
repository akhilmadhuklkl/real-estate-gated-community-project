# AI evaluation suite and release gate

## Purpose

T0049 adds an offline release gate for the property assistant. It measures the
behavioural contract, governed retrieval, structured responses, citations,
grounding, policy decisions, previews, multilingual consistency, failure
recovery, execution latency, and estimated token budgets without sending test
content to an external model provider.

## Evaluation layers

The release command runs three independent layers:

1. **Behavioural catalogue:** validates all 500 approved positive and negative
   cases, their unique identifiers, response modes, guardrails, and expected
   behaviours. This layer protects scope coverage but does not claim that all
   500 prompts were sent to a live model.
2. **Retrieval benchmark:** runs 38 reviewed positive and negative questions
   against the governed vector index. It measures hit rate, mean reciprocal
   rank, negative rejection, and citation metadata completeness.
3. **Executable response evaluation:** runs 22 deterministic scenarios through
   the production assistant service. These cover grounded answers, exact
   citation provenance, structured-output validation, villa and location
   previews, English plus the six approved translated languages, privacy,
   prompt injection, discriminatory requests, professional and investment
   escalation, missing evidence, retrieval failure, provider failure, and empty
   generation.

The executable cases use injected retrieval and generation fixtures. They
exercise production policy, response, citation, language, and preview code but
make zero external model calls. This keeps the gate reproducible and free to
run on every change.

## Approved thresholds

The reviewed response dataset requires 100% for structured-output validity,
policy accuracy, citation correctness, grounded-claim support, preview
validity, multilingual consistency, safe failure recovery, call-budget
compliance, and the latency gate. Each deterministic case must complete within
250 ms and remain below an estimated 2,000 input-plus-output tokens.

The retrieval thresholds remain governed by the retrieval suite: hit@1 of at
least 0.70, hit@3 of at least 0.90, mean reciprocal rank of at least 0.75,
negative rejection of at least 0.75, and complete citation metadata.

## Running the gate

```text
pnpm evaluate:ai
```

The command exits unsuccessfully when any layer fails and writes three reports
under `content/evaluation/`:

- `retrieval-evaluation-report.json`
- `assistant-evaluation-report.json`
- `ai-evaluation-release-report.json`

The release workflow runs this command after the standard formatting, lint,
type, unit, and production-build checks.

## Review and regression policy

Run the full gate after any change to approved sources, chunking, embeddings,
retrieval thresholds, prompts, guardrails, response contracts, previews,
language content, provider configuration, or security controls. Run it before
each public release even when none of those files appear to have changed.

A failed expectation must be resolved by correcting the implementation,
evidence, or a reviewer-confirmed expectation. Do not weaken a threshold or
rewrite expected evidence simply to produce a passing report. Every R3 or R4
miss, citation mismatch, unsupported factual claim, privacy failure, or
cross-language policy difference blocks release and requires reviewer sign-off.

## Limits and future expansion

The deterministic response latency measures application logic, not network or
provider latency. Token counts are conservative character-based estimates, not
provider billing records. Before material traffic or a provider/model change,
add a separate consented staging evaluation for real provider latency, output
quality, and billed usage. Keep its data free of personal information and do
not replace this deterministic regression gate with live-only tests.
