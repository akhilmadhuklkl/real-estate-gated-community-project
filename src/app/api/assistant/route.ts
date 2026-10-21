import { z } from "zod";

import {
  classifyAssistantTopic,
  recordAssistantObservation,
} from "@/lib/ai-observability";
import { answerAssistantQuestion } from "@/lib/assistant-runtime";
import { assistantLanguageSchema } from "@/lib/assistant-language";
import { selectAssistantPreview } from "@/lib/assistant-preview";
import {
  isRecommendationConversation,
  recommendationAnswer,
} from "@/lib/villa-recommendations";
import {
  assistantApiPolicy,
  bodyErrorResponse,
  enforceApiSecurity,
  readLimitedJson,
  recordSecurityEvent,
  secureJson,
} from "@/lib/api-security";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({
  question: z.string().trim().min(2).max(500),
  sessionId: z.string().trim().max(100).optional(),
  language: assistantLanguageSchema.default("en"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().trim().min(1).max(500),
      }),
    )
    .max(6)
    .optional(),
});

export async function POST(request: Request) {
  const security = enforceApiSecurity(request, assistantApiPolicy);
  if (!security.ok) return security.response;
  const { context } = security;
  const startedAt = performance.now();
  let body: unknown;
  try {
    body = await readLimitedJson(request, assistantApiPolicy.maxBodyBytes);
  } catch (error) {
    recordAssistantObservation({
      durationMs: performance.now() - startedAt,
      status: "invalid-request",
      language: "en",
      topic: "other",
      riskTier: "unknown",
      policyReason: "unknown",
      humanHandoffRequired: false,
      previewKind: "none",
      citationCount: 0,
      inputCharacters: 0,
      outputCharacters: 0,
      modelUsed: false,
    });
    return bodyErrorResponse(context, error);
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    recordAssistantObservation({
      durationMs: performance.now() - startedAt,
      status: "invalid-request",
      language: "en",
      topic: "other",
      riskTier: "unknown",
      policyReason: "unknown",
      humanHandoffRequired: false,
      previewKind: "none",
      citationCount: 0,
      inputCharacters: 0,
      outputCharacters: 0,
      modelUsed: false,
    });
    return secureJson(
      context,
      {
        error: "Please ask a short, specific property question.",
        requestId: context.requestId,
      },
      { status: 400 },
    );
  }

  try {
    const answer = await answerAssistantQuestion(parsed.data);
    const userConversation = [
      ...(parsed.data.history ?? [])
        .filter(({ role }) => role === "user")
        .map(({ text }) => text),
      parsed.data.question,
    ].join("\n");
    const preview =
      answer.status === "answered"
        ? selectAssistantPreview(userConversation, answer.citations)
        : null;
    const recommendation =
      preview?.kind === "recommendation" &&
      parsed.data.language === "en" &&
      isRecommendationConversation(userConversation)
        ? recommendationAnswer(preview.recommendation)
        : null;
    if (answer.policy.reason === "prompt-injection") {
      recordSecurityEvent(context, "prompt-injection-blocked");
    }
    recordAssistantObservation({
      durationMs: performance.now() - startedAt,
      status: answer.status,
      language: parsed.data.language,
      topic: classifyAssistantTopic(parsed.data.question),
      riskTier: answer.policy.riskTier,
      policyReason: answer.policy.reason,
      humanHandoffRequired: answer.policy.humanHandoffRequired,
      previewKind: preview?.kind ?? "none",
      citationCount: answer.citations.length,
      inputCharacters:
        parsed.data.question.length +
        (parsed.data.history ?? []).reduce(
          (total, turn) => total + turn.text.length,
          0,
        ),
      outputCharacters: (recommendation ?? answer.answer).length,
      modelUsed: Boolean(answer.model),
    });
    return secureJson(context, {
      ...answer,
      answer: recommendation ?? answer.answer,
      preview,
    });
  } catch (error) {
    recordSecurityEvent(context, "assistant-provider-failure", error);
    recordAssistantObservation({
      durationMs: performance.now() - startedAt,
      status: "service-unavailable",
      language: parsed.data.language,
      topic: classifyAssistantTopic(parsed.data.question),
      riskTier: "unknown",
      policyReason: "unknown",
      humanHandoffRequired: false,
      previewKind: "none",
      citationCount: 0,
      inputCharacters:
        parsed.data.question.length +
        (parsed.data.history ?? []).reduce(
          (total, turn) => total + turn.text.length,
          0,
        ),
      outputCharacters: 0,
      modelUsed: false,
    });
    return secureJson(
      context,
      {
        error:
          "The property guide is temporarily unavailable. Please try again shortly.",
        requestId: context.requestId,
      },
      { status: 503 },
    );
  }
}
