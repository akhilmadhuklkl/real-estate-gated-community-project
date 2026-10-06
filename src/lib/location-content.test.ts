import { describe, expect, it } from "vitest";

import {
  locationCategories,
  locationContent,
  nearestLandmarks,
} from "./location-content";

describe("location content", () => {
  it("maps every brochure landmark to an accessible filter category", () => {
    const categoryIds = new Set(locationCategories.map(({ id }) => id));

    expect(locationContent.landmarks).toHaveLength(18);
    expect(
      locationContent.landmarks.every((landmark) =>
        categoryIds.has(landmark.filterCategory),
      ),
    ).toBe(true);
  });

  it("keeps brochure distances ordered and unconfirmed records visible", () => {
    expect(nearestLandmarks.map(({ distanceKm }) => distanceKm)).toEqual([
      1, 2, 2.5,
    ]);
    expect(
      locationContent.landmarks.find(({ name }) => name === "Proposed Hub")
        ?.isUnconfirmed,
    ).toBe(true);
    expect(locationContent.approvalState).toBe("awaiting-approval");
  });
});
