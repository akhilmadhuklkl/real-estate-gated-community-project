import { createHash, timingSafeEqual } from "node:crypto";
import {
  copyFile,
  mkdir,
  readFile,
  rename,
  stat,
  writeFile,
} from "node:fs/promises";
import { basename, extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { z } from "zod";

const roleSchema = z.enum(["content-editor", "content-reviewer"]);
const stateSchema = z.enum([
  "validated",
  "pending-review",
  "approved",
  "active",
  "superseded",
  "rejected",
]);

const versionSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  fileName: z.string(),
  mediaType: z.string(),
  contentHash: z.string(),
  storedPath: z.string(),
  createdAt: z.string(),
  createdBy: z.string(),
  state: stateSchema,
  validation: z.object({ passed: z.boolean(), checks: z.array(z.string()) }),
  submittedAt: z.string().nullable(),
  submittedBy: z.string().nullable(),
  reviewedAt: z.string().nullable(),
  reviewedBy: z.string().nullable(),
  activatedAt: z.string().nullable(),
  activatedBy: z.string().nullable(),
  supersedesVersionId: z.string().nullable(),
});

const ledgerSchema = z.object({
  schemaVersion: z.literal("1.0.0"),
  projectId: z.literal("glitz-pride"),
  versions: z.array(versionSchema),
  activeVersions: z.record(z.string(), z.string()),
  auditEvents: z.array(
    z.object({
      id: z.string(),
      action: z.string(),
      actorId: z.string(),
      actorRole: roleSchema,
      occurredAt: z.string(),
      sourceId: z.string(),
      versionId: z.string(),
      reason: z.string(),
    }),
  ),
  reindexRequests: z.array(
    z.object({
      id: z.string(),
      versionId: z.string(),
      sourceId: z.string(),
      requestedAt: z.string(),
      requestedBy: z.string(),
      state: z.enum(["pending", "completed", "failed"]),
      completedAt: z.string().nullable(),
      detail: z.string(),
    }),
  ),
});

export type AdminRole = z.infer<typeof roleSchema>;
export type KnowledgeLedger = z.infer<typeof ledgerSchema>;
export type KnowledgeVersion = z.infer<typeof versionSchema>;

export type AdminActor = { id: string; role: AdminRole };
export type AdminPaths = {
  repo: string;
  ledger: string;
  register: string;
  versions: string;
};

type SourceRecord = {
  id: string;
  title: string;
  decision: string;
  format: string;
  location: string;
};

const approvedDecisions = new Set(["approved", "approved-with-qualifications"]);
const supportedFormats = new Map([
  ["json", { extension: ".json", mediaType: "application/json" }],
  ["pdf", { extension: ".pdf", mediaType: "application/pdf" }],
]);

export const defaultAdminPaths = (repo = process.cwd()): AdminPaths => ({
  repo: resolve(repo),
  ledger: resolve(repo, "content/administration/knowledge-admin.json"),
  register: resolve(repo, "content/data/ai-knowledge-sources.json"),
  versions: resolve(repo, "content/administration/versions"),
});

const emptyLedger = (): KnowledgeLedger => ({
  schemaVersion: "1.0.0",
  projectId: "glitz-pride",
  versions: [],
  activeVersions: {},
  auditEvents: [],
  reindexRequests: [],
});

const isoNow = (now = new Date()) => now.toISOString();
const shortStamp = (value: string) =>
  value.replace(/[-:.TZ]/g, "").slice(0, 14);
const hashBytes = (bytes: Buffer) =>
  `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
const safeId = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const assertInside = (root: string, target: string) => {
  const path = relative(resolve(root), resolve(target));
  if (!path || path === ".." || path.startsWith(`..${sep}`)) {
    throw new Error(
      "The administration target must stay inside the repository.",
    );
  }
};

const requireRole = (actor: AdminActor, role: AdminRole) => {
  if (actor.role !== role) {
    throw new Error(`This action requires the ${role} role.`);
  }
};

const secureEqual = (left: string, right: string) => {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return (
    leftBytes.length === rightBytes.length &&
    timingSafeEqual(leftBytes, rightBytes)
  );
};

export const authenticateAdmin = (
  environment: Record<string, string | undefined> = process.env,
): AdminActor => {
  const id = environment.KNOWLEDGE_ADMIN_ACTOR?.trim();
  const role = roleSchema.safeParse(environment.KNOWLEDGE_ADMIN_ROLE);
  const credential = environment.KNOWLEDGE_ADMIN_CREDENTIAL;
  if (!id || !role.success || !credential) {
    throw new Error("Knowledge administration credentials are incomplete.");
  }

  const configured =
    role.data === "content-editor"
      ? environment.KNOWLEDGE_EDITOR_CREDENTIAL
      : environment.KNOWLEDGE_REVIEWER_CREDENTIAL;
  if (!configured || !secureEqual(credential, configured)) {
    throw new Error("Knowledge administration authentication failed.");
  }
  return { id, role: role.data };
};

export const loadLedger = async (
  paths: AdminPaths,
): Promise<KnowledgeLedger> => {
  try {
    return ledgerSchema.parse(JSON.parse(await readFile(paths.ledger, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return emptyLedger();
    throw error;
  }
};

const saveLedger = async (paths: AdminPaths, ledger: KnowledgeLedger) => {
  ledgerSchema.parse(ledger);
  await mkdir(resolve(paths.ledger, ".."), { recursive: true });
  const temporary = `${paths.ledger}.tmp`;
  await writeFile(temporary, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
  await rename(temporary, paths.ledger);
};

const loadSources = async (paths: AdminPaths): Promise<SourceRecord[]> => {
  const value = JSON.parse(await readFile(paths.register, "utf8")) as {
    sources?: SourceRecord[];
  };
  if (!Array.isArray(value.sources))
    throw new Error("The governed source register is invalid.");
  return value.sources;
};

const findSource = async (paths: AdminPaths, sourceId: string) => {
  const source = (await loadSources(paths)).find(({ id }) => id === sourceId);
  if (!source) throw new Error(`Unknown governed source: ${sourceId}.`);
  if (!approvedDecisions.has(source.decision)) {
    throw new Error(`${sourceId} is not approved for knowledge activation.`);
  }
  if (!supportedFormats.has(source.format)) {
    throw new Error(`${sourceId} uses an unsupported administration format.`);
  }
  return source;
};

const inspectUpload = async (source: SourceRecord, filePath: string) => {
  const metadata = await stat(filePath);
  if (!metadata.isFile() || metadata.size === 0)
    throw new Error("The upload must be a non-empty file.");
  if (metadata.size > 20 * 1024 * 1024)
    throw new Error("The upload exceeds the 20 MB administration limit.");

  const expected = supportedFormats.get(source.format)!;
  if (extname(filePath).toLowerCase() !== expected.extension) {
    throw new Error(`The upload must use the ${expected.extension} extension.`);
  }
  const bytes = await readFile(filePath);
  const checks = ["source-approved", "size-valid", "extension-valid"];

  if (source.format === "pdf") {
    if (!bytes.subarray(0, 5).equals(Buffer.from("%PDF-")))
      throw new Error("The PDF signature is invalid.");
    checks.push("pdf-signature-valid");
  } else {
    const value = JSON.parse(bytes.toString("utf8")) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("The JSON upload must contain one root object.");
    }
    const secretKeys: string[] = [];
    const visit = (item: unknown, path = "root") => {
      if (Array.isArray(item))
        return item.forEach((child, index) =>
          visit(child, `${path}[${index}]`),
        );
      if (!item || typeof item !== "object") return;
      for (const [key, child] of Object.entries(item)) {
        if (/password|secret|token|api[_-]?key/i.test(key) && child)
          secretKeys.push(`${path}.${key}`);
        visit(child, `${path}.${key}`);
      }
    };
    visit(value);
    if (secretKeys.length)
      throw new Error(
        `Potential credential fields found: ${secretKeys.join(", ")}.`,
      );
    checks.push("json-parse-valid", "credential-field-scan-clear");
  }

  return {
    bytes,
    checks,
    mediaType: expected.mediaType,
    contentHash: hashBytes(bytes),
  };
};

const addAudit = (
  ledger: KnowledgeLedger,
  actor: AdminActor,
  version: KnowledgeVersion,
  action: string,
  reason: string,
  occurredAt: string,
) => {
  ledger.auditEvents.push({
    id: `kae-${shortStamp(occurredAt)}-${ledger.auditEvents.length + 1}`,
    action,
    actorId: actor.id,
    actorRole: actor.role,
    occurredAt,
    sourceId: version.sourceId,
    versionId: version.id,
    reason,
  });
};

const getVersion = (ledger: KnowledgeLedger, versionId: string) => {
  const version = ledger.versions.find(({ id }) => id === versionId);
  if (!version) throw new Error(`Unknown knowledge version: ${versionId}.`);
  return version;
};

export const stageKnowledge = async (input: {
  paths: AdminPaths;
  actor: AdminActor;
  sourceId: string;
  filePath: string;
  now?: Date;
}) => {
  requireRole(input.actor, "content-editor");
  const source = await findSource(input.paths, input.sourceId);
  const inspected = await inspectUpload(source, resolve(input.filePath));
  const createdAt = isoNow(input.now);
  const id = `kv-${safeId(input.sourceId)}-${shortStamp(createdAt)}-${inspected.contentHash.slice(-10)}`;
  const storedPath = `content/administration/versions/${id}/${basename(input.filePath)}`;
  const destination = resolve(input.paths.repo, storedPath);
  assertInside(input.paths.repo, destination);
  await mkdir(resolve(destination, ".."), { recursive: true });
  await writeFile(destination, inspected.bytes);

  const ledger = await loadLedger(input.paths);
  if (ledger.versions.some(({ id: existing }) => existing === id))
    throw new Error("This exact version is already staged.");
  const version: KnowledgeVersion = {
    id,
    sourceId: input.sourceId,
    fileName: basename(input.filePath),
    mediaType: inspected.mediaType,
    contentHash: inspected.contentHash,
    storedPath,
    createdAt,
    createdBy: input.actor.id,
    state: "validated",
    validation: { passed: true, checks: inspected.checks },
    submittedAt: null,
    submittedBy: null,
    reviewedAt: null,
    reviewedBy: null,
    activatedAt: null,
    activatedBy: null,
    supersedesVersionId: ledger.activeVersions[input.sourceId] ?? null,
  };
  ledger.versions.push(version);
  addAudit(
    ledger,
    input.actor,
    version,
    "validated",
    "Upload passed governed validation.",
    createdAt,
  );
  await saveLedger(input.paths, ledger);
  return version;
};

export const submitKnowledge = async (
  paths: AdminPaths,
  actor: AdminActor,
  versionId: string,
  now = new Date(),
) => {
  requireRole(actor, "content-editor");
  const ledger = await loadLedger(paths);
  const version = getVersion(ledger, versionId);
  if (version.createdBy !== actor.id || version.state !== "validated") {
    throw new Error(
      "Only the originating editor may submit a validated version.",
    );
  }
  const occurredAt = isoNow(now);
  version.state = "pending-review";
  version.submittedAt = occurredAt;
  version.submittedBy = actor.id;
  addAudit(
    ledger,
    actor,
    version,
    "submitted",
    "Version submitted for independent review.",
    occurredAt,
  );
  await saveLedger(paths, ledger);
  return version;
};

export const approveKnowledge = async (
  paths: AdminPaths,
  actor: AdminActor,
  versionId: string,
  reason: string,
  now = new Date(),
) => {
  requireRole(actor, "content-reviewer");
  if (!reason.trim()) throw new Error("Approval requires a review reason.");
  const ledger = await loadLedger(paths);
  const version = getVersion(ledger, versionId);
  if (version.state !== "pending-review")
    throw new Error("Only a pending version can be approved.");
  if (version.createdBy === actor.id || version.submittedBy === actor.id) {
    throw new Error("The reviewer must be different from the editor.");
  }
  const occurredAt = isoNow(now);
  version.state = "approved";
  version.reviewedAt = occurredAt;
  version.reviewedBy = actor.id;
  addAudit(ledger, actor, version, "approved", reason.trim(), occurredAt);
  await saveLedger(paths, ledger);
  return version;
};

const queueReindex = (
  ledger: KnowledgeLedger,
  version: KnowledgeVersion,
  actor: AdminActor,
  now: string,
  detail: string,
) => {
  ledger.reindexRequests.push({
    id: `kar-${shortStamp(now)}-${ledger.reindexRequests.length + 1}`,
    versionId: version.id,
    sourceId: version.sourceId,
    requestedAt: now,
    requestedBy: actor.id,
    state: "pending",
    completedAt: null,
    detail,
  });
};

const activateFile = async (
  paths: AdminPaths,
  source: SourceRecord,
  version: KnowledgeVersion,
) => {
  const stored = resolve(paths.repo, version.storedPath);
  const destination = resolve(paths.repo, source.location);
  assertInside(paths.repo, stored);
  assertInside(paths.repo, destination);
  if (hashBytes(await readFile(stored)) !== version.contentHash)
    throw new Error("Stored version hash mismatch.");
  await mkdir(resolve(destination, ".."), { recursive: true });
  await copyFile(stored, destination);
};

export const activateKnowledge = async (
  paths: AdminPaths,
  actor: AdminActor,
  versionId: string,
  now = new Date(),
) => {
  requireRole(actor, "content-reviewer");
  const ledger = await loadLedger(paths);
  const version = getVersion(ledger, versionId);
  if (version.state !== "approved" || version.reviewedBy !== actor.id) {
    throw new Error(
      "Only the approving reviewer may activate an approved version.",
    );
  }
  const source = await findSource(paths, version.sourceId);
  await activateFile(paths, source, version);
  const occurredAt = isoNow(now);
  const previousId = ledger.activeVersions[version.sourceId];
  if (previousId) getVersion(ledger, previousId).state = "superseded";
  version.state = "active";
  version.activatedAt = occurredAt;
  version.activatedBy = actor.id;
  version.supersedesVersionId = previousId ?? version.supersedesVersionId;
  ledger.activeVersions[version.sourceId] = version.id;
  queueReindex(
    ledger,
    version,
    actor,
    occurredAt,
    "Activation requires ingestion and vector-index rebuild.",
  );
  addAudit(
    ledger,
    actor,
    version,
    "activated",
    "Approved version copied to the governed source path.",
    occurredAt,
  );
  await saveLedger(paths, ledger);
  return version;
};

export const rollbackKnowledge = async (
  paths: AdminPaths,
  actor: AdminActor,
  targetVersionId: string,
  reason: string,
  now = new Date(),
) => {
  requireRole(actor, "content-reviewer");
  if (!reason.trim()) throw new Error("Rollback requires a reason.");
  const ledger = await loadLedger(paths);
  const target = getVersion(ledger, targetVersionId);
  if (!target.reviewedBy || !["superseded", "active"].includes(target.state)) {
    throw new Error(
      "Rollback targets must be previously approved and activated versions.",
    );
  }
  const source = await findSource(paths, target.sourceId);
  await activateFile(paths, source, target);
  const occurredAt = isoNow(now);
  const currentId = ledger.activeVersions[target.sourceId];
  if (currentId && currentId !== target.id)
    getVersion(ledger, currentId).state = "superseded";
  target.state = "active";
  target.activatedAt = occurredAt;
  target.activatedBy = actor.id;
  ledger.activeVersions[target.sourceId] = target.id;
  queueReindex(ledger, target, actor, occurredAt, `Rollback: ${reason.trim()}`);
  addAudit(ledger, actor, target, "rolled-back", reason.trim(), occurredAt);
  await saveLedger(paths, ledger);
  return target;
};

export const completeReindex = async (
  paths: AdminPaths,
  actor: AdminActor,
  requestId: string,
  now = new Date(),
) => {
  requireRole(actor, "content-reviewer");
  const ledger = await loadLedger(paths);
  const request = ledger.reindexRequests.find(({ id }) => id === requestId);
  if (!request || request.state !== "pending")
    throw new Error("A pending re-index request is required.");
  const commands: Array<[string, string[]]> = [
    ["python", ["scripts/ingest_ai_knowledge.py", "--repo", paths.repo]],
    [process.platform === "win32" ? "pnpm.cmd" : "pnpm", ["index:knowledge"]],
  ];
  for (const [command, args] of commands) {
    const result = spawnSync(command, args, {
      cwd: paths.repo,
      encoding: "utf8",
      stdio: "pipe",
    });
    if (result.status !== 0) {
      request.state = "failed";
      request.completedAt = isoNow(now);
      request.detail = `${command} failed: ${(result.stderr || result.stdout || "unknown error").trim()}`;
      await saveLedger(paths, ledger);
      throw new Error(request.detail);
    }
  }
  request.state = "completed";
  request.completedAt = isoNow(now);
  request.detail = "Ingestion and vector-index rebuild completed successfully.";
  await saveLedger(paths, ledger);
  return request;
};

const option = (name: string) => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const runCli = async () => {
  const action = process.argv[2];
  const paths = defaultAdminPaths();
  if (action === "status") {
    const ledger = await loadLedger(paths);
    console.log(
      JSON.stringify(
        {
          activeVersions: ledger.activeVersions,
          versions: ledger.versions,
          reindexRequests: ledger.reindexRequests,
        },
        null,
        2,
      ),
    );
    return;
  }
  const actor = authenticateAdmin();
  const versionId = option("version");
  let result: unknown;
  if (action === "stage") {
    const sourceId = option("source");
    const filePath = option("file");
    if (!sourceId || !filePath)
      throw new Error("stage requires --source and --file.");
    result = await stageKnowledge({ paths, actor, sourceId, filePath });
  } else if (action === "submit" && versionId) {
    result = await submitKnowledge(paths, actor, versionId);
  } else if (action === "approve" && versionId) {
    result = await approveKnowledge(
      paths,
      actor,
      versionId,
      option("reason") ?? "",
    );
  } else if (action === "activate" && versionId) {
    result = await activateKnowledge(paths, actor, versionId);
  } else if (action === "rollback" && versionId) {
    result = await rollbackKnowledge(
      paths,
      actor,
      versionId,
      option("reason") ?? "",
    );
  } else if (action === "reindex") {
    const requestId = option("request");
    if (!requestId) throw new Error("reindex requires --request.");
    result = await completeReindex(paths, actor, requestId);
  } else {
    throw new Error(
      "Use status, stage, submit, approve, activate, rollback, or reindex.",
    );
  }
  console.log(JSON.stringify(result, null, 2));
};

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  runCli().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
