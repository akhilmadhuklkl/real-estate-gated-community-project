export const masterPlanPoints = [
  {
    id: "community-villas",
    number: "01",
    name: "Villa neighbourhood",
    category: "Residences",
    description:
      "The aerial groups the villa residences around internal streets and landscaped edges.",
    note: "Individual plot identifiers, boundaries and availability are not confirmed.",
    position: { x: 44, y: 56 },
    href: "/villas",
    action: "Explore the villa reference",
  },
  {
    id: "club-house",
    number: "02",
    name: "Club house",
    category: "Community",
    description:
      "A shared building is shown beside the recreation zone and labelled as a club house in the brochure.",
    note: "Facilities, final footprint and delivery state require confirmation.",
    position: { x: 73, y: 52 },
    href: "/amenities#amenity-list",
    action: "View amenity details",
  },
  {
    id: "shuttle-court",
    number: "03",
    name: "Shuttle court",
    category: "Recreation",
    description:
      "The brochure aerial depicts a marked court on the eastern edge of the community.",
    note: "Confirm the intended sport, court specification and completion status.",
    position: { x: 83, y: 67 },
    href: "/amenities#amenity-list",
    action: "View amenity details",
  },
  {
    id: "children-play-area",
    number: "04",
    name: "Children play area",
    category: "Play",
    description:
      "A colourful shared play zone appears near the clubhouse in the brochure rendering.",
    note: "Equipment, safety specification, access and delivery state remain unconfirmed.",
    position: { x: 67, y: 44 },
    href: "/amenities#amenity-list",
    action: "View amenity details",
  },
  {
    id: "green-open-space",
    number: "05",
    name: "Green open space",
    category: "Landscape",
    description:
      "A large landscaped open area is illustrated along the northern community edge.",
    note: "The approved landscape plan, use, dimensions and access rules require confirmation.",
    position: { x: 37, y: 17 },
    href: "/community#principles",
    action: "Explore the landscape vision",
  },
  {
    id: "guest-parking",
    number: "06",
    name: "Guest parking reference",
    category: "Arrival",
    description:
      "Parking bays are illustrated along the upper internal road in the brochure aerial.",
    note: "Capacity, allocation, traffic flow and access rules are not confirmed.",
    position: { x: 72, y: 28 },
    href: "/amenities#amenity-list",
    action: "View amenity details",
  },
] as const;
