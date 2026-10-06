import { describe, expect, it } from "vitest";

import {
  galleryCategories,
  galleryItems,
  pendingCollections,
} from "./gallery-content";

describe("gallery content", () => {
  it("keeps every media item traceable and transparent", () => {
    expect(galleryItems).toHaveLength(8);
    expect(galleryItems.every((item) => item.source.length > 0)).toBe(true);
    expect(
      galleryItems.every((item) => item.dateLabel.includes("not supplied")),
    ).toBe(true);
    expect(galleryItems.every((item) => item.note.includes("confirm"))).toBe(
      true,
    );
  });

  it("represents only governed categories and records missing collections", () => {
    const categoryIds = new Set(galleryCategories.map(({ id }) => id));
    expect(galleryItems.every((item) => categoryIds.has(item.category))).toBe(
      true,
    );
    expect(pendingCollections).toHaveLength(3);
  });
});
