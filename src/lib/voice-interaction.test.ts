import { describe, expect, it, vi } from "vitest";

import {
  MAX_VOICE_AUDIO_BYTES,
  transcribeVoiceQuestion,
  validateVoiceAudio,
  voiceLanguageLocales,
} from "./voice-interaction";

function audioFile(contents: BlobPart = "voice", type = "audio/webm"): File {
  return new File([contents], "question.webm", { type });
}

function provider(transcript = "What villas are available?") {
  return {
    upload: vi.fn().mockResolvedValue({
      name: "files/voice-test",
      uri: "https://provider.test/files/voice-test",
      mimeType: "audio/webm",
    }),
    transcribe: vi.fn().mockResolvedValue(transcript),
    remove: vi.fn().mockResolvedValue(undefined),
  };
}

describe("voice interaction", () => {
  it("maps every approved assistant language to a transcription locale", () => {
    expect(voiceLanguageLocales).toEqual({
      en: "en-IN",
      ml: "ml-IN",
      hi: "hi-IN",
      ar: "ar-EG",
      te: "te-IN",
      ta: "ta-IN",
      kn: "kn-IN",
    });
  });

  it("rejects empty, oversized, and unsupported recordings", () => {
    expect(() => validateVoiceAudio(audioFile(""))).toThrow(/empty/i);
    expect(() =>
      validateVoiceAudio(audioFile(new Uint8Array(MAX_VOICE_AUDIO_BYTES + 1))),
    ).toThrow(/too large/i);
    expect(() =>
      validateVoiceAudio(audioFile("voice", "audio/x-test")),
    ).toThrow(/unsupported/i);
    expect(() =>
      validateVoiceAudio(audioFile("voice", "audio/webm;codecs=opus")),
    ).not.toThrow();
  });

  it("transcribes with the selected locale and removes uploaded audio", async () => {
    const testProvider = provider("  വില്ലകൾ ഏതൊക്കെയാണ്?  ");
    const result = await transcribeVoiceQuestion(
      audioFile(),
      "ml",
      testProvider,
    );

    expect(result).toMatchObject({
      transcript: "വില്ലകൾ ഏതൊക്കെയാണ്?",
      language: "ml",
      locale: "ml-IN",
      audioRetained: false,
    });
    expect(testProvider.transcribe).toHaveBeenCalledWith(
      expect.objectContaining({ locale: "ml-IN" }),
    );
    expect(testProvider.remove).toHaveBeenCalledWith("files/voice-test");
  });

  it("removes uploaded audio when transcription fails", async () => {
    const testProvider = provider();
    testProvider.transcribe.mockRejectedValue(
      new Error("provider unavailable"),
    );

    await expect(
      transcribeVoiceQuestion(audioFile(), "en", testProvider),
    ).rejects.toThrow("provider unavailable");
    expect(testProvider.remove).toHaveBeenCalledWith("files/voice-test");
  });
});
