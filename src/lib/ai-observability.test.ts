import { afterEach, describe, expect, it, vi } from "vitest";

const { metric } = vi.hoisted(() => ({ metric: vi.fn() }));
vi.mock("@vercel/functions", () => ({ metric }));

import {
  classifyAssistantTopic,
  recordAssistantObservation,
  recordFeedbackObservation,
} from "./ai-observability";

afterEach(() => {
  metric.mockReset();
  vi.restoreAllMocks();
  delete process.env.AI_INPUT_COST_USD_PER_MILLION_TOKENS;
  delete process.env.AI_OUTPUT_COST_USD_PER_MILLION_TOKENS;
});

describe("AI observability", () => {
  it("classifies questions into a bounded topic without retaining the text", () => {
    expect(classifyAssistantTopic("How far is the nearest hospital?")).toBe(
      "location",
    );
    expect(classifyAssistantTopic("Can I arrange a visit tomorrow?")).toBe(
      "site-visit",
    );
    expect(classifyAssistantTopic("Something outside the catalogue")).toBe(
      "other",
    );
  });

  it("emits bounded metrics and a privacy-safe structured event", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    recordAssistantObservation({
      durationMs: 124.6,
      status: "insufficient-evidence",
      language: "en",
      topic: "villa",
      riskTier: "R1",
      policyReason: "allowed",
      humanHandoffRequired: true,
      previewKind: "none",
      citationCount: 0,
      inputCharacters: 40,
      outputCharacters: 80,
      modelUsed: false,
    });

    expect(metric).toHaveBeenCalledWith(
      "glitz.ai.requests",
      1,
      expect.objectContaining({ status: "insufficient-evidence" }),
    );
    expect(metric).toHaveBeenCalledWith(
      "glitz.ai.unanswered",
      1,
      expect.objectContaining({ topic: "villa" }),
    );
    expect(metric).toHaveBeenCalledWith(
      "glitz.ai.handoffs",
      1,
      expect.any(Object),
    );
    const output = String(info.mock.calls[0]?.[0]);
    expect(output).toContain('"event":"assistant-request"');
    expect(output).not.toContain("question");
    expect(output).not.toContain("answer");
    expect(output).not.toContain("requestId");
  });

  it("emits a cost sample only when owner-approved rates are configured", () => {
    process.env.AI_INPUT_COST_USD_PER_MILLION_TOKENS = "1";
    process.env.AI_OUTPUT_COST_USD_PER_MILLION_TOKENS = "2";
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    recordAssistantObservation({
      durationMs: 10,
      status: "answered",
      language: "en",
      topic: "amenities",
      riskTier: "R0",
      policyReason: "allowed",
      humanHandoffRequired: false,
      previewKind: "gallery",
      citationCount: 1,
      inputCharacters: 400,
      outputCharacters: 800,
      modelUsed: true,
    });
    expect(metric).toHaveBeenCalledWith("glitz.ai.estimated_cost_usd", 0.0005, {
      model_used: "yes",
    });
  });

  it("records feedback without conversation content or identifiers", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    recordFeedbackObservation({
      rating: "helpful",
      language: "ml",
      answerStatus: "answered",
      riskTier: "R0",
      previewKind: "map",
    });
    expect(metric).toHaveBeenCalledWith(
      "glitz.ai.feedback",
      1,
      expect.objectContaining({ rating: "helpful", language: "ml" }),
    );
    const output = String(info.mock.calls[0]?.[0]);
    expect(output).not.toContain("session");
    expect(output).not.toContain("message");
  });
});
