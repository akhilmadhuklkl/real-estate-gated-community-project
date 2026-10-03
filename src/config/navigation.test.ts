import { describe, expect, it } from "vitest";

import { footerNavigation, primaryNavigation } from "./navigation";

describe("shared navigation", () => {
  it("keeps every primary destination unique", () => {
    const destinations = primaryNavigation.map((item) => item.href);
    expect(new Set(destinations).size).toBe(destinations.length);
  });

  it("includes every primary destination in the footer", () => {
    const footerDestinations = new Set(
      footerNavigation.map((item) => item.href),
    );
    expect(
      primaryNavigation.every((item) => footerDestinations.has(item.href)),
    ).toBe(true);
  });
});
