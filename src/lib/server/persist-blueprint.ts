import type { ZipImportSuccess } from "../blueprint/zip-import.ts";
import { computeReadiness } from "../understand/readiness.ts";
import type { SourceType } from "../cosy/types.ts";

export type PersistSql = {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
};

export type PersistBlueprintInput = {
  name: string;
  filename?: string | null;
  targetStack: string;
  scope: string;
  parsed: Pick<ZipImportSuccess, "blueprint" | "evidence" | "contentHash"> & {
    files?: string[];
    uncompressedBytes?: number;
    html?: string;
    warnings?: string[];
  };
  organizationId?: string;
  projectId?: string;
  sourceType?: SourceType;
  sourceUrl?: string | null;
};

export type PersistBlueprintResult = {
  id: string;
  blueprintId: string;
  importId: string;
};

function sourceUrlFrom(input: PersistBlueprintInput): string | null {
  if (input.sourceUrl) return input.sourceUrl;
  const blueprint = input.parsed.blueprint as Record<string, unknown>;
  if (typeof blueprint.sourceUrl === "string" && blueprint.sourceUrl) return blueprint.sourceUrl;
  if (typeof blueprint.source_url === "string" && blueprint.source_url) return blueprint.source_url;
  return null;
}

export async function persistBlueprintImport(
  sql: PersistSql,
  input: PersistBlueprintInput,
): Promise<PersistBlueprintResult> {
  const id = input.projectId ?? crypto.randomUUID();
  const blueprintId = crypto.randomUUID();
  const importId = crypto.randomUUID();
  const organizationId = input.organizationId ?? "org-cosy-demo";
  const sourceUrl = sourceUrlFrom(input);
  const sourceType = input.sourceType ?? "blueprint_zip";
  const readiness = computeReadiness(input.parsed.evidence);

  const blueprintPayload = {
    ...(input.parsed.blueprint as Record<string, unknown>),
    capturedHtml:
      typeof input.parsed.html === "string" ? input.parsed.html.slice(0, 80_000) : undefined,
  };

  await sql.query(
    `insert into projects (id, organization_id, name, source_type, status, target_stack, scope, readiness_score, risk_level)
     values ($1, $2, $3, $4, 'blueprint_ready', $5, $6, $7, $8)`,
    [
      id,
      organizationId,
      input.name,
      sourceType,
      input.targetStack,
      input.scope,
      readiness.score,
      readiness.riskLevel,
    ],
  );
  await sql.query(
    `insert into source_imports (id, project_id, filename, source_url, checksum, validation_status, import_metadata)
     values ($1, $2, $3, $4, $5, 'valid', $6::jsonb)`,
    [
      importId,
      id,
      input.filename ?? null,
      sourceUrl,
      input.parsed.contentHash,
      JSON.stringify({
        files: input.parsed.files ?? [],
        uncompressedBytes: input.parsed.uncompressedBytes ?? 0,
        warnings: input.parsed.warnings ?? [],
      }),
    ],
  );
  await sql.query(
    `insert into blueprints (id, project_id, version, data, content_hash)
     values ($1, $2, 1, $3::jsonb, $4)`,
    [blueprintId, id, JSON.stringify(blueprintPayload), input.parsed.contentHash],
  );
  for (const item of input.parsed.evidence) {
    await sql.query(
      `insert into evidence_items (id, project_id, category, label, value, confidence, source_reference, state)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        crypto.randomUUID(),
        id,
        item.category,
        item.label,
        item.value,
        item.confidence,
        item.sourceReference,
        item.state,
      ],
    );
  }
  await sql.query(
    `insert into activity_events (id, project_id, actor, type, message, metadata)
     values ($1, $2, 'workspace', 'import', $3, $4::jsonb)`,
    [
      crypto.randomUUID(),
      id,
      sourceType === "url"
        ? `Public scan imported (${sourceUrl ?? "pasted HTML"}).`
        : `Blueprint ZIP imported (${input.filename ?? "archive"}).`,
      JSON.stringify({ checksum: input.parsed.contentHash, sourceType }),
    ],
  );

  return { id, blueprintId, importId };
}
