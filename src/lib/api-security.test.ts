import { afterEach, describe, expect, it, vi } from "vitest";

import {
  assistantApiPolicy,
  enforceApiSecurity,
  readLimitedJson,
  recordSecurityEvent,
  resetApiSecurityStateForTests,
  secureJson,
} from "./api-security";

const request = (body = "{}", headers: HeadersInit = {}) =>
  new Request("https://example.test/api/assistant", {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      host: "example.test",
      origin: "https://example.test",
      "x-forwarded-for": "203.0.113.10",
      ...headers,
    },
  });

afterEach(() => {
  resetApiSecurityStateForTests();
  vi.restoreAllMocks();
});

describe("API security controls", () => {
  it("accepts same-origin JSON and adds privacy-safe response headers", () => {
    const decision = enforceApiSecurity(request(), assistantApiPolicy, 1_000);
    expect(decision.ok).toBe(true);
    if (!decision.ok) return;
    const response = secureJson(decision.context, { ok: true });
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("X-Request-ID")).toBeTruthy();
    expect(response.headers.get("RateLimit-Remaining")).toBe("11");
  });

  it("rejects cross-site, unsupported, and oversized requests", () => {
    expect(
      enforceApiSecurity(
        request("{}", {
          origin: "https://attacker.test",
          "sec-fetch-site": "cross-site",
        }),
        assistantApiPolicy,
      ).ok,
    ).toBe(false);
    expect(
      enforceApiSecurity(
        request("text", { "content-type": "text/plain" }),
        assistantApiPolicy,
      ).ok,
    ).toBe(false);
    expect(
      enforceApiSecurity(
        request("{}", {
          "content-length": String(assistantApiPolicy.maxBodyBytes + 1),
        }),
        assistantApiPolicy,
      ).ok,
    ).toBe(false);
  });

  it("enforces the per-client limit without storing the raw address", () => {
    let final: ReturnType<typeof enforceApiSecurity> | undefined;
    for (let index = 0; index <= assistantApiPolicy.rateLimit; index += 1) {
      final = enforceApiSecurity(request(), assistantApiPolicy, 1_000);
    }
    expect(final?.ok).toBe(false);
    if (final?.ok === false) {
      expect(final.response.status).toBe(429);
      expect(final.response.headers.get("Retry-After")).toBe("60");
    }
  });

  it("measures streamed bytes even when content-length is absent", async () => {
    const body = JSON.stringify({ question: "x".repeat(100) });
    await expect(readLimitedJson(request(body), 20)).rejects.toMatchObject({
      status: 413,
    });
  });

  it("logs identifiers and error type without sensitive error text", () => {
    const warning = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    recordSecurityEvent(
      {
        requestId: "request-1",
        route: "assistant",
        clientKey: "assistant:hashed-client",
      },
      "provider-failure",
      new Error("user@example.test +91 99999 99999"),
    );
    const output = String(warning.mock.calls[0]?.[0]);
    expect(output).toContain('"errorType":"Error"');
    expect(output).not.toContain("user@example.test");
    expect(output).not.toContain("99999");
  });
});
