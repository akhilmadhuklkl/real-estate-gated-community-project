import { z } from "zod";

import approvedTranslations from "../../content/data/approved-translations.json";

export const assistantLanguageSchema = z.enum(["en", "ml", "hi", "ar"]);
export type AssistantLanguage = z.infer<typeof assistantLanguageSchema>;

export type AssistantLanguageOption = {
  code: AssistantLanguage;
  label: string;
  nativeLabel: string;
  direction: "ltr" | "rtl";
  approvalState: "approved" | "pending";
  reviewer: string;
};

export const assistantLanguageOptions: AssistantLanguageOption[] = [
  {
    code: "en",
    label: "English",
    nativeLabel: "English",
    direction: "ltr",
    approvalState: "approved",
    reviewer: "AKHIL",
  },
  {
    code: "ml",
    label: "Malayalam",
    nativeLabel: "മലയാളം",
    direction: "ltr",
    approvalState: "approved",
    reviewer: approvedTranslations.languages.ml.reviewer,
  },
  {
    code: "hi",
    label: "Hindi",
    nativeLabel: "हिन्दी",
    direction: "ltr",
    approvalState: "approved",
    reviewer: approvedTranslations.languages.hi.reviewer,
  },
  {
    code: "ar",
    label: "Arabic",
    nativeLabel: "العربية",
    direction: "rtl",
    approvalState: "approved",
    reviewer: approvedTranslations.languages.ar.reviewer,
  },
];

const optionByCode = new Map(
  assistantLanguageOptions.map((option) => [option.code, option]),
);

const scriptPatterns: Array<[AssistantLanguage, RegExp]> = [
  ["ml", /[\u0d00-\u0d7f]/u],
  ["hi", /[\u0900-\u097f]/u],
  ["ar", /[\u0600-\u06ff]/u],
];
const namedLanguagePatterns: Array<[AssistantLanguage, RegExp]> = [
  ["ml", /\b(?:malayalam|മലയാളം)\b/iu],
  ["hi", /\b(?:hindi|हिन्दी|हिंदी)\b/iu],
  ["ar", /\b(?:arabic|العربية)\b/iu],
  ["en", /\benglish\b/i],
];

export function detectAssistantLanguage(
  value: string,
): AssistantLanguage | null {
  for (const [language, pattern] of scriptPatterns) {
    if (pattern.test(value)) return language;
  }
  for (const [language, pattern] of namedLanguagePatterns) {
    if (pattern.test(value)) return language;
  }
  return null;
}

export function resolveAssistantLanguage(
  question: string,
  explicitLanguage: AssistantLanguage = "en",
): AssistantLanguageOption {
  const detected = detectAssistantLanguage(question);
  const requested =
    explicitLanguage !== "en" ? explicitLanguage : (detected ?? "en");
  return optionByCode.get(requested) ?? assistantLanguageOptions[0];
}

export function languageUnavailableMessage(
  option: AssistantLanguageOption,
): string {
  return `${option.label} project translations are not yet approved. I cannot translate project facts until a human-reviewed translation set and cross-language evaluation are approved. English remains the approved reference language.`;
}

export type AssistantMessageKey =
  keyof (typeof approvedTranslations.languages)["ml"]["messages"];

const englishMessages: Record<AssistantMessageKey, string> = {
  invalidQuestion: "Please ask a short, specific question about Glitz Pride.",
  removePersonalData:
    "For privacy, please remove phone numbers, email addresses, or personal identifiers before asking your question.",
  insufficientEvidence:
    "That information is not confirmed in the approved project material. Please contact the project representative for an update.",
  serviceUnavailable:
    "The property guide is temporarily unavailable. Please try again shortly or contact the project representative.",
  unsupportedAnswer:
    "A supported answer could not be produced from the approved project material. Please contact the project representative for confirmation.",
  policyBoundary:
    "I cannot help with that request. I can help with approved public information about Glitz Pride.",
  humanConfirmation:
    "That request requires confirmation from a qualified professional or project representative. I can provide only approved property facts.",
};

export function assistantMessage(
  language: AssistantLanguage,
  key: AssistantMessageKey,
): string {
  if (language === "en") return englishMessages[key];
  return approvedTranslations.languages[language].messages[key];
}

export function targetLanguageInstruction(language: AssistantLanguage): string {
  const option = optionByCode.get(language) ?? assistantLanguageOptions[0];
  return language === "en"
    ? "Answer in English."
    : `Answer entirely in ${option.label} (${option.nativeLabel}). Preserve proper names, numbers, units, source qualifications, and citation meaning exactly. Do not translate an unsupported claim into an apparently confirmed fact.`;
}
