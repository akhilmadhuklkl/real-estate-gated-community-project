"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  galleryCategories,
  galleryItems,
  type GalleryItem,
} from "@/lib/gallery-content";

export function MediaGallery() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement>(null);
  const [category, setCategory] = useState("all");
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const filteredItems =
    category === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === category);

  useEffect(() => {
    if (!activeItem) return;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    document.body.dataset.galleryOpen = "true";

    return () => {
      delete document.body.dataset.galleryOpen;
    };
  }, [activeItem]);

  const closeDialog = () => dialogRef.current?.close();

  return (
    <>
      <div className="gallery-filter" aria-label="Filter gallery">
        {galleryCategories.map((item) => (
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

      <p className="gallery-results" aria-live="polite">
        Showing {filteredItems.length} of {galleryItems.length} brochure media
        references
      </p>

      <div className="gallery-grid">
        {filteredItems.map((item, index) => (
          <article
            className="gallery-card"
            data-orientation={item.orientation}
            key={item.id}
          >
            <button
              type="button"
              onClick={(event) => {
                lastTriggerRef.current = event.currentTarget;
                setActiveItem(item);
              }}
              aria-label={`Open ${item.title}`}
            >
              <span className="gallery-card__image">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  priority={index < 2}
                  sizes="(max-width: 640px) 100vw, (max-width: 1050px) 50vw, 33vw"
                />
                <span className="gallery-card__open" aria-hidden="true">
                  View larger <span>↗</span>
                </span>
              </span>
              <span className="gallery-card__caption">
                <span>{item.categoryLabel}</span>
                <strong>{item.title}</strong>
                <small>{item.source}</small>
              </span>
            </button>
          </article>
        ))}
      </div>

      {activeItem ? (
        <dialog
          ref={dialogRef}
          className="gallery-lightbox"
          aria-labelledby="gallery-lightbox-title"
          onClose={() => {
            setActiveItem(null);
            window.requestAnimationFrame(() => lastTriggerRef.current?.focus());
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <div className="gallery-lightbox__panel">
            <button
              className="gallery-lightbox__close"
              type="button"
              onClick={closeDialog}
              autoFocus
            >
              Close <span aria-hidden="true">×</span>
            </button>
            <div className="gallery-lightbox__image">
              <Image
                src={activeItem.src}
                alt={activeItem.alt}
                fill
                sizes="90vw"
              />
            </div>
            <div className="gallery-lightbox__copy">
              <p className="eyebrow">{activeItem.categoryLabel}</p>
              <h2 id="gallery-lightbox-title">{activeItem.title}</h2>
              <dl>
                <div>
                  <dt>Source</dt>
                  <dd>{activeItem.source}</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>{activeItem.dateLabel}</dd>
                </div>
              </dl>
              <p>{activeItem.note}</p>
            </div>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
