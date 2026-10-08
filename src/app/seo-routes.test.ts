import { describe, expect, it } from "vitest";

import robots from "./robots";
import sitemap from "./sitemap";

describe("SEO discovery routes", () => {
  it("keeps crawling disabled until public indexing is approved", () => {
    expect(robots().rules).toMatchObject({
      userAgent: "*",
      disallow: "/",
    });
  });

  it("lists static and governed villa routes without API endpoints", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("http://localhost:3000/");
    expect(urls).toContain(
      "http://localhost:3000/villas/villa-brochure-plan-01",
    );
    expect(urls.some((url) => url.includes("/api/"))).toBe(false);
  });
});
