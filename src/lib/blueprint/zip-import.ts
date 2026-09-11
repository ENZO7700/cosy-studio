import { unzipSync, strFromU8, zipSync, strToU8 } from "fflate";
import { createHash } from "node:crypto";
import { ZIP_LIMITS, REQUIRED_ZIP_FILES, type ZipLimits } from "./limits.ts";
import {
  extractEvidence,
  parseBlueprintJson,
  parseManifestJson,
  type Blueprint,
  type EvidenceDraft,
} from "./schema.ts";

export type ZipImportError = {
  ok: false;
  errors: string[];
};

export type ZipImportSuccess = {
  ok: true;
  files: string[];
  blueprint: Blueprint;
  manifest: unknown;
  html: string;
  evidence: EvidenceDraft[];
  warnings: string[];
  contentHash: string;
  uncompressedBytes: number;
};

export type ZipImportResult = ZipImportSuccess | ZipImportError;

function fail(errors: string[]): ZipImportError {
  return { ok: false, errors };
}

export function normalizeZipPath(raw: string): string | null {
  const trimmed = raw.replace(/\\/g, "/").replace(/^\.\/+/, "");
  if (!trimmed || trimmed.endsWith("/")) return null;
  if (trimmed.startsWith("/") || /^[a-zA-Z]:/.test(trimmed)) return null;
  const parts = trimmed.split("/").filter((part) => part && part !== ".");
  if (parts.some((part) => part === "..")) return null;
  if (parts.some((part) => part === "__MACOSX" || part.startsWith("._"))) return null;
  if (parts[parts.length - 1] === ".DS_Store") return null;
  return parts.join("/");
}

function stripSharedRoot(paths: string[]): Map<string, string> {
  const map = new Map<string, string>();
  if (paths.length === 0) return map;
  const first = paths[0]?.split("/")[0];
  const shared =
    first &&
    paths.every((path) => path === first || path.startsWith(`${first}/`)) &&
    paths.some((path) => path.includes("/"));
  for (const path of paths) {
    const next = shared ? path.slice(first.length + 1) : path;
    if (next) map.set(path, next);
  }
  return map;
}

export function assertAuthorized(authorized: boolean): string | null {
  if (!authorized) {
    return "Najprv zaškrtnite, že na to máte právo.";
  }
  return null;
}

export function importBlueprintZip(
  compressed: Uint8Array,
  options?: {
    filename?: string;
    authorized?: boolean;
    limits?: Partial<ZipLimits>;
  },
): ZipImportResult {
  const limits = { ...ZIP_LIMITS, ...options?.limits };
  const errors: string[] = [];
  const authError = assertAuthorized(options?.authorized ?? false);
  if (authError) errors.push(authError);

  const filename = options?.filename ?? "upload.zip";
  if (!filename.toLowerCase().endsWith(".zip")) {
    errors.push("Only .zip archives are accepted.");
  }
  if (compressed.byteLength > limits.maxCompressedBytes) {
    errors.push(
      `Compressed archive exceeds ${limits.maxCompressedBytes} bytes (${compressed.byteLength} bytes).`,
    );
  }
  if (errors.length) return fail(errors);

  let unzipped: Record<string, Uint8Array>;
  try {
    unzipped = unzipSync(compressed, {
      filter: (file) => !file.name.endsWith("/"),
    });
  } catch {
    return fail(["Archive could not be read as a ZIP file."]);
  }

  const entries = Object.entries(unzipped);
  if (entries.length > limits.maxFiles) {
    return fail([`Archive contains more than ${limits.maxFiles} files.`]);
  }

  let uncompressed = 0;
  const normalized: { path: string; bytes: Uint8Array }[] = [];
  const seen = new Set<string>();

  for (const [rawPath, bytes] of entries) {
    uncompressed += bytes.byteLength;
    if (uncompressed > limits.maxUncompressedBytes) {
      return fail([
        `Decompressed archive exceeds ${limits.maxUncompressedBytes} bytes.`,
      ]);
    }
    const path = normalizeZipPath(rawPath);
    if (path === null) {
      if (rawPath.includes("..") || rawPath.startsWith("/") || rawPath.includes("\\..")) {
        return fail([`Rejected unsafe path: ${rawPath}`]);
      }
      continue;
    }
    if (seen.has(path)) {
      return fail([`Duplicate path in archive: ${path}`]);
    }
    seen.add(path);
    normalized.push({ path, bytes });
  }

  const stripped = stripSharedRoot(normalized.map((row) => row.path));
  const files = new Map<string, Uint8Array>();
  for (const row of normalized) {
    const path = stripped.get(row.path) ?? row.path;
    if (files.has(path)) {
      return fail([`Duplicate path in archive: ${path}`]);
    }
    files.set(path, row.bytes);
  }

  for (const required of REQUIRED_ZIP_FILES) {
    if (!files.has(required)) {
      errors.push(`Missing required file: ${required}`);
    }
  }
  if (errors.length) return fail(errors);

  const blueprintRaw = strFromU8(files.get("blueprint.json")!);
  const manifestRaw = strFromU8(files.get("manifest.json")!);
  const html = strFromU8(files.get("index.html")!);

  const blueprintParsed = parseBlueprintJson(blueprintRaw);
  if (!blueprintParsed.ok) return fail([blueprintParsed.error]);
  const manifestParsed = parseManifestJson(manifestRaw);
  if (!manifestParsed.ok) return fail([manifestParsed.error]);

  const evidence = extractEvidence(blueprintParsed.data);
  const warnings: string[] = [];
  if (Array.isArray(blueprintParsed.data.warnings)) {
    for (const warning of blueprintParsed.data.warnings) {
      warnings.push(typeof warning === "string" ? warning : JSON.stringify(warning));
    }
  }

  const contentHash = createHash("sha256").update(compressed).digest("hex");

  return {
    ok: true,
    files: [...files.keys()].sort(),
    blueprint: blueprintParsed.data,
    manifest: manifestParsed.data,
    html,
    evidence,
    warnings,
    contentHash,
    uncompressedBytes: uncompressed,
  };
}

export function buildSampleBlueprintZip(): Uint8Array {
  const blueprint = {
    version: "1.0",
    sourceUrl: "https://example.com/sample",
    finalUrl: "https://example.com/sample",
    capturedAt: "2026-09-09T00:00:00.000Z",
    pages: [{ path: "/", title: "Home" }],
    forms: [{ name: "Newsletter", fields: 2 }],
    techSignals: [{ name: "WordPress", confidence: 0.9 }],
    designTokens: { colors: { accent: "#D8A84B" } },
    wordpress: { core: "6.4.3", theme: "Sample" },
    warnings: ["Partial crawl: 1 page"],
    limitations: ["Public frontend only"],
  };
  const manifest = {
    name: "Sample Blueprint",
    sourceUrl: "https://example.com/sample",
    createdAt: "2026-09-09T00:00:00.000Z",
  };
  return zipSync({
    "blueprint.json": strToU8(JSON.stringify(blueprint, null, 2)),
    "manifest.json": strToU8(JSON.stringify(manifest, null, 2)),
    "index.html": strToU8("<!doctype html><title>Sample</title><h1>Home</h1>"),
  });
}
