import { PlannedPage } from "@/components/shared/planned-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Accessibility",
  description: "Accessibility information for the Glitz Pride website.",
  path: "/accessibility",
});

export default function AccessibilityPage() {
  return (
    <PlannedPage
      eyebrow="Accessibility"
      title="An experience designed for everyone."
      description="The final statement will describe the accessibility target, supported features, and an approved feedback route."
    />
  );
}
