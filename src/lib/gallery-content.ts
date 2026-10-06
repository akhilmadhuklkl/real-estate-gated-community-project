export const galleryCategories = [
  { id: "all", label: "All media" },
  { id: "architecture", label: "Architecture" },
  { id: "landscape", label: "Landscape" },
  { id: "community", label: "Community" },
  { id: "arrival", label: "Arrival" },
  { id: "plans", label: "Floor plans" },
] as const;

export type GalleryCategory = Exclude<
  (typeof galleryCategories)[number]["id"],
  "all"
>;

export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  title: string;
  category: GalleryCategory;
  categoryLabel: string;
  orientation: "landscape" | "portrait";
  source: string;
  dateLabel: string;
  note: string;
};

export const galleryItems: GalleryItem[] = [
  {
    id: "villa-elevation",
    src: "/media/glitz-pride/villa.jpg",
    alt: "Brochure rendering of a contemporary two-level villa with a sheltered driveway",
    title: "A contemporary villa expression",
    category: "architecture",
    categoryLabel: "Architecture",
    orientation: "landscape",
    source: "Official brochure rendering",
    dateLabel: "Image date not supplied",
    note: "Illustrative architectural reference; finishes and built outcome require confirmation.",
  },
  {
    id: "community-aerial",
    src: "/media/glitz-pride/hero-villa.png",
    alt: "Illustrative aerial rendering of villas, shared buildings and greenery",
    title: "The community from above",
    category: "community",
    categoryLabel: "Community",
    orientation: "landscape",
    source: "Official brochure rendering",
    dateLabel: "Image date not supplied",
    note: "Illustrative composition only; boundaries and the approved master plan require confirmation.",
  },
  {
    id: "landscape-setting",
    src: "/media/glitz-pride/greenery.jpg",
    alt: "Dense tropical planting pictured as a landscape reference",
    title: "A landscape-led setting",
    category: "landscape",
    categoryLabel: "Landscape",
    orientation: "portrait",
    source: "Official brochure visual",
    dateLabel: "Image date not supplied",
    note: "Reference imagery; final planting, species and delivery state require confirmation.",
  },
  {
    id: "villa-street",
    src: "/media/glitz-pride/villas.jpg",
    alt: "Brochure rendering of a row of contemporary villas along a landscaped street",
    title: "A considered streetscape",
    category: "community",
    categoryLabel: "Community",
    orientation: "landscape",
    source: "Official brochure rendering",
    dateLabel: "Image date not supplied",
    note: "Illustrative community view; villa count and final arrangement require confirmation.",
  },
  {
    id: "arrival-gate",
    src: "/media/glitz-pride/entry.jpg",
    alt: "Brochure rendering of the gated entrance and arrival road",
    title: "A calm sense of arrival",
    category: "arrival",
    categoryLabel: "Arrival",
    orientation: "landscape",
    source: "Official brochure rendering",
    dateLabel: "Image date not supplied",
    note: "Illustrative entrance reference; access and security arrangements require confirmation.",
  },
  {
    id: "ground-floor-plan",
    src: "/media/glitz-pride/ground-floor.jpg",
    alt: "Illustrative brochure drawing of the villa ground-floor plan",
    title: "Ground-floor planning reference",
    category: "plans",
    categoryLabel: "Floor plans",
    orientation: "portrait",
    source: "Official brochure plan",
    dateLabel: "Revision date not supplied",
    note: "Not a construction drawing; dimensions, orientation and approvals require confirmation.",
  },
  {
    id: "first-floor-plan",
    src: "/media/glitz-pride/first-floor.jpg",
    alt: "Illustrative brochure drawing of the villa first-floor plan",
    title: "First-floor planning reference",
    category: "plans",
    categoryLabel: "Floor plans",
    orientation: "portrait",
    source: "Official brochure plan",
    dateLabel: "Revision date not supplied",
    note: "Not a construction drawing; dimensions, orientation and approvals require confirmation.",
  },
  {
    id: "location-context",
    src: "/media/glitz-pride/location-map.jpg",
    alt: "Illustrative brochure map showing the development location context",
    title: "The wider location context",
    category: "arrival",
    categoryLabel: "Arrival",
    orientation: "landscape",
    source: "Official brochure map",
    dateLabel: "Map date not supplied",
    note: "Illustrative map; routes, distances and landmarks require independent confirmation.",
  },
];

export const pendingCollections = [
  {
    title: "Interior photography",
    description:
      "Awaiting approved photography with room names, captions and capture dates.",
  },
  {
    title: "Construction progress",
    description:
      "Awaiting dated, location-labelled progress photographs from the property owner.",
  },
  {
    title: "Video and virtual tour",
    description:
      "Awaiting approved hosted video and a verified tour source with accessible alternatives.",
  },
] as const;
