import Image from "next/image";

import { ActionLink } from "@/components/shared/action-link";
import { PageShell } from "@/components/shared/page-shell";
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
        <PageShell className="hero__content">
          <p className="eyebrow">{project.project.category}</p>
          <h1 id="hero-title">
            Life, with room <em>to breathe.</em>
          </h1>
          <p className="hero__summary">{project.project.summary}</p>
          <ActionLink href="/villas" inverse>
            Explore the villas
          </ActionLink>
        </PageShell>
      </section>

      <section
        className="foundation"
        id="foundation"
        aria-labelledby="foundation-title"
      >
        <PageShell className="foundation__grid">
          <div>
            <p className="eyebrow">The vision</p>
            <h2 id="foundation-title">
              Close to the city. <em>Closer to nature.</em>
            </h2>
          </div>
          <div className="foundation__body">
            <p>{project.project.summary}</p>
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
            <ActionLink href="/community">
              Discover the complete vision
            </ActionLink>
          </div>
        </PageShell>
      </section>
    </main>
  );
}
