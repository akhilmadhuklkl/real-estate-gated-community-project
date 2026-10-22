import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import packageManifest from "../../package.json";

describe("hosted assistant runtime", () => {
  it("does not promote the offline native inference runtime to a hosted dependency", () => {
    expect(packageManifest.dependencies).not.toHaveProperty("onnxruntime-node");
  });

  it("keeps native embedding imports out of the hosted assistant path", () => {
    const runtimeSource = readFileSync(
      resolve(process.cwd(), "src/lib/assistant-runtime.ts"),
      "utf8",
    );
    expect(runtimeSource).not.toContain("@huggingface/transformers");
    expect(runtimeSource).toContain("rankLexicalRecords");
  });
});
