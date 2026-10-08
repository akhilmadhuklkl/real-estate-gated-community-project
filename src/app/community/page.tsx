import Image from "next/image";

import { ActionLink } from "@/components/shared/action-link";
import { PageShell } from "@/components/shared/page-shell";
import { communityContent } from "@/lib/community-content";
import { project } from "@/lib/project-content";
import { createPageMetadata } from "@/lib/seo";

import "./community.css";

export const metadata = createPageMetadata({
  title: "Community",
  description:
    "Explore the brochure-backed architectural, landscape and shared-life vision for Glitz Pride.",
  path: "/community",
  image: "/media/glitz-pride/villas.jpg",
});

export default function CommunityPage() {
  return (
    <main className="community-page">
      <section className="community-hero" aria-labelledby="community-title">
        <div className="community-hero__image">
          <Image
            src="/media/glitz-pride/villas.jpg"
            alt="Brochure rendering of a landscaped villa community"
            fill
            priority
            sizes="(max-width: 800px) 100vw, 54vw"
          />
        </div>
        <div className="community-hero__copy">
          <p className="eyebrow">The complete vision</p>
          <h1 id="community-title">
            Nature&apos;s pet. <em>Owner&apos;s pride.</em>
          </h1>
          <p>{project.project.summary}</p>
          <ActionLink href="#principles">Explore the vision</ActionLink>
        </div>
      </section>

      <section
        className="community-intro"
        id="principles"
        aria-labelledby="principles-title"
      >
        <PageShell>
          <div className="community-intro__lead">
            <div>
              <p className="eyebrow">A neighbourhood in balance</p>
              <h2 id="principles-title">
                Close to nature. <em>Considered for everyday life.</em>
              </h2>
            </div>
            <p>
              The brochure describes a green setting shaped around natural air,
              daylight and a quieter relationship between each villa and its
              surroundings. These details remain subject to current owner and
              design-team confirmation.
            </p>
          </div>
          <div className="principle-grid">
            {communityContent.principles.map((principle) => (
              <article key={principle.number} className="principle-card">
                <span>
                  {principle.number} · {principle.label}
                </span>
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </article>
            ))}
          </div>
        </PageShell>
      </section>

      <section className="landscape-story" aria-labelledby="landscape-title">
        <div className="landscape-story__image">
          <Image
            src="/media/glitz-pride/greenery.jpg"
            alt="Green landscaping shown in the official development brochure"
            fill
            sizes="(max-width: 800px) 100vw, 55vw"
          />
          <span>Official brochure reference</span>
        </div>
        <div className="landscape-story__copy">
          <p className="eyebrow">The landscape story</p>
          <h2 id="landscape-title">
            Thoughtful from <em>ground to garden.</em>
          </h2>
          <p>
            Picturesque landscaping, shared growing space and indoor planting
            express a continuous connection with greenery. They describe the
            design direction, not a verified environmental certification.
          </p>
          <dl>
            <div>
              <dt>Design intent</dt>
              <dd>Natural ventilation and daylight</dd>
            </div>
            <div>
              <dt>Landscape</dt>
              <dd>Greenery and planted shared spaces</dd>
            </div>
            <div>
              <dt>Architect</dt>
              <dd>{communityContent.architect}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="shared-life" aria-labelledby="shared-life-title">
        <PageShell className="shared-life__grid">
          <div className="shared-life__heading">
            <p className="eyebrow">Beyond the front door</p>
            <h2 id="shared-life-title">
              Shared spaces for <em>everyday rituals.</em>
            </h2>
            <p>
              The following amenities are listed in the brochure. Their final
              scope, location and delivery status still require confirmation.
            </p>
          </div>
          <ol className="shared-life__list">
            {communityContent.sharedLife.map((amenity, index) => (
              <li key={amenity.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{amenity.name}</h3>
                  <p>{amenity.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </PageShell>
      </section>

      <section className="community-security" aria-labelledby="security-title">
        <PageShell className="community-security__grid">
          <div>
            <p className="eyebrow">A considered arrival</p>
            <h2 id="security-title">
              Privacy begins <em>at the threshold.</em>
            </h2>
          </div>
          <div>
            <p>
              {communityContent.security?.description ??
                "Security information is awaiting confirmation."}
            </p>
            <p className="community-security__note">
              Brochure statement only. Installed systems, operating procedures
              and delivery status have not yet been verified.
            </p>
            <ActionLink href="/amenities" inverse>
              Explore amenities
            </ActionLink>
          </div>
        </PageShell>
      </section>

      <section
        className="community-next"
        aria-labelledby="community-next-title"
      >
        <PageShell>
          <p className="eyebrow">Continue exploring</p>
          <h2 id="community-next-title">
            See how the vision <em>becomes a home.</em>
          </h2>
          <ActionLink href="/villas">Explore the villas</ActionLink>
        </PageShell>
      </section>
    </main>
  );
}
