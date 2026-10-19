import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { resolveAssistantPreview } from "../../lib/assistant-preview";
import { LEAD_DRAFT_STORAGE_KEY } from "../../lib/lead-qualification";

import { DynamicPreviewPanel } from "./dynamic-preview-panel";

const evidenceIds = ["chk-source-one"];
const allowedEvidenceIds = new Set(evidenceIds);

describe("DynamicPreviewPanel", () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(cleanup);
  it.each([
    [
      "villa",
      { kind: "villa", evidenceIds, villaId: "villa-brochure-plan-01" },
      "Villa details",
    ],
    [
      "floor plan",
      {
        kind: "floor-plan",
        evidenceIds,
        villaId: "villa-brochure-plan-01",
        mediaIds: ["ground-floor-plan", "first-floor-plan"],
      },
      "Floor plans",
    ],
    [
      "gallery",
      { kind: "gallery", evidenceIds, mediaIds: ["villa-elevation"] },
      "Project gallery",
    ],
    [
      "location",
      {
        kind: "map",
        evidenceIds,
        landmarkIds: ["landmark-amala-medical-college"],
      },
      "Location details",
    ],
    [
      "contact",
      { kind: "contact", evidenceIds, channels: ["call", "email"] },
      "Contact options",
    ],
    [
      "document",
      {
        kind: "document",
        evidenceIds,
        documentId: "document-glitz-brochure",
        page: 7,
      },
      "Project document",
    ],
    [
      "recommendation",
      {
        kind: "recommendation",
        evidenceIds,
        villaIds: ["villa-brochure-plan-01"],
        preferences: {
          householdSize: null,
          minBedrooms: 3,
          minAreaSqFt: 2000,
          maxAreaSqFt: null,
          preferredLevels: null,
          requestedFeatures: [],
          budgetMentioned: false,
          availabilityRequested: false,
        },
      },
      "Villa recommendation",
    ],
    [
      "enquiry summary",
      {
        kind: "enquiry-summary",
        evidenceIds,
        conversation: "Please arrange a site visit on 2026-11-12 morning",
      },
      "Enquiry summary",
    ],
  ])("renders the trusted %s component", (_, selection, label) => {
    const preview = resolveAssistantPreview(selection, allowedEvidenceIds);
    render(<DynamicPreviewPanel preview={preview} />);
    expect(screen.getByRole("region", { name: label })).toBeInTheDocument();
  });

  it("stores only the reviewed non-sensitive draft after explicit continuation", () => {
    const preview = resolveAssistantPreview(
      {
        kind: "enquiry-summary",
        evidenceIds,
        conversation:
          "Arrange a site visit on 2026-11-12 morning. Call +91 90000 00000.",
      },
      allowedEvidenceIds,
    );
    render(<DynamicPreviewPanel preview={preview} />);
    const notes = screen.getByLabelText("Relevant context");
    expect((notes as HTMLTextAreaElement).value).not.toContain("90000");
    fireEvent.change(notes, {
      target: { value: "Interested in a morning visit." },
    });
    fireEvent.click(
      screen.getByRole("link", { name: /continue to enquiry form/i }),
    );
    const stored = sessionStorage.getItem(LEAD_DRAFT_STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored ?? "{}")).toMatchObject({
      intent: "site-visit",
      preferredDate: "2026-11-12",
      timeWindow: "morning",
      message: "Interested in a morning visit.",
      handoffRoute: "visit",
    });
  });

  it("lets the user clear the prepared summary", () => {
    const preview = resolveAssistantPreview(
      {
        kind: "enquiry-summary",
        evidenceIds,
        conversation: "Please call me back about the villa",
      },
      allowedEvidenceIds,
    );
    render(<DynamicPreviewPanel preview={preview} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear summary" }));
    expect(screen.getByRole("status")).toHaveTextContent("Summary cleared");
    expect(screen.getByLabelText("Relevant context")).toHaveValue("");
    expect(sessionStorage.getItem(LEAD_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it("shows explicit human ownership and lets the user correct the route", () => {
    const preview = resolveAssistantPreview(
      {
        kind: "enquiry-summary",
        evidenceIds,
        conversation: "Please arrange a site visit",
      },
      allowedEvidenceIds,
    );
    render(<DynamicPreviewPanel preview={preview} />);
    const route = screen.getByRole("article", { name: "Handoff route" });
    expect(route).toHaveTextContent("Visit coordination");
    expect(route).toHaveTextContent("Visit coordinator");
    expect(route).toHaveTextContent("Working hoursNot confirmed");
    expect(route).toHaveTextContent("Response timeNot confirmed");

    fireEvent.change(screen.getByRole("combobox", { name: "Handoff route" }), {
      target: { value: "architecture" },
    });
    expect(
      screen.getByRole("heading", { name: "Architecture question" }),
    ).toBeInTheDocument();
    expect(route).toHaveTextContent("architecture triage");
  });
});
