import Image from "next/image";

import { LandmarkDirectory } from "@/components/location/landmark-directory";
import { ActionLink } from "@/components/shared/action-link";
import { PageShell } from "@/components/shared/page-shell";
import { locationContent, nearestLandmarks } from "@/lib/location-content";
import { createPageMetadata } from "@/lib/seo";

import "./location.css";

export const metadata = createPageMetadata({
  title: "Location",
  description:
    "Explore brochure-backed distances, a location illustration and clear directions context for Glitz Pride near Thrissur.",
  path: "/location",
  image: "/media/glitz-pride/location-map.jpg",
});

export default function LocationPage() {
  return (
    <main className="location-page">
      <section className="location-hero" aria-labelledby="location-title">
        <Image
          src="/media/glitz-pride/location-map.jpg"
          alt="Illustrative brochure map showing Glitz Pride near Amala Nagar and Peramangalam"
          fill
          priority
          loading="eager"
          sizes="100vw"
        />
        <div className="location-hero__shade" />
        <PageShell className="location-hero__copy">
          <p className="eyebrow">Well connected</p>
          <h1 id="location-title">
            Everything within <em>easy reach.</em>
          </h1>
          <p>
            A brochure-backed view of the neighbourhood around Amala Nagar, with
            distances kept separate from live journey times.
          </p>
          <ActionLink href="#location-overview" inverse>
            Explore the location
          </ActionLink>
        </PageShell>
      </section>

      <section
        className="location-overview"
        id="location-overview"
        aria-labelledby="location-overview-title"
      >
        <PageShell className="location-overview__grid">
          <div className="location-overview__map">
            <Image
              src="/media/glitz-pride/location-map.jpg"
              alt="Brochure location illustration with roads and nearby place labels"
              fill
              sizes="(max-width: 800px) 100vw, 56vw"
            />
            <span>Illustrative brochure map · not a live navigation map</span>
          </div>
          <div className="location-overview__copy">
            <p className="eyebrow">The address reference</p>
            <h2 id="location-overview-title">
              Arrive with the context in hand.
            </h2>
            <address>{locationContent.address}</address>
            <dl>
              <div>
                <dt>Latitude</dt>
                <dd>{locationContent.coordinates.latitude.toFixed(6)}</dd>
              </div>
              <div>
                <dt>Longitude</dt>
                <dd>{locationContent.coordinates.longitude.toFixed(6)}</dd>
              </div>
              <div>
                <dt>Coordinate status</dt>
                <dd>Owner verification pending</dd>
              </div>
            </dl>
            <a
              className="location-directions-link"
              href={locationContent.directionsUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open directions <span aria-hidden="true">↗</span>
            </a>
            <p className="location-overview__note">
              Confirm the destination pin and current road access before
              travelling. The external provider calculates live routes and
              journey times.
            </p>
          </div>
        </PageShell>
      </section>

      <section className="nearest" aria-labelledby="nearest-title">
        <PageShell>
          <header className="nearest__header">
            <div>
              <p className="eyebrow">Closest brochure references</p>
              <h2 id="nearest-title">Three places close to home.</h2>
            </div>
            <p>
              These are printed distances, not route measurements or travel
              times. Verify each journey with a current mapping service.
            </p>
          </header>
          <div className="nearest__grid">
            {nearestLandmarks.map((landmark) => (
              <article key={landmark.name}>
                <p>{landmark.label}</p>
                <strong>
                  {landmark.distanceKm}
                  <small> km</small>
                </strong>
                <h3>{landmark.name}</h3>
                <span>Live travel time not published</span>
              </article>
            ))}
          </div>
        </PageShell>
      </section>

      <section className="landmarks" aria-labelledby="landmarks-title">
        <PageShell>
          <header className="landmarks__header">
            <div>
              <p className="eyebrow">Around the neighbourhood</p>
              <h2 id="landmarks-title">Filter all brochure distances.</h2>
            </div>
            <p>
              Distances are reproduced from the official brochure. The route,
              starting point, measurement method and current accuracy were not
              supplied.
            </p>
          </header>
          <LandmarkDirectory />
        </PageShell>
      </section>

      <section
        className="location-confirmation"
        aria-labelledby="location-confirmation-title"
      >
        <PageShell className="location-confirmation__grid">
          <div>
            <p className="eyebrow">Plan the visit</p>
            <h2 id="location-confirmation-title">Verify the final stretch.</h2>
          </div>
          <div>
            <p>{locationContent.publicationNote}</p>
            <ActionLink href="/contact#schedule-visit">
              Arrange a guided visit
            </ActionLink>
          </div>
        </PageShell>
      </section>

      <section className="location-next" aria-labelledby="location-next-title">
        <PageShell>
          <div>
            <p className="eyebrow">Continue exploring</p>
            <h2 id="location-next-title">See the community in context.</h2>
          </div>
          <ActionLink href="/master-plan" inverse>
            Explore the master plan
          </ActionLink>
        </PageShell>
      </section>
    </main>
  );
}
