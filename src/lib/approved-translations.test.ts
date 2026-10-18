import { describe, expect, it } from "vitest";

import translations from "../../content/data/approved-translations.json";

describe("approved translation memory", () => {
  it("records AKHIL approval for every production language", () => {
    expect(translations.approvedBy).toBe("AKHIL");
    expect(Object.keys(translations.languages).sort()).toEqual([
      "ar",
      "hi",
      "kn",
      "ml",
      "ta",
      "te",
    ]);
    for (const language of Object.values(translations.languages)) {
      expect(language.reviewer).toBe("AKHIL");
      expect(Object.values(language.messages).every(Boolean)).toBe(true);
    }
  });

  it("keeps English canonical and protects factual fidelity", () => {
    expect(translations.referenceLanguage).toBe("en");
    expect(translations.guardrails.preserveNamesNumbersUnitsAndCitations).toBe(
      true,
    );
    expect(
      translations.guardrails.prohibitUnverifiedLegalCommercialTranslations,
    ).toBe(true);
  });

  it("marks Arabic as right-to-left", () => {
    expect(translations.languages.ar.direction).toBe("rtl");
  });
});
