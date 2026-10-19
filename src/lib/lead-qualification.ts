import { z } from "zod";

export const LEAD_DRAFT_STORAGE_KEY = "glitz-pride-enquiry-draft:v1";

export const leadDraftSchema = z
  .object({
    intent: z.enum(["general-enquiry", "site-visit"]),
    villaInterest: z.string().trim().max(100),
    message: z.string().trim().max(1000),
    preferredDate: z
      .string()
      .trim()
      .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value)),
    timeWindow: z.enum(["morning", "afternoon", "any-time"]),
  })
  .strict();

export type LeadDraft = z.infer<typeof leadDraftSchema>;

export type LeadQualification = {
  draft: LeadDraft;
  captured: string[];
  missing: string[];
  privacyNotice: string;
};

const handoffPattern =
  /\b(callback|call me|contact me|speak (?:with|to)|talk (?:with|to)|arrange (?:a )?visit|book (?:a )?visit|schedule (?:a )?visit|site visit|send (?:this|the) (?:summary|conversation)|prepare (?:an? )?enquiry|make (?:an? )?enquiry)\b/i;
const siteVisitPattern = /\b(?:site )?visit|tour|viewing\b/i;
const brochureVillaPattern =
  /\b(?:brochure villa|villa plan|3\s*bed(?:room)?|2,?220|2220)\b/i;
const morningPattern = /\bmorning\b/i;
const afternoonPattern = /\bafternoon\b/i;
const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const phonePattern = /(?:\+?\d[\d\s().-]{6,}\d)/g;

export function isLeadQualificationConversation(value: string) {
  return handoffPattern.test(value);
}

export function removePersonalContactDetails(value: string) {
  return value
    .replace(emailPattern, "[email removed — enter it in the enquiry form]")
    .replace(phonePattern, (candidate) =>
      candidate.replace(/\D/g, "").length >= 10
        ? "[phone number removed — enter it in the enquiry form]"
        : candidate,
    )
    .trim();
}

function extractPreferredDate(value: string) {
  return value.match(/\b(20\d{2}-\d{2}-\d{2})\b/)?.[1] ?? "";
}

export function qualifyLead(value: string): LeadQualification {
  const intent = siteVisitPattern.test(value)
    ? ("site-visit" as const)
    : ("general-enquiry" as const);
  const preferredDate =
    intent === "site-visit" ? extractPreferredDate(value) : "";
  const timeWindow = morningPattern.test(value)
    ? ("morning" as const)
    : afternoonPattern.test(value)
      ? ("afternoon" as const)
      : ("any-time" as const);
  const villaInterest = brochureVillaPattern.test(value)
    ? "Brochure villa plan"
    : "";
  const summary = [
    intent === "site-visit" ? "Site-visit request." : "General enquiry.",
    villaInterest ? `Villa interest: ${villaInterest}.` : null,
    preferredDate ? `Preferred date: ${preferredDate}.` : null,
    timeWindow !== "any-time" ? `Preferred time: ${timeWindow}.` : null,
  ]
    .filter((item): item is string => Boolean(item))
    .join(" ");
  const captured = [
    intent === "site-visit" ? "Site-visit intent" : "General enquiry intent",
    villaInterest ? "Villa interest" : null,
    preferredDate ? "Preferred date" : null,
    timeWindow !== "any-time" ? "Preferred time" : null,
  ].filter((item): item is string => Boolean(item));
  const missing = [
    "Full name",
    "Email address or phone number",
    intent === "site-visit" && !preferredDate ? "Preferred visit date" : null,
    "Explicit consent",
  ].filter((item): item is string => Boolean(item));

  return {
    draft: {
      intent,
      villaInterest,
      message: summary,
      preferredDate,
      timeWindow,
    },
    captured,
    missing,
    privacyNotice:
      "No personal contact details are inferred, stored, or sent from this summary. Review it, then enter the minimum reply details and consent in the enquiry form.",
  };
}
