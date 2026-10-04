import { describe, expect, it } from "vitest";

import { filterVillas, villaCatalogue } from "./villas-content";

describe("villa catalogue", () => {
  it("maps the brochure reference plan without inventing room counts", () => {
    expect(villaCatalogue[0]).toMatchObject({
      totalAreaSqFt: 2220,
      levels: 2,
      bedrooms: null,
      bathrooms: null,
      availability: "unknown",
    });
  });

  it("filters by floor name and area band", () => {
    expect(filterVillas(villaCatalogue, "ground", "all")).toHaveLength(1);
    expect(filterVillas(villaCatalogue, "", "2500-plus")).toHaveLength(0);
  });
});
