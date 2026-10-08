import Image from "next/image";

import { MediaGallery } from "@/components/gallery/media-gallery";
import { ActionLink } from "@/components/shared/action-link";
import { PageShell } from "@/components/shared/page-shell";
import { galleryItems, pendingCollections } from "@/lib/gallery-content";
import { createPageMetadata } from "@/lib/seo";

import "./gallery.css";

export const metadata = createPageMetadata({
  title: "Gallery",
  description:
    "Browse brochure-derived Glitz Pride architecture, landscape, community and floor-plan media with clear source notes.",
  path: "/gallery",
  image: "/media/glitz-pride/villas.jpg",
});

export default function GalleryPage() {
  return (
    <main className="gallery-page">
      <section className="gallery-hero" aria-labelledby="gallery-title">
        <Image
          src="/media/glitz-pride/villas.jpg"
          alt="Brochure rendering of contemporary villas in a landscaped setting"
          fill
          priority
          sizes="100vw"
        />
        <div className="gallery-hero__shade" />
        <PageShell className="gallery-hero__copy">
          <p className="eyebrow">The gallery</p>
          <h1 id="gallery-title">
            A closer look at <em>the life imagined here.</em>
          </h1>
          <p>
            Explore {galleryItems.length} visuals drawn from the official
            brochure. Every image is labelled by source and remains subject to
            owner confirmation before production publication.
          </p>
          <ActionLink href="#media-gallery" inverse>
            Browse the collection
          </ActionLink>
        </PageShell>
      </section>

      <section className="gallery-intro" aria-labelledby="gallery-intro-title">
        <PageShell className="gallery-intro__grid">
          <div>
            <p className="eyebrow">A visual notebook</p>
            <h2 id="gallery-intro-title">
              Renderings, plans and <em>landscape references.</em>
            </h2>
          </div>
          <div>
            <p>
              This gallery separates what is available from what is still
              needed. Brochure visuals are not dated site photographs and should
              not be read as evidence of construction progress, availability or
              final delivery.
            </p>
            <dl>
              <div>
                <dt>{galleryItems.length}</dt>
                <dd>available visuals</dd>
              </div>
              <div>
                <dt>5</dt>
                <dd>media categories</dd>
              </div>
              <div>
                <dt>Pending</dt>
                <dd>publication approval</dd>
              </div>
            </dl>
          </div>
        </PageShell>
      </section>

      <section
        className="gallery-collection"
        id="media-gallery"
        aria-labelledby="gallery-collection-title"
      >
        <PageShell>
          <header className="gallery-collection__header">
            <div>
              <p className="eyebrow">The collection</p>
              <h2 id="gallery-collection-title">Choose your view.</h2>
            </div>
            <p>
              Select a category, then open any visual for its source, date
              status and publication note.
            </p>
          </header>
          <MediaGallery />
        </PageShell>
      </section>

      <section className="gallery-pending" aria-labelledby="pending-title">
        <PageShell>
          <header>
            <p className="eyebrow">What comes next</p>
            <h2 id="pending-title">Collections awaiting approved material.</h2>
          </header>
          <div className="gallery-pending__grid">
            {pendingCollections.map((collection, index) => (
              <article key={collection.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{collection.title}</h3>
                <p>{collection.description}</p>
              </article>
            ))}
          </div>
        </PageShell>
      </section>

      <section className="gallery-next" aria-labelledby="gallery-next-title">
        <PageShell>
          <div>
            <p className="eyebrow">Continue exploring</p>
            <h2 id="gallery-next-title">
              See how the community comes together.
            </h2>
          </div>
          <ActionLink href="/master-plan" inverse>
            Explore the master plan
          </ActionLink>
        </PageShell>
      </section>
    </main>
  );
}
