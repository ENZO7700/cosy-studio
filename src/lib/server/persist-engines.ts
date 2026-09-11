import type { ArchitectureDraft } from "../understand/architecture.ts";
import type { RiskDraft } from "../understand/risks.ts";
import type { TaskDraft } from "../understand/tasks.ts";
import type { GeneratedDraft } from "../rebuild/generate.ts";
import type { VerifyResult } from "../rebuild/verify.ts";
import type { PersistSql } from "./persist-blueprint.ts";
import type { Json } from "../cosy/types.ts";

export async function replaceAnalysis(
  sql: PersistSql,
  projectId: string,
  input: {
    readiness: number;
    riskLevel: string;
    architecture: ArchitectureDraft[];
    risks: RiskDraft[];
    tasks: TaskDraft[];
  },
) {
  await sql.query(`delete from architecture_nodes where project_id = $1`, [projectId]);
  await sql.query(`delete from risks where project_id = $1`, [projectId]);
  await sql.query(`delete from tasks where project_id = $1`, [projectId]);

  const ids = new Map<string, string>();
  for (const node of input.architecture) {
    const id = crypto.randomUUID();
    ids.set(node.key, id);
  }
  for (const node of input.architecture) {
    const parentId = node.parentKey ? (ids.get(node.parentKey) ?? null) : null;
    await sql.query(
      `insert into architecture_nodes (id, project_id, parent_id, category, title, data, state)
       values ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
      [
        ids.get(node.key),
        projectId,
        parentId,
        node.category,
        node.title,
        JSON.stringify(node.data),
        node.state,
      ],
    );
  }
  for (const risk of input.risks) {
    await sql.query(
      `insert into risks (id, project_id, severity, score, confidence, evidence, mitigation, status)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        crypto.randomUUID(),
        projectId,
        risk.severity,
        risk.score,
        risk.confidence,
        risk.evidence,
        risk.mitigation,
        risk.status,
      ],
    );
  }
  for (const task of input.tasks) {
    await sql.query(
      `insert into tasks (id, project_id, phase, title, description, priority, estimate_hours, dependencies, acceptance_criteria, status)
       values ($1, $2, $3, $4, $5, $6, $7, '[]'::jsonb, $8::jsonb, $9)`,
      [
        crypto.randomUUID(),
        projectId,
        task.phase,
        task.title,
        task.description,
        task.priority,
        task.estimateHours,
        JSON.stringify(task.acceptanceCriteria),
        task.status,
      ],
    );
  }
  await sql.query(
    `update projects set readiness_score = $2, risk_level = $3, status = 'blueprint_ready', updated_at = now() where id = $1`,
    [projectId, input.readiness, input.riskLevel],
  );
  await sql.query(
    `insert into activity_events (id, project_id, actor, type, message, metadata)
     values ($1, $2, 'workspace', 'understand', $3, $4::jsonb)`,
    [
      crypto.randomUUID(),
      projectId,
      `Understand engine wrote architecture, risks, and tasks. Readiness ${input.readiness}%.`,
      JSON.stringify({ readiness: input.readiness, riskLevel: input.riskLevel }),
    ],
  );
}

export async function replaceGeneratedFiles(
  sql: PersistSql,
  projectId: string,
  files: GeneratedDraft[],
  generatedBy: string,
) {
  await sql.query(`delete from generated_files where project_id = $1`, [projectId]);
  for (const file of files) {
    await sql.query(
      `insert into generated_files (id, project_id, path, code, language, version, generated_by)
       values ($1, $2, $3, $4, $5, 1, $6)`,
      [crypto.randomUUID(), projectId, file.path, file.code, file.language, generatedBy],
    );
  }
}

export async function insertBuildRun(
  sql: PersistSql,
  projectId: string,
  result: VerifyResult,
) {
  const id = crypto.randomUUID();
  await sql.query(
    `insert into build_runs (id, project_id, status, command, stdout, stderr, exit_code, completed_at)
     values ($1, $2, $3, $4, $5, $6, $7, now())`,
    [
      id,
      projectId,
      result.exitCode === 0 ? "passed" : "failed",
      result.command,
      result.stdout,
      result.stderr,
      result.exitCode,
    ],
  );
  await sql.query(
    `insert into activity_events (id, project_id, actor, type, message, metadata)
     values ($1, $2, 'workspace', 'build', $3, $4::jsonb)`,
    [
      crypto.randomUUID(),
      projectId,
      result.exitCode === 0
        ? "Workspace verification passed (exit 0)."
        : "Workspace verification failed.",
      JSON.stringify({ exitCode: result.exitCode, missing: result.missing } satisfies Json),
    ],
  );
  if (result.exitCode === 0) {
    await sql.query(
      `insert into project_versions (id, project_id, label, summary)
       values ($1, $2, $3, $4)`,
      [crypto.randomUUID(), projectId, "verified", "Generated tree passed cosy-verify."],
    );
  }
  return id;
}

export async function insertExportArtifact(
  sql: PersistSql,
  projectId: string,
  type: string,
  filename: string,
) {
  const id = crypto.randomUUID();
  await sql.query(
    `insert into export_artifacts (id, project_id, type, storage_ref)
     values ($1, $2, $3, $4)`,
    [id, projectId, type, filename],
  );
  await sql.query(
    `insert into activity_events (id, project_id, actor, type, message, metadata)
     values ($1, $2, 'workspace', 'export', $3, $4::jsonb)`,
    [
      crypto.randomUUID(),
      projectId,
      `Exported ${type} (${filename}).`,
      JSON.stringify({ type, filename }),
    ],
  );
  return id;
}
