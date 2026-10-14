# Retrieval evaluation and release gate

T0034 defines a deterministic offline evaluation for the governed vector index. It uses 26 representative questions derived from the approved capability catalogue: 18 answerable project questions and eight negative or out-of-scope questions spanning R0 through R4.

## Metrics

- **Hit@1:** an expected evidence chunk is the first result.
- **Hit@3:** an expected evidence chunk appears in the first three results.
- **Mean reciprocal rank:** rewards expected evidence appearing earlier.
- **Negative rejection rate:** the best match for an unsupported question remains below the similarity threshold.
- **Citation completeness:** every inspected result has a source ID and locator label.

The committed suite stores explicit expected chunk IDs rather than keywords. This measures evidence selection, not superficial text matching. Every report is bound to the immutable vector-index hash and records per-case rankings for diagnosis.

## Release thresholds

| Metric                  | Minimum |
| ----------------------- | ------: |
| Hit@1                   |     70% |
| Hit@3                   |     90% |
| Mean reciprocal rank    |     75% |
| Negative rejection rate |     75% |
| Citation completeness   |    100% |

The starting similarity threshold is `0.45`. It is a measured control, not a universal constant. Tuning must use reviewed evaluation cases and may not weaken high-risk failure behaviour merely to improve answer coverage.

## Run

```powershell
node scripts/run-retrieval-evaluation.mjs
```

The command exits unsuccessfully when any release threshold fails. It uses the same cached local multilingual model as index generation, requires no credential, and writes `content/evaluation/retrieval-evaluation-report.json`.

The accepted 14 October 2026 baseline passed with 83.3% Hit@1, 94.4% Hit@3, 90.3% mean reciprocal rank, 100% negative rejection, and 100% citation completeness.

## Change control

Run the gate after any source, chunking, model, vector, threshold, filter, or ranking change. A failed case must be resolved by correcting evidence, expected labels, chunking, retrieval logic, or a justified threshold change. Never edit expected evidence to make an incorrect result pass. R3 and R4 failures require explicit human review before release.
