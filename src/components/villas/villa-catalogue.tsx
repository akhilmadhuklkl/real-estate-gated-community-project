"use client";

import Image from "next/image";
import Link from "next/link";
import { type RefObject, useMemo, useRef, useState } from "react";

import {
  buildVillaComparisonRows,
  filterVillas,
  MAX_COMPARISON_VILLAS,
  type VillaCatalogueItem,
} from "@/lib/villas-content";

type AreaFilter = "all" | "under-2500" | "2500-plus";

export function VillaCatalogue({ villas }: { villas: VillaCatalogueItem[] }) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<AreaFilter>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const comparisonDialog = useRef<HTMLDialogElement>(null);
  const filtered = useMemo(
    () => filterVillas(villas, query, area),
    [villas, query, area],
  );

  function toggleComparison(id: string) {
    setSelected((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= MAX_COMPARISON_VILLAS) return current;
      return [...current, id];
    });
  }

  const selectedVillas = selected
    .map((id) => villas.find((villa) => villa.id === id))
    .filter((villa): villa is VillaCatalogueItem => Boolean(villa));
  const atComparisonLimit = selected.length >= MAX_COMPARISON_VILLAS;

  return (
    <div className="villa-explorer">
      <div className="villa-controls" aria-label="Villa catalogue filters">
        <label>
          <span>Search the catalogue</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, floor or area"
          />
        </label>
        <label>
          <span>Area</span>
          <select
            value={area}
            onChange={(event) => setArea(event.target.value as AreaFilter)}
          >
            <option value="all">All areas</option>
            <option value="under-2500">Under 2,500 sq ft</option>
            <option value="2500-plus">2,500 sq ft and above</option>
          </select>
        </label>
        <p aria-live="polite">
          <strong>{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "villa" : "villas"} shown
        </p>
      </div>

      {filtered.length ? (
        <div className="villa-results">
          {filtered.map((villa) => {
            const isSelected = selected.includes(villa.id);
            return (
              <article className="villa-card-full" key={villa.id}>
                <div className="villa-card-full__media">
                  <Image
                    src={villa.image}
                    alt={villa.imageAlt}
                    fill
                    sizes="(max-width: 800px) 100vw, 48vw"
                  />
                  <span>Official brochure reference</span>
                </div>
                <div className="villa-card-full__body">
                  <div className="villa-card-full__title">
                    <div>
                      <p className="eyebrow">Reference villa</p>
                      <h2>{villa.name}</h2>
                    </div>
                    <strong>
                      {villa.totalAreaSqFt.toLocaleString("en-IN")}
                    </strong>
                    <small>sq ft total</small>
                  </div>
                  <dl className="villa-specs">
                    <div>
                      <dt>Levels</dt>
                      <dd>{villa.levels}</dd>
                    </div>
                    <div>
                      <dt>Bedrooms</dt>
                      <dd>{villa.bedrooms ?? "To confirm"}</dd>
                    </div>
                    <div>
                      <dt>Bathrooms</dt>
                      <dd>{villa.bathrooms ?? "To confirm"}</dd>
                    </div>
                    <div>
                      <dt>Availability</dt>
                      <dd>
                        {villa.availability === "unknown"
                          ? "To confirm"
                          : villa.availability}
                      </dd>
                    </div>
                  </dl>
                  <div className="floor-breakdown">
                    {villa.floorAreas.map((floor) => (
                      <div key={floor.floor}>
                        <span>{floor.floor}</span>
                        <strong>
                          {floor.area.toLocaleString("en-IN")} sq ft
                        </strong>
                      </div>
                    ))}
                  </div>
                  <p className="villa-card-full__note">
                    {villa.publicationNote}
                  </p>
                  <div className="villa-card-full__actions">
                    <Link href={`/villas/${villa.id}`}>
                      View villa details <span aria-hidden="true">→</span>
                    </Link>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      disabled={!isSelected && atComparisonLimit}
                      aria-describedby="comparison-limit-note"
                      onClick={() => toggleComparison(villa.id)}
                    >
                      {isSelected
                        ? "Remove from comparison"
                        : "Add to comparison"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="villa-empty" role="status">
          <p className="eyebrow">No matching villas</p>
          <h2>Try another area or search term.</h2>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setArea("all");
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      {selected.length > 0 ? (
        <aside className="compare-tray" data-visible="true" aria-live="polite">
          <div>
            <strong>
              {selected.length} of {MAX_COMPARISON_VILLAS} selected
            </strong>
            <span>
              {selected.length < 2
                ? "Add another approved villa when available."
                : "Review the selected plans side by side."}
            </span>
          </div>
          <button
            type="button"
            onClick={() => comparisonDialog.current?.showModal()}
          >
            Review comparison
          </button>
        </aside>
      ) : null}

      <p className="sr-only" id="comparison-limit-note">
        You can compare up to {MAX_COMPARISON_VILLAS} villas.
      </p>

      <VillaComparisonDialog
        dialogRef={comparisonDialog}
        selectedVillas={selectedVillas}
        onRemove={toggleComparison}
      />
    </div>
  );
}

function VillaComparisonDialog({
  dialogRef,
  selectedVillas,
  onRemove,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  selectedVillas: VillaCatalogueItem[];
  onRemove: (id: string) => void;
}) {
  const rows = buildVillaComparisonRows(selectedVillas);
  const emptySlots = MAX_COMPARISON_VILLAS - selectedVillas.length;

  return (
    <dialog
      className="comparison-dialog"
      ref={dialogRef}
      aria-labelledby="comparison-title"
    >
      <div className="comparison-dialog__header">
        <div>
          <p className="eyebrow">Side-by-side review</p>
          <h2 id="comparison-title">Villa comparison</h2>
          <p>
            Compare source-backed facts only. Unknown room counts, features,
            prices, and availability remain clearly unconfirmed.
          </p>
        </div>
        <form method="dialog">
          <button type="submit" aria-label="Close villa comparison">
            Close
          </button>
        </form>
      </div>

      <div className="comparison-table-scroll">
        <table className="comparison-table">
          <thead>
            <tr>
              <th scope="col">Detail</th>
              {selectedVillas.map((villa) => (
                <th scope="col" key={villa.id}>
                  <span>{villa.name}</span>
                  <button type="button" onClick={() => onRemove(villa.id)}>
                    Remove
                  </button>
                </th>
              ))}
              {Array.from({ length: emptySlots }, (_, index) => (
                <th scope="col" key={`empty-${index}`}>
                  <span>Open comparison slot</span>
                  <small>Awaiting another governed villa plan</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.label}</th>
                {row.values.map((value, index) => (
                  <td key={`${row.id}-${selectedVillas[index].id}`}>{value}</td>
                ))}
                {Array.from({ length: emptySlots }, (_, index) => (
                  <td
                    key={`${row.id}-empty-${index}`}
                    aria-label="No villa selected"
                  >
                    —
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="comparison-dialog__footer">
        <p>
          No recommendation or ranking is generated. Confirm all details before
          making a purchase decision.
        </p>
        <Link href="/contact#schedule-visit">Ask about these villas</Link>
      </div>
    </dialog>
  );
}
