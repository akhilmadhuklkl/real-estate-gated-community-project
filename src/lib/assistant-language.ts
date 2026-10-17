import { z } from "zod";

export const assistantLanguageSchema = z.enum(["en", "ml", "hi", "ar"]);
export type AssistantLanguage = z.infer<typeof assistantLanguageSchema>;

export type AssistantLanguageOption = {
  code: AssistantLanguage;
  label: string;
  nativeLabel: string;
  direction: "ltr" | "rtl";
  approvalState: "approved" | "pending";
};

export const assistantLanguageOptions: AssistantLanguageOption[] = [
  {
    code: "en",
    label: "English",
    nativeLabel: "English",
    direction: "ltr",
    approvalState: "approved",
  },
  {
    code: "ml",
    label: "Malayalam",
    nativeLabel: "മലയാളം",
    direction: "ltr",
    approvalState: "pending",
  },
  {
    code: "hi",
    label: "Hindi",
    nativeLabel: "हिन्दी",
    direction: "ltr",
    approvalState: "pending",
  },
  {
    code: "ar",
    label: "Arabic",
    nativeLabel: "العربية",
    direction: "rtl",
    approvalState: "pending",
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
