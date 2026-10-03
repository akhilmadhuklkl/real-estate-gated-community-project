export const primaryNavigation = [
  { label: "Home", href: "/" },
  { label: "Community", href: "/community" },
  { label: "Villas", href: "/villas" },
  { label: "Amenities", href: "/amenities" },
  { label: "Gallery", href: "/gallery" },
  { label: "Location", href: "/location" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerNavigation = [
  ...primaryNavigation,
  { label: "Specifications", href: "/specifications" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Privacy", href: "/privacy" },
] as const;
