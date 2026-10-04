import { describe, expect, it } from "vitest";
import { homeContent } from "./home-content";

describe("homepage content", () => {
  it("uses governed villa and location data", () => {
    expect(homeContent.villaArea).toBe(2220);
    expect(
      homeContent.floorAreas.reduce((sum, floor) => sum + floor.value, 0),
    ).toBe(homeContent.villaArea);
    expect(homeContent.nearbyLandmarks[0]).toMatchObject({
      name: "Amala Medical College",
      distanceKm: 1,
    });
  });
});
