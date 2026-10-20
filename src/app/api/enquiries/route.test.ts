// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { resetApiSecurityStateForTests } from "@/lib/api-security";

const request = (body: unknown, origin = "https://example.test") =>
  new Request("https://example.test/api/enquiries", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      host: "example.test",
      origin,
      "x-forwarded-for": "203.0.113.30",
    },
  });

const validEnquiry = () => ({
  intent: "general-enquiry",
  fullName: "Test Visitor",
  email: "visitor@example.test",
  consent: true,
  sourcePath: "/contact",
  website: "",
  startedAt: Date.now() - 10_000,
});

afterEach(() => {
  resetApiSecurityStateForTests();
  vi.restoreAllMocks();
});

describe("POST /api/enquiries", () => {
  it("validates a preview without persisting the personal fields", async () => {
    const { POST } = await import("./route");
    const response = await POST(request(validEnquiry()));
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result).toMatchObject({ deliveryState: "preview-only" });
    expect(JSON.stringify(result)).not.toContain("visitor@example.test");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });

  it("blocks cross-site submissions", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      request(validEnquiry(), "https://attacker.test"),
    );
    expect(response.status).toBe(403);
  });

  it("records an abuse event without logging submitted fields", async () => {
    const warning = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const { POST } = await import("./route");
    const response = await POST(
      request({ ...validEnquiry(), website: "spam.example" }),
    );
    expect(response.status).toBe(422);
    expect(String(warning.mock.calls[0]?.[0])).not.toContain(
      "visitor@example.test",
    );
  });
});
