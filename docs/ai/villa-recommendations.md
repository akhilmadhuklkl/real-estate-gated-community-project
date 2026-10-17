# Explainable villa recommendations

## Decision

T0041 adds a deterministic recommendation layer on top of the approved villa catalogue. The language model does not rank villas. Application code extracts a small set of neutral preferences, validates them, compares them with governed catalogue fields, and renders every applied criterion with its outcome and evidence limitation.

The current approved catalogue contains one villa plan. The interface therefore describes an explained match or mismatch and never presents a competitive ranking.

## Preference collection

The service can collect these preferences from the current question and recent user turns:

- minimum bedroom count;
- minimum or maximum total floor area;
- preferred number of levels;
- explicitly requested accessibility, balcony, garden, or parking features;
- household size, used only to request a direct bedroom preference and never to infer capacity;
- whether budget or current availability was mentioned.

When no neutral property preference is present, the assistant asks one focused question covering bedroom count, approximate area, levels, or a specific feature.

## Recommendation outcomes

Each criterion is labelled as `match`, `not-match`, or `unknown`. Unknown catalogue fields stay unknown. Requested features that are not explicitly modelled require human confirmation. A numeric mismatch produces a no-evidenced-match result instead of stretching the criteria.

Budget and live availability are recorded only as limitations. They do not affect matching because the approved knowledge package has no verified live price or inventory source.

## Guardrails

- Recommendations use only approved catalogue IDs and answer-scoped evidence IDs.
- Protected characteristics are rejected by the assistant policy before retrieval.
- The system does not infer room capacity from household size.
- It does not determine affordability, loan eligibility, investment value, accessibility suitability, medical suitability, or personal safety.
- Catalogue presence does not prove price, availability, completion, installed features, contractual inclusion, or legal status.
- Changing commercial details are directed to the approved contact route for confirmation.

## Interface behavior

The recommendation preview shows the single approved option, each requested criterion and outcome, material limitations, and a confirmation link. It uses the existing desktop side panel and mobile in-dialog sheet, including scroll containment and missing-media fallback behavior.
