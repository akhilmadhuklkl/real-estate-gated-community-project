# Phase 2 AI-driven MVP release runbook

## Release authority and scope

AKHIL is the product owner and final release authority. This release adds the
grounded property assistant, governed citations and visual previews, multilingual
responses, voice transcription, editable human handoff, privacy-safe feedback,
and operational measurements to the existing public website.

The validated release keeps the direct Google provider integration used by the
accepted pilot. It tries `gemini-3.5-flash-lite` first and uses
`gemini-3.8-flash` only when the primary request fails. Both models are
available to the same approved Google project. Changing provider or routing
architecture requires a new pilot.

## Required gates

Release only when every gate passes on the same reviewed commit:

1. `pnpm check`
2. `pnpm evaluate:ai`
3. The privacy-safe live pilot reports 12 of 12 passing scenarios.
4. Hosted desktop and mobile UAT reports 19 passing tests and one expected skip.
5. Production-scoped configuration contains:
   - `GOOGLE_GENERATIVE_AI_API_KEY` as a Secret
   - `API_RATE_LIMIT_SALT` as a Secret
   - `APP_ALLOWED_ORIGINS` as Config
   - the four approved `NEXT_PUBLIC_` site and contact values as Config
6. The staged production build passes `pnpm smoke:production` before promotion.

Never copy secret values into source, logs, reports, screenshots, or release notes.

## Release record — 23 October 2026

- Public URL: `https://glitz-pride-community.vercel.app`
- Production deployment: `dpl_CTG55heBYPor2F4BgXkSW2eeGd8V`
- Pre-Phase 2 rollback deployment: `dpl_81JMF65zx2ACiwJ69BH8N3STEkXw`
- Automated code gate: 205 tests passed, followed by a successful production
  build.
- Offline AI evaluation: 500 behavioural, 38 retrieval, and 22 response-quality
  cases passed.
- Hosted AI pilot: 12 of 12 scenarios passed. Median duration was 1.69 seconds;
  p95 and maximum were 34.25 seconds because one request used the free-tier
  fallback path.
- Hosted browser UAT: 19 tests passed with one expected project-specific skip.
- Staged and post-promotion smoke checks: 8 of 8 passed on both runs.
- Initial production log review: zero error-level records in the first 15-minute
  verification window.

## Deployment procedure

Use a staged production build so testing and release use the identical artifact:

```powershell
npx --yes vercel@64.7.0 deploy --prod --skip-domain --yes
$env:BASE_URL="<staged-production-url>"
pnpm smoke:production
pnpm exec playwright test tests/e2e/uat.spec.ts tests/e2e/ai-integration.spec.ts
npx --yes vercel@64.7.0 promote <staged-production-url> --yes
```

After promotion, repeat the production smoke check against
`https://glitz-pride-community.vercel.app`.

## Capacity, cost, and fallback

- The current provider key uses an externally managed free quota. It can throttle
  or become unavailable without notice. The approved same-provider fallback
  reduces single-model outages but does not provide independent quota or provider
  redundancy.
- The assistant returns a safe service-unavailable response and preserves normal
  website navigation, contact actions, and typed enquiry routes when generation
  fails.
- Voice failure keeps typed chat available.
- Cost metrics remain disabled until owner-approved input and output rates are
  configured. Provider dashboard limits remain the authoritative budget control.
- Review provider capacity before paid promotion or material traffic campaigns.
  A sustained public campaign should use an approved paid quota or a separately
  piloted fallback provider.

## Post-release verification

Confirm these boundaries:

| Boundary         | Required evidence                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Browser          | Public routes render on desktop and mobile without application console errors.               |
| Client to API    | The assistant sends validated same-origin requests and receives structured JSON.             |
| API to knowledge | A grounded property question returns governed citations.                                     |
| Safety           | Prompt injection is blocked as R4 and changing commercial facts keep their policy treatment. |
| Response to UI   | Answers, citations, preview details, feedback, and editable handoff render correctly.        |
| Operations       | Health reports `phase-2-mvp`; structured logs contain categorical data only.                 |

## Monitoring

For the first release hour, review function logs after the smoke requests. Then
apply the thresholds in `docs/ai/ai-observability.md`:

- more than three service-unavailable events in 15 minutes;
- p95 duration above 10 seconds for 15 minutes;
- more than 10 percent service-unavailable responses;
- more than 30 percent needs-improvement feedback after ten ratings; or
- more than three voice-provider failures in 15 minutes.

Do not inspect or retain visitor questions, answers, contact details, audio, IP
addresses, or unique visitor identifiers for monitoring.

## Rollback

The pre-Phase 2 production deployment is
`dpl_81JMF65zx2ACiwJ69BH8N3STEkXw`. If a release-critical fault appears:

1. Stop promotional traffic and record the time and failing boundary.
2. Roll back to that deployment or the latest known-good production deployment:

   ```powershell
   npx --yes vercel@64.7.0 rollback dpl_81JMF65zx2ACiwJ69BH8N3STEkXw --yes
   ```

3. Confirm `/api/health`, the homepage, villas, contact, robots, and sitemap.
4. Preserve privacy-safe request IDs and categorical error evidence only.
5. Fix and repeat every release gate before promoting another build.

Rollback may disable automatic production assignment. Use an explicit promotion
after the repaired staged production build passes all gates.
