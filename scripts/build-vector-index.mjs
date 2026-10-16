import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { env, pipeline } from "@huggingface/transformers";

const repo = resolve(process.cwd());
const model =
  process.env.AI_EMBEDDING_MODEL ??
  "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
const asOf = process.env.VECTOR_INDEX_AS_OF ?? new Date().toISOString();
const packagePath = resolve(
  repo,
  "content/generated/ai-knowledge-package.json",
);
const manifestPath = resolve(repo, "content/generated/ingestion-manifest.json");
const outputPath = resolve(repo, "content/generated/vector-index.json");
const knowledge = JSON.parse(await readFile(packagePath, "utf8"));
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const documentsById = new Map(
  knowledge.documents.map((document) => [document.id, document]),
);

const publicCitationHref = (document) => {
  if (
    document.permissions.classification !== "public" ||
    !document.permissions.audiences.includes("public") ||
    !document.permissions.allowedActions.includes("render-preview")
  ) {
    return null;
  }
  if (document.sourceId === "KS-001") {
    return "/reference/glitz-pride/brochure.pdf";
  }
  return null;
};

const eligible = knowledge.chunks.filter((chunk) => {
  const validUntil = chunk.governance.validUntil;
  return (
    chunk.governance.retrievalEligible &&
    chunk.governance.state === "active" &&
    chunk.governance.qualification &&
    (!validUntil || new Date(validUntil) >= new Date(asOf)) &&
    chunk.permissions.audiences.includes("assistant") &&
    chunk.permissions.allowedActions.includes("retrieve") &&
    !chunk.permissions.consentRequired
  );
});

env.cacheDir = resolve(repo, ".cache/transformers");
const extractor = await pipeline("feature-extraction", model, { dtype: "q8" });
let embeddings;
try {
  const tensor = await extractor(
    eligible.map(
      ({ text, topics, locator }) =>
        `${topics.join(" ")} ${locator.label} ${locator.sectionPath.join(" ")} ${text}`,
    ),
    { pooling: "mean", normalize: true },
  );
  embeddings = tensor.tolist();
} finally {
  await extractor.dispose();
}
const dimensions = embeddings[0]?.length ?? 0;
if (
  !dimensions ||
  embeddings.length !== eligible.length ||
  embeddings.some((value) => value.length !== dimensions)
) {
  throw new Error(
    "Embedding response was incomplete or dimensionally inconsistent.",
  );
}

const index = {
  schemaVersion: "1.0.0",
  model,
  dimensions,
  generatedAt: asOf,
  sourcePackageHash: manifest.packageHash,
  indexHash: "",
  usage: { provider: "local", submittedRecords: eligible.length },
  records: eligible.map((chunk, index) => ({
    ...(() => {
      const document = documentsById.get(chunk.documentId);
      if (!document) {
        throw new Error(`Missing document metadata for ${chunk.documentId}.`);
      }
      return {
        citation: {
          sourceTitle: document.title,
          effectiveDate: document.effectiveDate ?? null,
          reviewedAt: document.governance.reviewedAt,
          validUntil: document.governance.validUntil ?? null,
          href: publicCitationHref(document),
        },
      };
    })(),
    id: chunk.id,
    documentId: chunk.documentId,
    sourceId: chunk.sourceId,
    text: chunk.text,
    contentHash: chunk.contentHash,
    topics: chunk.topics,
    locator: chunk.locator,
    qualification: chunk.governance.qualification,
    vector: embeddings[index],
  })),
};
index.indexHash = `sha256:${createHash("sha256").update(JSON.stringify(index.records)).digest("hex")}`;
await writeFile(outputPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(
  JSON.stringify({
    outputPath,
    model,
    dimensions,
    records: index.records.length,
  }),
);
