import type { Metadata } from "next";
import type { ReactNode } from "react";

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
      <body>{children}</body>
    </html>
  );
}
