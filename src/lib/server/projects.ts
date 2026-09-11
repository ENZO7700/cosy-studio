import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { importBlueprintZip, buildSampleBlueprintZip } from "@/lib/blueprint/zip-import";
import { persistBlueprintImport } from "@/lib/server/persist-blueprint";
import { scanPublicSource } from "@/lib/scanner/scan";
import { scannerBlueprintToCosy, evidenceFromScan } from "@/lib/server/promote-scan";
import type { Blueprint as ScanBlueprint } from "@/lib/blueprint/types";
import type {
  ActivityEvent,
  ArchitectureNode,
  BuildRun,
  CanvasMessage,
  EvidenceItem,
  ExportArtifact,
  GeneratedFile,
  Json,
  ProjectDetail,
  ProjectListItem,
  RiskItem,
  SourceImport,
  SourceType,
  TaskItem,
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

const ScanInput = z.object({
  name: z.string().trim().min(1).max(120),
  sourceUrl: z.string().trim().max(2000).optional().default(""),
  pastedHtml: z.string().max(1_500_000).optional().default(""),
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

    const [
      blueprintRows,
      evidenceRows,
      importRows,
      activityRows,
      architectureRows,
      riskRows,
      taskRows,
      fileRows,
      buildRows,
      exportRows,
      messageRows,
    ] = await Promise.all([
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
      sql<{
        id: string;
        parent_id: string | null;
        category: string;
        title: string;
        data: Json;
        state: string;
      }>`select id, parent_id, category, title, data, state from architecture_nodes where project_id = ${data.id}`,
      sql<{
        id: string;
        severity: string;
        score: number | null;
        confidence: number | string | null;
        evidence: string | null;
        mitigation: string | null;
        status: string;
      }>`select id, severity, score, confidence, evidence, mitigation, status from risks where project_id = ${data.id} order by score desc nulls last`,
      sql<{
        id: string;
        phase: string | null;
        title: string;
        description: string | null;
        priority: string | null;
        estimate_hours: number | string | null;
        acceptance_criteria: Json;
        status: string;
      }>`select id, phase, title, description, priority, estimate_hours, acceptance_criteria, status from tasks where project_id = ${data.id}`,
      sql<{
        id: string;
        path: string;
        code: string;
        language: string | null;
        version: number;
      }>`select id, path, code, language, version from generated_files where project_id = ${data.id} order by path`,
      sql<{
        id: string;
        status: string;
        command: string | null;
        stdout: string | null;
        stderr: string | null;
        exit_code: number | null;
        started_at: string;
        completed_at: string | null;
      }>`select id, status, command, stdout, stderr, exit_code, started_at, completed_at from build_runs where project_id = ${data.id} order by started_at desc limit 8`,
      sql<{
        id: string;
        type: string;
        storage_ref: string | null;
        created_at: string;
      }>`select id, type, storage_ref, created_at from export_artifacts where project_id = ${data.id} order by created_at desc`,
      sql<{
        id: string;
        role: string;
        body: string;
        created_at: string;
      }>`select id, role, body, created_at from canvas_messages where project_id = ${data.id} order by created_at asc limit 40`,
    ]);

    const mapped = mapProject(project);
    const evidence: EvidenceItem[] = evidenceRows.map((row) => ({
      id: row.id,
      category: row.category,
      label: row.label,
      value: row.value,
      confidence:
        row.confidence === null || row.confidence === undefined ? null : Number(row.confidence),
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
    const architecture: ArchitectureNode[] = architectureRows.map((row) => ({
      id: row.id,
      parentId: row.parent_id,
      category: row.category,
      title: row.title,
      data: row.data,
      state: row.state,
    }));
    const risks: RiskItem[] = riskRows.map((row) => ({
      id: row.id,
      severity: row.severity,
      score: row.score,
      confidence:
        row.confidence === null || row.confidence === undefined ? null : Number(row.confidence),
      evidence: row.evidence,
      mitigation: row.mitigation,
      status: row.status,
    }));
    const tasks: TaskItem[] = taskRows.map((row) => ({
      id: row.id,
      phase: row.phase,
      title: row.title,
      description: row.description,
      priority: row.priority,
      estimateHours:
        row.estimate_hours === null || row.estimate_hours === undefined
          ? null
          : Number(row.estimate_hours),
      acceptanceCriteria: row.acceptance_criteria,
      status: row.status,
    }));
    const files: GeneratedFile[] = fileRows.map((row) => ({
      id: row.id,
      path: row.path,
      code: row.code,
      language: row.language,
      version: row.version,
    }));
    const builds: BuildRun[] = buildRows.map((row) => ({
      id: row.id,
      status: row.status,
      command: row.command,
      stdout: row.stdout,
      stderr: row.stderr,
      exitCode: row.exit_code,
      startedAt: row.started_at,
      completedAt: row.completed_at,
    }));
    const exports: ExportArtifact[] = exportRows.map((row) => ({
      id: row.id,
      type: row.type,
      storageRef: row.storage_ref,
      createdAt: row.created_at,
    }));
    const canvasMessages: CanvasMessage[] = messageRows.map((row) => ({
      id: row.id,
      role: row.role,
      body: row.body,
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
      architecture,
      risks,
      tasks,
      files,
      builds,
      exports,
      canvasMessages,
    };
  });

export const createIdeaProject = createServerFn({ method: "POST" })
  .validator((input: unknown) => CreateIdeaInput.parse(input))
  .handler(async ({ data }) => {
    if (!data.authorized) {
      return { ok: false as const, errors: ["Najprv zaškrtnite, že na to máte právo."] };
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
        `Projekt vznikol z napísaného nápadu.`,
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

export const scanPublicProject = createServerFn({ method: "POST" })
  .validator((input: unknown) => ScanInput.parse(input))
  .handler(async ({ data }) => {
    const scanned = await scanPublicSource({
      authorized: data.authorized,
      sourceUrl: data.sourceUrl,
      pastedHtml: data.pastedHtml,
    });
    if (!scanned.ok) {
      return { ok: false as const, errors: scanned.errors };
    }
    const sql = await getSql();
    const saved = await persistBlueprintImport(sql, {
      name: data.name,
      filename: data.sourceUrl ? "public-scan.html" : "pasted.html",
      targetStack: data.targetStack,
      scope: data.scope,
      sourceType: "url",
      sourceUrl: data.sourceUrl || null,
      parsed: scanned,
    });
    return { ok: true as const, id: saved.id, partial: scanned.partial };
  });

export const sampleZip = createServerFn({ method: "GET" }).handler(async () => {
  const bytes = buildSampleBlueprintZip();
  return {
    filename: "sample-blueprint.zip",
    base64: Buffer.from(bytes).toString("base64"),
  };
});

export const promoteScanToProject = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        blueprint: z.unknown(),
        authorized: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (!data.authorized) {
      return { ok: false as const, errors: ["Najprv zaškrtnite, že na to máte právo."] };
    }
    const bp = data.blueprint as ScanBlueprint;
    const cosy = scannerBlueprintToCosy(bp);
    const evidence = evidenceFromScan(bp);
    const html = typeof bp.html === "string" ? bp.html : "";
    const sql = await getSql();
    const saved = await persistBlueprintImport(sql, {
      name: bp.meta?.title || "Sken webu",
      filename: "public-scan.html",
      targetStack: "next_ts_tailwind",
      scope: "frontend_rebuild",
      sourceType: "url",
      sourceUrl: bp.finalUrl || bp.sourceUrl || null,
      parsed: {
        blueprint: cosy,
        evidence,
        contentHash: bp.contentHash || "scan",
        html,
        files: ["blueprint.json", "index.html"],
        uncompressedBytes: Buffer.byteLength(html),
        warnings: Array.isArray(cosy.warnings) ? cosy.warnings.map(String) : [],
      },
    });
    return { ok: true as const, id: saved.id };
  });
