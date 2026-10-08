import type { MetadataRoute } from "next";

import { publicEnvironment } from "../lib/env";

export default function robots(): MetadataRoute.Robots {
  const indexable = publicEnvironment.NEXT_PUBLIC_SITE_INDEXABLE;

  return {
    rules: {
      userAgent: "*",
      allow: indexable ? "/" : undefined,
      disallow: indexable ? ["/api/"] : "/",
    },
    sitemap: indexable
      ? new URL(
          "/sitemap.xml",
          publicEnvironment.NEXT_PUBLIC_SITE_URL,
        ).toString()
      : undefined,
    host: indexable ? publicEnvironment.NEXT_PUBLIC_SITE_URL : undefined,
  };
}
