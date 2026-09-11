# Testing

Canonical gate: `npm run test:all`.

| Script | What it covers | Needs running app |
|---|---|---|
| `test` / `test:unit` | Platform + ZIP / schema / persist / scanner / understand / rebuild / export | No |
| `test:regression` | ZIP, schema, persist, engines → DB rows | No |
| `test:smoke` | HTTP pages + Playwright (Canvas copy, wizard, ZIP persist e2e) | Yes — fails if the workspace is down |
| `test:all` | unit then smoke | Yes |
| `typecheck` | `tsc --noEmit` | No |

## Closed gaps

- Canvas copy is asserted in the browser (`COSY Canvas` + rebuild/preview), not against an RSC HTML shell.
- ZIP bomb uses a **test-only** uncompressed / file-count limit. Production limits stay 8 MB / 32 MB / 200 files.
- `test:all` is the one command that includes smoke. Smoke throws if the workspace is down.
- Persist is tested twice: isolated PGLite and wizard ZIP import in Playwright.

## Persist contract under test

A valid authorized ZIP writes project, import, blueprint, evidence, and activity rows.

A rejected ZIP (no authorization, traversal, oversized, missing files) writes nothing.

Understand + rebuild persist architecture nodes, generated files, and a `build_runs.exit_code` of 0 when `cosy-verify` passes.
