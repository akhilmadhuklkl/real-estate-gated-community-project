import { z } from "zod";

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
  let body: unknown;
  try {
    body = await readLimitedJson(request, assistantApiPolicy.maxBodyBytes);
  } catch (error) {
    return bodyErrorResponse(context, error);
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
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
    return secureJson(context, {
      ...answer,
      answer: recommendation ?? answer.answer,
      preview,
    });
  } catch (error) {
    recordSecurityEvent(context, "assistant-provider-failure", error);
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
