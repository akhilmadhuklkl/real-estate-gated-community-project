import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { classifyHandoffRoute, routeHumanHandoff } from "./human-handoff";

const originalNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const originalMessage = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE;

describe("human handoff routing", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "+91 90000 00000";
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE = "Existing default";
  });

  afterEach(() => {
    if (originalNumber === undefined) {
      delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    } else {
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = originalNumber;
    }

    if (originalMessage === undefined) {
      delete process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE;
    } else {
      process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE = originalMessage;
    }
  });

  it.each([
    ["I want to buy a villa", "sales"],
    ["Please arrange a site visit", "visit"],
    ["I need to speak with the architect", "architecture"],
    ["Please cancel my existing request", "support"],
  ] as const)("routes %s to %s", (question, expected) => {
    expect(classifyHandoffRoute(question)).toBe(expected);
  });

  it("gives support correction precedence over a visit keyword", () => {
    expect(classifyHandoffRoute("Reschedule my site visit")).toBe("support");
  });

  it("creates only a neutral route-specific approved WhatsApp draft", () => {
    const result = routeHumanHandoff(
      "Call me on +91 98888 77777 about price and my private notes",
    );
    expect(result.route).toBe("sales");
    expect(result.whatsappHref).toContain("wa.me/919000000000");
    expect(decodeURIComponent(result.whatsappHref ?? "")).toContain(
      "Glitz Pride sales enquiry",
    );
    expect(result.whatsappHref).not.toContain("98888");
    expect(result.whatsappHref).not.toContain("private");
    expect(result.workingHours).toBe("Not confirmed");
    expect(result.serviceLevel).toBe("Not confirmed");
  });

  it("fails closed when the approved WhatsApp destination is unavailable", () => {
    delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    expect(routeHumanHandoff("Please call me").whatsappHref).toBeNull();
  });
});
