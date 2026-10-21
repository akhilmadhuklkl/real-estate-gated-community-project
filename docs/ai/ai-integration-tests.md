# AI integration test evidence

## Purpose

This suite verifies the complete browser journey between the property guide, governed response contract, dynamic preview, and human-controlled enquiry handoff. It is designed to be repeatable without contacting an external model provider or transmitting personal data.

## Automated coverage

Run `pnpm test:ai-integration` to execute seven scenarios in both desktop and mobile Chromium:

1. Multi-turn context, approved citation disclosure, location preview, and document preview.
2. Explainable villa recommendation with explicit availability and pricing limitations.
3. Approved WhatsApp contact rendering with unavailable channels withheld and sending kept under user control.
4. Editable site-visit summary transferred into the enquiry form without automatic submission.
5. Approved language selection carried to the assistant request and localized text rendered safely.
6. Prompt-injection refusal without unsupported previews or citations.
7. Assistant endpoint failure with a clear retry message and a still-usable input.

The test intercepts `/api/assistant` and returns deterministic, schema-compatible fixtures. This provides stable integration evidence while avoiding API keys, live accounts, external network calls, and real customer information.

## Release evidence

A passing run must report 14 tests: seven scenarios for `desktop-chromium` and the same seven for `mobile-chromium`. Any failed assertion blocks completion of this task. The broader `pnpm test:e2e` and `pnpm check` commands remain the regression and quality gates.

## Boundary

This suite validates the application integration contract and user experience, not the uptime or output quality of a live model provider. Live-provider staging tests require a separately approved environment, controlled credentials, cost limits, and non-production data.
