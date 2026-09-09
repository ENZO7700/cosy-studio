# Roadmap

## Milestone 1 — workspace shell — **shipped**

- Product landing
- Projects list with Demo ILUMINAT
- Project layout: Overview, Blueprint, later-milestone stubs
- Dark technical UI, gold accent
- Seeded demo Blueprint + evidence ledger

## Milestone 2 — Blueprint ZIP import — **shipped**

- Wizard: source → details → target → scope → confirm
- Authorization checkbox required
- ZIP validation: extension, readable archive, required files, Zod, traversal, duplicates, size, file count
- Shared-root folder strip, ignore macOS junk
- Persist: `projects`, `source_imports`, `blueprints`, `evidence_items`, `activity_events`
- Sample ZIP download
- Archives are never executed
- `test:all` (unit, persist, HTTP + browser smoke)

## Milestone 3 — Scanner

Public URL / pasted HTML. Rendered HTML, static HTTP fallback, Wayback fallback, crawl, asset capture, partial scan recovery, SSRF protection. Blueprint JSON produced by the scanner is the same ZIP contract as M2.

## Milestone 4 — Understand

Architecture graph, risk engine, task / Cursor planner. Readiness score computed from evidence, not a mock percentage.

## Milestone 5 — Rebuild

Real project files, workflow events, versions, build verification (real exit 0), repair loop after failure.

## Milestone 6 — Canvas

Live preview shell. Diff + code + chat in one workspace. No fake “build verified” until M5 is real.

## Milestone 7 — Export

Application project ZIP and Cursor plan ZIP.

## Milestone 8 — SaaS

Organizations, roles, billing, Stripe. Every project action respects org permissions.
