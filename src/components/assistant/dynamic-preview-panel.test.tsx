import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { resolveAssistantPreview } from "../../lib/assistant-preview";

import { DynamicPreviewPanel } from "./dynamic-preview-panel";

const evidenceIds = ["chk-source-one"];
const allowedEvidenceIds = new Set(evidenceIds);

describe("DynamicPreviewPanel", () => {
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
  ])("renders the trusted %s component", (_, selection, label) => {
    const preview = resolveAssistantPreview(selection, allowedEvidenceIds);
    render(<DynamicPreviewPanel preview={preview} />);
    expect(screen.getByRole("region", { name: label })).toBeInTheDocument();
  });
});
