# PRODUCT PROMPT
# COSY Studio — Blueprint-to-App Intelligence Platform

Build and keep a production-grade workspace named **COSY Studio**.

Tagline: “Scan. Understand. Rebuild. Ship.”
Subtitle: “Turn a public website or a Blueprint ZIP into an editable, verified application workspace.”

Public source: [github.com/ENZO7700/cosy-studio](https://github.com/ENZO7700/cosy-studio)

This is one product, not three demos:

1. Blueprint Scanner — public URL / ZIP evidence
2. AI App Builder — real generated files, verified build, repair
3. COSY Studio UI — chat + code + diff + preview + canvas

## Non-negotiables

- Product name is COSY Studio. Landing may say “Blueprint Scanner — Powered by COSY Studio”.
- Face metric is Rebuild readiness %, never clone %.
- Public data only. Authorization confirmation before ZIP / URL work.
- Never execute uploaded archives.
- No 1:1 clone claim. Evidence-backed rebuild.
- No fake “build verified” / live preview of captured HTML. Canvas previews generated files only. Verification is `cosy-verify` exit 0.
- Demo data must be labeled Demo.
- Billing is sandbox unless Stripe is explicitly connected.

## Current shipped scope

Milestones 1–8 in this workspace: schema, scanner, understand, rebuild, canvas, exports, sandbox org/billing. Auth remains off; rows are unowned.

## Legal / trust

- Scan public URLs only.
- ZIP is inspected, not run.
- User confirms authorization.
- Rebuild is a new application informed by evidence, not a pixel-perfect copy.

## Stack in this workspace

TanStack Start + PGLite/Postgres. Spec mentions of Next.js + Prisma map here; do not re-scaffold a second app.

## Tests

`npm run test:all` is the product gate. Details in docs/product/TESTING.md.

## Docs map

See [docs/README.md](docs/README.md).
