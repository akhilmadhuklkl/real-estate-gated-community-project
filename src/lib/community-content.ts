import { project } from "./project-content";

const security = project.amenities.find(
  (amenity) => amenity.id === "amenity-security",
);

export const communityContent = {
  architect: project.project.architect ?? "Architect confirmation pending",
  principles: [
    {
      number: "01",
      label: "Nature",
      title: "Green through the seasons",
      description:
        "The brochure places landscaping, a vegetable garden and indoor planting at the centre of everyday community life.",
    },
    {
      number: "02",
      label: "Architecture",
      title: "Air, light and shade",
      description:
        "Natural ventilation and daylight shape the stated design intent, connecting interior rooms with planted outdoor spaces.",
    },
    {
      number: "03",
      label: "Designers",
      title: project.project.architect ?? "Design team confirmation pending",
      description:
        "The studio credited in the brochure brings architectural character and practical planning into the same composition.",
    },
  ],
  sharedLife: project.amenities
    .filter((amenity) => amenity.id !== "amenity-security")
    .slice(0, 5),
  security,
};
