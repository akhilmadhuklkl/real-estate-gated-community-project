import { describe, expect, it } from "vitest";

import { project } from "./project-content";

describe("project content", () => {
  it("loads the brochure-backed project record", () => {
    expect(project.project.name).toBe("Glitz Pride");
    expect(project.villaTypes[0]?.totalAreaSqFt).toBe(2220);
    expect(project.amenities.length).toBeGreaterThan(0);
  });
});
