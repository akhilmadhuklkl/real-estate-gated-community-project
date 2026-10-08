import Image from "next/image";

import { VillaCatalogue } from "@/components/villas/villa-catalogue";
import { PageShell } from "@/components/shared/page-shell";
import { villaCatalogue } from "@/lib/villas-content";
import { createPageMetadata } from "@/lib/seo";

import "./villas.css";

export const metadata = createPageMetadata({
  title: "Villas",
  description: "Explore brochure-backed Glitz Pride villa plans and areas.",
  path: "/villas",
  image: "/media/glitz-pride/villa.jpg",
});

export default function VillasPage() {
  return (
    <main className="villas-page">
      <section className="villas-hero" aria-labelledby="villas-title">
        <Image
          src="/media/glitz-pride/villa.jpg"
          alt="Contemporary villa rendering from the development brochure"
          fill
          priority
          sizes="100vw"
        />
        <div className="villas-hero__shade" />
        <PageShell className="villas-hero__content">
          <p className="eyebrow">The residences</p>
          <h1 id="villas-title">
            Made for the way <em>you want to live.</em>
          </h1>
          <p>
            Explore the currently modelled brochure plan. Additional villa types
            will appear only after their names, dimensions, configuration and
            availability are approved.
          </p>
          <a href="#catalogue">
            Browse the catalogue <span aria-hidden="true">↓</span>
          </a>
        </PageShell>
      </section>

      <section
        className="villas-catalogue"
        id="catalogue"
        aria-labelledby="catalogue-title"
      >
        <PageShell>
          <header className="villas-catalogue__heading">
            <div>
              <p className="eyebrow">Brochure-backed plans</p>
              <h2 id="catalogue-title">Find the right starting point.</h2>
            </div>
            <p>
              Search and filter the governed catalogue. Unknown room counts,
              commercial details and availability remain explicitly unconfirmed.
            </p>
          </header>
          <VillaCatalogue villas={villaCatalogue} />
        </PageShell>
      </section>

      <section className="plan-preview" aria-labelledby="plan-preview-title">
        <PageShell className="plan-preview__grid">
          <div>
            <p className="eyebrow">Across two levels</p>
            <h2 id="plan-preview-title">
              A plan that separates shared life from quieter moments.
            </h2>
            <p>
              The brochure presents 1,410 sq ft on the ground floor and 810 sq
              ft on the first floor. Plan identity, scale, dimensions and
              publication clearance remain subject to confirmation.
            </p>
          </div>
          <figure>
            <Image
              src="/media/glitz-pride/ground-floor.jpg"
              alt="Ground-floor brochure plan labelled 1,410 square feet"
              fill
              sizes="(max-width: 800px) 100vw, 44vw"
            />
            <figcaption>Ground floor · 1,410 sq ft</figcaption>
          </figure>
          <figure>
            <Image
              src="/media/glitz-pride/first-floor.jpg"
              alt="First-floor brochure plan labelled 810 square feet"
              fill
              sizes="(max-width: 800px) 100vw, 44vw"
            />
            <figcaption>First floor · 810 sq ft</figcaption>
          </figure>
        </PageShell>
      </section>
    </main>
  );
}
