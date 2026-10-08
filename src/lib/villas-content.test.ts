import { describe, expect, it } from "vitest";

import {
  buildVillaComparisonRows,
  filterVillas,
  MAX_COMPARISON_VILLAS,
  villaCatalogue,
} from "./villas-content";

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

  it("builds comparison rows without replacing unknown values", () => {
    const rows = buildVillaComparisonRows(villaCatalogue);

    expect(MAX_COMPARISON_VILLAS).toBe(3);
    expect(rows.find((row) => row.id === "total-area")?.values).toEqual([
      "2,220 sq ft",
    ]);
    expect(rows.find((row) => row.id === "bedrooms")?.values).toEqual([
      "To confirm",
    ]);
    expect(rows.find((row) => row.id === "features")?.values).toEqual([
      "Not supplied in the current source",
    ]);
  });
});
