import { describe, expect, it } from "vitest";

import {
  createPageMetadata,
  getProjectStructuredData,
  serializeStructuredData,
} from "./seo";

describe("SEO metadata", () => {
  it("builds canonical and social metadata for a route", () => {
    const metadata = createPageMetadata({
      title: "Villas",
      description: "Explore villa plans.",
      path: "/villas",
    });

    expect(metadata.alternates).toEqual({ canonical: "/villas" });
    expect(metadata.openGraph).toMatchObject({ url: "/villas" });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("builds source-backed website and residence structured data", () => {
    const structuredData = getProjectStructuredData();

    expect(structuredData["@graph"]).toHaveLength(2);
    expect(structuredData["@graph"][1]).toMatchObject({
      "@type": "Residence",
      name: "Glitz Pride",
    });
  });

  it("escapes markup-sensitive characters before script insertion", () => {
    expect(serializeStructuredData({ value: "</script>" })).toContain(
      "\\u003c/script>",
    );
  });
});
