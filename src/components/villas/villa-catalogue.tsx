"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { filterVillas, type VillaCatalogueItem } from "@/lib/villas-content";

type AreaFilter = "all" | "under-2500" | "2500-plus";

export function VillaCatalogue({ villas }: { villas: VillaCatalogueItem[] }) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<AreaFilter>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const filtered = useMemo(
    () => filterVillas(villas, query, area),
    [villas, query, area],
  );

  function toggleComparison(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

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
            <strong>{selected.length} selected</strong>
            <span>
              {selected.length < 2
                ? "Add another approved villa when available."
                : "Ready to compare."}
            </span>
          </div>
          <button type="button" disabled={selected.length < 2}>
            Compare villas
          </button>
        </aside>
      ) : null}
    </div>
  );
}
