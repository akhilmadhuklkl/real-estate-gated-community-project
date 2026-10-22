# AI pilot and UAT

## Decision

The Phase 2 AI pilot is **in progress and not yet accepted**. The governed user
experience, deterministic safety controls, deployment-safe retrieval, and
published-route browser journeys have been verified on a non-production preview. The
model-backed acceptance run is blocked by the free provider quota returning the
safe service-unavailable response.

AKHIL is the product owner and acceptance authority. Production remains on the
Phase 1 release until every model-backed acceptance scenario passes.

## Scope and privacy

- Target: the non-production Phase 2 preview deployment.
- Pilot population: automated, synthetic role simulations only. No real visitor
  or lead data is used.
- Languages: English, Malayalam, Hindi, Arabic, Telugu, Tamil, and Kannada.
- Coverage: grounded location and amenity answers, changing price information,
  prompt injection, private-data requests, investment guarantees, citations,
  visual details, editable handoff, recovery, desktop, and mobile.
- Evidence stores scenario identifiers, outcomes, policy metadata, timing, and
  citation counts. It does not store questions, answers, contacts, or conversation
  content.

## Acceptance criteria

The pilot can be accepted only when all of these conditions are met:

1. All 12 live synthetic scenarios pass against the same deployment.
2. Grounded responses include the required governed citations.
3. Every approved language returns an answer in its expected script.
4. High-risk requests are blocked or sent to human confirmation as specified.
5. Provider failures degrade safely without fabricated property information.
6. Published desktop and mobile journeys complete without application errors.
7. Production receives its own server-side provider key and rate-limit salt only
   after acceptance, immediately before the approved Phase 2 promotion.

## Evidence collected on 22 October 2026

### Browser UAT

The hosted Playwright run completed with 19 passing and one intentionally skipped
test across desktop and mobile. It covered all public routes and the assistant's
citation, preview, recommendation, contact, multilingual, refusal, failure, and
human-handoff journeys.

The hosting preview toolbar injects an external feedback script. The application
Content Security Policy correctly blocks it. The audit ignores only that exact
preview-platform console message; the policy was not weakened and all other
console errors still fail the run.

### Live AI pilot

The latest privacy-safe report contains 12 scenarios: 3 passed and 9 failed. The
three deterministic safety cases passed. The nine provider-backed cases returned
the safe service-unavailable state after a paced retry, consistent with exhausted
or unavailable free-provider quota. No unsupported answer was shown.

An earlier run proved that real model-backed grounded answers and citations work,
but it was not a complete acceptance run. Mixed-run evidence cannot satisfy the
all-scenarios acceptance gate.

## Findings

| Severity | Finding                                                                                     | State             | Resolution or next action                                                                                    |
| -------- | ------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------ |
| High     | The published production deployment is still Phase 1 and has no assistant endpoint.         | Open by design    | Do not promote until this pilot passes and production secrets are configured.                                |
| High     | The original hosted assistant bundle failed while loading the native embedding runtime.     | Resolved          | Hosted retrieval now uses governed lexical ranking; offline index generation retains transformer embeddings. |
| High     | Free provider quota or availability prevents a complete model-backed pilot.                 | Open blocker      | Retry the paced pilot after quota recovery; consider a paid quota before public launch.                      |
| Medium   | The preview toolbar creates a CSP console error despite the application behaving correctly. | Resolved in audit | Ignore only the exact hosting-toolbar injection on hosted previews; retain the strict CSP.                   |

## Re-run procedure

After provider quota recovery, run:

```powershell
$env:BASE_URL="<approved-preview-url>"
pnpm pilot:ai
```

The runner prints progress, spaces provider requests, retries transient failures
once, and replaces `content/evaluation/ai-pilot-uat-report.json`. Acceptance must
be based on a single report showing 12 of 12 scenarios passed.

Then repeat the hosted browser suite:

```powershell
$env:BASE_URL="<approved-preview-url>"
pnpm exec playwright test tests/e2e/uat.spec.ts tests/e2e/ai-integration.spec.ts
```

## Production promotion gate

Production promotion is a separate, explicit release action. Before it occurs:

- the live pilot must pass 12 of 12;
- production-only secrets must be configured without copying them into source;
- the Phase 2 health endpoint must report `phase-2-mvp`;
- the assistant endpoint and critical browser journeys must pass production
  smoke tests; and
- AKHIL must record final acceptance.
