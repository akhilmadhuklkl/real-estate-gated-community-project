"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";

import type { AssistantPreview } from "@/lib/assistant-preview";
import {
  LEAD_DRAFT_STORAGE_KEY,
  leadDraftSchema,
  type LeadQualification,
} from "../../lib/lead-qualification";
import { buildHumanHandoff } from "../../lib/human-handoff";

function PreviewImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className="assistant-preview__media-fallback"
        role="img"
        aria-label={alt}
      >
        <span aria-hidden="true">GP</span>
        <p>Visual temporarily unavailable</p>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 700px) 100vw, 46vw"
      onError={() => setFailed(true)}
    />
  );
}

function PanelHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="assistant-preview__header">
      <p>{eyebrow}</p>
      <h3>{title}</h3>
    </header>
  );
}

function EnquirySummaryPanel({
  qualification,
  href,
}: {
  qualification: LeadQualification;
  href: "/contact#schedule-visit";
}) {
  const [draft, setDraft] = useState(qualification.draft);
  const [cleared, setCleared] = useState(false);
  const handoff = buildHumanHandoff(draft.handoffRoute);

  function continueToForm() {
    const parsed = leadDraftSchema.safeParse(draft);
    if (parsed.success) {
      sessionStorage.setItem(
        LEAD_DRAFT_STORAGE_KEY,
        JSON.stringify(parsed.data),
      );
    }
  }

  function clearSummary() {
    sessionStorage.removeItem(LEAD_DRAFT_STORAGE_KEY);
    setDraft({
      intent: "general-enquiry",
      villaInterest: "",
      message: "",
      preferredDate: "",
      timeWindow: "any-time",
      handoffRoute: "sales",
    });
    setCleared(true);
  }

  return (
    <section
      className="assistant-preview__content assistant-preview__enquiry"
      aria-label="Enquiry summary"
    >
      <PanelHeader eyebrow="Your review" title="Enquiry summary" />
      <p className="assistant-preview__privacy">
        {qualification.privacyNotice}
      </p>
      <article
        className="assistant-preview__handoff"
        aria-label="Handoff route"
      >
        <p>Human ownership</p>
        <h4>{handoff.routeLabel}</h4>
        <strong>{handoff.ownerLabel}</strong>
        <span>{handoff.reason}</span>
        <dl>
          <div>
            <dt>Working hours</dt>
            <dd>{handoff.workingHours}</dd>
          </div>
          <div>
            <dt>Response time</dt>
            <dd>{handoff.serviceLevel}</dd>
          </div>
        </dl>
      </article>
      <div className="assistant-preview__summary-status">
        <div>
          <strong>Captured</strong>
          <ul>
            {qualification.captured.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>Needed in the form</strong>
          <ul>
            {qualification.missing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <fieldset className="assistant-preview__summary-fields">
        <legend>Review or correct before continuing</legend>
        <label>
          Request type
          <select
            value={draft.intent}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                intent: event.target.value as typeof current.intent,
              }))
            }
          >
            <option value="general-enquiry">General enquiry</option>
            <option value="site-visit">Site visit</option>
          </select>
        </label>
        <label>
          Handoff route
          <select
            value={draft.handoffRoute}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                handoffRoute: event.target.value as typeof current.handoffRoute,
              }))
            }
          >
            <option value="sales">Sales enquiry</option>
            <option value="visit">Visit coordination</option>
            <option value="architecture">Architecture question</option>
            <option value="support">Request support</option>
          </select>
        </label>
        <label>
          Villa interest
          <select
            value={draft.villaInterest}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                villaInterest: event.target.value,
              }))
            }
          >
            <option value="">No specific villa selected</option>
            <option value="Brochure villa plan">Brochure villa plan</option>
          </select>
        </label>
        {draft.intent === "site-visit" ? (
          <>
            <label>
              Preferred date
              <input
                type="date"
                value={draft.preferredDate}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    preferredDate: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Preferred time
              <select
                value={draft.timeWindow}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    timeWindow: event.target.value as typeof current.timeWindow,
                  }))
                }
              >
                <option value="any-time">Any time</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
              </select>
            </label>
          </>
        ) : null}
        <label className="assistant-preview__summary-notes">
          Relevant context
          <textarea
            rows={5}
            maxLength={1000}
            value={draft.message}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                message: event.target.value,
              }))
            }
          />
        </label>
      </fieldset>
      {cleared ? (
        <p className="assistant-preview__cleared" role="status">
          Summary cleared. Nothing will be carried to the enquiry form.
        </p>
      ) : null}
      <div className="assistant-preview__summary-actions">
        {handoff.whatsappHref ? (
          <a
            className="assistant-preview__action"
            href={handoff.whatsappHref}
            target="_blank"
            rel="noreferrer"
          >
            Review WhatsApp draft <span aria-hidden="true">↗</span>
          </a>
        ) : null}
        <Link
          className="assistant-preview__action"
          href={href}
          onClick={continueToForm}
        >
          Continue to enquiry form <span aria-hidden="true">→</span>
        </Link>
        <button type="button" onClick={clearSummary}>
          Clear summary
        </button>
      </div>
      <p className="assistant-preview__note">
        Continuing does not submit anything. The form requires your review and
        explicit consent, and this preview does not confirm delivery.
      </p>
      <ul className="assistant-preview__handoff-limits">
        {handoff.limitations.map((limitation) => (
          <li key={limitation}>{limitation}</li>
        ))}
      </ul>
    </section>
  );
}

export function DynamicPreviewPanel({
  preview,
}: {
  preview: AssistantPreview;
}) {
  switch (preview.kind) {
    case "villa":
      return (
        <section
          className="assistant-preview__content"
          aria-label="Villa details"
        >
          <PanelHeader eyebrow="Residence" title={preview.villa.name} />
          <div className="assistant-preview__hero">
            <PreviewImage
              src={preview.villa.image}
              alt={preview.villa.imageAlt}
            />
          </div>
          <dl className="assistant-preview__facts">
            <div>
              <dt>Total area</dt>
              <dd>
                {preview.villa.totalAreaSqFt.toLocaleString("en-IN")} sq ft
              </dd>
            </div>
            <div>
              <dt>Levels</dt>
              <dd>{preview.villa.levels}</dd>
            </div>
            <div>
              <dt>Bedrooms</dt>
              <dd>{preview.villa.bedrooms ?? "To confirm"}</dd>
            </div>
          </dl>
          <p className="assistant-preview__note">
            {preview.villa.publicationNote}
          </p>
          <Link className="assistant-preview__action" href={preview.href}>
            View residence details <span aria-hidden="true">→</span>
          </Link>
        </section>
      );
    case "floor-plan":
      return (
        <section
          className="assistant-preview__content"
          aria-label="Floor plans"
        >
          <PanelHeader
            eyebrow={preview.villa.name}
            title="Planning references"
          />
          <div className="assistant-preview__plan-grid">
            {preview.media.map((item) => (
              <article key={item.id}>
                <div className="assistant-preview__plan">
                  <PreviewImage src={item.src} alt={item.alt} />
                </div>
                <h4>{item.title}</h4>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </section>
      );
    case "gallery":
      return (
        <section
          className="assistant-preview__content"
          aria-label="Project gallery"
        >
          <PanelHeader eyebrow="Gallery" title="A closer look" />
          <div className="assistant-preview__gallery">
            {preview.media.map((item) => (
              <figure key={item.id}>
                <div>
                  <PreviewImage src={item.src} alt={item.alt} />
                </div>
                <figcaption>{item.title}</figcaption>
              </figure>
            ))}
          </div>
          <Link className="assistant-preview__action" href={preview.href}>
            Explore the gallery <span aria-hidden="true">→</span>
          </Link>
        </section>
      );
    case "map":
      return (
        <section
          className="assistant-preview__content"
          aria-label="Location details"
        >
          <PanelHeader eyebrow="Location" title="Everything within reach" />
          <div
            className="assistant-preview__map"
            aria-label="Illustrative landmark distance diagram"
          >
            <span className="assistant-preview__map-home">GP</span>
            {preview.landmarks.map((landmark, index) => (
              <span
                key={landmark.id}
                className="assistant-preview__map-point"
                style={{ "--point-index": index } as CSSProperties}
              >
                {index + 1}
              </span>
            ))}
          </div>
          <p className="assistant-preview__address">{preview.address}</p>
          <ol className="assistant-preview__landmarks">
            {preview.landmarks.map((landmark) => (
              <li key={landmark.id}>
                <span>{landmark.name}</span>
                <strong>{landmark.distanceKm} km</strong>
              </li>
            ))}
          </ol>
          <div className="assistant-preview__actions">
            <a href={preview.directionsUrl} target="_blank" rel="noreferrer">
              Open directions
            </a>
            <Link href={preview.href}>Location details</Link>
          </div>
        </section>
      );
    case "comparison":
      return (
        <section
          className="assistant-preview__content"
          aria-label="Villa comparison"
        >
          <PanelHeader eyebrow="Compare" title="Villa plans at a glance" />
          <div className="assistant-preview__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Detail</th>
                  {preview.villas.map((villa) => (
                    <th key={villa.id}>{villa.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row) => (
                  <tr key={row.id}>
                    <th>{row.label}</th>
                    {row.values.map((value, index) => (
                      <td key={`${row.id}-${preview.villas[index]?.id}`}>
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      );
    case "contact":
      return (
        <section
          className="assistant-preview__content"
          aria-label="Contact reference cards"
        >
          <PanelHeader
            eyebrow="Approved directory"
            title="Continue with a person"
          />
          <p className="assistant-preview__privacy">
            {preview.directory.directoryNotice}
          </p>
          <div className="assistant-preview__contact-list">
            {preview.directory.cards.map((card) => (
              <article
                key={card.id}
                className="assistant-preview__contact-card"
              >
                <div
                  className="assistant-preview__contact-avatar"
                  aria-hidden="true"
                >
                  GP
                </div>
                <div>
                  <span>Department contact</span>
                  <h4>{card.displayName}</h4>
                  <strong>{card.role}</strong>
                </div>
                <dl>
                  <div>
                    <dt>Languages</dt>
                    <dd>{card.languages.join(", ")}</dd>
                  </div>
                  <div>
                    <dt>Working hours</dt>
                    <dd>{card.workingHours}</dd>
                  </div>
                  <div>
                    <dt>Response time</dt>
                    <dd>{card.responseTime}</dd>
                  </div>
                </dl>
                {card.channels.map((channel) => (
                  <a
                    key={channel.type}
                    href={channel.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {channel.label} <span aria-hidden="true">↗</span>
                  </a>
                ))}
                <p className="assistant-preview__contact-source">
                  Source: {card.source.label} · {card.source.approvalId} ·
                  reviewed {card.source.reviewedOn}
                </p>
                <ul>
                  {card.limitations.map((limitation) => (
                    <li key={limitation}>{limitation}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          {preview.directory.unavailableChannels.length ? (
            <p className="assistant-preview__contact-unavailable" role="status">
              No approved {preview.directory.unavailableChannels.join(" or ")}{" "}
              contact card is available yet.
            </p>
          ) : null}
          <Link className="assistant-preview__action" href={preview.href}>
            All contact options <span aria-hidden="true">→</span>
          </Link>
        </section>
      );
    case "document": {
      const href = preview.page
        ? `${preview.href}#page=${preview.page}`
        : preview.href;
      return (
        <section
          className="assistant-preview__content assistant-preview__document"
          aria-label="Project document"
        >
          <PanelHeader eyebrow="Official reference" title={preview.title} />
          <div className="assistant-preview__document-mark" aria-hidden="true">
            <span>PDF</span>
            <strong>GP</strong>
          </div>
          <p>
            {preview.page
              ? `Open the source at page ${preview.page}.`
              : "Read the approved project brochure."}
          </p>
          <a
            className="assistant-preview__action"
            href={href}
            target="_blank"
            rel="noreferrer"
          >
            Open brochure <span aria-hidden="true">→</span>
          </a>
        </section>
      );
    }
    case "recommendation": {
      const { recommendation } = preview;
      return (
        <section
          className="assistant-preview__content assistant-preview__recommendation"
          aria-label="Villa recommendation"
        >
          <PanelHeader
            eyebrow="Preference match"
            title={
              recommendation.status === "needs-preferences"
                ? "Tell us what matters"
                : "An explained match"
            }
          />
          {recommendation.villa ? (
            <article className="assistant-preview__recommendation-villa">
              <div className="assistant-preview__recommendation-image">
                <PreviewImage
                  src={recommendation.villa.image}
                  alt={recommendation.villa.imageAlt}
                />
              </div>
              <div>
                <p>Only approved catalogue option</p>
                <h4>{recommendation.villa.name}</h4>
                <span>
                  {recommendation.villa.totalAreaSqFt.toLocaleString("en-IN")}{" "}
                  sq ft · {recommendation.villa.levels} levels
                </span>
              </div>
            </article>
          ) : null}
          {recommendation.clarification ? (
            <p className="assistant-preview__clarification">
              {recommendation.clarification}
            </p>
          ) : null}
          {recommendation.criteria.length ? (
            <ul className="assistant-preview__criteria">
              {recommendation.criteria.map((criterion) => (
                <li key={criterion.id} data-outcome={criterion.outcome}>
                  <span aria-hidden="true">
                    {criterion.outcome === "match"
                      ? "✓"
                      : criterion.outcome === "not-match"
                        ? "×"
                        : "?"}
                  </span>
                  <div>
                    <strong>{criterion.label}</strong>
                    <small>{criterion.requested}</small>
                    <p>{criterion.explanation}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="assistant-preview__limitations">
            <h4>Important limitations</h4>
            <ul>
              {recommendation.limitations.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          </div>
          <Link className="assistant-preview__action" href={preview.href}>
            Confirm changing details <span aria-hidden="true">→</span>
          </Link>
        </section>
      );
    }
    case "enquiry-summary":
      return (
        <EnquirySummaryPanel
          key={preview.id}
          qualification={preview.qualification}
          href={preview.href}
        />
      );
  }
}
