import { z } from "zod";

import type { AssistantCitation } from "./assistant-service";
import { getContactActions } from "./contact-actions";
import { galleryItems } from "./gallery-content";
import { locationContent } from "./location-content";
import {
  collectRecommendationPreferences,
  evaluateVillaRecommendation,
} from "./villa-recommendations";
import {
  buildVillaComparisonRows,
  getVillaById,
  MAX_COMPARISON_VILLAS,
  villaCatalogue,
} from "./villas-content";

const evidenceIds = z
  .array(z.string().regex(/^chk-[a-z0-9-]+$/))
  .min(1)
  .max(3);
const base = { evidenceIds };

const villaSelection = z
  .object({
    kind: z.literal("villa"),
    ...base,
    villaId: z.string().min(1),
  })
  .strict();
const floorPlanSelection = z
  .object({
    kind: z.literal("floor-plan"),
    ...base,
    villaId: z.string().min(1),
    mediaIds: z.array(z.string().min(1)).min(1).max(2),
  })
  .strict();
const gallerySelection = z
  .object({
    kind: z.literal("gallery"),
    ...base,
    mediaIds: z.array(z.string().min(1)).min(1).max(6),
  })
  .strict();
const mapSelection = z
  .object({
    kind: z.literal("map"),
    ...base,
    landmarkIds: z.array(z.string().min(1)).min(1).max(8),
  })
  .strict();
const comparisonSelection = z
  .object({
    kind: z.literal("comparison"),
    ...base,
    villaIds: z.array(z.string().min(1)).min(2).max(MAX_COMPARISON_VILLAS),
  })
  .strict();
const contactSelection = z
  .object({
    kind: z.literal("contact"),
    ...base,
    channels: z
      .array(z.enum(["call", "email", "whatsapp"]))
      .min(1)
      .max(3),
  })
  .strict();
const documentSelection = z
  .object({
    kind: z.literal("document"),
    ...base,
    documentId: z.literal("document-glitz-brochure"),
    page: z.number().int().min(1).max(9).nullable(),
  })
  .strict();
const recommendationPreferences = z
  .object({
    householdSize: z.number().int().min(1).max(20).nullable(),
    minBedrooms: z.number().int().min(1).max(20).nullable(),
    minAreaSqFt: z.number().int().min(100).max(100000).nullable(),
    maxAreaSqFt: z.number().int().min(100).max(100000).nullable(),
    preferredLevels: z.number().int().min(1).max(10).nullable(),
    requestedFeatures: z
      .array(z.enum(["accessibility", "balcony", "garden", "parking"]))
      .max(4),
    budgetMentioned: z.boolean(),
    availabilityRequested: z.boolean(),
  })
  .strict();
const recommendationSelection = z
  .object({
    kind: z.literal("recommendation"),
    ...base,
    villaIds: z.array(z.string().min(1)).min(1).max(MAX_COMPARISON_VILLAS),
    preferences: recommendationPreferences,
  })
  .strict();

export const assistantPreviewSelectionSchema = z.discriminatedUnion("kind", [
  villaSelection,
  floorPlanSelection,
  gallerySelection,
  mapSelection,
  comparisonSelection,
  contactSelection,
  documentSelection,
  recommendationSelection,
]);

export type AssistantPreviewSelection = z.infer<
  typeof assistantPreviewSelectionSchema
>;

type PreviewBase = {
  id: string;
  evidenceIds: string[];
};

export type AssistantPreview =
  | (PreviewBase & {
      kind: "villa";
      component: "villa-summary";
      villa: NonNullable<ReturnType<typeof getVillaById>>;
      href: string;
    })
  | (PreviewBase & {
      kind: "floor-plan";
      component: "floor-plan-gallery";
      villa: NonNullable<ReturnType<typeof getVillaById>>;
      media: typeof galleryItems;
    })
  | (PreviewBase & {
      kind: "gallery";
      component: "media-gallery";
      media: typeof galleryItems;
      href: "/gallery";
    })
  | (PreviewBase & {
      kind: "map";
      component: "landmark-map";
      address: string;
      landmarks: (typeof locationContent.landmarks)[number][];
      directionsUrl: string;
      href: "/location";
    })
  | (PreviewBase & {
      kind: "comparison";
      component: "villa-comparison";
      villas: NonNullable<ReturnType<typeof getVillaById>>[];
      rows: ReturnType<typeof buildVillaComparisonRows>;
    })
  | (PreviewBase & {
      kind: "contact";
      component: "contact-actions";
      actions: {
        calls: ReturnType<typeof getContactActions>["office"]["phones"];
        email: ReturnType<typeof getContactActions>["office"]["email"];
        whatsapp: ReturnType<typeof getContactActions>["whatsapp"];
      };
      href: "/contact";
    })
  | (PreviewBase & {
      kind: "document";
      component: "document-link";
      title: string;
      href: string;
      page: number | null;
      downloadName: string;
    })
  | (PreviewBase & {
      kind: "recommendation";
      component: "villa-recommendation";
      recommendation: ReturnType<typeof evaluateVillaRecommendation>;
      href: "/contact";
    });

function unique(values: string[], field: string) {
  if (new Set(values).size !== values.length) {
    throw new Error(`${field} must not contain duplicate IDs.`);
  }
}

function requireEvidence(
  selected: string[],
  allowedEvidenceIds: ReadonlySet<string>,
) {
  unique(selected, "evidenceIds");
  if (selected.some((id) => !allowedEvidenceIds.has(id))) {
    throw new Error("Preview evidence must be attached to the same answer.");
  }
}

function requireVilla(id: string) {
  const villa = getVillaById(id);
  if (!villa) throw new Error(`Unknown villa ID: ${id}`);
  return villa;
}

function requireMedia(ids: string[], plansOnly = false) {
  unique(ids, "mediaIds");
  return ids.map((id) => {
    const item = galleryItems.find((candidate) => candidate.id === id);
    if (!item || (plansOnly && item.category !== "plans")) {
      throw new Error(`Unknown or disallowed media ID: ${id}`);
    }
    return item;
  });
}

export function resolveAssistantPreview(
  input: unknown,
  allowedEvidenceIds: ReadonlySet<string>,
): AssistantPreview {
  const selection = assistantPreviewSelectionSchema.parse(input);
  requireEvidence(selection.evidenceIds, allowedEvidenceIds);
  const id = `preview-${selection.kind}-${selection.evidenceIds[0]}`;
  const previewBase = { id, evidenceIds: selection.evidenceIds };

  switch (selection.kind) {
    case "villa": {
      const villa = requireVilla(selection.villaId);
      return {
        ...previewBase,
        kind: selection.kind,
        component: "villa-summary",
        villa,
        href: `/villas/${villa.id}`,
      };
    }
    case "floor-plan":
      return {
        ...previewBase,
        kind: selection.kind,
        component: "floor-plan-gallery",
        villa: requireVilla(selection.villaId),
        media: requireMedia(selection.mediaIds, true),
      };
    case "gallery":
      return {
        ...previewBase,
        kind: selection.kind,
        component: "media-gallery",
        media: requireMedia(selection.mediaIds),
        href: "/gallery",
      };
    case "map": {
      unique(selection.landmarkIds, "landmarkIds");
      const landmarks = selection.landmarkIds.map((landmarkId) => {
        const landmark = locationContent.landmarks.find(
          ({ id: candidateId }) => candidateId === landmarkId,
        );
        if (!landmark) throw new Error(`Unknown landmark ID: ${landmarkId}`);
        return landmark;
      });
      return {
        ...previewBase,
        kind: selection.kind,
        component: "landmark-map",
        address: locationContent.address,
        landmarks,
        directionsUrl: locationContent.directionsUrl,
        href: "/location",
      };
    }
    case "comparison": {
      unique(selection.villaIds, "villaIds");
      const villas = selection.villaIds.map(requireVilla);
      return {
        ...previewBase,
        kind: selection.kind,
        component: "villa-comparison",
        villas,
        rows: buildVillaComparisonRows(villas),
      };
    }
    case "contact": {
      unique(selection.channels, "channels");
      const trusted = getContactActions();
      return {
        ...previewBase,
        kind: selection.kind,
        component: "contact-actions",
        actions: {
          calls: selection.channels.includes("call")
            ? trusted.office.phones
            : [],
          email: selection.channels.includes("email")
            ? trusted.office.email
            : null,
          whatsapp: selection.channels.includes("whatsapp")
            ? trusted.whatsapp
            : { enabled: false as const, href: null },
        },
        href: "/contact",
      };
    }
    case "document": {
      const brochure = getContactActions().brochure;
      return {
        ...previewBase,
        kind: selection.kind,
        component: "document-link",
        title: brochure.title,
        href: brochure.href,
        page: selection.page,
        downloadName: brochure.downloadName,
      };
    }
    case "recommendation": {
      unique(selection.villaIds, "villaIds");
      const villas = selection.villaIds.map(requireVilla);
      return {
        ...previewBase,
        kind: selection.kind,
        component: "villa-recommendation",
        recommendation: evaluateVillaRecommendation(
          selection.preferences,
          villas,
        ),
        href: "/contact",
      };
    }
  }
}

const intentPatterns = {
  recommendation:
    /\b(recommend|suggest|suitable|best|right (?:villa|home)|which (?:villa|home))\b/i,
  floorPlan: /\b(floor\s*plan|layout|ground floor|first floor)\b/i,
  gallery: /\b(gallery|photos?|images?|pictures?|visuals?|renderings?)\b/i,
  map: /\b(map|location|nearby|distance|hospital|school|college|city|reach|connected)\b/i,
  comparison: /\b(compare|comparison|versus|\bvs\b|difference)\b/i,
  contact: /\b(contact|call|phone|email|whats\s*app|enquir|schedule|visit)\b/i,
  document: /\b(brochure|document|pdf|download)\b/i,
  villa: /\b(villa|configuration|bedroom|bathroom|area|size|residence|home)\b/i,
};

export function selectAssistantPreview(
  question: string,
  citations: AssistantCitation[],
): AssistantPreview | null {
  const evidenceIds = citations.map(({ evidenceId }) => evidenceId).slice(0, 3);
  if (!evidenceIds.length) return null;
  const allowedEvidenceIds = new Set(evidenceIds);
  let selection: AssistantPreviewSelection | null = null;

  if (intentPatterns.recommendation.test(question)) {
    selection = {
      kind: "recommendation",
      evidenceIds,
      villaIds: villaCatalogue
        .slice(0, MAX_COMPARISON_VILLAS)
        .map(({ id }) => id),
      preferences: collectRecommendationPreferences(question),
    };
  } else if (intentPatterns.floorPlan.test(question)) {
    selection = {
      kind: "floor-plan",
      evidenceIds,
      villaId: villaCatalogue[0]?.id ?? "",
      mediaIds: galleryItems
        .filter(({ category }) => category === "plans")
        .slice(0, 2)
        .map(({ id }) => id),
    };
  } else if (intentPatterns.gallery.test(question)) {
    selection = {
      kind: "gallery",
      evidenceIds,
      mediaIds: galleryItems
        .filter(({ category }) => category !== "plans")
        .slice(0, 4)
        .map(({ id }) => id),
    };
  } else if (intentPatterns.map.test(question)) {
    selection = {
      kind: "map",
      evidenceIds,
      landmarkIds: locationContent.landmarks.slice(0, 6).map(({ id }) => id),
    };
  } else if (
    intentPatterns.comparison.test(question) &&
    villaCatalogue.length >= 2
  ) {
    selection = {
      kind: "comparison",
      evidenceIds,
      villaIds: villaCatalogue.slice(0, 3).map(({ id }) => id),
    };
  } else if (intentPatterns.contact.test(question)) {
    selection = {
      kind: "contact",
      evidenceIds,
      channels: ["call", "email", "whatsapp"],
    };
  } else if (intentPatterns.document.test(question)) {
    selection = {
      kind: "document",
      evidenceIds,
      documentId: "document-glitz-brochure",
      page: citations[0]?.locator.pageStart ?? null,
    };
  } else if (
    intentPatterns.villa.test(question) ||
    intentPatterns.comparison.test(question)
  ) {
    selection = {
      kind: "villa",
      evidenceIds,
      villaId: villaCatalogue[0]?.id ?? "",
    };
  }

  if (!selection) return null;
  try {
    return resolveAssistantPreview(selection, allowedEvidenceIds);
  } catch {
    return null;
  }
}
