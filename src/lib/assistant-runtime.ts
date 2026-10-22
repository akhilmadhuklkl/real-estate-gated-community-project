import "server-only";

import vectorIndexData from "../../content/generated/vector-index.json";
import { shouldTranslateAssistantQuery } from "./assistant-language";
import {
  createAssistantService,
  createGeminiGenerator,
  createGeminiQueryTranslator,
  ASSISTANT_MODEL,
  type AssistantRequest,
} from "./assistant-service";
import { rankLexicalRecords, type VectorIndex } from "./vector-retrieval";

const vectorIndex = vectorIndexData as VectorIndex;

export async function answerAssistantQuestion(request: AssistantRequest) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Assistant generation is not configured.");
  }

  const service = createAssistantService({
    model: ASSISTANT_MODEL,
    retrieve: async ({ query, minimumScore, topK, language }) => {
      const retrievalQuery = shouldTranslateAssistantQuery(query, language)
        ? await createGeminiQueryTranslator(apiKey)({
            question: query,
            language,
          })
        : query;
      return rankLexicalRecords(retrievalQuery, vectorIndex.records, {
        minimumScore,
        topK,
        languageCodes: ["en"],
      });
    },
    generate: createGeminiGenerator(apiKey),
  });

  return service(request);
}
