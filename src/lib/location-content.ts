import { project } from "./project-content";

export const locationCategories = [
  { id: "all", label: "All landmarks" },
  { id: "healthcare", label: "Healthcare" },
  { id: "education", label: "Education" },
  { id: "transport", label: "Transport" },
  { id: "everyday", label: "Everyday life" },
  { id: "worship", label: "Places of worship" },
] as const;

export type LocationCategory = Exclude<
  (typeof locationCategories)[number]["id"],
  "all"
>;

function landmarkId(name: string) {
  return `landmark-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

const categoryPresentation: Record<
  string,
  { filterCategory: LocationCategory; label: string }
> = {
  healthcare: { filterCategory: "healthcare", label: "Healthcare" },
  education: { filterCategory: "education", label: "Education" },
  transport: { filterCategory: "transport", label: "Transport" },
  "place-of-worship": {
    filterCategory: "worship",
    label: "Place of worship",
  },
  city: { filterCategory: "everyday", label: "City centre" },
  shopping: { filterCategory: "everyday", label: "Shopping" },
  events: { filterCategory: "everyday", label: "Events" },
  landmark: { filterCategory: "everyday", label: "Local landmark" },
  government: { filterCategory: "everyday", label: "Government" },
  unconfirmed: { filterCategory: "everyday", label: "Unconfirmed reference" },
};

export const locationContent = {
  address: project.location.address,
  coordinates: project.location.coordinates,
  approvalState: project.location.approvalState,
  publicationNote: project.location.publicationNote,
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${project.location.coordinates.latitude},${project.location.coordinates.longitude}`,
  landmarks: project.location.landmarks
    .map((landmark, index) => {
      const presentation = categoryPresentation[landmark.category];

      if (!presentation) {
        throw new Error(
          `Missing location presentation for ${landmark.category}`,
        );
      }

      return {
        ...landmark,
        id: landmarkId(landmark.name),
        ...presentation,
        number: String(index + 1).padStart(2, "0"),
        isUnconfirmed: landmark.category === "unconfirmed",
      };
    })
    .toSorted((a, b) => a.distanceKm - b.distanceKm),
} as const;

export const nearestLandmarks = locationContent.landmarks.slice(0, 3);
