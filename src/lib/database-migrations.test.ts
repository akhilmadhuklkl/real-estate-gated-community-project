import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migrationDirectory = resolve(process.cwd(), "supabase", "migrations");
const coreMigration = readFileSync(
  resolve(migrationDirectory, "20261025081506_create_phase_3_core_schema.sql"),
  "utf8",
);
const hardeningMigration = readFileSync(
  resolve(
    migrationDirectory,
    "20261025081830_harden_core_schema_access_and_indexes.sql",
  ),
  "utf8",
);
const seed = readFileSync(
  resolve(process.cwd(), "supabase", "seed.sql"),
  "utf8",
);

const expectedTables = [
  "profiles",
  "role_assignments",
  "villas",
  "villa_versions",
  "content_items",
  "content_versions",
  "media_assets",
  "documents",
  "enquiries",
  "enquiry_status_history",
  "visit_settings",
  "visits",
  "visit_status_history",
  "approvals",
  "notification_outbox",
  "audit_events",
];

describe("Phase 3 database migrations", () => {
  it("creates every required canonical table in the private schema", () => {
    for (const table of expectedTables) {
      expect(coreMigration).toContain(`create table app_private.${table}`);
    }
  });

  it("keeps browser roles outside the canonical schema", () => {
    expect(coreMigration).toContain(
      "revoke all on schema app_private from public, anon, authenticated",
    );
    expect(coreMigration).not.toMatch(
      /grant\s+(?:select|insert|update|delete|all)\s+on\s+table\s+app_private\..*\s+to\s+(?:anon|authenticated)/i,
    );
  });

  it("enables forced row-level security and explicit deny policies", () => {
    expect(coreMigration).toContain(
      "alter table app_private.%I enable row level security",
    );
    expect(coreMigration).toContain(
      "alter table app_private.%I force row level security",
    );
    expect(hardeningMigration).toContain("create policy deny_all_until_t0059");
  });

  it("makes audit records append-only", () => {
    expect(coreMigration).toContain("create trigger audit_events_immutable");
    expect(coreMigration).toContain("audit events are append-only");
  });

  it("contains synthetic-only seed records", () => {
    expect(seed).toContain("Synthetic local-only records");
    expect(seed).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    expect(seed).not.toMatch(/\+91\d{10}/);
  });
});
