import { PlannedPage } from "@/components/shared/planned-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Specifications",
  description:
    "Review brochure-backed material and construction specifications for Glitz Pride.",
  path: "/specifications",
});

export default function SpecificationsPage() {
  return (
    <PlannedPage
      eyebrow="The details"
      title="Materials, clearly presented."
      description="Approved construction and material specifications will be organised here with their source and review status."
    />
  );
}
