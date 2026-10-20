// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { resetApiSecurityStateForTests } from "@/lib/api-security";

const answerAssistantQuestion = vi.fn();

vi.mock("@/lib/assistant-runtime", () => ({ answerAssistantQuestion }));

const request = (body: unknown, origin = "https://example.test") =>
  new Request("https://example.test/api/assistant", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      host: "example.test",
      origin,
      "x-forwarded-for": "203.0.113.20",
    },
  });

afterEach(() => {
  answerAssistantQuestion.mockReset();
  resetApiSecurityStateForTests();
});

describe("POST /api/assistant", () => {
  it("returns a secured, uncached assistant response", async () => {
    answerAssistantQuestion.mockResolvedValue({
      sessionId: "session-test",
      status: "insufficient-evidence",
      answer: "I cannot confirm that from approved information.",
      citations: [],
      model: null,
      policy: {
        version: "test",
        reason: "allowed",
        riskTier: "R1",
        humanHandoffRequired: true,
      },
      evidence: { confidence: "none", citationCount: 0, minimumScore: 0.45 },
    });
    const { POST } = await import("./route");
    const response = await POST(
      request({ question: "What amenities are listed?", language: "en" }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(response.headers.get("X-Request-ID")).toBeTruthy();
    expect(response.headers.get("RateLimit-Limit")).toBe("12");
  });

  it("rejects cross-site calls before invoking the assistant", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      request(
        { question: "What amenities are listed?" },
        "https://attacker.test",
      ),
    );
    expect(response.status).toBe(403);
    expect(answerAssistantQuestion).not.toHaveBeenCalled();
  });
});
