import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PreviewNotice } from "@/components/shared/preview-notice";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { publicEnvironment } from "@/lib/env";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnvironment.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "Glitz Pride",
    template: "%s | Glitz Pride",
  },
  description:
    "A brochure-backed digital experience for the Glitz Pride villa community.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <PreviewNotice />
        <SiteHeader />
        <div id="main-content">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
