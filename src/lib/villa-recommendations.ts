import type { VillaCatalogueItem } from "./villas-content";

export type VillaRecommendationPreferences = {
  householdSize: number | null;
  minBedrooms: number | null;
  minAreaSqFt: number | null;
  maxAreaSqFt: number | null;
  preferredLevels: number | null;
  requestedFeatures: Array<"accessibility" | "balcony" | "garden" | "parking">;
  budgetMentioned: boolean;
  availabilityRequested: boolean;
};

export type RecommendationCriterion = {
  id: string;
  label: string;
  requested: string;
  outcome: "match" | "not-match" | "unknown" | "not-used";
  explanation: string;
};

export type VillaRecommendation = {
  status: "needs-preferences" | "single-approved-option" | "no-evidenced-match";
  villa: VillaCatalogueItem | null;
  criteria: RecommendationCriterion[];
  limitations: string[];
  clarification: string | null;
};

const recommendationPattern =
  /\b(recommend|suggest|suitable|best|right (?:villa|home)|which (?:villa|home))\b/i;
const budgetPattern = /\b(budget|price|cost|afford|lakh|crore|₹|rs\.?\s*\d)/i;
const availabilityPattern =
  /\b(available|availability|ready to (?:buy|move)|inventory)\b/i;
const featurePatterns: Array<
  [VillaRecommendationPreferences["requestedFeatures"][number], RegExp]
> = [
  ["accessibility", /\b(accessib|wheelchair|step[- ]?free)\b/i],
  ["balcony", /\bbalcon(?:y|ies)\b/i],
  ["garden", /\b(?:private )?garden\b/i],
  ["parking", /\bparking\b/i],
];

function lastNumberMatch(value: string, pattern: RegExp): number | null {
  const matches = [...value.matchAll(pattern)];
  const raw = matches.at(-1)?.[1];
  return raw ? Number(raw.replaceAll(",", "")) : null;
}

export function isRecommendationConversation(value: string): boolean {
  return recommendationPattern.test(value);
}

export function collectRecommendationPreferences(
  conversation: string,
): VillaRecommendationPreferences {
  const bedrooms = lastNumberMatch(
    conversation,
    /\b(\d{1,2})\s*(?:bed(?:room)?s?|bhk)\b/gi,
  );
  const householdSize = lastNumberMatch(
    conversation,
    /\b(?:family|household|home)\s+(?:of|for)\s+(\d{1,2})\b/gi,
  );
  const minAreaSqFt = lastNumberMatch(
    conversation,
    /\b(?:at least|minimum|min\.?|over|above)\s*([\d,]{3,6})\s*(?:sq\.?\s*ft|square feet)\b/gi,
  );
  const maxAreaSqFt = lastNumberMatch(
    conversation,
    /\b(?:up to|maximum|max\.?|under|below)\s*([\d,]{3,6})\s*(?:sq\.?\s*ft|square feet)\b/gi,
  );
  const preferredLevels = lastNumberMatch(
    conversation,
    /\b(\d)\s*(?:levels?|floors?|storeys?|stories?)\b/gi,
  );

  return {
    householdSize,
    minBedrooms: bedrooms,
    minAreaSqFt,
    maxAreaSqFt,
    preferredLevels,
    requestedFeatures: featurePatterns
      .filter(([, pattern]) => pattern.test(conversation))
      .map(([feature]) => feature),
    budgetMentioned: budgetPattern.test(conversation),
    availabilityRequested: availabilityPattern.test(conversation),
  };
}

function hasNeutralPreference(preferences: VillaRecommendationPreferences) {
  return Boolean(
    preferences.minBedrooms ||
    preferences.minAreaSqFt ||
    preferences.maxAreaSqFt ||
    preferences.preferredLevels ||
    preferences.requestedFeatures.length,
  );
}

function numericCriterion(args: {
  id: string;
  label: string;
  requested: string;
  actual: number | null;
  matches: (actual: number) => boolean;
  confirmed: (actual: number) => string;
}): RecommendationCriterion {
  if (args.actual === null) {
    return {
      id: args.id,
      label: args.label,
      requested: args.requested,
      outcome: "unknown",
      explanation: "The approved catalogue does not confirm this value.",
    };
  }
  return {
    id: args.id,
    label: args.label,
    requested: args.requested,
    outcome: args.matches(args.actual) ? "match" : "not-match",
    explanation: args.confirmed(args.actual),
  };
}

export function evaluateVillaRecommendation(
  preferences: VillaRecommendationPreferences,
  villas: VillaCatalogueItem[],
): VillaRecommendation {
  const villa = villas[0] ?? null;
  const limitations = [
    "The approved catalogue currently contains one villa plan, so this is an explained match—not a ranking across multiple options.",
    "Catalogue presence does not confirm current price, availability, completion, contractual inclusion, or personal suitability.",
  ];

  if (preferences.householdSize) {
    limitations.push(
      `A household size of ${preferences.householdSize} is noted, but room capacity is not inferred. Confirm the bedroom requirement directly.`,
    );
  }
  if (preferences.budgetMentioned) {
    limitations.push(
      "Budget was not used because no verified live price source is available. Request current pricing from the project representative.",
    );
  }
  if (preferences.availabilityRequested) {
    limitations.push(
      "Availability was not used because the approved catalogue does not include verified live inventory.",
    );
  }

  if (!villa || !hasNeutralPreference(preferences)) {
    return {
      status: "needs-preferences",
      villa,
      criteria: [],
      limitations,
      clarification:
        "What matters most: bedroom count, approximate floor area, number of levels, or a specific property feature?",
    };
  }

  const criteria: RecommendationCriterion[] = [];
  if (preferences.minBedrooms) {
    criteria.push(
      numericCriterion({
        id: "bedrooms",
        label: "Bedrooms",
        requested: `At least ${preferences.minBedrooms}`,
        actual: villa.bedrooms,
        matches: (actual) => actual >= preferences.minBedrooms!,
        confirmed: (actual) =>
          `The approved catalogue records ${actual} bedrooms.`,
      }),
    );
  }
  if (preferences.minAreaSqFt) {
    criteria.push(
      numericCriterion({
        id: "minimum-area",
        label: "Minimum area",
        requested: `${preferences.minAreaSqFt.toLocaleString("en-IN")} sq ft or more`,
        actual: villa.totalAreaSqFt,
        matches: (actual) => actual >= preferences.minAreaSqFt!,
        confirmed: (actual) =>
          `The approved total plan is ${actual.toLocaleString("en-IN")} sq ft.`,
      }),
    );
  }
  if (preferences.maxAreaSqFt) {
    criteria.push(
      numericCriterion({
        id: "maximum-area",
        label: "Maximum area",
        requested: `${preferences.maxAreaSqFt.toLocaleString("en-IN")} sq ft or less`,
        actual: villa.totalAreaSqFt,
        matches: (actual) => actual <= preferences.maxAreaSqFt!,
        confirmed: (actual) =>
          `The approved total plan is ${actual.toLocaleString("en-IN")} sq ft.`,
      }),
    );
  }
  if (preferences.preferredLevels) {
    criteria.push(
      numericCriterion({
        id: "levels",
        label: "Levels",
        requested: preferences.preferredLevels.toString(),
        actual: villa.levels,
        matches: (actual) => actual === preferences.preferredLevels,
        confirmed: (actual) => `The approved plan has ${actual} levels.`,
      }),
    );
  }
  for (const feature of preferences.requestedFeatures) {
    criteria.push({
      id: `feature-${feature}`,
      label: feature.charAt(0).toUpperCase() + feature.slice(1),
      requested: "Requested",
      outcome: "unknown",
      explanation:
        "This feature is not explicitly modelled in the approved villa record and requires confirmation.",
    });
  }

  const noMatch = criteria.some(({ outcome }) => outcome === "not-match");
  return {
    status: noMatch ? "no-evidenced-match" : "single-approved-option",
    villa,
    criteria,
    limitations,
    clarification: null,
  };
}

export function recommendationAnswer(result: VillaRecommendation): string {
  if (result.status === "needs-preferences") {
    return result.clarification ?? "Please share one property preference.";
  }
  if (result.status === "no-evidenced-match") {
    return "The only approved villa plan does not match every stated numeric preference. The visual summary shows the supported facts and what still needs confirmation.";
  }
  return "The approved catalogue currently contains one villa plan. It matches the supported criteria shown in the visual summary; unknown and changing details remain clearly marked for confirmation.";
}
