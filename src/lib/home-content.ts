import { project } from "./project-content";

const villa = project.villaTypes[0];

export const homeContent = {
  villaArea: villa?.totalAreaSqFt ?? 0,
  floorAreas: [
    {
      label: "Ground floor",
      value: 1410,
      image: "/media/glitz-pride/ground-floor.jpg",
    },
    {
      label: "First floor",
      value: 810,
      image: "/media/glitz-pride/first-floor.jpg",
    },
  ],
  featuredAmenities: project.amenities.slice(0, 6),
  nearbyLandmarks: project.location.landmarks
    .filter((landmark) => landmark.category !== "unconfirmed")
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 6),
};
