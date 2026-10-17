"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";

import type { AssistantPreview } from "@/lib/assistant-preview";

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
          aria-label="Contact options"
        >
          <PanelHeader eyebrow="Talk to us" title="Continue with a person" />
          <div className="assistant-preview__contact-list">
            {preview.actions.calls.map((call) => (
              <a key={call.href} href={call.href}>
                <span>Call</span>
                <strong>{call.label}</strong>
              </a>
            ))}
            {preview.actions.email ? (
              <a href={preview.actions.email.href}>
                <span>Email</span>
                <strong>{preview.actions.email.label}</strong>
              </a>
            ) : null}
            {preview.actions.whatsapp.enabled ? (
              <a
                href={preview.actions.whatsapp.href ?? undefined}
                target="_blank"
                rel="noreferrer"
              >
                <span>Message</span>
                <strong>WhatsApp</strong>
              </a>
            ) : null}
          </div>
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
  }
}
