import type { Metadata } from "next";

import { publicEnvironment } from "./env";
import { project } from "./project-content";

export const SITE_NAME = project.project.name;
export const SITE_DESCRIPTION =
  "A brochure-backed digital experience for the Glitz Pride gated villa community near Thrissur.";
export const SOCIAL_IMAGE = "/media/glitz-pride/hero-villa.png";

type PageMetadataInput = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  image?: string;
};

export function createPageMetadata({
  title,
  description,
  path,
  image = SOCIAL_IMAGE,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: path,
      images: [{ url: image, alt: `${title} at ${SITE_NAME}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function getProjectStructuredData() {
  const siteUrl = publicEnvironment.NEXT_PUBLIC_SITE_URL;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "en-IN",
      },
      {
        "@type": "Residence",
        "@id": `${siteUrl}/#residence`,
        name: project.project.name,
        description: project.project.summary,
        url: siteUrl,
        image: new URL(SOCIAL_IMAGE, siteUrl).toString(),
        address: {
          "@type": "PostalAddress",
          streetAddress: project.location.address,
          addressRegion: "Kerala",
          addressCountry: "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: project.location.coordinates.latitude,
          longitude: project.location.coordinates.longitude,
        },
      },
    ],
  };
}

export function serializeStructuredData(value: unknown) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}
