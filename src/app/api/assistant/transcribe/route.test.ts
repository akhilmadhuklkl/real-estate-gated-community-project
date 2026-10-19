import { afterEach, describe, expect, it, vi } from "vitest";

const transcribeVoiceQuestion = vi.fn();
const createGoogleVoiceProvider = vi.fn(() => ({ provider: true }));

vi.mock("../../../../lib/voice-interaction", () => ({
  transcribeVoiceQuestion,
  createGoogleVoiceProvider,
}));

const originalKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

afterEach(() => {
  vi.clearAllMocks();
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalKey;
});

describe("POST /api/assistant/transcribe", () => {
  it("rejects requests without a supported recording", async () => {
    const { POST } = await import("./route");
    const form = new FormData();
    form.set("language", "en");
    const response = await POST({
      formData: async () => form,
    } as Request);
    expect(response.status).toBe(400);
  });

  it("returns an editable transcript without retaining audio", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
    transcribeVoiceQuestion.mockResolvedValue({
      transcript: "What villas are available?",
      language: "en",
      locale: "en-IN",
      model: "test-model",
      audioRetained: false,
    });
    const { POST } = await import("./route");
    const form = new FormData();
    form.set("language", "en");
    form.set(
      "audio",
      new Blob(["voice"], { type: "audio/webm" }),
      "question.webm",
    );
    const response = await POST({
      formData: async () => form,
    } as Request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      transcript: "What villas are available?",
      audioRetained: false,
    });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
