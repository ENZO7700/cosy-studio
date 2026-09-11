# Roadmap

## Milestone 1 — workspace shell — **shipped**

- Product landing
- Projects list with Demo ILUMINAT
- Project layout: Overview, Blueprint, later engines
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

## Milestone 3 — Scanner — **shipped**

Public URL / pasted HTML. Same-origin crawl (budgeted), static HTTP, Wayback fallback, SSRF protection, partial scan recovery. Blueprint JSON matches the ZIP contract.

## Milestone 4 — Understand — **shipped**

Architecture graph, risk engine, Cursor task planner. Rebuild readiness % is computed from evidence.

## Milestone 5 — Rebuild — **shipped**

Generated application files, repair loop, workspace verification (`cosy-verify`) with stored exit code. No fake “build verified” without exit 0.

## Milestone 6 — Canvas — **shipped**

Generated-preview iframe (never executes uploaded ZIP HTML), code pane, workspace notes.

## Milestone 7 — Export — **shipped**

Application project ZIP and Cursor plan ZIP from the generated tree.

## Milestone 8 — Workspace / billing — **shipped (sandbox)**

Organization labels, roles, plan picker. Billing events are **sandbox** — Stripe is not charged. Auth stays off; rows remain unowned.
