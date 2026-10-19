import { describe, expect, it } from "vitest";

import {
  isLeadQualificationConversation,
  leadDraftSchema,
  qualifyLead,
  removePersonalContactDetails,
} from "./lead-qualification";

describe("lead qualification", () => {
  it.each([
    "Please arrange a site visit",
    "Can someone call me back?",
    "Prepare an enquiry for the team",
    "I want to speak with a representative",
  ])("recognises an explicit handoff request: %s", (question) => {
    expect(isLeadQualificationConversation(question)).toBe(true);
  });

  it("does not qualify a general property question", () => {
    expect(isLeadQualificationConversation("What is the villa area?")).toBe(
      false,
    );
  });

  it("collects only neutral, reviewable visit preferences", () => {
    const result = qualifyLead(
      "Arrange a site visit for the 3 bedroom villa on 2026-11-12 morning",
    );
    expect(result.draft).toEqual({
      intent: "site-visit",
      villaInterest: "Brochure villa plan",
      message:
        "Site-visit request. Villa interest: Brochure villa plan. Preferred date: 2026-11-12. Preferred time: morning. Requested route: Visit coordination.",
      preferredDate: "2026-11-12",
      timeWindow: "morning",
      handoffRoute: "visit",
    });
    expect(result.missing).toEqual([
      "Full name",
      "Email address or phone number",
      "Explicit consent",
    ]);
    expect(leadDraftSchema.safeParse(result.draft).success).toBe(true);
  });

  it("removes contact details instead of carrying them into the summary", () => {
    const source = "Call me at +91 90000 00000 or user@example.com";
    const cleaned = removePersonalContactDetails(source);
    expect(cleaned).not.toContain("90000");
    expect(cleaned).not.toContain("user@example.com");
    expect(cleaned).toContain("enter it in the enquiry form");
  });

  it("never treats form-only identity and consent fields as captured", () => {
    const result = qualifyLead("Call me back about the villa");
    expect(result.captured).toEqual([
      "General enquiry intent",
      "Handoff route",
    ]);
    expect(result.missing).toContain("Full name");
    expect(result.missing).toContain("Email address or phone number");
    expect(result.missing).toContain("Explicit consent");
  });
});
