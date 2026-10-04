import { project } from "@/lib/project-content";

const presentation = {
  "amenity-vegetable-garden": {
    number: "01",
    group: "Nature",
    shortDescription:
      "A shared place for growing, gathering and reconnecting with the landscape.",
  },
  "amenity-guest-parking": {
    number: "02",
    group: "Arrival",
    shortDescription:
      "A brochure-labelled guest parking area intended to make everyday arrivals easier.",
  },
  "amenity-club-house": {
    number: "03",
    group: "Community",
    shortDescription:
      "A shared clubhouse reference for neighbourhood gatherings and resident life.",
  },
  "amenity-children-play-area": {
    number: "04",
    group: "Play",
    shortDescription:
      "A dedicated play-area reference designed around younger residents.",
  },
  "amenity-health-club": {
    number: "05",
    group: "Wellbeing",
    shortDescription:
      "A health-club reference for movement and everyday wellbeing close to home.",
  },
  "amenity-shuttle-court": {
    number: "06",
    group: "Play",
    shortDescription:
      "A court labelled in the brochure; its intended sport and specifications need confirmation.",
  },
  "amenity-security": {
    number: "07",
    group: "Security",
    shortDescription:
      "A brochure statement covering security standards and surveillance systems.",
  },
} as const;

export const amenities = project.amenities.map((amenity) => ({
  ...amenity,
  ...presentation[amenity.id as keyof typeof presentation],
}));

export const amenityImages = [
  {
    src: "/media/glitz-pride/greenery.jpg",
    alt: "Landscaped greenery shown in the official Glitz Pride brochure",
    label: "Landscape reference",
  },
  {
    src: "/media/glitz-pride/villas.jpg",
    alt: "Brochure rendering of villas arranged within the community",
    label: "Community reference",
  },
  {
    src: "/media/glitz-pride/entry.jpg",
    alt: "Brochure rendering of the gated community entrance",
    label: "Arrival reference",
  },
] as const;
