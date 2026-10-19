import { NextResponse } from "next/server";

import { assistantLanguageSchema } from "../../../../lib/assistant-language";
import {
  createGoogleVoiceProvider,
  transcribeVoiceQuestion,
} from "../../../../lib/voice-interaction";

export const runtime = "nodejs";
export const maxDuration = 60;

function isUploadedAudio(value: unknown): value is File {
  return typeof value === "object" && value !== null && "type" in value;
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const audio = form?.get("audio");
  const language = assistantLanguageSchema.safeParse(form?.get("language"));

  if (!isUploadedAudio(audio) || !language.success) {
    return NextResponse.json(
      { error: "Please provide a supported recording and language." },
      { status: 400 },
    );
  }
  const audioFile = audio;

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Voice transcription is temporarily unavailable." },
      { status: 503 },
    );
  }

  try {
    const result = await transcribeVoiceQuestion(
      audioFile,
      language.data,
      createGoogleVoiceProvider(apiKey),
    );
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The recording could not be transcribed.";
    const invalidRecording =
      /empty|large|unsupported|clear speech|too long/i.test(message);
    if (!invalidRecording) console.error("Voice transcription failed", error);
    return NextResponse.json(
      {
        error: invalidRecording
          ? message
          : "The recording could not be transcribed. Please try again or type your question.",
      },
      { status: invalidRecording ? 400 : 503 },
    );
  }
}
