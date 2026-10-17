# Dynamic preview panel

T0040 connects grounded assistant answers to deterministic visual components. The server selects a preview intent from the visitor's question, attaches only answer-scoped evidence IDs, and resolves all displayed content through the trusted application catalogue.

## Supported experiences

- Villa summary with approved area, level, bedroom, image, and publication status.
- Floor-plan gallery limited to approved plan media.
- Project gallery limited to registered media records.
- Location diagram with registered landmarks, distances, address, and trusted direction link.
- Villa comparison table when at least two approved villas are available.
- Contact actions sourced from the trusted project contact configuration.
- Official brochure link with an evidence-derived page reference when available.

The current approved catalogue has one villa. Comparison requests therefore fall back to that villa summary until a second approved villa record is added.

## Responsive behavior

On larger screens, the conversation expands into a two-pane workspace with the preview beside the answer. On phones, the preview opens as a contained bottom sheet inside the property-guide dialog. Visitors can return to the conversation without closing the guide.

## Safety and fallback behavior

- The response model cannot provide markup, styles, local paths, contact values, or arbitrary URLs.
- A preview is returned only when the answer includes approved citations.
- Unknown or invalid records fail closed and produce no preview.
- Missing media renders an accessible branded placeholder while text and navigation remain available.
- Unsupported questions and non-answered policy outcomes never receive a visual preview.
