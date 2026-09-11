# Architecture (M1–M8)

## App shape

TanStack Start file routes:

| Route | Status |
|---|---|
| `/` | Landing |
| `/projects` | List + Demo ILUMINAT |
| `/projects/new` | Import / scan wizard |
| `/projects/$id` | Overview |
| `/projects/$id/blueprint` | Evidence workspace |
| `/projects/$id/architecture` | Understand graph |
| `/projects/$id/risks` | Risk engine |
| `/projects/$id/tasks` | Cursor planner |
| `/projects/$id/build` | Workspace verification |
| `/projects/$id/code` | Generated files |
| `/projects/$id/canvas` | Generated preview + notes |
| `/projects/$id/exports` | Application / Cursor ZIP |
| `/workspace` | Org labels + roles |
| `/billing` | Sandbox plans |

## Data

Schema: [`migrations/0002_cosy.sql`](../../migrations/0002_cosy.sql) + [`migrations/0003_engines.sql`](../../migrations/0003_engines.sql)

Auth is **off**. Rows are unowned. Seed org: `org-cosy-demo`.

## Engines

- Scanner: [`src/lib/scanner/scan.ts`](../../src/lib/scanner/scan.ts) — SSRF, crawl, Wayback, pasted HTML
- Understand: [`src/lib/understand/`](../../src/lib/understand/)
- Rebuild: [`src/lib/rebuild/`](../../src/lib/rebuild/) — generate + `cosy-verify`
- Export: [`src/lib/export/zip.ts`](../../src/lib/export/zip.ts)
- Persist: [`src/lib/server/persist-blueprint.ts`](../../src/lib/server/persist-blueprint.ts), [`src/lib/server/persist-engines.ts`](../../src/lib/server/persist-engines.ts)

## Import path

1. Wizard collects name, ZIP bytes or URL/HTML, target stack, scope, `authorized`.
2. ZIP → [`importBlueprintZip`](../../src/lib/blueprint/zip-import.ts) or URL → [`scanPublicSource`](../../src/lib/scanner/scan.ts).
3. [`persistBlueprintImport`](../../src/lib/server/persist-blueprint.ts) writes the five row types + computed readiness.
4. User lands on `/projects/$id/blueprint`.
5. Understand / rebuild / export write engine tables.

## Evidence

[`extractEvidence`](../../src/lib/blueprint/schema.ts) reads `blueprint.json`. HTML in a ZIP or scan is stored as captured markup, not executed. Canvas iframes **generated** `index.html` only.
