import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as number, c as union, l as unknown, n as array, o as object, r as boolean, s as string, t as _enum } from "../_libs/zod.mjs";
import { i as zipSync, n as strToU8, r as unzipSync, t as strFromU8 } from "../_libs/fflate.mjs";
import { createHash } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/projects-DhkSlcF3.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var _0002_cosy_default = "-- COSY Studio M1+M2 schema. Auth is off: rows are unowned (no user_id).\n-- Later engines (risks, tasks, generated files, builds) get tables now, unused.\n\ncreate table if not exists organizations (\n  id text primary key,\n  name text not null,\n  plan text not null default 'free',\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists projects (\n  id text primary key,\n  organization_id text not null references organizations(id),\n  name text not null,\n  source_type text not null,\n  status text not null default 'draft',\n  target_stack text,\n  scope text,\n  readiness_score integer,\n  risk_level text,\n  is_demo boolean not null default false,\n  idea_brief text,\n  created_at timestamptz not null default now(),\n  updated_at timestamptz not null default now()\n);\n\ncreate index if not exists projects_org_idx on projects (organization_id);\ncreate index if not exists projects_updated_idx on projects (updated_at desc);\n\ncreate table if not exists source_imports (\n  id text primary key,\n  project_id text not null references projects(id) on delete cascade,\n  filename text,\n  source_url text,\n  checksum text,\n  imported_at timestamptz not null default now(),\n  validation_status text not null,\n  import_metadata jsonb not null default '{}'::jsonb,\n  error_message text\n);\n\ncreate index if not exists source_imports_project_idx on source_imports (project_id);\n\ncreate table if not exists blueprints (\n  id text primary key,\n  project_id text not null references projects(id) on delete cascade,\n  version integer not null default 1,\n  data jsonb not null,\n  content_hash text,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists blueprints_project_idx on blueprints (project_id);\n\ncreate table if not exists evidence_items (\n  id text primary key,\n  project_id text not null references projects(id) on delete cascade,\n  category text not null,\n  label text not null,\n  value text,\n  confidence numeric,\n  source_reference text,\n  state text not null default 'detected',\n  notes text\n);\n\ncreate index if not exists evidence_items_project_idx on evidence_items (project_id);\n\ncreate table if not exists architecture_nodes (\n  id text primary key,\n  project_id text not null references projects(id) on delete cascade,\n  parent_id text,\n  category text not null,\n  title text not null,\n  data jsonb not null default '{}'::jsonb,\n  state text not null default 'draft'\n);\n\ncreate table if not exists risks (\n  id text primary key,\n  project_id text not null references projects(id) on delete cascade,\n  severity text not null,\n  score integer,\n  confidence numeric,\n  evidence text,\n  mitigation text,\n  status text not null default 'open'\n);\n\ncreate table if not exists tasks (\n  id text primary key,\n  project_id text not null references projects(id) on delete cascade,\n  phase text,\n  title text not null,\n  description text,\n  priority text,\n  estimate_hours numeric,\n  dependencies jsonb not null default '[]'::jsonb,\n  acceptance_criteria jsonb not null default '[]'::jsonb,\n  status text not null default 'todo'\n);\n\ncreate table if not exists generated_files (\n  id text primary key,\n  project_id text not null references projects(id) on delete cascade,\n  path text not null,\n  code text not null,\n  language text,\n  version integer not null default 1,\n  generated_by text,\n  updated_at timestamptz not null default now()\n);\n\ncreate table if not exists build_runs (\n  id text primary key,\n  project_id text not null references projects(id) on delete cascade,\n  status text not null,\n  command text,\n  stdout text,\n  stderr text,\n  exit_code integer,\n  started_at timestamptz not null default now(),\n  completed_at timestamptz\n);\n\ncreate table if not exists project_versions (\n  id text primary key,\n  project_id text not null references projects(id) on delete cascade,\n  label text,\n  summary text,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists export_artifacts (\n  id text primary key,\n  project_id text not null references projects(id) on delete cascade,\n  type text not null,\n  storage_ref text,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists activity_events (\n  id text primary key,\n  project_id text not null references projects(id) on delete cascade,\n  actor text not null default 'system',\n  type text not null,\n  message text not null,\n  metadata jsonb not null default '{}'::jsonb,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists activity_events_project_idx on activity_events (project_id, created_at desc);\n\ninsert into organizations (id, name, plan)\nvalues ('org-cosy-demo', 'COSY Demo Workspace', 'studio')\non conflict (id) do nothing;\n\ninsert into projects (\n  id, organization_id, name, source_type, status, target_stack, scope,\n  readiness_score, risk_level, is_demo, idea_brief\n) values (\n  'demo-iluminat',\n  'org-cosy-demo',\n  'ILUMINAT Agency Site',\n  'blueprint_zip',\n  'blueprint_ready',\n  'next_ts_tailwind',\n  'frontend_rebuild',\n  62,\n  'elevated',\n  true,\n  null\n) on conflict (id) do nothing;\n\ninsert into source_imports (\n  id, project_id, filename, source_url, checksum, validation_status, import_metadata\n) values (\n  'imp-demo-iluminat',\n  'demo-iluminat',\n  'iluminat-blueprint.zip',\n  'https://example.com/iluminat',\n  'demo-hash-iluminat',\n  'valid',\n  '{\"files\":[\"blueprint.json\",\"manifest.json\",\"index.html\"],\"demo\":true}'::jsonb\n) on conflict (id) do nothing;\n\ninsert into blueprints (id, project_id, version, data, content_hash)\nvalues (\n  'bp-demo-iluminat',\n  'demo-iluminat',\n  1,\n  '{\n    \"version\": \"1.0\",\n    \"sourceUrl\": \"https://example.com/iluminat\",\n    \"finalUrl\": \"https://example.com/iluminat\",\n    \"capturedAt\": \"2026-08-29T10:00:00.000Z\",\n    \"limitations\": [\"Public frontend only\", \"No private API contracts\"],\n    \"warnings\": [\"Elementor globals inferred from CSS variables\", \"Plugin list is HTML evidence, not wp-admin\"],\n    \"techSignals\": [{\"name\": \"WordPress\", \"confidence\": 0.96}, {\"name\": \"Elementor\", \"confidence\": 0.91}, {\"name\": \"Astra Child\", \"confidence\": 0.74}],\n    \"designTokens\": {\"colors\": {\"accent\": \"#D8A84B\", \"canvas\": \"#08090A\", \"text\": \"#F6F4EF\"}, \"fonts\": {\"body\": \"Inter\"}},\n    \"forms\": [{\"name\": \"Contact\", \"fields\": 5, \"action\": \"/contact\"}],\n    \"wordpress\": {\"core\": \"6.4.3\", \"theme\": \"Astra Child\", \"pluginsActive\": 23, \"templates\": 42, \"customFields\": 57},\n    \"pages\": [{\"path\": \"/\", \"title\": \"Home\"}, {\"path\": \"/work\", \"title\": \"Work\"}, {\"path\": \"/contact\", \"title\": \"Contact\"}]\n  }'::jsonb,\n  'demo-hash-iluminat'\n) on conflict (id) do nothing;\n\ninsert into evidence_items (id, project_id, category, label, value, confidence, source_reference, state) values\n  ('ev-demo-1', 'demo-iluminat', 'platform', 'WordPress core', '6.4.3', 0.96, 'html:generator,rest-root', 'detected'),\n  ('ev-demo-2', 'demo-iluminat', 'theme', 'Theme', 'Astra Child', 0.74, 'html:body-class', 'inferred'),\n  ('ev-demo-3', 'demo-iluminat', 'plugins', 'Active plugins (HTML evidence)', '23', 0.61, 'html:plugin-assets', 'inferred'),\n  ('ev-demo-4', 'demo-iluminat', 'elementor', 'Elementor', 'present', 0.91, 'html:data-elementor', 'detected'),\n  ('ev-demo-5', 'demo-iluminat', 'forms', 'Public forms', '1 contact form', 0.88, 'html:form', 'detected'),\n  ('ev-demo-6', 'demo-iluminat', 'tokens', 'Accent color', '#D8A84B', 0.8, 'css:--e-global-color-primary', 'detected'),\n  ('ev-demo-7', 'demo-iluminat', 'limitation', 'Private APIs', 'Not captured', 1, 'policy', 'confirmed')\non conflict (id) do nothing;\n\ninsert into activity_events (id, project_id, actor, type, message, metadata)\nvalues (\n  'act-demo-1',\n  'demo-iluminat',\n  'system',\n  'seed',\n  'Demo project seeded with a labeled Blueprint snapshot.',\n  '{\"demo\":true}'::jsonb\n) on conflict (id) do nothing;\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({ "/migrations/0002_cosy.sql": _0002_cosy_default });
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
var ZIP_LIMITS = {
	maxCompressedBytes: 8388608,
	maxUncompressedBytes: 33554432,
	maxFiles: 200
};
var REQUIRED_ZIP_FILES = [
	"blueprint.json",
	"manifest.json",
	"index.html"
];
_enum([
	"detected",
	"inferred",
	"confirmed",
	"rejected",
	"manual"
]);
var BlueprintSchema = object({
	version: union([string(), number()]).optional(),
	sourceUrl: string().optional(),
	source_url: string().optional(),
	finalUrl: string().optional(),
	final_url: string().optional(),
	capturedAt: string().optional(),
	captured_at: string().optional(),
	pages: array(unknown()).optional(),
	designTokens: unknown().optional(),
	tokens: unknown().optional(),
	forms: array(unknown()).optional(),
	technology: unknown().optional(),
	techSignals: unknown().optional(),
	wordpress: unknown().optional(),
	elementor: unknown().optional(),
	warnings: array(unknown()).optional(),
	limitations: array(unknown()).optional(),
	metadata: unknown().optional()
}).passthrough();
var ManifestSchema = object({
	name: string().optional(),
	sourceUrl: string().optional(),
	createdAt: string().optional()
}).passthrough();
function asString(value) {
	if (typeof value === "string" && value.trim()) return value.trim();
	if (typeof value === "number" && Number.isFinite(value)) return String(value);
	if (typeof value === "boolean") return value ? "true" : "false";
	return null;
}
function pushUnique(list, item) {
	if (!list.some((row) => row.category === item.category && row.label === item.label)) list.push(item);
}
function extractEvidence(blueprint) {
	const items = [];
	const sourceUrl = asString(blueprint.sourceUrl) ?? asString(blueprint.source_url) ?? "blueprint.json";
	const wp = blueprint.wordpress;
	if (wp && typeof wp === "object") {
		const rec = wp;
		for (const [key, value] of Object.entries(rec)) {
			const text = asString(value) ?? (value && typeof value === "object" ? JSON.stringify(value) : null);
			if (!text) continue;
			pushUnique(items, {
				category: "wordpress",
				label: key,
				value: text.slice(0, 500),
				confidence: .7,
				sourceReference: "blueprint.json#wordpress",
				state: "detected"
			});
		}
	}
	const tech = blueprint.techSignals ?? blueprint.technology;
	if (Array.isArray(tech)) for (const row of tech) {
		if (!row || typeof row !== "object") continue;
		const rec = row;
		const name = asString(rec.name) ?? asString(rec.label);
		if (!name) continue;
		const confidence = typeof rec.confidence === "number" && Number.isFinite(rec.confidence) ? rec.confidence : .6;
		pushUnique(items, {
			category: "technology",
			label: name,
			value: asString(rec.version) ?? "present",
			confidence,
			sourceReference: "blueprint.json#techSignals",
			state: confidence >= .85 ? "detected" : "inferred"
		});
	}
	if (Array.isArray(blueprint.forms)) pushUnique(items, {
		category: "forms",
		label: "Public forms",
		value: String(blueprint.forms.length),
		confidence: .8,
		sourceReference: "blueprint.json#forms",
		state: "detected"
	});
	if (Array.isArray(blueprint.pages)) pushUnique(items, {
		category: "routes",
		label: "Captured pages",
		value: String(blueprint.pages.length),
		confidence: .85,
		sourceReference: "blueprint.json#pages",
		state: "detected"
	});
	const tokens = blueprint.designTokens ?? blueprint.tokens;
	if (tokens && typeof tokens === "object") pushUnique(items, {
		category: "tokens",
		label: "Design tokens",
		value: "present",
		confidence: .75,
		sourceReference: "blueprint.json#designTokens",
		state: "detected"
	});
	if (Array.isArray(blueprint.warnings)) for (const warning of blueprint.warnings) pushUnique(items, {
		category: "warning",
		label: "Scan warning",
		value: (asString(warning) ?? JSON.stringify(warning)).slice(0, 500),
		confidence: 1,
		sourceReference: "blueprint.json#warnings",
		state: "detected"
	});
	if (Array.isArray(blueprint.limitations)) for (const limitation of blueprint.limitations) pushUnique(items, {
		category: "limitation",
		label: "Limitation",
		value: (asString(limitation) ?? JSON.stringify(limitation)).slice(0, 500),
		confidence: 1,
		sourceReference: "blueprint.json#limitations",
		state: "confirmed"
	});
	pushUnique(items, {
		category: "source",
		label: "Source URL",
		value: sourceUrl,
		confidence: 1,
		sourceReference: "blueprint.json",
		state: "detected"
	});
	return items;
}
function parseBlueprintJson(raw) {
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return {
			ok: false,
			error: "blueprint.json is not valid JSON."
		};
	}
	const result = BlueprintSchema.safeParse(parsed);
	if (!result.success) {
		const issue = result.error.issues[0];
		return {
			ok: false,
			error: `blueprint.json failed schema validation${issue ? `: ${issue.message}` : "."}`
		};
	}
	return {
		ok: true,
		data: result.data
	};
}
function parseManifestJson(raw) {
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return {
			ok: false,
			error: "manifest.json is not valid JSON."
		};
	}
	const result = ManifestSchema.safeParse(parsed);
	if (!result.success) return {
		ok: false,
		error: "manifest.json failed schema validation."
	};
	return {
		ok: true,
		data: result.data
	};
}
function fail(errors) {
	return {
		ok: false,
		errors
	};
}
function normalizeZipPath(raw) {
	const trimmed = raw.replace(/\\/g, "/").replace(/^\.\/+/, "");
	if (!trimmed || trimmed.endsWith("/")) return null;
	if (trimmed.startsWith("/") || /^[a-zA-Z]:/.test(trimmed)) return null;
	const parts = trimmed.split("/").filter((part) => part && part !== ".");
	if (parts.some((part) => part === "..")) return null;
	if (parts.some((part) => part === "__MACOSX" || part.startsWith("._"))) return null;
	if (parts[parts.length - 1] === ".DS_Store") return null;
	return parts.join("/");
}
function stripSharedRoot(paths) {
	const map = /* @__PURE__ */ new Map();
	if (paths.length === 0) return map;
	const first = paths[0]?.split("/")[0];
	const shared = first && paths.every((path) => path === first || path.startsWith(`${first}/`)) && paths.some((path) => path.includes("/"));
	for (const path of paths) {
		const next = shared ? path.slice(first.length + 1) : path;
		if (next) map.set(path, next);
	}
	return map;
}
function assertAuthorized(authorized) {
	if (!authorized) return "Authorization confirmation is required before import.";
	return null;
}
function importBlueprintZip(compressed, options) {
	const errors = [];
	const authError = assertAuthorized(options?.authorized ?? false);
	if (authError) errors.push(authError);
	if (!(options?.filename ?? "upload.zip").toLowerCase().endsWith(".zip")) errors.push("Only .zip archives are accepted.");
	if (compressed.byteLength > ZIP_LIMITS.maxCompressedBytes) errors.push(`Compressed archive exceeds ${ZIP_LIMITS.maxCompressedBytes} bytes (${compressed.byteLength} bytes).`);
	if (errors.length) return fail(errors);
	let unzipped;
	try {
		unzipped = unzipSync(compressed, { filter: (file) => !file.name.endsWith("/") });
	} catch {
		return fail(["Archive could not be read as a ZIP file."]);
	}
	const entries = Object.entries(unzipped);
	if (entries.length > ZIP_LIMITS.maxFiles) return fail([`Archive contains more than ${ZIP_LIMITS.maxFiles} files.`]);
	let uncompressed = 0;
	const normalized = [];
	const seen = /* @__PURE__ */ new Set();
	for (const [rawPath, bytes] of entries) {
		uncompressed += bytes.byteLength;
		if (uncompressed > ZIP_LIMITS.maxUncompressedBytes) return fail([`Decompressed archive exceeds ${ZIP_LIMITS.maxUncompressedBytes} bytes.`]);
		const path = normalizeZipPath(rawPath);
		if (path === null) {
			if (rawPath.includes("..") || rawPath.startsWith("/") || rawPath.includes("\\..")) return fail([`Rejected unsafe path: ${rawPath}`]);
			continue;
		}
		if (seen.has(path)) return fail([`Duplicate path in archive: ${path}`]);
		seen.add(path);
		normalized.push({
			path,
			bytes
		});
	}
	const stripped = stripSharedRoot(normalized.map((row) => row.path));
	const files = /* @__PURE__ */ new Map();
	for (const row of normalized) {
		const path = stripped.get(row.path) ?? row.path;
		if (files.has(path)) return fail([`Duplicate path in archive: ${path}`]);
		files.set(path, row.bytes);
	}
	for (const required of REQUIRED_ZIP_FILES) if (!files.has(required)) errors.push(`Missing required file: ${required}`);
	if (errors.length) return fail(errors);
	const blueprintRaw = strFromU8(files.get("blueprint.json"));
	const manifestRaw = strFromU8(files.get("manifest.json"));
	const html = strFromU8(files.get("index.html"));
	const blueprintParsed = parseBlueprintJson(blueprintRaw);
	if (!blueprintParsed.ok) return fail([blueprintParsed.error]);
	const manifestParsed = parseManifestJson(manifestRaw);
	if (!manifestParsed.ok) return fail([manifestParsed.error]);
	const evidence = extractEvidence(blueprintParsed.data);
	const warnings = [];
	if (Array.isArray(blueprintParsed.data.warnings)) for (const warning of blueprintParsed.data.warnings) warnings.push(typeof warning === "string" ? warning : JSON.stringify(warning));
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
		uncompressedBytes: uncompressed
	};
}
function buildSampleBlueprintZip() {
	return zipSync({
		"blueprint.json": strToU8(JSON.stringify({
			version: "1.0",
			sourceUrl: "https://example.com/sample",
			finalUrl: "https://example.com/sample",
			capturedAt: "2026-09-09T00:00:00.000Z",
			pages: [{
				path: "/",
				title: "Home"
			}],
			forms: [{
				name: "Newsletter",
				fields: 2
			}],
			techSignals: [{
				name: "WordPress",
				confidence: .9
			}],
			designTokens: { colors: { accent: "#D8A84B" } },
			wordpress: {
				core: "6.4.3",
				theme: "Sample"
			},
			warnings: ["Partial crawl: 1 page"],
			limitations: ["Public frontend only"]
		}, null, 2)),
		"manifest.json": strToU8(JSON.stringify({
			name: "Sample Blueprint",
			sourceUrl: "https://example.com/sample",
			createdAt: "2026-09-09T00:00:00.000Z"
		}, null, 2)),
		"index.html": strToU8("<!doctype html><title>Sample</title><h1>Home</h1>")
	});
}
var CreateIdeaInput = object({
	name: string().trim().min(1).max(120),
	ideaBrief: string().trim().min(8).max(4e3),
	targetStack: string(),
	scope: string(),
	authorized: boolean()
});
var ImportZipInput = object({
	name: string().trim().min(1).max(120),
	filename: string().min(1).max(240),
	zipBase64: string().min(8),
	targetStack: string(),
	scope: string(),
	authorized: boolean()
});
function mapProject(row) {
	return {
		id: row.id,
		name: row.name,
		sourceType: row.source_type,
		status: row.status,
		targetStack: row.target_stack,
		scope: row.scope,
		readinessScore: row.readiness_score,
		riskLevel: row.risk_level,
		isDemo: Boolean(row.is_demo),
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		ideaBrief: row.idea_brief
	};
}
var listProjects_createServerFn_handler = createServerRpc({
	id: "0ab656f523a4a1840e55ff3fc0260d6c05d6398ec40527baec32aad1d39c60b9",
	name: "listProjects",
	filename: "src/lib/server/projects.ts"
}, (opts) => listProjects.__executeServer(opts));
var listProjects = createServerFn({ method: "GET" }).handler(listProjects_createServerFn_handler, async () => {
	return (await (await getSql())`
    select id, name, source_type, status, target_stack, scope,
           readiness_score, risk_level, is_demo, idea_brief, created_at, updated_at
    from projects
    order by is_demo desc, updated_at desc
  `).map(mapProject);
});
var getProject_createServerFn_handler = createServerRpc({
	id: "7a46f2d87e585938c9d2af069361195068a7b78cd354e58c7440b8edc0cfd103",
	name: "getProject",
	filename: "src/lib/server/projects.ts"
}, (opts) => getProject.__executeServer(opts));
var getProject = createServerFn({ method: "GET" }).validator((input) => object({ id: string().min(1) }).parse(input)).handler(getProject_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const project = (await sql`
      select id, name, source_type, status, target_stack, scope,
             readiness_score, risk_level, is_demo, idea_brief, created_at, updated_at
      from projects where id = ${data.id} limit 1
    `)[0];
	if (!project) return null;
	const [blueprintRows, evidenceRows, importRows, activityRows] = await Promise.all([
		sql`select id, version, data, content_hash, created_at from blueprints where project_id = ${data.id} order by version desc limit 1`,
		sql`select id, category, label, value, confidence, source_reference, state, notes from evidence_items where project_id = ${data.id} order by category, label`,
		sql`select id, filename, source_url, checksum, imported_at, validation_status, import_metadata, error_message from source_imports where project_id = ${data.id} order by imported_at desc`,
		sql`select id, actor, type, message, created_at from activity_events where project_id = ${data.id} order by created_at desc limit 20`
	]);
	const mapped = mapProject(project);
	const evidence = evidenceRows.map((row) => ({
		id: row.id,
		category: row.category,
		label: row.label,
		value: row.value,
		confidence: row.confidence === null || row.confidence === void 0 ? null : Number(row.confidence),
		sourceReference: row.source_reference,
		state: row.state,
		notes: row.notes
	}));
	const imports = importRows.map((row) => ({
		id: row.id,
		filename: row.filename,
		sourceUrl: row.source_url,
		checksum: row.checksum,
		importedAt: row.imported_at,
		validationStatus: row.validation_status,
		importMetadata: row.import_metadata,
		errorMessage: row.error_message
	}));
	const activity = activityRows.map((row) => ({
		id: row.id,
		actor: row.actor,
		type: row.type,
		message: row.message,
		createdAt: row.created_at
	}));
	return {
		project: {
			...mapped,
			ideaBrief: project.idea_brief
		},
		blueprint: blueprintRows[0] ? {
			id: blueprintRows[0].id,
			version: blueprintRows[0].version,
			data: blueprintRows[0].data,
			contentHash: blueprintRows[0].content_hash,
			createdAt: blueprintRows[0].created_at
		} : null,
		evidence,
		imports,
		activity
	};
});
var createIdeaProject_createServerFn_handler = createServerRpc({
	id: "4fcf560b114f6ae0409d6319e20330c7640538f9e02fa7f3822cade70bccbe93",
	name: "createIdeaProject",
	filename: "src/lib/server/projects.ts"
}, (opts) => createIdeaProject.__executeServer(opts));
var createIdeaProject = createServerFn({ method: "POST" }).validator((input) => CreateIdeaInput.parse(input)).handler(createIdeaProject_createServerFn_handler, async ({ data }) => {
	if (!data.authorized) return {
		ok: false,
		errors: ["Authorization confirmation is required before import."]
	};
	const sql = await getSql();
	const id = crypto.randomUUID();
	await sql.query(`insert into projects (id, organization_id, name, source_type, status, target_stack, scope, idea_brief)
       values ($1, 'org-cosy-demo', $2, 'blank', 'draft', $3, $4, $5)`, [
		id,
		data.name,
		data.targetStack,
		data.scope,
		data.ideaBrief
	]);
	await sql.query(`insert into activity_events (id, project_id, actor, type, message, metadata)
       values ($1, $2, 'workspace', 'create', $3, $4::jsonb)`, [
		crypto.randomUUID(),
		id,
		`Project created from a written idea.`,
		JSON.stringify({ sourceType: "blank" })
	]);
	return {
		ok: true,
		id
	};
});
var importZipProject_createServerFn_handler = createServerRpc({
	id: "2202b9d94a7359ffee5b9ac9eb5b078a276490b178afba1475fea60398e2ed9e",
	name: "importZipProject",
	filename: "src/lib/server/projects.ts"
}, (opts) => importZipProject.__executeServer(opts));
var importZipProject = createServerFn({ method: "POST" }).validator((input) => ImportZipInput.parse(input)).handler(importZipProject_createServerFn_handler, async ({ data }) => {
	const parsed = importBlueprintZip(Uint8Array.from(Buffer.from(data.zipBase64, "base64")), {
		filename: data.filename,
		authorized: data.authorized
	});
	if (!parsed.ok) return {
		ok: false,
		errors: parsed.errors
	};
	const sql = await getSql();
	const id = crypto.randomUUID();
	const blueprintId = crypto.randomUUID();
	const importId = crypto.randomUUID();
	const sourceUrl = typeof parsed.blueprint.sourceUrl === "string" && parsed.blueprint.sourceUrl || typeof parsed.blueprint.source_url === "string" && parsed.blueprint.source_url || null;
	await sql.query(`insert into projects (id, organization_id, name, source_type, status, target_stack, scope, readiness_score, risk_level)
       values ($1, 'org-cosy-demo', $2, 'blueprint_zip', 'blueprint_ready', $3, $4, null, 'needs_review')`, [
		id,
		data.name,
		data.targetStack,
		data.scope
	]);
	await sql.query(`insert into source_imports (id, project_id, filename, source_url, checksum, validation_status, import_metadata)
       values ($1, $2, $3, $4, $5, 'valid', $6::jsonb)`, [
		importId,
		id,
		data.filename,
		sourceUrl,
		parsed.contentHash,
		JSON.stringify({
			files: parsed.files,
			uncompressedBytes: parsed.uncompressedBytes
		})
	]);
	await sql.query(`insert into blueprints (id, project_id, version, data, content_hash)
       values ($1, $2, 1, $3::jsonb, $4)`, [
		blueprintId,
		id,
		JSON.stringify(parsed.blueprint),
		parsed.contentHash
	]);
	for (const item of parsed.evidence) await sql.query(`insert into evidence_items (id, project_id, category, label, value, confidence, source_reference, state)
         values ($1, $2, $3, $4, $5, $6, $7, $8)`, [
		crypto.randomUUID(),
		id,
		item.category,
		item.label,
		item.value,
		item.confidence,
		item.sourceReference,
		item.state
	]);
	await sql.query(`insert into activity_events (id, project_id, actor, type, message, metadata)
       values ($1, $2, 'workspace', 'import', $3, $4::jsonb)`, [
		crypto.randomUUID(),
		id,
		`Blueprint ZIP imported (${data.filename}).`,
		JSON.stringify({
			checksum: parsed.contentHash,
			files: parsed.files.length
		})
	]);
	return {
		ok: true,
		id
	};
});
var sampleZip_createServerFn_handler = createServerRpc({
	id: "6c5560876f03a5ef2c3aff43b25cbb40da098b11c0ca3b93d87fbbccdaeab4ab",
	name: "sampleZip",
	filename: "src/lib/server/projects.ts"
}, (opts) => sampleZip.__executeServer(opts));
var sampleZip = createServerFn({ method: "GET" }).handler(sampleZip_createServerFn_handler, async () => {
	const bytes = buildSampleBlueprintZip();
	return {
		filename: "sample-blueprint.zip",
		base64: Buffer.from(bytes).toString("base64")
	};
});
//#endregion
export { createIdeaProject_createServerFn_handler, getProject_createServerFn_handler, importZipProject_createServerFn_handler, listProjects_createServerFn_handler, sampleZip_createServerFn_handler };
