import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { buildSampleBlueprintZip, importBlueprintZip } from "../blueprint/zip-import.ts";
import { persistBlueprintImport, type PersistSql } from "./persist-blueprint.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

async function openTestSql(): Promise<{ sql: PersistSql; close: () => Promise<void> }> {
  const pg = new PGlite();
  await pg.waitReady;
  const schema = readFileSync(join(root, "migrations/0002_cosy.sql"), "utf8");
  await pg.exec(schema);
  const sql: PersistSql = {
    query: async <T = Record<string, unknown>>(text: string, params: unknown[] = []) => {
      const result = await pg.query<T>(text, params);
      return result.rows;
    },
  };
  return { sql, close: () => pg.close() };
}

test("ZIP import persists project, blueprint, evidence, and activity rows", async () => {
  const { sql, close } = await openTestSql();
  try {
    const parsed = importBlueprintZip(buildSampleBlueprintZip(), {
      filename: "sample.zip",
      authorized: true,
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;

    const saved = await persistBlueprintImport(sql, {
      name: "Persist regression",
      filename: "sample.zip",
      targetStack: "next_ts_tailwind",
      scope: "frontend_rebuild",
      parsed,
      projectId: "proj-persist-1",
    });

    const projects = await sql.query<{
      source_type: string;
      status: string;
      name: string;
    }>("select source_type, status, name from projects where id = $1", [saved.id]);
    assert.equal(projects[0]?.name, "Persist regression");
    assert.equal(projects[0]?.source_type, "blueprint_zip");
    assert.equal(projects[0]?.status, "blueprint_ready");

    const imports = await sql.query<{ checksum: string; filename: string; validation_status: string }>(
      "select checksum, filename, validation_status from source_imports where project_id = $1",
      [saved.id],
    );
    assert.equal(imports[0]?.filename, "sample.zip");
    assert.equal(imports[0]?.checksum, parsed.contentHash);
    assert.equal(imports[0]?.validation_status, "valid");

    const blueprints = await sql.query<{ version: number; content_hash: string; data: { sourceUrl?: string } }>(
      "select version, content_hash, data from blueprints where project_id = $1",
      [saved.id],
    );
    assert.equal(blueprints[0]?.version, 1);
    assert.equal(blueprints[0]?.content_hash, parsed.contentHash);
    assert.equal(blueprints[0]?.data?.sourceUrl, "https://example.com/sample");

    const evidence = await sql.query<{ n: string | number }>(
      "select count(*)::int as n from evidence_items where project_id = $1",
      [saved.id],
    );
    assert.ok(Number(evidence[0]?.n) >= 5);

    const activity = await sql.query<{ type: string; message: string }>(
      "select type, message from activity_events where project_id = $1",
      [saved.id],
    );
    assert.equal(activity[0]?.type, "import");
    assert.match(activity[0]?.message ?? "", /sample\.zip/);
  } finally {
    await close();
  }
});

test("rejected ZIP never writes project rows", async () => {
  const { sql, close } = await openTestSql();
  try {
    const parsed = importBlueprintZip(buildSampleBlueprintZip(), {
      filename: "sample.zip",
      authorized: false,
    });
    assert.equal(parsed.ok, false);
    const before = await sql.query<{ n: string | number }>(
      "select count(*)::int as n from projects where is_demo = false",
    );
    assert.equal(Number(before[0]?.n), 0);
  } finally {
    await close();
  }
});
