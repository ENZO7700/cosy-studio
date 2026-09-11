import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { buildSampleBlueprintZip, importBlueprintZip } from "../blueprint/zip-import.ts";
import { persistBlueprintImport, type PersistSql } from "./persist-blueprint.ts";
import { insertBuildRun, replaceAnalysis, replaceGeneratedFiles } from "./persist-engines.ts";
import { buildArchitecture } from "../understand/architecture.ts";
import { buildRisks } from "../understand/risks.ts";
import { buildTasks } from "../understand/tasks.ts";
import { computeReadiness } from "../understand/readiness.ts";
import { generateApplication } from "../rebuild/generate.ts";
import { verifyGeneratedTree } from "../rebuild/verify.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

async function openTestSql() {
  const pg = new PGlite();
  await pg.waitReady;
  await pg.exec(readFileSync(join(root, "migrations/0002_cosy.sql"), "utf8"));
  await pg.exec(readFileSync(join(root, "migrations/0003_engines.sql"), "utf8"));
  const sql: PersistSql = {
    query: async <T = Record<string, unknown>>(text: string, params: unknown[] = []) => {
      const result = await pg.query<T>(text, params);
      return result.rows;
    },
  };
  return { sql, close: () => pg.close() };
}

test("understand + rebuild persist architecture, files, and exit 0 build run", async () => {
  const { sql, close } = await openTestSql();
  try {
    const parsed = importBlueprintZip(buildSampleBlueprintZip(), {
      filename: "sample.zip",
      authorized: true,
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const saved = await persistBlueprintImport(sql, {
      name: "Engine persist",
      filename: "sample.zip",
      targetStack: "next_ts_tailwind",
      scope: "frontend_rebuild",
      parsed,
      projectId: "proj-engine-1",
    });
    const readiness = computeReadiness(parsed.evidence);
    await replaceAnalysis(sql, saved.id, {
      readiness: readiness.score,
      riskLevel: readiness.riskLevel,
      architecture: buildArchitecture(parsed.blueprint),
      risks: buildRisks(parsed.blueprint, parsed.evidence),
      tasks: buildTasks(parsed.blueprint, "next_ts_tailwind"),
    });
    const files = generateApplication({
      name: "Engine persist",
      targetStack: "next_ts_tailwind",
      scope: "frontend_rebuild",
      blueprint: parsed.blueprint,
    });
    await replaceGeneratedFiles(sql, saved.id, files, "test");
    const verified = verifyGeneratedTree(files);
    await insertBuildRun(sql, saved.id, verified);

    const nodes = await sql.query<{ n: string | number }>(
      "select count(*)::int as n from architecture_nodes where project_id = $1",
      [saved.id],
    );
    const generated = await sql.query<{ n: string | number }>(
      "select count(*)::int as n from generated_files where project_id = $1",
      [saved.id],
    );
    const builds = await sql.query<{ exit_code: number }>(
      "select exit_code from build_runs where project_id = $1",
      [saved.id],
    );
    assert.ok(Number(nodes[0]?.n) >= 2);
    assert.ok(Number(generated[0]?.n) >= 5);
    assert.equal(builds[0]?.exit_code, 0);
  } finally {
    await close();
  }
});
