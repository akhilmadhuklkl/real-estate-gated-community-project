# Phase 1 release runbook

## Release position

Phase 1 was publicly released on 10 October 2026 after owner approval was relayed by AKHIL. The production application uses a separate Vercel project and does not replace or modify the preserved mockup.

## Recorded launch decisions

- Owner publication approval for the qualified Phase 1 candidate was relayed by AKHIL on 10 October 2026.
- The canonical production origin is `https://glitz-pride-community.vercel.app` in the separate `glitz-pride-community` Vercel project.
- Search indexing is enabled. Canonical metadata, `robots.txt`, and `sitemap.xml` use the production origin.
- Analytics remains disabled, so no analytics cookie-consent flow is active.
- WhatsApp remains disabled until a verified routing number is approved.
- The enquiry endpoint remains preview-only and does not transmit or persist personal data.
- Existing qualifications and unknown labels remain visible until the owner supplies confirmed project details.

## Environment configuration

| Variable                       | Preview value             | Production value                  | Purpose                                            |
| ------------------------------ | ------------------------- | --------------------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`         | Preview deployment origin | Approved canonical HTTPS origin   | Canonical links, social metadata, and sitemap URLs |
| `NEXT_PUBLIC_SITE_INDEXABLE`   | `false`                   | `true` only after launch approval | Search indexing and sitemap publication            |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`  | Empty                     | Approved digits-only destination  | Enables the WhatsApp contact action                |
| `NEXT_PUBLIC_WHATSAPP_MESSAGE` | Approved preview text     | Approved production text          | Prefilled non-sensitive enquiry message            |

These variables are public browser configuration and must not contain credentials or private data. Any future secret must use a server-only variable configured directly in the hosting environment.

## Release procedure

1. Merge only a reviewed commit whose release-quality workflow passes.
2. Create a separate hosting project for the real application. Do not link it to the mockup project.
3. Configure preview variables with indexing disabled.
4. Deploy a preview and verify `/api/health` returns HTTP 200 with `status: ok` and `Cache-Control: no-store`.
5. Run the complete browser suite against the exact candidate deployment.
6. Obtain final business acceptance and record the approver, commit, deployment URL, and acceptance date.
7. Configure the approved production domain and production variables. Keep indexing disabled during final checks.
8. Stage the production build without assigning the public domain, verify it, and then promote that same tested build.
9. Enable indexing only when publication approval and the canonical domain are confirmed. Redeploy and verify `robots.txt`, `sitemap.xml`, canonical links, and social metadata.
10. Record the production URL, deployment identifier, commit, and rollback target in the release record.

## Post-release monitoring

- Check `/api/health` every five minutes from an external HTTPS monitor. Alert after two consecutive failures.
- Review hosting error logs after release, after configuration changes, and when the health check fails.
- Monitor availability, function errors, response latency, and Core Web Vitals without collecting enquiry content.
- Confirm the brochure download and the villa-to-visit journey daily during the first seven days.
- Treat unexpected search indexing, broken contact routes, incorrect property claims, or exposure of unapproved content as release-blocking incidents.

## Backup and recovery

Phase 1 does not persist enquiries or user accounts. The form validates requests and returns a preview reference without external delivery, so there is no application database to back up.

- Git history and the remote repository are the source-code and configuration backup.
- `project-assets/official/Glitz_Brochure.pdf` is the retained official source document. Published derivatives can be recreated from the repository.
- Hosting environment configuration must be documented in the release record without copying secret values.
- Before launch, record the previous healthy deployment as the rollback target.
- For recovery, promote the recorded healthy deployment, verify `/api/health`, then run the critical browser journey before reopening traffic.

## Rollback triggers

Rollback immediately for repeated health-check failures, inaccessible primary routes, broken brochure delivery, failed enquiry validation, unsafe indexing behavior, or publication of unapproved content. Pause contact promotion while the issue is investigated.

## Release record

| Field                | Value                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Release date         | 10 October 2026                                                                                                                             |
| Approved by          | Owner approval relayed by AKHIL                                                                                                             |
| Commit               | `4721e0b`                                                                                                                                  |
| Candidate deployment | `dpl_BcQLdbEK6jsGERiiskXCUuMma2W8`                                                                                                        |
| Production URL       | `https://glitz-pride-community.vercel.app`                                                                                                  |
| Health check         | Passed publicly with HTTP 200, `status: ok`, and phase `phase-1-mvp`                                                                        |
| Browser regression   | 56 passed across desktop and mobile; 2 intentional platform-specific skips                                                                 |
| Rollback deployment  | Initial production release; no earlier production baseline. Redeploy commit `4721e0b` if the active deployment must be reconstructed.     |
| Analytics decision   | Disabled                                                                                                                                   |
