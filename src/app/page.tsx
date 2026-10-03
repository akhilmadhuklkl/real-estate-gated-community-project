import Image from "next/image";
import Link from "next/link";

import { project } from "@/lib/project-content";

export default function HomePage() {
  const villaArea = project.villaTypes[0]?.totalAreaSqFt;

  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <Image
          src="/reference/glitz-pride/hero-01.jpg"
          alt="Architectural rendering of a tropical contemporary villa"
          fill
          priority
          sizes="100vw"
          className="hero__image"
        />
        <div className="hero__overlay" />
        <div className="hero__content shell">
          <p className="eyebrow">{project.project.category}</p>
          <h1 id="hero-title">{project.project.name}</h1>
          <p className="hero__summary">{project.project.summary}</p>
          <Link className="primary-link" href="#foundation">
            Explore the foundation <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section
        className="foundation shell"
        id="foundation"
        aria-labelledby="foundation-title"
      >
        <div>
          <p className="eyebrow">Production foundation</p>
          <h2 id="foundation-title">
            Structured, responsive, and ready to grow.
          </h2>
        </div>
        <div className="foundation__body">
          <p>
            This baseline reads brochure-backed project data through a validated
            content layer. The next development tasks will turn the approved
            mockup direction into reusable sections and complete visitor
            journeys.
          </p>
          <dl className="metrics">
            <div>
              <dt>{project.amenities.length}</dt>
              <dd>modelled amenities</dd>
            </div>
            <div>
              <dt>{villaArea?.toLocaleString("en-IN") ?? "—"}</dt>
              <dd>sq ft brochure plan</dd>
            </div>
            <div>
              <dt>{project.location.landmarks.length}</dt>
              <dd>nearby landmarks</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
