import { project } from "./project-content";

export type VillaCatalogueItem = {
  id: string;
  name: string;
  totalAreaSqFt: number;
  levels: number;
  floorAreas: { floor: string; area: number }[];
  bedrooms: number | null;
  bathrooms: number | null;
  availability: string;
  approvalState: string;
  publicationNote: string;
  image: string;
  imageAlt: string;
};

export const villaCatalogue: VillaCatalogueItem[] = project.villaTypes.map(
  (villa) => ({
    id: villa.id,
    name: villa.name,
    totalAreaSqFt: villa.totalAreaSqFt,
    levels: villa.floorAreasSqFt.length,
    floorAreas: villa.floorAreasSqFt,
    bedrooms: villa.bedrooms,
    bathrooms: villa.bathrooms,
    availability: villa.availability,
    approvalState: villa.approvalState,
    publicationNote: villa.publicationNote,
    image: "/media/glitz-pride/villa.jpg",
    imageAlt: "Brochure rendering of a contemporary Glitz Pride villa",
  }),
);

export const villaDetailMedia = [
  {
    src: "/media/glitz-pride/villa.jpg",
    alt: "Brochure rendering of the villa exterior",
  },
  {
    src: "/media/glitz-pride/villas.jpg",
    alt: "Brochure rendering of villas in the landscaped community",
  },
  {
    src: "/media/glitz-pride/entry.jpg",
    alt: "Brochure rendering of the gated community entrance",
  },
];

export const villaSpecifications = project.specifications;

export function getVillaById(id: string) {
  return villaCatalogue.find((villa) => villa.id === id);
}

export function filterVillas(
  villas: VillaCatalogueItem[],
  query: string,
  area: "all" | "under-2500" | "2500-plus",
) {
  const normalizedQuery = query.trim().toLowerCase();
  return villas.filter((villa) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      villa.name.toLowerCase().includes(normalizedQuery) ||
      villa.totalAreaSqFt.toString().includes(normalizedQuery) ||
      villa.floorAreas.some((floor) =>
        floor.floor.toLowerCase().includes(normalizedQuery),
      );
    const matchesArea =
      area === "all" ||
      (area === "under-2500" && villa.totalAreaSqFt < 2500) ||
      (area === "2500-plus" && villa.totalAreaSqFt >= 2500);
    return matchesQuery && matchesArea;
  });
}
