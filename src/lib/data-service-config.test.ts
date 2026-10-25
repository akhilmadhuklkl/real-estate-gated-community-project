import { describe, expect, it } from "vitest";

import {
  parseDataServiceEnvironment,
  storageBuckets,
} from "./data-service-config";

describe("data service environment isolation", () => {
  it("accepts the isolated local service", () => {
    expect(
      parseDataServiceEnvironment({
        DATA_ENVIRONMENT: "local",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "local-publishable-key",
      }),
    ).toMatchObject({ DATA_ENVIRONMENT: "local" });
  });

  it("rejects a hosted project in the local environment", () => {
    expect(() =>
      parseDataServiceEnvironment({
        DATA_ENVIRONMENT: "local",
        NEXT_PUBLIC_SUPABASE_URL: "https://preview.example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "preview-publishable-key",
      }),
    ).toThrow("Local development must use the isolated local data service.");
  });

  it("rejects a local endpoint in a deployed environment", () => {
    expect(() =>
      parseDataServiceEnvironment({
        DATA_ENVIRONMENT: "production",
        NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "local-publishable-key",
      }),
    ).toThrow("Deployed environments cannot use a local data-service URL.");
  });

  it("keeps every storage trust boundary in a separate bucket", () => {
    expect(new Set(Object.values(storageBuckets)).size).toBe(4);
    expect(storageBuckets).toEqual({
      publicMedia: "public-media",
      protectedOriginals: "protected-originals",
      quarantine: "quarantine",
      recoveryExport: "recovery-export",
    });
  });
});
