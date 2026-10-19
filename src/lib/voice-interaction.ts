import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import type { AssistantLanguage } from "./assistant-language";

export const VOICE_TRANSCRIPTION_MODEL = "gemini-3.5-transcribe";
export const MAX_VOICE_AUDIO_BYTES = 4 * 1024 * 1024;
export const MAX_VOICE_RECORDING_SECONDS = 30;

export const voiceLanguageLocales: Record<AssistantLanguage, string> = {
  en: "en-IN",
  ml: "ml-IN",
  hi: "hi-IN",
  ar: "ar-EG",
  te: "te-IN",
  ta: "ta-IN",
  kn: "kn-IN",
};

export const supportedVoiceMimeTypes = [
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
] as const;

export const voiceMimeTypeSchema = z.enum(supportedVoiceMimeTypes);

export const voiceVocabulary = [
  "Glitz Pride",
  "Glitz Homes",
  "The Grove",
  "The Courtyard",
  "Thrissur",
  "villa",
  "villas",
  "gated community",
  "clubhouse",
  "floor plan",
  "master plan",
];

export type VoiceTranscriptionResult = {
  transcript: string;
  language: AssistantLanguage;
  locale: string;
  model: string;
  audioRetained: false;
};

type UploadedAudio = {
  name?: string;
  uri?: string;
  mimeType?: string;
};

type VoiceProvider = {
  upload(audio: Blob): Promise<UploadedAudio>;
  transcribe(args: {
    uri: string;
    mimeType: string;
    locale: string;
  }): Promise<string>;
  remove(name: string): Promise<void>;
};

export function validateVoiceAudio(audio: File): void {
  if (audio.size === 0) throw new Error("The recording is empty.");
  if (audio.size > MAX_VOICE_AUDIO_BYTES) {
    throw new Error(
      "The recording is too large. Please keep it under 30 seconds.",
    );
  }
  const baseMimeType = audio.type.toLowerCase().split(";", 1)[0];
  if (!voiceMimeTypeSchema.safeParse(baseMimeType).success) {
    throw new Error("This browser produced an unsupported audio format.");
  }
}

export function createGoogleVoiceProvider(apiKey: string): VoiceProvider {
  if (!apiKey.trim()) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is required.");
  }
  const client = new GoogleGenAI({ apiKey });

  return {
    async upload(audio) {
      return client.files.upload({ file: audio });
    },
    async transcribe({ uri, mimeType, locale }) {
      const interaction = await client.interactions.create({
        model: VOICE_TRANSCRIPTION_MODEL,
        input: [{ type: "audio", uri, mime_type: mimeType }],
        generation_config: {
          transcription_config: {
            language_codes: [locale],
            custom_vocabulary: voiceVocabulary,
            mode: "smart",
          },
        },
      });
      return interaction.output_text ?? "";
    },
    async remove(name) {
      await client.files.delete({ name });
    },
  };
}

export async function transcribeVoiceQuestion(
  audio: File,
  language: AssistantLanguage,
  provider: VoiceProvider,
): Promise<VoiceTranscriptionResult> {
  validateVoiceAudio(audio);
  const uploaded = await provider.upload(audio);
  if (!uploaded.name || !uploaded.uri || !uploaded.mimeType) {
    throw new Error("The transcription provider did not accept the recording.");
  }

  try {
    const transcript = (
      await provider.transcribe({
        uri: uploaded.uri,
        mimeType: uploaded.mimeType,
        locale: voiceLanguageLocales[language],
      })
    ).trim();
    if (transcript.length < 2) {
      throw new Error("No clear speech was detected. Please try again.");
    }
    if (transcript.length > 500) {
      throw new Error(
        "The transcript is too long. Please ask a shorter question.",
      );
    }
    return {
      transcript,
      language,
      locale: voiceLanguageLocales[language],
      model: VOICE_TRANSCRIPTION_MODEL,
      audioRetained: false,
    };
  } finally {
    await provider.remove(uploaded.name).catch(() => undefined);
  }
}
