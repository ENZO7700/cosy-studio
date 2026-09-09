# Testing

Canonical gate: `npm run test:all`.

| Script | What it covers | Needs running app |
|---|---|---|
| `test` / `test:unit` | Platform + ZIP / schema / persist | No |
| `test:regression` | ZIP, schema, persist → DB rows | No |
| `test:smoke` | HTTP pages + Playwright (Canvas copy, wizard auth, ZIP persist e2e) | Yes — fails if the workspace is down |
| `test:all` | unit then smoke | Yes |
| `typecheck` | `tsc --noEmit` | No |

## Closed gaps

- Canvas copy is asserted in the browser (`Scheduled for Milestone 6`), not against an RSC HTML shell.
- ZIP bomb uses a **test-only** uncompressed / file-count limit. Production limits stay 8 MB / 32 MB / 200 files.
- `test:all` is the one command that includes smoke. Smoke throws if the workspace is down.
- Persist is tested twice: isolated PGLite (`src/lib/server/persist-blueprint.test.ts`) and wizard ZIP import in Playwright (`tests/cosy-browser-regression.test.mjs`).

## Persist contract under test

A valid authorized ZIP writes project, import, blueprint, evidence, and activity rows.

A rejected ZIP (no authorization, traversal, oversized, missing files) writes nothing.

## Key files

- [`src/lib/blueprint/zip-import.test.ts`](../../src/lib/blueprint/zip-import.test.ts)
- [`src/lib/blueprint/schema.test.ts`](../../src/lib/blueprint/schema.test.ts)
- [`src/lib/server/persist-blueprint.test.ts`](../../src/lib/server/persist-blueprint.test.ts)
- [`tests/cosy-smoke.test.mjs`](../../tests/cosy-smoke.test.mjs)
- [`tests/cosy-browser-regression.test.mjs`](../../tests/cosy-browser-regression.test.mjs)
