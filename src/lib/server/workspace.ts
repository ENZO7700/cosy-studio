import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { BlueprintSchema, extractEvidence, type Blueprint } from "@/lib/blueprint/schema";
import { buildArchitecture } from "@/lib/understand/architecture";
import { buildRisks } from "@/lib/understand/risks";
import { buildTasks } from "@/lib/understand/tasks";
import { computeReadiness } from "@/lib/understand/readiness";
import { generateApplication, type GeneratedDraft } from "@/lib/rebuild/generate";
import { repairGeneratedTree, verifyGeneratedTree } from "@/lib/rebuild/verify";
import { zipApplication, zipCursorPlan } from "@/lib/export/zip";
import {
  insertBuildRun,
  insertExportArtifact,
  replaceAnalysis,
  replaceGeneratedFiles,
} from "@/lib/server/persist-engines";
import { isPlanId, PLANS } from "@/lib/saas/plans";

const IdInput = z.object({ id: z.string().min(1) });

function asBlueprint(data: unknown, fallback: Blueprint): Blueprint {
  const parsed = BlueprintSchema.safeParse(data);
  return parsed.success ? parsed.data : fallback;
}

async function loadProjectBundle(id: string) {
  const sql = await getSql();
  const projects = await sql<{
    id: string;
    name: string;
    target_stack: string | null;
    scope: string | null;
    idea_brief: string | null;
  }>`select id, name, target_stack, scope, idea_brief from projects where id = ${id} limit 1`;
  const project = projects[0];
  if (!project) return { sql, project: null as null };
  const [blueprintRows, evidenceRows, fileRows, taskRows] = await Promise.all([
    sql<{ data: unknown }>`select data from blueprints where project_id = ${id} order by version desc limit 1`,
    sql<{
      category: string;
      confidence: number | string | null;
      state: string;
      label: string;
      value: string | null;
    }>`select category, confidence, state, label, value from evidence_items where project_id = ${id}`,
    sql<{ path: string; code: string; language: string | null }>`select path, code, language from generated_files where project_id = ${id}`,
    sql<{
      title: string;
      phase: string | null;
      description: string | null;
      estimate_hours: number | string | null;
    }>`select title, phase, description, estimate_hours from tasks where project_id = ${id}`,
  ]);
  return { sql, project, blueprintRows, evidenceRows, fileRows, taskRows };
}

function ideaBlueprint(name: string, idea: string): Blueprint {
  return {
    version: "1.0",
    pages: [{ path: "/", title: name }],
    warnings: ["Len napísaný nápad — žiadna verejná stránka."],
    limitations: ["Žiadny sken. Stavba je odhad podľa textu."],
    metadata: { idea },
  };
}

export const analyzeProject = createServerFn({ method: "POST" })
  .validator((input: unknown) => IdInput.parse(input))
  .handler(async ({ data }) => {
    const loaded = await loadProjectBundle(data.id);
    if (!loaded.project) return { ok: false as const, errors: ["Tento projekt sme nenašli."] };
    const { sql, project, blueprintRows, evidenceRows } = loaded;
    const blueprint = blueprintRows[0]
      ? asBlueprint(blueprintRows[0].data, ideaBlueprint(project.name, project.idea_brief ?? ""))
      : ideaBlueprint(project.name, project.idea_brief ?? "");
    const evidence =
      evidenceRows && evidenceRows.length
        ? evidenceRows.map((row) => ({
            category: row.category,
            label: row.label,
            value: row.value ?? "",
            confidence: row.confidence === null || row.confidence === undefined ? null : Number(row.confidence),
            sourceReference: "evidence",
            state: row.state as "detected",
          }))
        : extractEvidence(blueprint);
    const architecture = buildArchitecture(blueprint);
    const risks = buildRisks(blueprint, evidence);
    const tasks = buildTasks(blueprint, project.target_stack ?? "next_ts_tailwind");
    const readiness = computeReadiness(evidence);
    await replaceAnalysis(sql, project.id, {
      readiness: readiness.score,
      riskLevel: readiness.riskLevel,
      architecture,
      risks,
      tasks,
    });
    return { ok: true as const, readiness };
  });

export const rebuildProject = createServerFn({ method: "POST" })
  .validator((input: unknown) => IdInput.parse(input))
  .handler(async ({ data }) => {
    const loaded = await loadProjectBundle(data.id);
    if (!loaded.project) return { ok: false as const, errors: ["Tento projekt sme nenašli."] };
    const { sql, project, blueprintRows } = loaded;
    const blueprint = blueprintRows[0]
      ? asBlueprint(blueprintRows[0].data, ideaBlueprint(project.name, project.idea_brief ?? ""))
      : ideaBlueprint(project.name, project.idea_brief ?? "");
    let files = generateApplication({
      name: project.name,
      targetStack: project.target_stack ?? "next_ts_tailwind",
      scope: project.scope ?? "frontend_rebuild",
      blueprint,
    });
    let verified = verifyGeneratedTree(files);
    if (verified.exitCode !== 0) {
      files = repairGeneratedTree(files, generateApplication({
        name: project.name,
        targetStack: project.target_stack ?? "next_ts_tailwind",
        scope: project.scope ?? "frontend_rebuild",
        blueprint,
      }));
      verified = verifyGeneratedTree(files);
    }
    await replaceGeneratedFiles(sql, project.id, files, "cosy-rebuild");
    const buildId = await insertBuildRun(sql, project.id, verified);
    return {
      ok: true as const,
      fileCount: files.length,
      exitCode: verified.exitCode,
      buildId,
      repaired: verified.missing.length === 0 && verified.exitCode === 0,
    };
  });

export const postCanvasMessage = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ id: z.string().min(1), body: z.string().trim().min(1).max(2000) }).parse(input),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const projects = await sql<{ id: string }>`select id from projects where id = ${data.id} limit 1`;
    if (!projects[0]) return { ok: false as const, errors: ["Tento projekt sme nenašli."] };
    await sql.query(
      `insert into canvas_messages (id, project_id, role, body) values ($1, $2, 'user', $3)`,
      [crypto.randomUUID(), data.id, data.body],
    );
    await sql.query(
      `insert into canvas_messages (id, project_id, role, body) values ($1, $2, 'system', $3)`,
      [
        crypto.randomUUID(),
        data.id,
        "Poznámka je uložená. Náhľad a kontrola sa tým samy nespustia.",
      ],
    );
    return { ok: true as const };
  });

export const exportProjectZip = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ id: z.string().min(1), kind: z.enum(["application", "cursor_plan"]) }).parse(input),
  )
  .handler(async ({ data }) => {
    const loaded = await loadProjectBundle(data.id);
    if (!loaded.project) return { ok: false as const, errors: ["Tento projekt sme nenašli."] };
    const files: GeneratedDraft[] = (loaded.fileRows ?? []).map((row) => ({
      path: row.path,
      code: row.code,
      language: row.language ?? "txt",
    }));
    if (files.length === 0) {
      return { ok: false as const, errors: ["Najprv pripravte súbory, až potom sťahujte."] };
    }
    const built =
      data.kind === "application"
        ? zipApplication(loaded.project.name, files)
        : zipCursorPlan(
            loaded.project.name,
            files,
            (loaded.taskRows ?? []).map((row) => ({
              title: row.title,
              phase: row.phase ?? "",
              description: row.description ?? "",
              estimateHours: row.estimate_hours === null || row.estimate_hours === undefined ? null : Number(row.estimate_hours),
            })),
          );
    await insertExportArtifact(loaded.sql, loaded.project.id, data.kind, built.filename);
    return {
      ok: true as const,
      filename: built.filename,
      base64: Buffer.from(built.bytes).toString("base64"),
    };
  });

export const getWorkspaceOrg = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const orgs = await sql<{
    id: string;
    name: string;
    plan: string;
    created_at: string;
  }>`select id, name, plan, created_at from organizations where id = 'org-cosy-demo' limit 1`;
  const members = await sql<{
    id: string;
    display_name: string;
    role: string;
  }>`select id, display_name, role from organization_members where organization_id = 'org-cosy-demo' order by role`;
  const billing = await sql<{
    id: string;
    provider: string;
    plan: string;
    note: string | null;
    created_at: string;
  }>`select id, provider, plan, note, created_at from billing_events where organization_id = 'org-cosy-demo' order by created_at desc limit 8`;
  return {
    org: orgs[0] ?? { id: "org-cosy-demo", name: "COSY Demo Workspace", plan: "studio", created_at: "" },
    members,
    billing,
    plans: PLANS,
  };
});

export const selectWorkspacePlan = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ plan: z.string(), name: z.string().trim().max(80).optional() }).parse(input))
  .handler(async ({ data }) => {
    if (!isPlanId(data.plan)) {
      return { ok: false as const, errors: ["Unknown plan."] };
    }
    const sql = await getSql();
    if (data.name) {
      await sql.query(`update organizations set name = $1 where id = 'org-cosy-demo'`, [data.name]);
    }
    await sql.query(`update organizations set plan = $1 where id = 'org-cosy-demo'`, [data.plan]);
    await sql.query(
      `insert into billing_events (id, organization_id, provider, plan, note)
       values ($1, 'org-cosy-demo', 'sandbox', $2, $3)`,
      [
        crypto.randomUUID(),
        data.plan,
        "Sandbox plan change. No card was charged. Stripe is not connected in this workspace.",
      ],
    );
    return { ok: true as const, plan: data.plan };
  });
