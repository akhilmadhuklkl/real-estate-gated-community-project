import { afterEach, describe, expect, it } from "vitest";

import { getApprovedContactDirectory } from "./contact-directory";

describe("approved contact directory", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    delete process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE;
  });

  it("builds a source-backed department card for the approved channel", () => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "+91 98954 68235";
    const result = getApprovedContactDirectory(["whatsapp"]);

    expect(result.cards).toHaveLength(1);
    expect(result.cards[0]).toMatchObject({
      displayName: "Glitz Pride project enquiries",
      personName: null,
      photo: null,
      role: "Project enquiry coordinator",
      languages: ["Not confirmed"],
      workingHours: "Not confirmed",
      responseTime: "Not confirmed",
      source: { id: "KS-004", approvalId: "APR-004" },
    });
    expect(result.cards[0]?.channels[0]?.href).toContain("wa.me/919895468235");
  });

  it("withholds unapproved call and email cards", () => {
    const result = getApprovedContactDirectory(["call", "email"]);

    expect(result.cards).toEqual([]);
    expect(result.unavailableChannels).toEqual(["call", "email"]);
  });

  it("fails closed when the approved destination is not configured", () => {
    const result = getApprovedContactDirectory(["whatsapp"]);

    expect(result.cards).toEqual([]);
    expect(result.unavailableChannels).toEqual(["whatsapp"]);
  });
});
