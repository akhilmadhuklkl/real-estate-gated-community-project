import Image from "next/image";

import { MasterPlanViewer } from "@/components/master-plan/master-plan-viewer";
import { ActionLink } from "@/components/shared/action-link";
import { PageShell } from "@/components/shared/page-shell";
import { masterPlanPoints } from "@/lib/master-plan-content";
import { createPageMetadata } from "@/lib/seo";

import "./master-plan.css";

export const metadata = createPageMetadata({
  title: "Master plan",
  description:
    "Explore an accessible, brochure-backed aerial reference for the Glitz Pride villa community.",
  path: "/master-plan",
});

export default function MasterPlanPage() {
  return (
    <main className="master-plan-page">
      <section className="master-plan-hero" aria-labelledby="master-plan-title">
        <div className="master-plan-hero__image">
          <Image
            src="/media/glitz-pride/hero-villa.png"
            alt="Aerial brochure rendering of the villa community"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="master-plan-hero__shade" />
        <PageShell className="master-plan-hero__copy">
          <p className="eyebrow">The community from above</p>
          <h1 id="master-plan-title">
            A place designed <em>to feel connected.</em>
          </h1>
          <p>
            Explore the official brochure aerial through accessible reference
            points for residences, landscape, arrival and shared life.
          </p>
          <ActionLink href="#interactive-plan" inverse>
            Explore the plan
          </ActionLink>
        </PageShell>
      </section>

      <section className="master-plan-intro" aria-labelledby="plan-intro-title">
        <PageShell className="master-plan-intro__grid">
          <div>
            <p className="eyebrow">An illustrative overview</p>
            <h2 id="plan-intro-title">
              Understand the setting. <em>Keep the unknowns visible.</em>
            </h2>
          </div>
          <div>
            <p>
              The aerial provides a useful visual orientation, but it is not a
              surveyed or approved master-plan drawing. Reference points are
              approximate and should not be used to determine plot boundaries,
              ownership, dimensions, availability or legal access.
            </p>
            <dl>
              <div>
                <dt>{masterPlanPoints.length}</dt>
                <dd>accessible reference points</dd>
              </div>
              <div>
                <dt>Unknown</dt>
                <dd>plot availability</dd>
              </div>
              <div>
                <dt>Pending</dt>
                <dd>plan approval</dd>
              </div>
            </dl>
          </div>
        </PageShell>
      </section>

      <section
        className="interactive-plan"
        id="interactive-plan"
        aria-labelledby="viewer-title"
      >
        <PageShell>
          <header className="interactive-plan__header">
            <div>
              <p className="eyebrow">Interactive reference</p>
              <h2 id="viewer-title">Choose a point to explore.</h2>
            </div>
            <p>
              Select a numbered point on the image or use the list below it.
              Both controls open the same information.
            </p>
          </header>
          <MasterPlanViewer />
        </PageShell>
      </section>

      <section
        className="plan-confirmation"
        aria-labelledby="confirmation-title"
      >
        <PageShell className="plan-confirmation__grid">
          <div>
            <p className="eyebrow">Before making a decision</p>
            <h2 id="confirmation-title">Ask for the current approved plan.</h2>
          </div>
          <div>
            <p>
              Confirm the latest sanctioned layout, plot schedule, common-area
              ownership, construction progress, availability and any plan
              revisions directly with the property owner and relevant advisers.
            </p>
            <ActionLink href="/contact#schedule-visit">
              Request a plan discussion
            </ActionLink>
          </div>
        </PageShell>
      </section>

      <section
        className="master-plan-next"
        aria-labelledby="master-plan-next-title"
      >
        <PageShell>
          <div>
            <p className="eyebrow">Continue exploring</p>
            <h2 id="master-plan-next-title">
              Step inside the villa reference.
            </h2>
          </div>
          <ActionLink href="/villas" inverse>
            Explore the villas
          </ActionLink>
        </PageShell>
      </section>
    </main>
  );
}
