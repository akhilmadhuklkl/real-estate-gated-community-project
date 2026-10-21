import { assistantLanguageSchema } from "../../../../lib/assistant-language";
import { recordVoiceObservation } from "../../../../lib/ai-observability";
import {
  createGoogleVoiceProvider,
  transcribeVoiceQuestion,
} from "../../../../lib/voice-interaction";
import {
  bodyErrorResponse,
  enforceApiSecurity,
  readLimitedFormData,
  recordSecurityEvent,
  secureJson,
  transcriptionApiPolicy,
} from "../../../../lib/api-security";

export const runtime = "nodejs";
export const maxDuration = 60;

function isUploadedAudio(value: unknown): value is File {
  return typeof value === "object" && value !== null && "type" in value;
}

export async function POST(request: Request) {
  const security = enforceApiSecurity(request, transcriptionApiPolicy);
  if (!security.ok) return security.response;
  const { context } = security;
  const startedAt = performance.now();
  let form: FormData;
  try {
    form = await readLimitedFormData(
      request,
      transcriptionApiPolicy.maxBodyBytes,
    );
  } catch (error) {
    recordVoiceObservation({
      durationMs: performance.now() - startedAt,
      outcome: "invalid",
      language: "unknown",
      audioBytes: 0,
    });
    return bodyErrorResponse(context, error);
  }
  const audio = form?.get("audio");
  const language = assistantLanguageSchema.safeParse(form?.get("language"));

  if (!isUploadedAudio(audio) || !language.success) {
    recordVoiceObservation({
      durationMs: performance.now() - startedAt,
      outcome: "invalid",
      language: language.success ? language.data : "unknown",
      audioBytes: isUploadedAudio(audio) && "size" in audio ? audio.size : 0,
    });
    return secureJson(
      context,
      {
        error: "Please provide a supported recording and language.",
        requestId: context.requestId,
      },
      { status: 400 },
    );
  }
  const audioFile = audio;

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (!apiKey) {
    recordVoiceObservation({
      durationMs: performance.now() - startedAt,
      outcome: "unavailable",
      language: language.data,
      audioBytes: audioFile.size,
    });
    return secureJson(
      context,
      {
        error: "Voice transcription is temporarily unavailable.",
        requestId: context.requestId,
      },
      { status: 503 },
    );
  }

  try {
    const result = await transcribeVoiceQuestion(
      audioFile,
      language.data,
      createGoogleVoiceProvider(apiKey),
    );
    recordVoiceObservation({
      durationMs: performance.now() - startedAt,
      outcome: "success",
      language: language.data,
      audioBytes: audioFile.size,
    });
    return secureJson(context, result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The recording could not be transcribed.";
    const invalidRecording =
      /empty|large|unsupported|clear speech|too long/i.test(message);
    if (!invalidRecording)
      recordSecurityEvent(context, "transcription-provider-failure", error);
    recordVoiceObservation({
      durationMs: performance.now() - startedAt,
      outcome: invalidRecording ? "invalid" : "provider-failure",
      language: language.data,
      audioBytes: audioFile.size,
    });
    return secureJson(
      context,
      {
        error: invalidRecording
          ? message
          : "The recording could not be transcribed. Please try again or type your question.",
        requestId: context.requestId,
      },
      { status: invalidRecording ? 400 : 503 },
    );
  }
}
