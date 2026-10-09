"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { masterPlanPoints } from "@/lib/master-plan-content";

export function MasterPlanViewer() {
  const [selectedId, setSelectedId] = useState<string>(masterPlanPoints[0].id);
  const selected =
    masterPlanPoints.find((point) => point.id === selectedId) ??
    masterPlanPoints[0];

  return (
    <div className="plan-viewer">
      <div className="plan-viewer__canvas">
        <Image
          src="/media/glitz-pride/hero-villa.png"
          alt="Illustrative aerial brochure rendering of the villa community"
          fill
          sizes="(max-width: 900px) 100vw, 72vw"
          quality={70}
        />
        <div className="plan-viewer__shade" />
        {masterPlanPoints.map((point) => (
          <button
            key={point.id}
            type="button"
            className="plan-hotspot"
            data-active={point.id === selected.id || undefined}
            style={{
              left: `${point.position.x}%`,
              top: `${point.position.y}%`,
            }}
            aria-label={`Show ${point.name}`}
            aria-pressed={point.id === selected.id}
            aria-controls="plan-detail"
            onClick={() => setSelectedId(point.id)}
          >
            <span>{point.number}</span>
          </button>
        ))}
        <p className="plan-viewer__image-note">
          Illustrative brochure rendering · points are approximate references
        </p>
      </div>

      <aside className="plan-detail" id="plan-detail" aria-live="polite">
        <div className="plan-detail__index">
          <span>{selected.number}</span>
          <span>{selected.category}</span>
        </div>
        <h2>{selected.name}</h2>
        <p>{selected.description}</p>
        <p className="plan-detail__note">{selected.note}</p>
        <Link href={selected.href}>
          {selected.action} <span aria-hidden="true">→</span>
        </Link>
      </aside>

      <ol className="plan-index" aria-label="Master plan reference points">
        {masterPlanPoints.map((point) => (
          <li key={point.id}>
            <button
              type="button"
              data-active={point.id === selected.id || undefined}
              aria-pressed={point.id === selected.id}
              onClick={() => setSelectedId(point.id)}
            >
              <span>{point.number}</span>
              <span>{point.name}</span>
              <small>{point.category}</small>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
