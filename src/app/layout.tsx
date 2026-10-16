import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ConciergeChat } from "@/components/assistant/concierge-chat";
import { PreviewNotice } from "@/components/shared/preview-notice";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { publicEnvironment } from "@/lib/env";
import {
  getProjectStructuredData,
  serializeStructuredData,
  SITE_DESCRIPTION,
  SOCIAL_IMAGE,
} from "@/lib/seo";

import "./globals.css";
import "../components/assistant/concierge-chat.css";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnvironment.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "Glitz Pride",
    template: "%s | Glitz Pride",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Glitz Pride",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Glitz Pride",
    title: "Glitz Pride",
    description: SITE_DESCRIPTION,
    url: "/",
    images: [{ url: SOCIAL_IMAGE, alt: "Glitz Pride villa community" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Glitz Pride",
    description: SITE_DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
  robots: publicEnvironment.NEXT_PUBLIC_SITE_INDEXABLE
    ? { index: true, follow: true }
    : { index: false, follow: false, noarchive: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeStructuredData(getProjectStructuredData()),
          }}
        />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <PreviewNotice />
        <SiteHeader />
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        <SiteFooter />
        <ConciergeChat />
      </body>
    </html>
  );
}
