import { describe, expect, it } from "vitest";

import {
  assistantPreviewSelectionSchema,
  resolveAssistantPreview,
} from "./assistant-preview";

const evidence = new Set(["chk-source-one", "chk-source-two"]);
const base = { evidenceIds: ["chk-source-one"] };

describe("assistant preview response schema", () => {
  it.each([
    [
      "villa",
      { kind: "villa", ...base, villaId: "villa-brochure-plan-01" },
      "villa-summary",
    ],
    [
      "floor-plan",
      {
        kind: "floor-plan",
        ...base,
        villaId: "villa-brochure-plan-01",
        mediaIds: ["ground-floor-plan", "first-floor-plan"],
      },
      "floor-plan-gallery",
    ],
    [
      "gallery",
      { kind: "gallery", ...base, mediaIds: ["villa-elevation"] },
      "media-gallery",
    ],
    [
      "map",
      {
        kind: "map",
        ...base,
        landmarkIds: ["landmark-amala-medical-college"],
      },
      "landmark-map",
    ],
    [
      "contact",
      { kind: "contact", ...base, channels: ["call", "whatsapp"] },
      "contact-actions",
    ],
    [
      "document",
      {
        kind: "document",
        ...base,
        documentId: "document-glitz-brochure",
        page: 7,
      },
      "document-link",
    ],
  ])(
    "resolves the %s selector to a trusted component",
    (_, input, component) => {
      expect(resolveAssistantPreview(input, evidence).component).toBe(
        component,
      );
    },
  );

  it("supports comparisons only within the configured maximum", () => {
    const parsed = assistantPreviewSelectionSchema.safeParse({
      kind: "comparison",
      ...base,
      villaIds: ["villa-one", "villa-two", "villa-three", "villa-four"],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects arbitrary URLs, text, and component names", () => {
    expect(
      assistantPreviewSelectionSchema.safeParse({
        kind: "gallery",
        ...base,
        mediaIds: ["villa-elevation"],
        component: "custom-html",
        href: "https://untrusted.example",
        title: "Invented claim",
      }).success,
    ).toBe(false);
  });

  it("rejects unknown records and evidence not attached to the answer", () => {
    expect(() =>
      resolveAssistantPreview(
        { kind: "villa", ...base, villaId: "unknown-villa" },
        evidence,
      ),
    ).toThrow("Unknown villa ID");
    expect(() =>
      resolveAssistantPreview(
        {
          kind: "gallery",
          evidenceIds: ["chk-unattached"],
          mediaIds: ["villa-elevation"],
        },
        evidence,
      ),
    ).toThrow("same answer");
  });

  it("allows only floor-plan media in a floor-plan preview", () => {
    expect(() =>
      resolveAssistantPreview(
        {
          kind: "floor-plan",
          ...base,
          villaId: "villa-brochure-plan-01",
          mediaIds: ["villa-elevation"],
        },
        evidence,
      ),
    ).toThrow("disallowed media ID");
  });

  it("returns only the requested trusted contact channels", () => {
    const preview = resolveAssistantPreview(
      { kind: "contact", ...base, channels: ["email"] },
      evidence,
    );
    expect(preview.kind).toBe("contact");
    if (preview.kind !== "contact") throw new Error("Unexpected preview kind");
    expect(preview.actions.calls).toEqual([]);
    expect(preview.actions.email?.href).toMatch(/^mailto:/);
    expect(preview.actions.whatsapp.enabled).toBe(false);
  });
});
