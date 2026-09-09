# Architecture (M1 + M2)

## App shape

TanStack Start file routes:

| Route | Status |
|---|---|
| `/` | Landing |
| `/projects` | List + Demo ILUMINAT |
| `/projects/new` | Import wizard |
| `/projects/$id` | Overview |
| `/projects/$id/blueprint` | Evidence workspace |
| `/projects/$id/architecture` | Empty — M4 |
| `/projects/$id/risks` | Empty — M4 |
| `/projects/$id/tasks` | Empty — M4 |
| `/projects/$id/build` | Empty — M5 |
| `/projects/$id/code` | Empty — M5 |
| `/projects/$id/canvas` | Empty — M6 |
| `/projects/$id/exports` | Empty — M7 |

## Data

Schema: [`migrations/0002_cosy.sql`](../../migrations/0002_cosy.sql)

Auth is **off**. Rows are unowned. Seed org: `org-cosy-demo`.

Tables used now:

- `organizations`
- `projects`
- `source_imports`
- `blueprints`
- `evidence_items`
- `activity_events`

Tables reserved for later engines (empty in M2): `architecture_nodes`, `risks`, `tasks`, `generated_files`, `build_runs`, `project_versions`, `export_artifacts`.

Preview uses in-memory PGLite. Deploy uses Postgres when `DATABASE_URL` is set. Same SQL files.

## Import path

1. Wizard collects name, ZIP bytes, target stack, scope, `authorized`.
2. [`importBlueprintZip`](../../src/lib/blueprint/zip-import.ts) validates the archive.
3. [`persistBlueprintImport`](../../src/lib/server/persist-blueprint.ts) writes the five row types.
4. User lands on `/projects/$id/blueprint`.

Server functions live in [`src/lib/server/projects.ts`](../../src/lib/server/projects.ts).

## Evidence

[`extractEvidence`](../../src/lib/blueprint/schema.ts) reads `blueprint.json` (`sourceUrl` / `source_url`, `wordpress`, `techSignals` / `technology`, `forms`, `pages`, `designTokens` / `tokens`, `warnings`, `limitations`). HTML in the ZIP is stored as captured markup, not executed.
