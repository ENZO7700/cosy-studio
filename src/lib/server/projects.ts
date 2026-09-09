import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { importBlueprintZip, buildSampleBlueprintZip } from "@/lib/blueprint/zip-import";
import { persistBlueprintImport } from "@/lib/server/persist-blueprint";
import type {
  ActivityEvent,
  EvidenceItem,
  Json,
  ProjectDetail,
  ProjectListItem,
  SourceImport,
  SourceType,
} from "@/lib/cosy/types";

const CreateIdeaInput = z.object({
  name: z.string().trim().min(1).max(120),
  ideaBrief: z.string().trim().min(8).max(4000),
  targetStack: z.string(),
  scope: z.string(),
  authorized: z.boolean(),
});

const ImportZipInput = z.object({
  name: z.string().trim().min(1).max(120),
  filename: z.string().min(1).max(240),
  zipBase64: z.string().min(8),
  targetStack: z.string(),
  scope: z.string(),
  authorized: z.boolean(),
});

type ProjectRow = {
  id: string;
  name: string;
  source_type: string;
  status: string;
  target_stack: string | null;
  scope: string | null;
  readiness_score: number | null;
  risk_level: string | null;
  is_demo: boolean;
  idea_brief: string | null;
  created_at: string;
  updated_at: string;
};

function mapProject(row: ProjectRow): ProjectListItem & { ideaBrief?: string | null } {
  return {
    id: row.id,
    name: row.name,
    sourceType: row.source_type as SourceType,
    status: row.status as ProjectListItem["status"],
    targetStack: row.target_stack,
    scope: row.scope,
    readinessScore: row.readiness_score,
    riskLevel: row.risk_level,
    isDemo: Boolean(row.is_demo),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ideaBrief: row.idea_brief,
  };
}

export const listProjects = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<ProjectRow>`
    select id, name, source_type, status, target_stack, scope,
           readiness_score, risk_level, is_demo, idea_brief, created_at, updated_at
    from projects
    order by is_demo desc, updated_at desc
  `;
  return rows.map(mapProject);
});

export const getProject = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<ProjectDetail | null> => {
    const sql = await getSql();
    const projects = await sql<ProjectRow>`
      select id, name, source_type, status, target_stack, scope,
             readiness_score, risk_level, is_demo, idea_brief, created_at, updated_at
      from projects where id = ${data.id} limit 1
    `;
    const project = projects[0];
    if (!project) return null;

    const [blueprintRows, evidenceRows, importRows, activityRows] = await Promise.all([
      sql<{
        id: string;
        version: number;
        data: Json;
        content_hash: string | null;
        created_at: string;
      }>`select id, version, data, content_hash, created_at from blueprints where project_id = ${data.id} order by version desc limit 1`,
      sql<{
        id: string;
        category: string;
        label: string;
        value: string | null;
        confidence: number | string | null;
        source_reference: string | null;
        state: string;
        notes: string | null;
      }>`select id, category, label, value, confidence, source_reference, state, notes from evidence_items where project_id = ${data.id} order by category, label`,
      sql<{
        id: string;
        filename: string | null;
        source_url: string | null;
        checksum: string | null;
        imported_at: string;
        validation_status: string;
        import_metadata: Json;
        error_message: string | null;
      }>`select id, filename, source_url, checksum, imported_at, validation_status, import_metadata, error_message from source_imports where project_id = ${data.id} order by imported_at desc`,
      sql<{
        id: string;
        actor: string;
        type: string;
        message: string;
        created_at: string;
      }>`select id, actor, type, message, created_at from activity_events where project_id = ${data.id} order by created_at desc limit 20`,
    ]);

    const mapped = mapProject(project);
    const evidence: EvidenceItem[] = evidenceRows.map((row) => ({
      id: row.id,
      category: row.category,
      label: row.label,
      value: row.value,
      confidence:
        row.confidence === null || row.confidence === undefined
          ? null
          : Number(row.confidence),
      sourceReference: row.source_reference,
      state: row.state,
      notes: row.notes,
    }));
    const imports: SourceImport[] = importRows.map((row) => ({
      id: row.id,
      filename: row.filename,
      sourceUrl: row.source_url,
      checksum: row.checksum,
      importedAt: row.imported_at,
      validationStatus: row.validation_status,
      importMetadata: row.import_metadata,
      errorMessage: row.error_message,
    }));
    const activity: ActivityEvent[] = activityRows.map((row) => ({
      id: row.id,
      actor: row.actor,
      type: row.type,
      message: row.message,
      createdAt: row.created_at,
    }));

    return {
      project: { ...mapped, ideaBrief: project.idea_brief },
      blueprint: blueprintRows[0]
        ? {
            id: blueprintRows[0].id,
            version: blueprintRows[0].version,
            data: blueprintRows[0].data,
            contentHash: blueprintRows[0].content_hash,
            createdAt: blueprintRows[0].created_at,
          }
        : null,
      evidence,
      imports,
      activity,
    };
  });

export const createIdeaProject = createServerFn({ method: "POST" })
  .validator((input: unknown) => CreateIdeaInput.parse(input))
  .handler(async ({ data }) => {
    if (!data.authorized) {
      return { ok: false as const, errors: ["Authorization confirmation is required before import."] };
    }
    const sql = await getSql();
    const id = crypto.randomUUID();
    await sql.query(
      `insert into projects (id, organization_id, name, source_type, status, target_stack, scope, idea_brief)
       values ($1, 'org-cosy-demo', $2, 'blank', 'draft', $3, $4, $5)`,
      [id, data.name, data.targetStack, data.scope, data.ideaBrief],
    );
    await sql.query(
      `insert into activity_events (id, project_id, actor, type, message, metadata)
       values ($1, $2, 'workspace', 'create', $3, $4::jsonb)`,
      [
        crypto.randomUUID(),
        id,
        `Project created from a written idea.`,
        JSON.stringify({ sourceType: "blank" }),
      ],
    );
    return { ok: true as const, id };
  });

export const importZipProject = createServerFn({ method: "POST" })
  .validator((input: unknown) => ImportZipInput.parse(input))
  .handler(async ({ data }) => {
    const compressed = Uint8Array.from(Buffer.from(data.zipBase64, "base64"));
    const parsed = importBlueprintZip(compressed, {
      filename: data.filename,
      authorized: data.authorized,
    });
    if (!parsed.ok) {
      return { ok: false as const, errors: parsed.errors };
    }

    const sql = await getSql();
    const saved = await persistBlueprintImport(sql, {
      name: data.name,
      filename: data.filename,
      targetStack: data.targetStack,
      scope: data.scope,
      parsed,
    });
    return { ok: true as const, id: saved.id };
  });

export const sampleZip = createServerFn({ method: "GET" }).handler(async () => {
  const bytes = buildSampleBlueprintZip();
  return {
    filename: "sample-blueprint.zip",
    base64: Buffer.from(bytes).toString("base64"),
  };
});
