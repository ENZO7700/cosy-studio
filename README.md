# COSY Studio

**Blueprint-to-App Intelligence Platform**

Scan. Understand. Rebuild. Ship.

Turn a public website or a Blueprint ZIP into an editable, verified application workspace. Not a clone tool. Rebuild readiness is the face metric — never clone %.

## What it does now (Milestone 1 + 2)

- Landing and project workspace with a labeled **Demo ILUMINAT** project
- Secure **Blueprint ZIP import** (authorization, path traversal, size, required files, Zod)
- Persist import into **projects, blueprints, evidence, activity**
- Honest empty states for later milestones (Canvas, Build, Architecture, Tasks, Exports)
- Sample ZIP download from the new-project wizard

## What it is not yet

- Public URL scanner (Milestone 3)
- Risk engine / architecture graph / task planner (Milestone 4)
- Real code generation + verified build (Milestone 5)
- COSY Canvas live preview (Milestone 6)
- Project / Cursor plan ZIP export (Milestone 7)
- Billing, teams, Stripe (Milestone 8)

## Product rules

- Public frontend evidence only. No 1:1 clone claim.
- Uploaded ZIP is parsed, never executed.
- Authorization checkbox is required before import.
- Face metric: **Rebuild readiness %**.

## Tests

Canonical gate: `npm run test:all` (unit + ZIP/schema/persist regression + HTTP/browser smoke).

See [docs/product/TESTING.md](docs/product/TESTING.md).
