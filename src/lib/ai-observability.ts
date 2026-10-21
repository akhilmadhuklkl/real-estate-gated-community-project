import { metric } from "@vercel/functions";

import type { AssistantLanguage } from "./assistant-language";
import type {
  AssistantPolicyReason,
  AssistantRiskTier,
} from "./assistant-policy";
import type { AssistantAnswer } from "./assistant-service";
import type { AssistantPreview } from "./assistant-preview";

export const assistantFeedbackRatingValues = [
  "helpful",
  "needs-improvement",
] as const;
export type AssistantFeedbackRating =
  (typeof assistantFeedbackRatingValues)[number];

export const assistantTopicValues = [
  "amenities",
  "contact",
  "documents",
  "location",
  "site-visit",
  "villa",
  "other",
] as const;
export type AssistantTopic = (typeof assistantTopicValues)[number];

type PreviewKind = AssistantPreview["kind"] | "none";
type AssistantOutcome = AssistantAnswer["status"] | "invalid-request";

type AssistantObservation = {
  durationMs: number;
  status: AssistantOutcome;
  language: AssistantLanguage;
  topic: AssistantTopic;
  riskTier: AssistantRiskTier | "unknown";
  policyReason: AssistantPolicyReason | "unknown";
  humanHandoffRequired: boolean;
  previewKind: PreviewKind;
  citationCount: number;
  inputCharacters: number;
  outputCharacters: number;
  modelUsed: boolean;
};

type VoiceObservation = {
  durationMs: number;
  outcome: "success" | "invalid" | "unavailable" | "provider-failure";
  language: AssistantLanguage | "unknown";
  audioBytes: number;
};

type FeedbackObservation = {
  rating: AssistantFeedbackRating;
  language: AssistantLanguage;
  answerStatus: AssistantAnswer["status"];
  riskTier: AssistantRiskTier;
  previewKind: PreviewKind;
};

const estimateTokens = (characters: number) =>
  Math.max(0, Math.ceil(characters / 4));

const nonNegativeNumber = (value: string | undefined) => {
  if (!value?.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const configuredCost = (inputTokens: number, outputTokens: number) => {
  const inputRate = nonNegativeNumber(
    process.env.AI_INPUT_COST_USD_PER_MILLION_TOKENS,
  );
  const outputRate = nonNegativeNumber(
    process.env.AI_OUTPUT_COST_USD_PER_MILLION_TOKENS,
  );
  if (inputRate === null || outputRate === null) return null;
  return (inputTokens * inputRate + outputTokens * outputRate) / 1_000_000;
};

function emitMetric(
  name: string,
  value: number,
  tags?: Record<string, string>,
) {
  try {
    metric(name, value, tags);
  } catch {
    // Observability must never interrupt the visitor journey.
  }
}

function writeEvent(event: string, fields: Record<string, unknown>) {
  try {
    console.info(
      JSON.stringify({ type: "ai-observability", event, ...fields }),
    );
  } catch {
    // Logging must never interrupt the visitor journey.
  }
}

export function classifyAssistantTopic(question: string): AssistantTopic {
  if (/\b(visit|tour|appointment|schedule)\b/i.test(question)) {
    return "site-visit";
  }
  if (/\b(contact|call|phone|email|whatsapp|reach)\b/i.test(question)) {
    return "contact";
  }
  if (
    /\b(location|located|distance|route|near|school|hospital|map)\b/i.test(
      question,
    )
  ) {
    return "location";
  }
  if (/\b(amenit|clubhouse|pool|gym|garden|community)\w*/i.test(question)) {
    return "amenities";
  }
  if (/\b(brochure|document|source|reference|download)\b/i.test(question)) {
    return "documents";
  }
  if (
    /\b(villa|bedroom|floor|plan|area|sq\.?\s*ft|residence)\b/i.test(question)
  ) {
    return "villa";
  }
  return "other";
}

export function recordAssistantObservation(observation: AssistantObservation) {
  const durationMs = Math.max(0, Math.round(observation.durationMs));
  const inputTokens = estimateTokens(observation.inputCharacters);
  const outputTokens = estimateTokens(observation.outputCharacters);
  const estimatedCostUsd = configuredCost(inputTokens, outputTokens);
  const tags = {
    status: observation.status,
    language: observation.language,
    topic: observation.topic,
    risk_tier: observation.riskTier,
    policy_reason: observation.policyReason,
    handoff: observation.humanHandoffRequired ? "required" : "not-required",
    preview: observation.previewKind,
    model_used: observation.modelUsed ? "yes" : "no",
  };

  emitMetric("glitz.ai.requests", 1, tags);
  emitMetric("glitz.ai.duration_ms", durationMs, tags);
  emitMetric("glitz.ai.citation_count", observation.citationCount, tags);
  emitMetric("glitz.ai.input_tokens_estimated", inputTokens, tags);
  emitMetric("glitz.ai.output_tokens_estimated", outputTokens, tags);
  if (observation.status === "insufficient-evidence") {
    emitMetric("glitz.ai.unanswered", 1, {
      language: observation.language,
      topic: observation.topic,
    });
  }
  if (observation.humanHandoffRequired) {
    emitMetric("glitz.ai.handoffs", 1, {
      language: observation.language,
      topic: observation.topic,
      risk_tier: observation.riskTier,
    });
  }
  if (estimatedCostUsd !== null) {
    emitMetric("glitz.ai.estimated_cost_usd", estimatedCostUsd, {
      model_used: observation.modelUsed ? "yes" : "no",
    });
  }

  writeEvent("assistant-request", {
    ...tags,
    durationMs,
    citationCount: observation.citationCount,
    estimatedInputTokens: inputTokens,
    estimatedOutputTokens: outputTokens,
    estimatedCostUsd: estimatedCostUsd ?? undefined,
  });
}

export function recordVoiceObservation(observation: VoiceObservation) {
  const tags = {
    outcome: observation.outcome,
    language: observation.language,
  };
  const durationMs = Math.max(0, Math.round(observation.durationMs));
  const audioBytes = Math.max(0, Math.round(observation.audioBytes));
  emitMetric("glitz.ai.voice_requests", 1, tags);
  emitMetric("glitz.ai.voice_duration_ms", durationMs, tags);
  emitMetric("glitz.ai.voice_audio_bytes", audioBytes, tags);
  writeEvent("voice-request", { ...tags, durationMs, audioBytes });
}

export function recordFeedbackObservation(observation: FeedbackObservation) {
  const tags = {
    rating: observation.rating,
    language: observation.language,
    answer_status: observation.answerStatus,
    risk_tier: observation.riskTier,
    preview: observation.previewKind,
  };
  emitMetric("glitz.ai.feedback", 1, tags);
  writeEvent("assistant-feedback", tags);
}
