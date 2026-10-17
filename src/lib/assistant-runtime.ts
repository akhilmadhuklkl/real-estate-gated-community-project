import "server-only";

import {
  env,
  pipeline,
  type FeatureExtractionPipeline,
} from "@huggingface/transformers";

import vectorIndexData from "../../content/generated/vector-index.json";
import {
  createAssistantService,
  createGeminiGenerator,
  ASSISTANT_MODEL,
  type AssistantRequest,
} from "./assistant-service";
import { rankVectorRecords, type VectorIndex } from "./vector-retrieval";

const vectorIndex = vectorIndexData as VectorIndex;
let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

env.allowLocalModels = false;

async function embedQuestion(question: string): Promise<number[]> {
  extractorPromise ??= pipeline("feature-extraction", vectorIndex.model, {
    dtype: "q8",
  });
  const extractor = await extractorPromise;
  const tensor = await extractor(question, {
    pooling: "mean",
    normalize: true,
  });
  const rows = tensor.tolist() as number[][];
  return rows[0] ?? [];
}

export async function answerAssistantQuestion(request: AssistantRequest) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Assistant generation is not configured.");
  }

  const service = createAssistantService({
    model: ASSISTANT_MODEL,
    retrieve: async ({ query, minimumScore, topK, language }) => {
      const embedding = await embedQuestion(query);
      return rankVectorRecords(
        embedding,
        vectorIndex.records,
        { minimumScore, topK, languageCodes: [language] },
        query,
      );
    },
    generate: createGeminiGenerator(apiKey),
  });

  return service(request);
}
