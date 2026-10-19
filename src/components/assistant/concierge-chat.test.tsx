import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConciergeChat } from "./concierge-chat";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.style.overflow = "";
  vi.unstubAllGlobals();
});

describe("ConciergeChat", () => {
  it("opens with input focus and restores launcher focus after Escape", async () => {
    render(<ConciergeChat />);
    const launcher = screen.getByRole("button", {
      name: "Open Glitz Pride property guide",
    });

    fireEvent.click(launcher);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Ask a property question")).toHaveFocus();

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(launcher).toHaveFocus();
  });

  it("submits a suggested question and presents grounded sources", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          sessionId: "session-test",
          status: "answered",
          answer:
            "The approved project information describes three-bedroom villas.",
          citations: [
            {
              evidenceId: "evidence-1",
              sourceId: "brochure",
              documentId: "brochure-1",
              sourceTitle: "Glitz Pride brochure",
              locator: {
                label: "Page 8",
                pageStart: 8,
                pageEnd: 8,
                sectionPath: [],
              },
              effectiveDate: null,
              reviewedAt: "2026-10-16",
              validUntil: null,
              qualification: "owner-provided",
              href: null,
              confidence: {
                level: "high",
                score: 0.9,
                basis: "retrieval-score",
              },
            },
          ],
          model: "test-model",
          policy: {
            version: "1",
            reason: "allowed",
            riskTier: "R0",
            humanHandoffRequired: false,
          },
          evidence: {
            confidence: "high",
            citationCount: 1,
            minimumScore: 0.45,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    render(<ConciergeChat />);
    fireEvent.click(
      screen.getByRole("button", { name: "Open Glitz Pride property guide" }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "What villa configurations are available?",
      }),
    );

    expect(
      await screen.findByText(/three-bedroom villas/i),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("1 approved source"));
    expect(screen.getByText("Glitz Pride brochure")).toBeInTheDocument();
  });

  it("shows a safe recovery message when the service is unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    render(<ConciergeChat />);
    fireEvent.click(
      screen.getByRole("button", { name: "Open Glitz Pride property guide" }),
    );
    fireEvent.change(screen.getByLabelText("Ask a property question"), {
      target: { value: "Tell me about amenities" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(
      await screen.findByText(
        /could not reach the property knowledge service/i,
      ),
    ).toBeInTheDocument();
  });

  it("sends the selected language with the assistant request", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          sessionId: "session-language",
          status: "insufficient-evidence",
          answer: "The selected language is awaiting approved translations.",
          citations: [],
          model: null,
          policy: {
            version: "1",
            reason: "translation-not-approved",
            riskTier: "R1",
            humanHandoffRequired: true,
          },
          evidence: {
            confidence: "none",
            citationCount: 0,
            minimumScore: 0.45,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    render(<ConciergeChat />);
    fireEvent.click(
      screen.getByRole("button", { name: "Open Glitz Pride property guide" }),
    );
    fireEvent.change(screen.getByLabelText("Language"), {
      target: { value: "ml" },
    });
    fireEvent.change(screen.getByLabelText("Ask a property question"), {
      target: { value: "വില്ലകളെക്കുറിച്ച് പറയാമോ?" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(request.body))).toMatchObject({
      language: "ml",
    });
  });

  it("records a question and presents the transcript for review", async () => {
    class TestMediaRecorder extends EventTarget {
      static isTypeSupported() {
        return true;
      }
      state: RecordingState = "inactive";
      mimeType = "audio/webm;codecs=opus";
      constructor(public stream: MediaStream) {
        super();
      }
      start() {
        this.state = "recording";
      }
      stop() {
        this.state = "inactive";
        const event = new Event("dataavailable") as BlobEvent;
        Object.defineProperty(event, "data", {
          value: new Blob(["voice"], { type: this.mimeType }),
        });
        this.dispatchEvent(event);
        this.dispatchEvent(new Event("stop"));
      }
    }
    const stopTrack = vi.fn();
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: stopTrack }],
        }),
      },
    });
    vi.stubGlobal("MediaRecorder", TestMediaRecorder);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          transcript: "What villas are available?",
          language: "en",
          locale: "en-IN",
          model: "test-model",
          audioRetained: false,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(<ConciergeChat />);
    fireEvent.click(
      screen.getByRole("button", { name: "Open Glitz Pride property guide" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Start voice input" }));
    expect(await screen.findByText(/listening 0s/i)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Stop voice recording" }),
    );

    await waitFor(() =>
      expect(screen.getByLabelText("Ask a property question")).toHaveValue(
        "What villas are available?",
      ),
    );
    expect(
      screen.getByText(/review and edit the transcript/i),
    ).toBeInTheDocument();
    expect(stopTrack).toHaveBeenCalled();
  });

  it("offers optional spoken playback for a visible assistant answer", async () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      class {
        lang = "";
        rate = 1;
        onend: (() => void) | null = null;
        onerror: (() => void) | null = null;
        constructor(public text: string) {}
      },
    );
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: { speak, cancel },
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          sessionId: "session-speech",
          status: "answered",
          answer: "The approved plan describes a 2,180 sq ft villa.",
          citations: [],
          model: "test-model",
          policy: {
            version: "1",
            reason: "allowed",
            riskTier: "R0",
            humanHandoffRequired: false,
          },
          evidence: {
            confidence: "high",
            citationCount: 1,
            minimumScore: 0.45,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(<ConciergeChat />);
    fireEvent.click(
      screen.getByRole("button", { name: "Open Glitz Pride property guide" }),
    );
    fireEvent.change(screen.getByLabelText("Ask a property question"), {
      target: { value: "What is the villa area?" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));
    fireEvent.click(
      await screen.findByRole("button", { name: /listen to answer/i }),
    );

    expect(speak).toHaveBeenCalledOnce();
    expect(speak.mock.calls[0][0]).toMatchObject({
      text: "The approved plan describes a 2,180 sq ft villa.",
      lang: "en-IN",
    });
  });
});
