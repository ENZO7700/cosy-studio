# Blueprint ZIP contract

Implemented in [`src/lib/blueprint/zip-import.ts`](../../src/lib/blueprint/zip-import.ts) and [`limits.ts`](../../src/lib/blueprint/limits.ts).

## Required files

```text
blueprint.json
manifest.json
index.html
```

`blueprint.json` and `manifest.json` must be JSON objects (Zod). Extra vendor fields are allowed (passthrough).

## Limits

| Limit | Value |
|---|---|
| Compressed | 8 MB |
| Uncompressed | 32 MB |
| File count | 200 |

Tests may pass a tighter `limits` override. Production limits do not change.

## Rejected

- Missing authorization confirmation
- Filename not ending in `.zip`
- Unreadable archive
- Path traversal (`..`, absolute, Windows drive)
- Duplicate normalized paths
- Missing required members
- Invalid JSON / failed schema
- Oversize (compressed or decompressed)
- Too many files

## Accepted quirks

- Shared root folder (`export/blueprint.json` …) is stripped
- `__MACOSX/`, `._*` AppleDouble, `.DS_Store` are ignored
- Backslashes normalize to `/`

## Persist

A valid authorized ZIP writes:

1. `projects` — `source_type = blueprint_zip`, `status = blueprint_ready`
2. `source_imports` — filename, checksum, `validation_status = valid`
3. `blueprints` — version 1 JSON + content hash
4. `evidence_items` — extracted ledger
5. `activity_events` — import record

A rejected ZIP writes **nothing**.

The archive is never executed. `index.html` is evidence, not a runtime.
