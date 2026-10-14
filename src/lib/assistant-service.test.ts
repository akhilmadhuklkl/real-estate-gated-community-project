import { describe, expect, it, vi } from "vitest";

import {
  ASSISTANT_MINIMUM_SCORE,
  buildGroundedPrompt,
  containsSensitivePersonalData,
  createAssistantService,
} from "./assistant-service";
import type { RetrievalMatch } from "./vector-retrieval";

const evidence: RetrievalMatch = {
  id: "chk-amenities",
  documentId: "doc-brochure",
  sourceId: "KS-001",
  text: "The brochure lists a clubhouse and children's play area.",
  contentHash: "sha256:test",
  topics: ["amenities"],
  locator: {
    label: "Page 4",
    pageStart: 4,
    pageEnd: 4,
    sectionPath: [],
  },
  qualification: "Brochure-listed amenities only.",
  score: 0.81,
};

describe("assistant service", () => {
  it("returns a grounded answer with deterministic citations", async () => {
    const retrieve = vi.fn().mockResolvedValue([evidence]);
    const generate = vi
      .fn()
      .mockResolvedValue("The brochure lists a clubhouse.");
    const answer = await createAssistantService({ retrieve, generate })(
      "Which amenities are listed?",
    );

    expect(retrieve).toHaveBeenCalledWith({
      query: "Which amenities are listed?",
      minimumScore: ASSISTANT_MINIMUM_SCORE,
      topK: 3,
    });
    expect(answer.status).toBe("answered");
    expect(answer.sessionId).toMatch(/^session-/);
    expect(answer.citations).toEqual([
      {
        evidenceId: "chk-amenities",
        sourceId: "KS-001",
        locator: "Page 4",
        qualification: "Brochure-listed amenities only.",
      },
    ]);
  });

  it("does not call the model when evidence is insufficient", async () => {
    const generate = vi.fn();
    const answer = await createAssistantService({
      retrieve: vi.fn().mockResolvedValue([]),
      generate,
    })("What is today's villa price?");

    expect(answer.status).toBe("insufficient-evidence");
    expect(answer.model).toBeNull();
    expect(generate).not.toHaveBeenCalled();
  });

  it("blocks personal data before retrieval or generation", async () => {
    const retrieve = vi.fn();
    const generate = vi.fn();
    const answer = await createAssistantService({ retrieve, generate })(
      "Email the details to buyer@example.com",
    );

    expect(answer.status).toBe("blocked");
    expect(retrieve).not.toHaveBeenCalled();
    expect(generate).not.toHaveBeenCalled();
  });

  it("validates question length before external processing", async () => {
    const retrieve = vi.fn();
    const answer = await createAssistantService({
      retrieve,
      generate: vi.fn(),
    })(" ");

    expect(answer.status).toBe("blocked");
    expect(retrieve).not.toHaveBeenCalled();
  });

  it("preserves a supplied session and bounded conversation context", async () => {
    const generate = vi.fn().mockResolvedValue("The clubhouse is listed.");
    const answer = await createAssistantService({
      retrieve: vi.fn().mockResolvedValue([evidence]),
      generate,
    })({
      question: "What about the clubhouse?",
      sessionId: "session-existing",
      history: [{ role: "user", text: "Which amenities are listed?" }],
    });

    expect(answer.sessionId).toBe("session-existing");
    expect(generate).toHaveBeenCalledWith({
      question: "What about the clubhouse?",
      evidence: [evidence],
      history: [{ role: "user", text: "Which amenities are listed?" }],
    });
  });

  it("recovers safely from retrieval and provider failures", async () => {
    const retrievalFailure = await createAssistantService({
      retrieve: vi.fn().mockRejectedValue(new Error("index unavailable")),
      generate: vi.fn(),
    })("Which amenities are listed?");
    const providerFailure = await createAssistantService({
      retrieve: vi.fn().mockResolvedValue([evidence]),
      generate: vi.fn().mockRejectedValue(new Error("rate limited")),
    })("Which amenities are listed?");

    expect(retrievalFailure.status).toBe("service-unavailable");
    expect(providerFailure.status).toBe("service-unavailable");
    expect(providerFailure.citations).toEqual([]);
  });

  it("formats evidence as untrusted, qualified source blocks", () => {
    const prompt = buildGroundedPrompt("What amenities are listed?", [
      evidence,
    ]);
    expect(prompt).toContain("[E1] Source: KS-001; Locator: Page 4");
    expect(prompt).toContain("Qualification: Brochure-listed amenities only.");
  });

  it("detects common personal identifiers", () => {
    expect(containsSensitivePersonalData("Call me on +91 98954 68235")).toBe(
      true,
    );
    expect(containsSensitivePersonalData("My Aadhaar is 1234 5678 9012")).toBe(
      true,
    );
    expect(containsSensitivePersonalData("What villas are available?")).toBe(
      false,
    );
  });
});
