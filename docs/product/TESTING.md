# Testing

Canonical gate: `npm run test:all`.

| Script | What it covers | Needs preview |
|---|---|---|
| `test` / `test:unit` | Platform + ZIP/schema/persist | No |
| `test:regression` | ZIP, schema, persist → DB rows | No |
| `test:smoke` | HTTP pages + Playwright (Canvas copy, wizard auth, ZIP persist e2e) | Yes — fails if preview is down |
| `test:all` | unit then smoke | Yes |

## Gaps that used to exist (closed)

- Canvas copy is asserted in the browser, not against an RSC HTML shell.
- ZIP bomb uses a **test-only** uncompressed/file-count limit. Production limits stay 8 MB / 32 MB / 200 files.
- `test:all` is the one command that includes smoke. Smoke throws if the workspace preview is down.
- Persist is tested twice: isolated PGLite (`persist-blueprint.test.ts`) and wizard ZIP import in Playwright.

## Persist contract

A valid authorized ZIP writes:

1. `projects` row (`blueprint_zip`, `blueprint_ready`)
2. `source_imports` with checksum
3. `blueprints` version 1 JSON
4. `evidence_items` extracted from Blueprint
5. `activity_events` import record

A rejected ZIP (no authorization, traversal, oversized, missing files) writes nothing.
