import { NextResponse } from "next/server";
import { z } from "zod";

import { answerAssistantQuestion } from "@/lib/assistant-runtime";
import { selectAssistantPreview } from "@/lib/assistant-preview";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({
  question: z.string().trim().min(2).max(500),
  sessionId: z.string().trim().max(100).optional(),
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
    return NextResponse.json({
      ...answer,
      preview:
        answer.status === "answered"
          ? selectAssistantPreview(parsed.data.question, answer.citations)
          : null,
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
