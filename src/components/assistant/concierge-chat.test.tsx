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
});
