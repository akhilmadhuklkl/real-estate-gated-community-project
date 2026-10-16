# Vector retrieval

T0033 adds a disposable semantic index over the governed ingestion package. The source documents, hashes, permissions, lifecycle states, qualifications, and citations remain authoritative; vectors are only a search projection and can be rebuilt at any time.

## Selected approach

- Index embedding backend: local Transformers.js feature extraction, with no external inference request or billing dependency.
- Default model: `Xenova/paraphrase-multilingual-MiniLM-L12-v2`, a Transformers.js-compatible multilingual sentence model. Quantized inference produces normalized 384-dimensional vectors.
- Runtime provider contract: Vercel AI SDK `embed` and `embedMany` can use the same retrieval index contract when a paid gateway or another approved provider is enabled.
- Initial store: versioned JSON index bundled with the application. The current 19-chunk corpus is small enough for exact in-memory search without an external vector database.
- Migration point: move the same `VectorRecord` contract to managed vector storage when the corpus or query volume makes a bundled exact scan unsuitable.

## Security and governance gates

Before embedding, every chunk must be active, retrieval eligible, unexpired, qualified, visible to the assistant audience, permitted for retrieval, and free of consent requirements. Search applies allow-list metadata filters before ranking. Returned matches contain evidence text, immutable hashes, locators, qualifications, source title, effective date, review date, validity date, and an optional approved public route, but never expose raw vectors to the assistant response.

The index builder derives citation metadata from the governed document rather than user text or model output. A route is emitted only for a public document that allows the `public` audience and `render-preview` action. The official brochure maps to its existing application route. Structured or restricted evidence remains citable by title and locator but receives a null route.

The index is invalid when its `sourcePackageHash` differs from the ingestion manifest, or when query-vector dimensions differ from the stored dimensions. Model changes require a complete rebuild because vectors from different models or dimensions must never be mixed.

## Build

The first run downloads the quantized model into the ignored local cache. Later builds reuse the cached files.

```powershell
$env:VECTOR_INDEX_AS_OF = "2026-10-13T00:00:00.000Z"
node scripts/build-vector-index.mjs
```

`AI_EMBEDDING_MODEL` optionally overrides the compatible local model. Do not commit the model cache. Only already-approved public chunks are embedded.

## Query behaviour

`retrieveEvidence` embeds a non-empty question with the same model, rejects dimension mismatches, applies source/document/topic filters, combines cosine similarity with a bounded exact-token boost, uses stable ID ordering for score ties, enforces a maximum of 20 results, and returns citation-ready evidence. The token boost improves precise project terms without replacing semantic ranking.
