# Preview response schema

T0038 defines the safe boundary between assistant reasoning and visual preview rendering. The assistant selects allow-listed records; the server constructs the interface payload from trusted application modules.

## Supported previews

| Selector kind | Trusted component    | Model-selected fields                                              |
| ------------- | -------------------- | ------------------------------------------------------------------ |
| `villa`       | `villa-summary`      | Villa ID and attached evidence IDs                                 |
| `floor-plan`  | `floor-plan-gallery` | Villa ID, one or two allow-listed plan-media IDs, and evidence IDs |
| `gallery`     | `media-gallery`      | Up to six allow-listed media IDs and evidence IDs                  |
| `map`         | `landmark-map`       | Up to eight allow-listed landmark IDs and evidence IDs             |
| `comparison`  | `villa-comparison`   | Two or three unique allow-listed villa IDs and evidence IDs        |
| `contact`     | `contact-actions`    | Requested channel names and evidence IDs                           |
| `document`    | `document-link`      | The approved brochure ID, optional page 1–9, and evidence IDs      |

Selectors are strict discriminated unions. Unknown fields are rejected rather than removed. The model cannot provide titles, descriptions, HTML, media paths, coordinates, contact values, routes, or external URLs.

## Resolution rules

`resolveAssistantPreview` validates the selector, requires every evidence ID to belong to the same answer, rejects duplicate IDs, and resolves records from the existing project modules. Unknown or disallowed records fail closed.

Floor-plan previews accept only media already classified as plans. Contact previews expose only the requested channels from the trusted contact configuration. Document previews use the existing public brochure route. Location directions and villa routes are produced by application code rather than model output.

## Rendering contract

The returned payload contains a fixed `component` key and data shaped for the corresponding production component. A future interface may switch exhaustively on this key. It must not interpret selector values as markup, styles, executable code, filesystem paths, or arbitrary navigation targets.

The selection schema is intentionally separate from generated answer prose. Preview selection can be added to structured model output later without expanding the model's authority over presentation or project facts.
