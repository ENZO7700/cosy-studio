import type { ZipImportSuccess } from "../blueprint/zip-import.ts";

export type PersistSql = {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
};

export type PersistBlueprintInput = {
  name: string;
  filename: string;
  targetStack: string;
  scope: string;
  parsed: ZipImportSuccess;
  organizationId?: string;
  projectId?: string;
};

export type PersistBlueprintResult = {
  id: string;
  blueprintId: string;
  importId: string;
};

function sourceUrlFrom(parsed: ZipImportSuccess): string | null {
  const blueprint = parsed.blueprint as Record<string, unknown>;
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
  const sourceUrl = sourceUrlFrom(input.parsed);

  await sql.query(
    `insert into projects (id, organization_id, name, source_type, status, target_stack, scope, readiness_score, risk_level)
     values ($1, $2, $3, 'blueprint_zip', 'blueprint_ready', $4, $5, null, 'needs_review')`,
    [id, organizationId, input.name, input.targetStack, input.scope],
  );
  await sql.query(
    `insert into source_imports (id, project_id, filename, source_url, checksum, validation_status, import_metadata)
     values ($1, $2, $3, $4, $5, 'valid', $6::jsonb)`,
    [
      importId,
      id,
      input.filename,
      sourceUrl,
      input.parsed.contentHash,
      JSON.stringify({
        files: input.parsed.files,
        uncompressedBytes: input.parsed.uncompressedBytes,
      }),
    ],
  );
  await sql.query(
    `insert into blueprints (id, project_id, version, data, content_hash)
     values ($1, $2, 1, $3::jsonb, $4)`,
    [blueprintId, id, JSON.stringify(input.parsed.blueprint), input.parsed.contentHash],
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
      `Blueprint ZIP imported (${input.filename}).`,
      JSON.stringify({ checksum: input.parsed.contentHash, files: input.parsed.files.length }),
    ],
  );

  return { id, blueprintId, importId };
}
