"use client";

import { useState } from "react";

import { locationCategories, locationContent } from "@/lib/location-content";

export function LandmarkDirectory() {
  const [category, setCategory] = useState("all");
  const landmarks =
    category === "all"
      ? locationContent.landmarks
      : locationContent.landmarks.filter(
          (landmark) => landmark.filterCategory === category,
        );

  return (
    <>
      <div className="location-filter" aria-label="Filter nearby landmarks">
        {locationCategories.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={category === item.id}
            onClick={() => setCategory(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="location-results" aria-live="polite">
        Showing {landmarks.length} of {locationContent.landmarks.length}
        brochure distance references
      </p>
      <ol className="landmark-list">
        {landmarks.map((landmark) => (
          <li key={landmark.name}>
            <article className="landmark-card">
              <span className="landmark-card__number">{landmark.number}</span>
              <div>
                <p>{landmark.label}</p>
                <h3>{landmark.name}</h3>
                {landmark.isUnconfirmed ? (
                  <span className="landmark-card__warning">
                    Name and proposal status require confirmation
                  </span>
                ) : null}
              </div>
              <strong>
                {landmark.distanceKm}
                <small> km</small>
              </strong>
            </article>
          </li>
        ))}
      </ol>
    </>
  );
}
