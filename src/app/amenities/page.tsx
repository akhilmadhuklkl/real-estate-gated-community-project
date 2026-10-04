import type { Metadata } from "next";
import Image from "next/image";

import { ActionLink } from "@/components/shared/action-link";
import { PageShell } from "@/components/shared/page-shell";
import { amenities, amenityImages } from "@/lib/amenities-content";

import "./amenities.css";

export const metadata: Metadata = {
  title: "Amenities",
  description:
    "Explore the shared spaces listed in the official Glitz Pride development brochure.",
};

export default function AmenitiesPage() {
  return (
    <main className="amenities-page">
      <section className="amenities-hero" aria-labelledby="amenities-title">
        <Image
          src="/media/glitz-pride/greenery.jpg"
          alt="Green landscaping shown in the official development brochure"
          fill
          priority
          sizes="100vw"
        />
        <div className="amenities-hero__shade" />
        <PageShell className="amenities-hero__copy">
          <p className="eyebrow">Beyond your front door</p>
          <h1 id="amenities-title">
            Room for the rituals <em>that make a community.</em>
          </h1>
          <p>
            Seven shared amenities are named in the official brochure. This
            experience shows those references while keeping their scope,
            location and delivery state transparent.
          </p>
          <ActionLink href="#amenity-list" inverse>
            Explore the shared spaces
          </ActionLink>
        </PageShell>
      </section>

      <section
        className="amenities-intro"
        aria-labelledby="amenity-story-title"
      >
        <PageShell className="amenities-intro__grid">
          <div>
            <p className="eyebrow">A fuller everyday</p>
            <h2 id="amenity-story-title">
              From quiet gardens to <em>shared energy.</em>
            </h2>
          </div>
          <div>
            <p>
              The brochure brings nature, recreation, arrival and security
              together as one community story. The final facility mix and
              operating details must be confirmed before relying on them.
            </p>
            <dl>
              <div>
                <dt>{amenities.length}</dt>
                <dd>brochure-listed amenities</dd>
              </div>
              <div>
                <dt>6</dt>
                <dd>lifestyle purposes</dd>
              </div>
              <div>
                <dt>Pending</dt>
                <dd>delivery confirmation</dd>
              </div>
            </dl>
          </div>
        </PageShell>
      </section>

      <section
        className="amenity-list"
        id="amenity-list"
        aria-labelledby="amenity-list-title"
      >
        <PageShell>
          <header className="amenity-list__header">
            <div>
              <p className="eyebrow">The shared spaces</p>
              <h2 id="amenity-list-title">
                Designed around how life is lived.
              </h2>
            </div>
            <p>
              Each item below is a brochure reference, not a verified statement
              that the facility is delivered or available for use.
            </p>
          </header>
          <ol className="amenity-list__grid">
            {amenities.map((amenity) => (
              <li key={amenity.id}>
                <article className="amenity-card">
                  <div className="amenity-card__meta">
                    <span>{amenity.number}</span>
                    <span>{amenity.group}</span>
                  </div>
                  <h3>{amenity.name}</h3>
                  <p>{amenity.shortDescription}</p>
                  <div className="amenity-card__status">
                    <span aria-hidden="true" />
                    Delivery state: confirmation pending
                  </div>
                  <p className="amenity-card__note">
                    {amenity.publicationNote}
                  </p>
                </article>
              </li>
            ))}
          </ol>
        </PageShell>
      </section>

      <section
        className="amenity-visuals"
        aria-label="Brochure amenity context"
      >
        <PageShell className="amenity-visuals__grid">
          {amenityImages.map((image, index) => (
            <figure key={image.src} data-wide={index === 0 || undefined}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={
                  index === 0
                    ? "(max-width: 800px) 100vw, 62vw"
                    : "(max-width: 800px) 100vw, 31vw"
                }
              />
              <figcaption>{image.label} · Official brochure visual</figcaption>
            </figure>
          ))}
        </PageShell>
      </section>

      <section className="amenity-plan" aria-labelledby="amenity-plan-title">
        <PageShell className="amenity-plan__grid">
          <div>
            <p className="eyebrow">The community plan</p>
            <h2 id="amenity-plan-title">One setting. Many ways to belong.</h2>
          </div>
          <div>
            <p>
              Amenity positions shown in brochure imagery are illustrative.
              Confirm the approved master plan, access arrangements, capacity,
              operating rules and completion status with the property owner.
            </p>
            <ActionLink href="/contact#schedule-visit">
              Discuss the amenity plan
            </ActionLink>
          </div>
        </PageShell>
      </section>

      <section
        className="amenities-next"
        aria-labelledby="amenities-next-title"
      >
        <PageShell>
          <div>
            <p className="eyebrow">Continue exploring</p>
            <h2 id="amenities-next-title">Find the home at the heart of it.</h2>
          </div>
          <ActionLink href="/villas" inverse>
            Explore the villas
          </ActionLink>
        </PageShell>
      </section>
    </main>
  );
}
