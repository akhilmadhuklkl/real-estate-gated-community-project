// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { resetApiSecurityStateForTests } from "../../../../lib/api-security";

const transcribeVoiceQuestion = vi.fn();
const createGoogleVoiceProvider = vi.fn(() => ({ provider: true }));

vi.mock("../../../../lib/voice-interaction", () => ({
  transcribeVoiceQuestion,
  createGoogleVoiceProvider,
}));

const originalKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

afterEach(() => {
  vi.clearAllMocks();
  resetApiSecurityStateForTests();
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalKey;
});

const requestWith = (form: FormData) =>
  new Request("http://localhost/api/assistant/transcribe", {
    method: "POST",
    body: form,
    headers: {
      host: "localhost",
      origin: "http://localhost",
      "x-forwarded-for": "127.0.0.1",
    },
  });

describe("POST /api/assistant/transcribe", () => {
  it("rejects requests without a supported recording", async () => {
    const { POST } = await import("./route");
    const form = new FormData();
    form.set("language", "en");
    const response = await POST(requestWith(form));
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
    const response = await POST(requestWith(form));
    const payload = await response.clone().json();

    expect(response.status, JSON.stringify(payload)).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      transcript: "What villas are available?",
      audioRetained: false,
    });
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });
});
