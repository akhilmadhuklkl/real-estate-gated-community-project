import type { MetadataRoute } from "next";

import { publicEnvironment } from "../lib/env";
import { villaCatalogue } from "../lib/villas-content";

const staticRoutes = [
  "",
  "/community",
  "/villas",
  "/amenities",
  "/master-plan",
  "/gallery",
  "/location",
  "/specifications",
  "/contact",
  "/accessibility",
  "/privacy",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = publicEnvironment.NEXT_PUBLIC_SITE_URL;
  const lastModified = new Date("2026-10-08T00:00:00+05:30");
  const staticEntries = staticRoutes.map((route) => ({
    url: new URL(route || "/", baseUrl).toString(),
    lastModified,
    changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : 0.7,
  }));
  const villaEntries = villaCatalogue.map((villa) => ({
    url: new URL(`/villas/${villa.id}`, baseUrl).toString(),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...villaEntries];
}
