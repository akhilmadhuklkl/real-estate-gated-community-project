import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ActionLink } from "@/components/shared/action-link";
import { PageShell } from "@/components/shared/page-shell";
import {
  getVillaById,
  villaCatalogue,
  villaDetailMedia,
  villaSpecifications,
} from "@/lib/villas-content";
import { createPageMetadata } from "@/lib/seo";

import "./villa-detail.css";

type Props = { params: Promise<{ villaId: string }> };

export function generateStaticParams() {
  return villaCatalogue.map((villa) => ({ villaId: villa.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const villa = getVillaById((await params).villaId);
  return villa
    ? createPageMetadata({
        title: villa.name,
        description: `${villa.totalAreaSqFt.toLocaleString("en-IN")} sq ft brochure reference villa.`,
        path: `/villas/${villa.id}`,
        image: villa.image,
      })
    : { title: "Villa not found" };
}

export default async function VillaDetailPage({ params }: Props) {
  const villa = getVillaById((await params).villaId);
  if (!villa) notFound();

  return (
    <main className="villa-detail">
      <section className="villa-detail__hero" aria-labelledby="villa-title">
        <Image
          src={villa.image}
          alt={villa.imageAlt}
          fill
          priority
          sizes="100vw"
        />
        <div className="villa-detail__shade" />
        <PageShell className="villa-detail__hero-copy">
          <Link href="/villas" className="villa-detail__back">
            ← All villas
          </Link>
          <p className="eyebrow">Official brochure reference</p>
          <h1 id="villa-title">{villa.name}</h1>
          <div className="villa-detail__hero-meta">
            <strong>{villa.totalAreaSqFt.toLocaleString("en-IN")}</strong>
            <span>sq ft across {villa.levels} levels</span>
          </div>
        </PageShell>
      </section>

      <section
        className="villa-detail__overview"
        aria-labelledby="overview-title"
      >
        <PageShell className="villa-detail__overview-grid">
          <div>
            <p className="eyebrow">The residence</p>
            <h2 id="overview-title">
              Designed around air, light and daily rhythm.
            </h2>
          </div>
          <div>
            <p>
              This page presents the villa plan currently documented in the
              official brochure. It is a reference record, not a statement of
              current sale inventory.
            </p>
            <dl>
              {villa.floorAreas.map((floor) => (
                <div key={floor.floor}>
                  <dt>{floor.floor}</dt>
                  <dd>{floor.area.toLocaleString("en-IN")} sq ft</dd>
                </div>
              ))}
            </dl>
            <p className="villa-detail__notice">
              Bedrooms, bathrooms, price, availability, plan scale and final
              dimensions require owner and design-team confirmation.
            </p>
          </div>
        </PageShell>
      </section>

      <section className="villa-gallery" aria-label="Villa brochure gallery">
        <PageShell className="villa-gallery__grid">
          {villaDetailMedia.map((media, index) => (
            <figure key={media.src} data-large={index === 0 || undefined}>
              <Image
                src={media.src}
                alt={media.alt}
                fill
                sizes={
                  index === 0
                    ? "(max-width: 800px) 100vw, 64vw"
                    : "(max-width: 800px) 100vw, 32vw"
                }
              />
              <figcaption>
                {String(index + 1).padStart(2, "0")} · Brochure visual
              </figcaption>
            </figure>
          ))}
        </PageShell>
      </section>

      <section className="villa-plans" aria-labelledby="plans-title">
        <PageShell>
          <header>
            <p className="eyebrow">Floor plans</p>
            <h2 id="plans-title">Two considered levels.</h2>
            <p>
              Illustrative brochure plans. Confirm identity, scale, dimensions,
              room labels and legal disclaimers before relying on them.
            </p>
          </header>
          <div className="villa-plans__grid">
            <figure>
              <Image
                src="/media/glitz-pride/ground-floor.jpg"
                alt="Ground-floor brochure plan"
                fill
                sizes="(max-width: 800px) 100vw, 50vw"
              />
              <figcaption>Ground floor · 1,410 sq ft</figcaption>
            </figure>
            <figure>
              <Image
                src="/media/glitz-pride/first-floor.jpg"
                alt="First-floor brochure plan"
                fill
                sizes="(max-width: 800px) 100vw, 50vw"
              />
              <figcaption>First floor · 810 sq ft</figcaption>
            </figure>
          </div>
        </PageShell>
      </section>

      <section className="villa-materials" aria-labelledby="materials-title">
        <PageShell>
          <header>
            <p className="eyebrow">Brochure specifications</p>
            <h2 id="materials-title">Material choices, clearly referenced.</h2>
            <p>
              Brands, models, substitutions and contractual specifications
              require current confirmation.
            </p>
          </header>
          <div className="villa-materials__grid">
            {villaSpecifications.map((spec, index) => (
              <article key={spec.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{spec.category}</h3>
                <ul>
                  {spec.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </PageShell>
      </section>

      <section className="villa-detail__enquiry">
        <PageShell>
          <div>
            <p className="eyebrow">Discuss the reference plan</p>
            <h2>Explore how this plan could fit your needs.</h2>
          </div>
          <ActionLink href="/contact#schedule-visit" inverse>
            Request a private discussion
          </ActionLink>
        </PageShell>
      </section>
    </main>
  );
}
