"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/media/glitz-pride/villas.jpg",
    alt: "Brochure rendering of villas among tropical landscaping",
  },
  {
    src: "/media/glitz-pride/villa.jpg",
    alt: "Brochure rendering of a contemporary villa exterior",
  },
  {
    src: "/media/glitz-pride/entry.jpg",
    alt: "Brochure rendering of the gated community entrance",
  },
];

export function VisionSlideshow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % slides.length),
      5200,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <figure className="vision-visual" aria-label="Villa design gallery">
      <Image
        key={slides[active].src}
        src={slides[active].src}
        alt={slides[active].alt}
        fill
        sizes="(max-width: 800px) 100vw, 46vw"
        className="vision-visual__image"
        data-active="true"
        priority={active === 0}
        quality={70}
      />
      <div className="vision-visual__shade" />
      <figcaption className="vision-visual__content">
        <span className="eyebrow">The vision</span>
        <h2 id="vision-title">
          Close to the city. <em>Closer to nature.</em>
        </h2>
      </figcaption>
    </figure>
  );
}
