import { afterEach, describe, expect, it } from "vitest";

import { getContactActions } from "./contact-actions";

describe("contact actions", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    delete process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE;
  });

  it("builds brochure-backed call, email, and download actions", () => {
    const actions = getContactActions();

    expect(actions.brochure.href).toBe("/reference/glitz-pride/brochure.pdf");
    expect(actions.office.email?.href).toContain(
      "mailto:info@glitzhomes.co.in",
    );
    expect(actions.office.phones).toEqual([
      { label: "+91 954 451 9000", href: "tel:+919544519000" },
      { label: "+91 960 555 9400", href: "tel:+919605559400" },
    ]);
  });

  it("keeps WhatsApp unavailable without an approved number", () => {
    expect(getContactActions().whatsapp).toEqual({
      enabled: false,
      href: null,
    });
  });

  it("creates a WhatsApp link only from configured values", () => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "+91 98954 68235";
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE =
      "Hello, I would like to know more about Glitz Pride.";

    expect(getContactActions().whatsapp).toEqual({
      enabled: true,
      href: "https://wa.me/919895468235?text=Hello%2C%20I%20would%20like%20to%20know%20more%20about%20Glitz%20Pride.",
    });
  });
});
