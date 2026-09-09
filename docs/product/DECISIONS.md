# Decisions

Locked unless the product owner changes them.

| Decision | Choice |
|---|---|
| Product name | COSY Studio |
| Landing kicker | Blueprint Scanner — Powered by COSY Studio |
| Face metric | Rebuild readiness %, never clone % |
| Auth | Off until accounts are explicitly requested |
| Database | On. Unowned rows, org `org-cosy-demo` |
| Stack | TanStack Start + PGLite/Postgres in this workspace |
| ZIP | Parse only. Never execute `index.html` or other members |
| Required ZIP files | `blueprint.json`, `manifest.json`, `index.html` |
| Limits | 8 MB compressed, 32 MB uncompressed, 200 files |
| Authorization | Required boolean before import |
| Canvas / Build / Architecture | Honest empty states until their milestone |
| Tests | `test:all` = unit + persist + smoke. Smoke fails if preview is down |

Do not mix this product with `ENZO7700/cozy-studio` (brief → HTML preview) or an unlabeled cutover of ILUMINAT `dawn-cabin-raven-baker`.
