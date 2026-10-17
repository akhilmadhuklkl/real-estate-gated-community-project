import { NextResponse } from "next/server";
import { z } from "zod";

import { answerAssistantQuestion } from "@/lib/assistant-runtime";
import { assistantLanguageSchema } from "@/lib/assistant-language";
import { selectAssistantPreview } from "@/lib/assistant-preview";
import {
  isRecommendationConversation,
  recommendationAnswer,
} from "@/lib/villa-recommendations";

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
  const parsed = requestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please ask a short, specific property question." },
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
    return NextResponse.json({
      ...answer,
      answer: recommendation ?? answer.answer,
      preview,
    });
  } catch (error) {
    console.error("Assistant request failed", error);
    return NextResponse.json(
      {
        error:
          "The property guide is temporarily unavailable. Please try again shortly.",
      },
      { status: 503 },
    );
  }
}
