import { cosineSimilarity, embed, embedMany } from "ai";

export type KnowledgeChunk = {
  id: string;
  documentId: string;
  sourceId: string;
  text: string;
  contentHash: string;
  topics: string[];
  language?: {
    code: string;
    translationState: string;
  };
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
  citation: {
    sourceTitle: string;
    effectiveDate: string | null;
    reviewedAt: string;
    validUntil: string | null;
    href: string | null;
  };
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
  languageCodes?: string[];
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
  citationByDocumentId: Record<string, VectorRecord["citation"]>;
  model: string;
  sourcePackageHash: string;
  generatedAt: string;
  asOf: Date;
}): Promise<VectorIndex> {
  const eligible = args.chunks.filter((chunk) =>
    isRetrievalEligible(chunk, args.asOf),
  );
  if (eligible.some((chunk) => !args.citationByDocumentId[chunk.documentId])) {
    throw new Error("Every retrievable chunk requires citation metadata.");
  }
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
      language: chunk.language,
      locator: chunk.locator,
      qualification: chunk.governance.qualification!,
      citation: args.citationByDocumentId[chunk.documentId],
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
  return rankVectorRecords(embedding, args.index.records, args.filters, query);
}

export function rankVectorRecords(
  queryVector: number[],
  records: VectorRecord[],
  filters: RetrievalFilters = {},
  queryText = "",
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
  const languageCodes = filters.languageCodes
    ? new Set(filters.languageCodes)
    : null;
  const minimumScore = filters.minimumScore ?? 0;
  const topK = Math.min(Math.max(filters.topK ?? 5, 1), 20);

  return records
    .filter((record) => !sourceIds || sourceIds.has(record.sourceId))
    .filter((record) => !documentIds || documentIds.has(record.documentId))
    .filter(
      (record) => !topics || record.topics.some((topic) => topics.has(topic)),
    )
    .filter(
      (record) =>
        !languageCodes || languageCodes.has(record.language?.code ?? "en"),
    )
    .filter(
      ({ vector }) =>
        vector.length === queryVector.length &&
        vector.every((value) => Number.isFinite(value)),
    )
    .map(({ vector, ...record }) => ({
      ...record,
      score:
        cosineSimilarity(queryVector, vector) + lexicalBoost(queryText, record),
    }))
    .filter(({ score }) => Number.isFinite(score) && score >= minimumScore)
    .sort(
      (left, right) =>
        right.score - left.score || left.id.localeCompare(right.id),
    )
    .slice(0, topK);
}

export function rankLexicalRecords(
  queryText: string,
  records: VectorRecord[],
  filters: RetrievalFilters = {},
): RetrievalMatch[] {
  const query = queryText.trim();
  if (!query) return [];
  const sourceIds = filters.sourceIds ? new Set(filters.sourceIds) : null;
  const documentIds = filters.documentIds ? new Set(filters.documentIds) : null;
  const topics = filters.topics ? new Set(filters.topics) : null;
  const languageCodes = filters.languageCodes
    ? new Set(filters.languageCodes)
    : null;
  const minimumScore = filters.minimumScore ?? 0;
  const topK = Math.min(Math.max(filters.topK ?? 5, 1), 20);

  return records
    .filter((record) => !sourceIds || sourceIds.has(record.sourceId))
    .filter((record) => !documentIds || documentIds.has(record.documentId))
    .filter(
      (record) => !topics || record.topics.some((topic) => topics.has(topic)),
    )
    .filter(
      (record) =>
        !languageCodes || languageCodes.has(record.language?.code ?? "en"),
    )
    .map((record) => {
      const { vector, ...metadata } = record;
      void vector;
      return {
        ...metadata,
        score: lexicalSimilarity(query, metadata),
      };
    })
    .filter(({ score }) => Number.isFinite(score) && score >= minimumScore)
    .sort(
      (left, right) =>
        right.score - left.score || left.id.localeCompare(right.id),
    )
    .slice(0, topK);
}

const stopWords = new Set([
  "the",
  "this",
  "that",
  "what",
  "which",
  "who",
  "how",
  "are",
  "is",
  "does",
  "there",
  "and",
  "for",
  "from",
  "into",
  "with",
]);

function lexicalBoost(
  query: string,
  record: Omit<VectorRecord, "vector">,
): number {
  return 0.25 * lexicalSimilarity(query, record);
}

function lexicalSimilarity(
  query: string,
  record: Omit<VectorRecord, "vector">,
): number {
  const tokenize = (value: string) =>
    new Set(
      value
        .toLowerCase()
        .match(/[a-z0-9]+/g)
        ?.filter((token) => token.length > 2 && !stopWords.has(token)) ?? [],
    );
  const queryTokens = tokenize(query);
  if (!queryTokens.size) return 0;
  const evidenceTokens = tokenize(
    `${record.topics.join(" ")} ${record.locator.label} ${record.locator.sectionPath.join(" ")} ${record.text}`,
  );
  const overlap = [...queryTokens].filter((token) =>
    evidenceTokens.has(token),
  ).length;
  return overlap / queryTokens.size;
}
