// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { resetApiSecurityStateForTests } from "@/lib/api-security";

const recordFeedbackObservation = vi.fn();
vi.mock("@/lib/ai-observability", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/lib/ai-observability")>();
  return { ...original, recordFeedbackObservation };
});

const request = (body: unknown) =>
  new Request("https://example.test/api/assistant/feedback", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      host: "example.test",
      origin: "https://example.test",
      "x-forwarded-for": "203.0.113.30",
    },
  });

afterEach(() => {
  recordFeedbackObservation.mockReset();
  resetApiSecurityStateForTests();
});

describe("POST /api/assistant/feedback", () => {
  it("accepts only categorical, privacy-safe feedback", async () => {
    const { POST } = await import("./route");
    const feedback = {
      rating: "helpful",
      language: "en",
      answerStatus: "answered",
      riskTier: "R0",
      previewKind: "villa",
    };
    const response = await POST(request(feedback));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ accepted: true });
    expect(recordFeedbackObservation).toHaveBeenCalledWith(feedback);
  });

  it("rejects additional conversation content", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      request({
        rating: "needs-improvement",
        language: "en",
        answerStatus: "answered",
        riskTier: "R0",
        previewKind: "none",
        answer: "Do not collect this content.",
      }),
    );
    expect(response.status).toBe(400);
    expect(recordFeedbackObservation).not.toHaveBeenCalled();
  });
});
