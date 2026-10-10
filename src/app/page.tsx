import Image from "next/image";
import Link from "next/link";

import { VisionSlideshow } from "@/components/home/vision-slideshow";
import { SectionNextLink } from "@/components/home/section-next-link";
import { ActionLink } from "@/components/shared/action-link";
import { PageShell } from "@/components/shared/page-shell";
import { homeContent } from "@/lib/home-content";
import { project } from "@/lib/project-content";

import "./home.css";

const residenceCards = [
  {
    eyebrow: "Villa exterior",
    title: "A home shaped by light",
    copy: "A contemporary villa rendering from the official development brochure.",
    image: "/media/glitz-pride/villa.jpg",
    alt: "Contemporary villa exterior rendering",
  },
  ...homeContent.floorAreas.map((floor) => ({
    eyebrow: "Brochure plan",
    title: floor.label,
    copy: `${floor.value.toLocaleString("en-IN")} sq ft as shown in the brochure.`,
    image: floor.image,
    alt: `${floor.label} three-dimensional floor plan`,
  })),
];

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero" id="top" aria-labelledby="hero-title">
        <Image
          src="/media/glitz-pride/hero-villa.png"
          alt="Villa-led concept rendering for Glitz Pride"
          fill
          preload
          sizes="100vw"
          className="home-hero__image"
          quality={75}
        />
        <div className="home-hero__shade" />
        <PageShell className="home-hero__content">
          <p className="eyebrow">{project.project.category}</p>
          <h1 id="hero-title">
            Life, with room <em>to breathe.</em>
          </h1>
          <p>{project.project.summary}</p>
          <div className="home-hero__actions">
            <ActionLink href="/villas" inverse>
              Explore the villas
            </ActionLink>
            <div className="home-hero__stat">
              <strong>{homeContent.villaArea.toLocaleString("en-IN")}</strong>
              <span>sq ft brochure plan</span>
            </div>
          </div>
        </PageShell>
        <SectionNextLink href="#vision" inverse>
          Discover the story
        </SectionNextLink>
      </section>

      <section
        className="home-section vision-section"
        id="vision"
        aria-labelledby="vision-title"
      >
        <PageShell className="vision-grid">
          <VisionSlideshow />
          <div className="vision-copy">
            <p className="vision-copy__lead">
              A private digital presentation of a nature-led gated villa
              community—calm, clear and personal from the first visit.
            </p>
            <p>
              Every detail shown here is brochure-backed reference content
              published with clear notes where current confirmation is needed.
            </p>
            <dl className="home-metrics">
              <div>
                <dt>{project.amenities.length}</dt>
                <dd>brochure amenities</dd>
              </div>
              <div>
                <dt>{homeContent.villaArea.toLocaleString("en-IN")}</dt>
                <dd>sq ft total plan</dd>
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
        <SectionNextLink href="#residences">
          Explore the residences
        </SectionNextLink>
      </section>

      <section
        className="home-section residences-section"
        id="residences"
        aria-labelledby="residences-title"
      >
        <PageShell>
          <header className="home-heading">
            <div>
              <p className="eyebrow">The residences</p>
              <h2 id="residences-title">
                Made for the way <em>you want to live.</em>
              </h2>
            </div>
            <p>
              Generous rooms, tropical light and a plan that separates shared
              life from quieter moments.
            </p>
          </header>
          <div
            className="residence-grid"
            role="region"
            aria-label="Villa and floor-plan gallery. Scroll horizontally to view more."
            tabIndex={0}
          >
            {residenceCards.map((card) => (
              <article className="residence-card" key={card.title}>
                <div className="residence-card__image">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    sizes="(max-width: 800px) 86vw, 31vw"
                  />
                </div>
                <div>
                  <span>{card.eyebrow}</span>
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="home-section__action">
            <ActionLink href="/villas">View all residence details</ActionLink>
          </div>
        </PageShell>
        <SectionNextLink href="#lifestyle">
          Discover community life
        </SectionNextLink>
      </section>

      <section
        className="home-section lifestyle-section"
        id="lifestyle"
        aria-labelledby="lifestyle-title"
      >
        <div className="lifestyle-image">
          <Image
            src="/media/glitz-pride/greenery.jpg"
            alt="Landscaped community setting shown in the brochure"
            fill
            sizes="(max-width: 800px) 100vw, 52vw"
          />
        </div>
        <div className="lifestyle-copy">
          <p className="eyebrow">Life together</p>
          <h2 id="lifestyle-title">
            Space to move. <em>Room to belong.</em>
          </h2>
          <p>
            Shared spaces are drawn from the brochure and presented as
            possibilities pending current confirmation.
          </p>
          <ul>
            {homeContent.featuredAmenities.map((amenity) => (
              <li key={amenity.id}>{amenity.name}</li>
            ))}
          </ul>
          <ActionLink href="/amenities" inverse>
            Explore community life
          </ActionLink>
        </div>
        <SectionNextLink href="#location" inverse>
          See the neighbourhood
        </SectionNextLink>
      </section>

      <section
        className="home-section location-section"
        id="location"
        aria-labelledby="location-title"
      >
        <PageShell className="location-grid">
          <div>
            <p className="eyebrow">Well connected</p>
            <h2 id="location-title">
              Everything within <em>easy reach.</em>
            </h2>
            <p>
              The brochure places the community at Amala Nagar in Thrissur.
              Distances remain subject to route and source verification.
            </p>
            <div className="landmark-grid">
              {homeContent.nearbyLandmarks.map((landmark) => (
                <div key={landmark.name}>
                  <strong>{landmark.distanceKm} km</strong>
                  <span>{landmark.name}</span>
                </div>
              ))}
            </div>
            <ActionLink href="/location">View location details</ActionLink>
          </div>
          <figure className="location-map">
            <Image
              src="/media/glitz-pride/location-map.jpg"
              alt="Illustrative brochure map of the Glitz Pride area"
              fill
              sizes="(max-width: 800px) 100vw, 44vw"
            />
            <figcaption>
              Illustrative brochure map · verify routes before travel
            </figcaption>
          </figure>
        </PageShell>
        <SectionNextLink href="#guide">Meet the property guide</SectionNextLink>
      </section>

      <section
        className="home-section guide-section"
        id="guide"
        aria-labelledby="guide-title"
      >
        <PageShell className="guide-grid">
          <div>
            <p className="eyebrow">Coming in the AI phase</p>
            <h2 id="guide-title">A property guide that knows the details.</h2>
          </div>
          <div>
            <p>
              The future assistant will answer source-backed questions, surface
              relevant plans and contacts, and clearly distinguish confirmed
              information from details still awaiting approval.
            </p>
            <Link className="guide-preview" href="/contact">
              Ask a question later <span aria-hidden="true">→</span>
            </Link>
          </div>
        </PageShell>
        <SectionNextLink href="#top" inverse>
          Back to the beginning
        </SectionNextLink>
      </section>
    </main>
  );
}
