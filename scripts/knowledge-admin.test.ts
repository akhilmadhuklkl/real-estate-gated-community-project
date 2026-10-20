// @vitest-environment node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  activateKnowledge,
  approveKnowledge,
  authenticateAdmin,
  defaultAdminPaths,
  loadLedger,
  rollbackKnowledge,
  stageKnowledge,
  submitKnowledge,
} from "./knowledge-admin";

const editor = { id: "editor-1", role: "content-editor" as const };
const reviewer = { id: "reviewer-1", role: "content-reviewer" as const };

const fixture = async () => {
  const repo = await mkdtemp(join(tmpdir(), "knowledge-admin-"));
  const paths = defaultAdminPaths(repo);
  await mkdir(join(repo, "content/data"), { recursive: true });
  await writeFile(
    paths.register,
    JSON.stringify({
      sources: [
        {
          id: "KS-TEST",
          title: "Approved test source",
          decision: "approved",
          format: "json",
          location: "content/data/source.json",
        },
        {
          id: "KS-PENDING",
          title: "Pending source",
          decision: "pending",
          format: "json",
          location: "content/data/pending.json",
        },
      ],
    }),
  );
  await writeFile(
    join(repo, "candidate-one.json"),
    JSON.stringify({ title: "Version one" }),
  );
  await writeFile(
    join(repo, "candidate-two.json"),
    JSON.stringify({ title: "Version two" }),
  );
  return { repo, paths };
};

const approveAndActivate = async (
  paths: ReturnType<typeof defaultAdminPaths>,
  filePath: string,
  time: string,
) => {
  const staged = await stageKnowledge({
    paths,
    actor: editor,
    sourceId: "KS-TEST",
    filePath,
    now: new Date(time),
  });
  await submitKnowledge(paths, editor, staged.id, new Date(time));
  await approveKnowledge(
    paths,
    reviewer,
    staged.id,
    "Reviewed against the governed source.",
    new Date(time),
  );
  return activateKnowledge(paths, reviewer, staged.id, new Date(time));
};

describe("knowledge administration", () => {
  it("requires environment-backed role credentials", () => {
    expect(
      authenticateAdmin({
        KNOWLEDGE_ADMIN_ACTOR: "akhil-editor",
        KNOWLEDGE_ADMIN_ROLE: "content-editor",
        KNOWLEDGE_ADMIN_CREDENTIAL: "editor-value",
        KNOWLEDGE_EDITOR_CREDENTIAL: "editor-value",
      }),
    ).toEqual({ id: "akhil-editor", role: "content-editor" });
    expect(() => authenticateAdmin({})).toThrow(/credentials are incomplete/i);
  });

  it("validates, versions, submits, approves and activates content", async () => {
    const { repo, paths } = await fixture();
    const active = await approveAndActivate(
      paths,
      join(repo, "candidate-one.json"),
      "2026-10-20T10:00:00.000Z",
    );
    expect(active.state).toBe("active");
    expect(
      JSON.parse(
        await readFile(join(repo, "content/data/source.json"), "utf8"),
      ),
    ).toEqual({ title: "Version one" });
    const ledger = await loadLedger(paths);
    expect(ledger.activeVersions["KS-TEST"]).toBe(active.id);
    expect(ledger.reindexRequests).toHaveLength(1);
    expect(ledger.auditEvents.map(({ action }) => action)).toEqual([
      "validated",
      "submitted",
      "approved",
      "activated",
    ]);
  });

  it("enforces independent review and blocks pending sources", async () => {
    const { repo, paths } = await fixture();
    const staged = await stageKnowledge({
      paths,
      actor: editor,
      sourceId: "KS-TEST",
      filePath: join(repo, "candidate-one.json"),
    });
    await submitKnowledge(paths, editor, staged.id);
    await expect(
      approveKnowledge(
        paths,
        { id: editor.id, role: "content-reviewer" },
        staged.id,
        "Self review",
      ),
    ).rejects.toThrow(/different from the editor/i);
    await expect(
      stageKnowledge({
        paths,
        actor: editor,
        sourceId: "KS-PENDING",
        filePath: join(repo, "candidate-one.json"),
      }),
    ).rejects.toThrow(/not approved/i);
  });

  it("rejects likely credentials in JSON uploads", async () => {
    const { repo, paths } = await fixture();
    const unsafe = join(repo, "unsafe.json");
    await writeFile(unsafe, JSON.stringify({ apiKey: "do-not-store-this" }));
    await expect(
      stageKnowledge({
        paths,
        actor: editor,
        sourceId: "KS-TEST",
        filePath: unsafe,
      }),
    ).rejects.toThrow(/credential fields/i);
  });

  it("rolls back only to an activated reviewed version and queues re-indexing", async () => {
    const { repo, paths } = await fixture();
    const first = await approveAndActivate(
      paths,
      join(repo, "candidate-one.json"),
      "2026-10-20T10:00:00.000Z",
    );
    await approveAndActivate(
      paths,
      join(repo, "candidate-two.json"),
      "2026-10-20T11:00:00.000Z",
    );
    const restored = await rollbackKnowledge(
      paths,
      reviewer,
      first.id,
      "The second version failed content review after activation.",
      new Date("2026-10-20T12:00:00.000Z"),
    );
    expect(restored.id).toBe(first.id);
    expect(
      JSON.parse(
        await readFile(join(repo, "content/data/source.json"), "utf8"),
      ),
    ).toEqual({ title: "Version one" });
    const ledger = await loadLedger(paths);
    expect(ledger.reindexRequests).toHaveLength(3);
    expect(ledger.auditEvents.at(-1)?.action).toBe("rolled-back");
  });
});
