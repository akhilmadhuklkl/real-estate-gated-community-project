# Cited answers

T0037 makes every answered project claim traceable to governed evidence. The model produces prose, but it cannot create or alter the citation objects returned by the service.

## Citation contract

Each citation contains the immutable evidence, source, and document identifiers; the approved source title; a page or structured-section locator; the source effective, review, and validity dates; the mandatory qualification; an optional approved public route; and a retrieval-score confidence signal.

The application may open the brochure route with the citation page as interface context. It must not construct a filesystem path, repository path, or download URL from source metadata. A null route means the evidence may support the answer but is not directly openable by the visitor.

## Confidence

Confidence describes evidence retrieval strength, not truth probability or model certainty.

- High: score at least `0.80`.
- Moderate: score at least `0.60` and below `0.80`.
- Limited: accepted score at least `0.45` and below `0.60`.
- None: no supported answer was returned.

The response-level confidence is the weakest attached citation. The exact rounded score and `retrieval-score` basis remain visible for evaluation and future interface explanations.

## Unsupported answers

No qualifying evidence prevents generation. Empty model output is also treated as unsupported. Both paths return a deterministic not-confirmed message, no citations, no model identifier, confidence `none`, and required human handoff. Refusals, validation failures, retrieval failures, and provider failures also return no citations so the interface cannot imply support that was not used.

## Restricted material

Citation opening is deny-by-default. The builder emits a link only when the source classification is public, the public audience is allowed, the document permits preview rendering, and the application has an explicit allow-listed route. Document titles, qualifications, and review dates remain available for audit without revealing internal locations.

## Release checks

Tests verify complete citation metadata on every indexed record, safe route allow-listing, restricted-source null links, deterministic confidence boundaries, unsupported-answer behavior, qualifications, and the existing retrieval release thresholds.
