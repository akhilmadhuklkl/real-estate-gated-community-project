import { describe, expect, it } from "vitest";

import {
  createEnquiryReference,
  enquirySchema,
  getFieldErrors,
  isLikelyAutomatedSubmission,
} from "./enquiry";

const validInput = {
  intent: "general-enquiry" as const,
  fullName: "Akhil",
  email: "akhil@example.com",
  phone: "",
  preferredDate: "",
  villaInterest: "",
  message: "Please share more information.",
  consent: true as const,
  sourcePath: "/contact",
  website: "",
  startedAt: 1_700_000_000_000,
};

describe("enquiry contract", () => {
  it("accepts a minimal general enquiry", () => {
    expect(enquirySchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts only a governed handoff route", () => {
    expect(
      enquirySchema.safeParse({ ...validInput, handoffRoute: "architecture" })
        .success,
    ).toBe(true);
    expect(
      enquirySchema.safeParse({ ...validInput, handoffRoute: "unapproved" })
        .success,
    ).toBe(false);
  });

  it("requires a preferred date for a site visit", () => {
    const result = enquirySchema.safeParse({
      ...validInput,
      intent: "site-visit",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getFieldErrors(result.error).preferredDate).toMatch(/preferred/);
    }
  });

  it("requires at least one reply channel", () => {
    const result = enquirySchema.safeParse({
      ...validInput,
      email: "",
      phone: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getFieldErrors(result.error).email).toMatch(
        /email address or phone/,
      );
    }
  });

  it("detects honeypot and implausibly fast submissions", () => {
    expect(
      isLikelyAutomatedSubmission(
        { website: "example.com", startedAt: 1_000 },
        10_000,
      ),
    ).toBe(true);
    expect(
      isLikelyAutomatedSubmission({ website: "", startedAt: 9_000 }, 10_000),
    ).toBe(true);
    expect(
      isLikelyAutomatedSubmission({ website: "", startedAt: 1_000 }, 10_000),
    ).toBe(false);
  });

  it("creates a non-sensitive dated reference", () => {
    expect(
      createEnquiryReference(
        new Date("2026-10-07T10:00:00.000Z"),
        "12345678-abcd-4000-8000-123456789abc",
      ),
    ).toBe("GP-20261007-12345678");
  });
});
