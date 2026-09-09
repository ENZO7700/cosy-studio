# COSY Studio

**Blueprint-to-App Intelligence Platform**

Scan. Understand. Rebuild. Ship.

Turn a public website or a Blueprint ZIP into an editable, verified application workspace.

[github.com/ENZO7700/cosy-studio](https://github.com/ENZO7700/cosy-studio)

This is **one product**, not three demos:

| Capability | Role today |
|---|---|
| Blueprint Scanner | ZIP evidence in. Public URL scan is Milestone 3. |
| AI App Builder | Persistence + workspace. Real code generation is Milestone 5. |
| COSY Studio UI | Dark technical workspace: projects, Blueprint ledger, honest empty states. |

Not a clone tool. The face metric is **Rebuild readiness %**, never clone %.

## What ships now (Milestone 1 + 2)

- Product landing: *Blueprint Scanner — Powered by COSY Studio*
- Projects list with a labeled **Demo ILUMINAT** snapshot (readiness 62%)
- New-project wizard: source → details → target → scope → confirm
- Secure **Blueprint ZIP import** (authorization, traversal, size, required files, Zod)
- Persist: `projects`, `source_imports`, `blueprints`, `evidence_items`, `activity_events`
- Blueprint workspace: checksum, WordPress/Elementor signals, tokens, limitations, evidence ledger
- Sample ZIP download from the wizard
- Honest empty states for Architecture, Risks, Tasks, Build, Code, Canvas, Exports

## What does not ship yet

| Milestone | Capability |
|---|---|
| 3 | Public URL / HTML scanner |
| 4 | Architecture graph, risk engine, task planner |
| 5 | Real code generation, verified build, repair loop |
| 6 | COSY Canvas live preview |
| 7 | Application ZIP / Cursor plan export |
| 8 | Billing, teams, Stripe |

Those screens exist as **scheduled empty states**. They do not fake a live preview or a verified build.

## Product rules

- Public frontend evidence only.
- User confirms authorization before import.
- Uploaded ZIP is **parsed, never executed**.
- No 1:1 clone claim. Rebuild is a new application informed by evidence.
- Demo data is labeled Demo.

## Blueprint ZIP contract

Required members:

- `blueprint.json`
- `manifest.json`
- `index.html`

Limits: **8 MB** compressed, **32 MB** uncompressed, **200** files.

Rejected: path traversal, duplicate paths, missing members, invalid JSON, non-`.zip` name, missing authorization.

Optional: shared root folder (stripped), `css/`, `assets/`, `pages.json`. macOS junk (`__MACOSX`, `.DS_Store`) is ignored.

Full contract: [docs/product/ZIP_CONTRACT.md](docs/product/ZIP_CONTRACT.md)

## Stack

- TanStack Start (React 19) + Vite
- Postgres via PGLite in preview, Neon when `DATABASE_URL` is set
- Zod schemas, fflate ZIP parser
- Playwright smoke against the running workspace

Spec mentions of Next.js + Prisma map onto this stack. Do not re-scaffold a second app.

## Documentation

| Doc | What it is |
|---|---|
| [docs/README.md](docs/README.md) | Index |
| [PRODUCT_PROMPT.md](PRODUCT_PROMPT.md) | Constitution for builders |
| [docs/product/PRODUCT.md](docs/product/PRODUCT.md) | Positioning and workflow |
| [docs/product/DECISIONS.md](docs/product/DECISIONS.md) | Locked product decisions |
| [docs/product/ROADMAP.md](docs/product/ROADMAP.md) | Milestones 1–8 |
| [docs/product/ARCHITECTURE.md](docs/product/ARCHITECTURE.md) | Schema, routes, persist |
| [docs/product/ZIP_CONTRACT.md](docs/product/ZIP_CONTRACT.md) | Import security contract |
| [docs/product/TESTING.md](docs/product/TESTING.md) | Test gates |

## Tests

Canonical gate: `npm run test:all`

```text
npm test              # unit (no running app)
npm run test:regression
npm run test:smoke    # HTTP + Playwright — needs the workspace running
npm run test:all      # unit then smoke
npm run typecheck
```

Smoke fails if the workspace is down. Canvas copy is asserted in the browser, not against an RSC HTML shell. Persist is tested in isolated PGLite and through the wizard.

## Local run

```bash
npm install
npm run dev
```

The workspace serves on port **8080**.

## License

Private product source. All rights reserved unless a license file is added.
