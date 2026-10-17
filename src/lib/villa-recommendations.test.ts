import { describe, expect, it } from "vitest";

import { villaCatalogue } from "./villas-content";
import {
  collectRecommendationPreferences,
  evaluateVillaRecommendation,
  isRecommendationConversation,
  recommendationAnswer,
} from "./villa-recommendations";

describe("villa recommendation preferences", () => {
  it("collects supported neutral criteria from a conversation", () => {
    expect(
      collectRecommendationPreferences(
        "Recommend a 3 bedroom villa for a family of 4, at least 2,000 sq ft, two levels, with parking.",
      ),
    ).toEqual({
      householdSize: 4,
      minBedrooms: 3,
      minAreaSqFt: 2000,
      maxAreaSqFt: null,
      preferredLevels: null,
      requestedFeatures: ["parking"],
      budgetMentioned: false,
      availabilityRequested: false,
    });
  });

  it("recognises recommendation intent without treating every villa question as one", () => {
    expect(isRecommendationConversation("Which villa is right for me?")).toBe(
      true,
    );
    expect(isRecommendationConversation("Show the villa floor plan")).toBe(
      false,
    );
  });
});

describe("deterministic villa recommendation", () => {
  it("asks one focused question when no neutral preference is supplied", () => {
    const result = evaluateVillaRecommendation(
      collectRecommendationPreferences("Recommend the best villa"),
      villaCatalogue,
    );
    expect(result.status).toBe("needs-preferences");
    expect(recommendationAnswer(result)).toMatch(/what matters most/i);
  });

  it("explains supported matches without pretending to rank inventory", () => {
    const result = evaluateVillaRecommendation(
      collectRecommendationPreferences(
        "Suggest a 3 bedroom villa at least 2,000 sq ft",
      ),
      villaCatalogue,
    );
    expect(result.status).toBe("single-approved-option");
    expect(result.criteria.map(({ outcome }) => outcome)).toEqual([
      "unknown",
      "match",
    ]);
    expect(result.limitations.join(" ")).toMatch(/one villa plan/i);
  });

  it("reports a numeric mismatch rather than stretching the evidence", () => {
    const result = evaluateVillaRecommendation(
      collectRecommendationPreferences(
        "Recommend a 5 bedroom villa above 4,000 sq ft",
      ),
      villaCatalogue,
    );
    expect(result.status).toBe("no-evidenced-match");
    expect(result.criteria.map(({ outcome }) => outcome)).toEqual([
      "unknown",
      "not-match",
    ]);
  });

  it("does not use budget, live availability, household capacity, or unmodelled features as match facts", () => {
    const result = evaluateVillaRecommendation(
      collectRecommendationPreferences(
        "Recommend an affordable available villa for a family of 5 with a garden",
      ),
      villaCatalogue,
    );
    expect(result.criteria).toEqual([
      expect.objectContaining({ id: "feature-garden", outcome: "unknown" }),
    ]);
    expect(result.limitations.join(" ")).toMatch(/budget was not used/i);
    expect(result.limitations.join(" ")).toMatch(/availability was not used/i);
    expect(result.limitations.join(" ")).toMatch(
      /room capacity is not inferred/i,
    );
  });

  it("returns no recommendation when the approved catalogue is empty", () => {
    const result = evaluateVillaRecommendation(
      collectRecommendationPreferences("Suggest a 3 bedroom villa"),
      [],
    );
    expect(result.status).toBe("needs-preferences");
    expect(result.villa).toBeNull();
  });
});
