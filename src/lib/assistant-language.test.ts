import { describe, expect, it } from "vitest";

import {
  assistantLanguageOptions,
  detectAssistantLanguage,
  languageUnavailableMessage,
  resolveAssistantLanguage,
} from "./assistant-language";

describe("assistant language support", () => {
  it("detects supported scripts and language names", () => {
    expect(detectAssistantLanguage("വില്ല വിവരങ്ങൾ")).toBe("ml");
    expect(detectAssistantLanguage("विला की जानकारी")).toBe("hi");
    expect(detectAssistantLanguage("معلومات الفيلا")).toBe("ar");
    expect(detectAssistantLanguage("విల్లా వివరాలు")).toBe("te");
    expect(detectAssistantLanguage("வில்லா விவரங்கள்")).toBe("ta");
    expect(detectAssistantLanguage("ವಿಲ್ಲಾ ವಿವರಗಳು")).toBe("kn");
    expect(detectAssistantLanguage("Please answer in Malayalam")).toBe("ml");
    expect(detectAssistantLanguage("Tell me about the villas")).toBeNull();
  });

  it("honours an explicit approved language selection", () => {
    expect(
      resolveAssistantLanguage("Tell me about villas", "hi"),
    ).toMatchObject({
      code: "hi",
      direction: "ltr",
      approvalState: "approved",
      reviewer: "AKHIL",
    });
  });

  it("marks all seven languages approved and Arabic right-to-left", () => {
    expect(assistantLanguageOptions).toHaveLength(7);
    expect(
      assistantLanguageOptions.every(
        ({ approvalState, reviewer }) =>
          approvalState === "approved" && reviewer === "AKHIL",
      ),
    ).toBe(true);
    expect(
      assistantLanguageOptions.find(({ code }) => code === "en")?.approvalState,
    ).toBe("approved");
    expect(
      assistantLanguageOptions.find(({ code }) => code === "ar")?.direction,
    ).toBe("rtl");
  });

  it("keeps the unavailable-language guard for future additions", () => {
    expect(
      languageUnavailableMessage({
        code: "ml",
        label: "Malayalam",
        nativeLabel: "മലയാളം",
        direction: "ltr",
        approvalState: "pending",
        reviewer: "AKHIL",
      }),
    ).toContain("not yet approved");
  });
});
