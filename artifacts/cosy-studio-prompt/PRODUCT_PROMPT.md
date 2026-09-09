# PRODUCT PROMPT
# COSY Studio — Blueprint-to-App Intelligence Platform

Build and keep a production-grade workspace named **COSY Studio**.

Tagline: “Scan. Understand. Rebuild. Ship.”
Subtitle: “Turn a public website or a Blueprint ZIP into an editable, verified application workspace.”

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
- No fake “build verified” / live preview until that milestone exists.
- Demo data must be labeled Demo.

## Current shipped scope

Milestone 1 + 2 only: schema, project shell, secure Blueprint ZIP import, persist, honest later-milestone empty states, tests.

Do not jump to M3–M8 in one pass.

## Legal / trust

- Scan public URLs only.
- ZIP is inspected, not run.
- User confirms authorization.
- Rebuild is a new application informed by evidence, not a pixel-perfect copy.

## Stack in this workspace

TanStack Start + PGLite/Postgres. Spec mentions of Next.js + Prisma map here; do not re-scaffold a second app.

## Tests

`npm run test:all` is the product gate. Details in docs/product/TESTING.md.
