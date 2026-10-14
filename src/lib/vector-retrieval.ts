import { cosineSimilarity, embed, embedMany } from "ai";

export type KnowledgeChunk = {
  id: string;
  documentId: string;
  sourceId: string;
  text: string;
  contentHash: string;
  topics: string[];
  locator: {
    label: string;
    pageStart: number | null;
    pageEnd: number | null;
    sectionPath: string[];
  };
  permissions: {
    audiences: string[];
    allowedActions: string[];
    consentRequired: boolean;
  };
  governance: {
    state: string;
    retrievalEligible: boolean;
    qualification: string | null;
    validUntil: string | null;
  };
};

export type VectorRecord = Omit<
  KnowledgeChunk,
  "permissions" | "governance"
> & {
  vector: number[];
  qualification: string;
};

export type VectorIndex = {
  schemaVersion: "1.0.0";
  model: string;
  dimensions: number;
  generatedAt: string;
  sourcePackageHash: string;
  records: VectorRecord[];
};

export type RetrievalFilters = {
  sourceIds?: string[];
  documentIds?: string[];
  topics?: string[];
  minimumScore?: number;
  topK?: number;
};

export type RetrievalMatch = Omit<VectorRecord, "vector"> & { score: number };

export function isRetrievalEligible(
  chunk: KnowledgeChunk,
  asOf: Date,
): boolean {
  const { governance, permissions } = chunk;
  return (
    governance.retrievalEligible &&
    governance.state === "active" &&
    Boolean(governance.qualification) &&
    (!governance.validUntil || new Date(governance.validUntil) >= asOf) &&
    permissions.audiences.includes("assistant") &&
    permissions.allowedActions.includes("retrieve") &&
    !permissions.consentRequired
  );
}

export async function buildVectorIndex(args: {
  chunks: KnowledgeChunk[];
  model: string;
  sourcePackageHash: string;
  generatedAt: string;
  asOf: Date;
}): Promise<VectorIndex> {
  const eligible = args.chunks.filter((chunk) =>
    isRetrievalEligible(chunk, args.asOf),
  );
  const { embeddings } = await embedMany({
    model: args.model,
    values: eligible.map(({ text }) => text),
    maxParallelCalls: 2,
    telemetry: { isEnabled: false },
  });
  const dimensions = embeddings[0]?.length ?? 0;
  if (
    !dimensions ||
    embeddings.some((vector) => vector.length !== dimensions)
  ) {
    throw new Error(
      "Embedding provider returned empty or inconsistent dimensions.",
    );
  }
  return {
    schemaVersion: "1.0.0",
    model: args.model,
    dimensions,
    generatedAt: args.generatedAt,
    sourcePackageHash: args.sourcePackageHash,
    records: eligible.map((chunk, index) => ({
      id: chunk.id,
      documentId: chunk.documentId,
      sourceId: chunk.sourceId,
      text: chunk.text,
      contentHash: chunk.contentHash,
      topics: chunk.topics,
      locator: chunk.locator,
      qualification: chunk.governance.qualification!,
      vector: embeddings[index],
    })),
  };
}

export async function retrieveEvidence(args: {
  query: string;
  index: VectorIndex;
  filters?: RetrievalFilters;
}): Promise<RetrievalMatch[]> {
  const query = args.query.trim();
  if (!query) return [];
  const { embedding } = await embed({
    model: args.index.model,
    value: query,
    telemetry: { isEnabled: false },
  });
  if (embedding.length !== args.index.dimensions) {
    throw new Error(
      "Query embedding dimensions do not match the stored index.",
    );
  }
  return rankVectorRecords(embedding, args.index.records, args.filters);
}

export function rankVectorRecords(
  queryVector: number[],
  records: VectorRecord[],
  filters: RetrievalFilters = {},
): RetrievalMatch[] {
  if (
    !queryVector.length ||
    queryVector.some((value) => !Number.isFinite(value))
  ) {
    return [];
  }
  const sourceIds = filters.sourceIds ? new Set(filters.sourceIds) : null;
  const documentIds = filters.documentIds ? new Set(filters.documentIds) : null;
  const topics = filters.topics ? new Set(filters.topics) : null;
  const minimumScore = filters.minimumScore ?? 0;
  const topK = Math.min(Math.max(filters.topK ?? 5, 1), 20);

  return records
    .filter((record) => !sourceIds || sourceIds.has(record.sourceId))
    .filter((record) => !documentIds || documentIds.has(record.documentId))
    .filter(
      (record) => !topics || record.topics.some((topic) => topics.has(topic)),
    )
    .filter(
      ({ vector }) =>
        vector.length === queryVector.length &&
        vector.every((value) => Number.isFinite(value)),
    )
    .map(({ vector, ...record }) => ({
      ...record,
      score: cosineSimilarity(queryVector, vector),
    }))
    .filter(({ score }) => Number.isFinite(score) && score >= minimumScore)
    .sort(
      (left, right) =>
        right.score - left.score || left.id.localeCompare(right.id),
    )
    .slice(0, topK);
}
