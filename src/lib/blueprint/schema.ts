import { z } from "zod";

export const EvidenceStateSchema = z.enum([
  "detected",
  "inferred",
  "confirmed",
  "rejected",
  "manual",
]);

export const BlueprintSchema = z
  .object({
    version: z.union([z.string(), z.number()]).optional(),
    sourceUrl: z.string().optional(),
    source_url: z.string().optional(),
    finalUrl: z.string().optional(),
    final_url: z.string().optional(),
    capturedAt: z.string().optional(),
    captured_at: z.string().optional(),
    pages: z.array(z.unknown()).optional(),
    designTokens: z.unknown().optional(),
    tokens: z.unknown().optional(),
    forms: z.array(z.unknown()).optional(),
    technology: z.unknown().optional(),
    techSignals: z.unknown().optional(),
    wordpress: z.unknown().optional(),
    elementor: z.unknown().optional(),
    warnings: z.array(z.unknown()).optional(),
    limitations: z.array(z.unknown()).optional(),
    metadata: z.unknown().optional(),
  })
  .passthrough();

export const ManifestSchema = z
  .object({
    name: z.string().optional(),
    sourceUrl: z.string().optional(),
    createdAt: z.string().optional(),
  })
  .passthrough();

export type Blueprint = z.infer<typeof BlueprintSchema>;

export type EvidenceDraft = {
  category: string;
  label: string;
  value: string;
  confidence: number | null;
  sourceReference: string;
  state: z.infer<typeof EvidenceStateSchema>;
};

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return null;
}

function pushUnique(list: EvidenceDraft[], item: EvidenceDraft) {
  if (!list.some((row) => row.category === item.category && row.label === item.label)) {
    list.push(item);
  }
}

export function extractEvidence(blueprint: Blueprint): EvidenceDraft[] {
  const items: EvidenceDraft[] = [];
  const sourceUrl =
    asString(blueprint.sourceUrl) ?? asString(blueprint.source_url) ?? "blueprint.json";

  const wp = blueprint.wordpress;
  if (wp && typeof wp === "object") {
    const rec = wp as Record<string, unknown>;
    for (const [key, value] of Object.entries(rec)) {
      const text = asString(value) ?? (value && typeof value === "object" ? JSON.stringify(value) : null);
      if (!text) continue;
      pushUnique(items, {
        category: "wordpress",
        label: key,
        value: text.slice(0, 500),
        confidence: 0.7,
        sourceReference: "blueprint.json#wordpress",
        state: "detected",
      });
    }
  }

  const tech = blueprint.techSignals ?? blueprint.technology;
  if (Array.isArray(tech)) {
    for (const row of tech) {
      if (!row || typeof row !== "object") continue;
      const rec = row as Record<string, unknown>;
      const name = asString(rec.name) ?? asString(rec.label);
      if (!name) continue;
      const confidence =
        typeof rec.confidence === "number" && Number.isFinite(rec.confidence)
          ? rec.confidence
          : 0.6;
      pushUnique(items, {
        category: "technology",
        label: name,
        value: asString(rec.version) ?? "present",
        confidence,
        sourceReference: "blueprint.json#techSignals",
        state: confidence >= 0.85 ? "detected" : "inferred",
      });
    }
  }

  if (Array.isArray(blueprint.forms)) {
    pushUnique(items, {
      category: "forms",
      label: "Public forms",
      value: String(blueprint.forms.length),
      confidence: 0.8,
      sourceReference: "blueprint.json#forms",
      state: "detected",
    });
  }

  if (Array.isArray(blueprint.pages)) {
    pushUnique(items, {
      category: "routes",
      label: "Captured pages",
      value: String(blueprint.pages.length),
      confidence: 0.85,
      sourceReference: "blueprint.json#pages",
      state: "detected",
    });
  }

  const tokens = blueprint.designTokens ?? blueprint.tokens;
  if (tokens && typeof tokens === "object") {
    pushUnique(items, {
      category: "tokens",
      label: "Design tokens",
      value: "present",
      confidence: 0.75,
      sourceReference: "blueprint.json#designTokens",
      state: "detected",
    });
  }

  if (Array.isArray(blueprint.warnings)) {
    for (const warning of blueprint.warnings) {
      const text = asString(warning) ?? JSON.stringify(warning);
      pushUnique(items, {
        category: "warning",
        label: "Scan warning",
        value: text.slice(0, 500),
        confidence: 1,
        sourceReference: "blueprint.json#warnings",
        state: "detected",
      });
    }
  }

  if (Array.isArray(blueprint.limitations)) {
    for (const limitation of blueprint.limitations) {
      const text = asString(limitation) ?? JSON.stringify(limitation);
      pushUnique(items, {
        category: "limitation",
        label: "Limitation",
        value: text.slice(0, 500),
        confidence: 1,
        sourceReference: "blueprint.json#limitations",
        state: "confirmed",
      });
    }
  }

  pushUnique(items, {
    category: "source",
    label: "Source URL",
    value: sourceUrl,
    confidence: 1,
    sourceReference: "blueprint.json",
    state: "detected",
  });

  return items;
}

export function parseBlueprintJson(raw: string): { ok: true; data: Blueprint } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "blueprint.json is not valid JSON." };
  }
  const result = BlueprintSchema.safeParse(parsed);
  if (!result.success) {
    const issue = result.error.issues[0];
    return {
      ok: false,
      error: `blueprint.json failed schema validation${issue ? `: ${issue.message}` : "."}`,
    };
  }
  return { ok: true, data: result.data };
}

export function parseManifestJson(raw: string): { ok: true; data: unknown } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "manifest.json is not valid JSON." };
  }
  const result = ManifestSchema.safeParse(parsed);
  if (!result.success) {
    return { ok: false, error: "manifest.json failed schema validation." };
  }
  return { ok: true, data: result.data };
}
