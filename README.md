# COSY Studio

**Blueprint-to-App Intelligence Platform**

Scan. Understand. Rebuild. Ship.

Turn a public website or a Blueprint ZIP into an editable, verified application workspace.

[github.com/ENZO7700/cosy-studio](https://github.com/ENZO7700/cosy-studio)

This is **one product**, not three demos:

| Capability | Role today |
|---|---|
| Blueprint Scanner | ZIP evidence in, or public URL / pasted HTML (SSRF-safe). |
| AI App Builder | Generated files, `cosy-verify` exit 0, repair loop. |
| COSY Studio UI | Dark technical workspace: Blueprint, architecture, Canvas, exports. |

Not a clone tool. The face metric is **Rebuild readiness %**, never clone %.

## What ships now

- Product landing: *Blueprint Scanner — Powered by COSY Studio*
- Projects list with a labeled **Demo ILUMINAT** snapshot (readiness 62%)
- New-project wizard: ZIP, public URL, pasted HTML, or written idea
- Secure **Blueprint ZIP import** and **public scanner** (authorization, SSRF, Wayback fallback)
- Understand: architecture graph, risks, Cursor tasks, evidence-backed readiness
- Rebuild: generated application tree, verification, repair
- COSY Canvas: generated preview only (uploaded HTML is never executed)
- Exports: application ZIP + Cursor plan ZIP
- Workspace + sandbox billing (no Stripe charge; auth off)

## Product rules

- Public frontend evidence only.
- User confirms authorization before import / scan.
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

## Tests

Canonical gate: `npm run test:all`

```text
npm test              # unit (no running app)
npm run test:regression
npm run test:smoke    # HTTP + Playwright — needs the workspace running
npm run test:all      # unit then smoke
npm run typecheck
```

## Local run

```bash
npm install
npm run dev
```

The workspace serves on port **8080**.

## License

Private product source. All rights reserved unless a license file is added.
