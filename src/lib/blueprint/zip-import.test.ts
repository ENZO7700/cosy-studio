import assert from "node:assert/strict";
import { test } from "node:test";
import { zipSync, strToU8 } from "fflate";
import {
  assertAuthorized,
  buildSampleBlueprintZip,
  importBlueprintZip,
  normalizeZipPath,
} from "./zip-import.ts";
import { ZIP_LIMITS } from "./limits.ts";

function zip(files: Record<string, string | Uint8Array>): Uint8Array {
  const encoded: Record<string, Uint8Array> = {};
  for (const [path, value] of Object.entries(files)) {
    encoded[path] = typeof value === "string" ? strToU8(value) : value;
  }
  return zipSync(encoded);
}

const validFiles = {
  "blueprint.json": JSON.stringify({
    version: "1.0",
    sourceUrl: "https://example.com",
    pages: [{ path: "/" }],
  }),
  "manifest.json": JSON.stringify({ name: "ok" }),
  "index.html": "<html></html>",
};

test("normalizeZipPath rejects traversal and absolute paths", () => {
  assert.equal(normalizeZipPath("../etc/passwd"), null);
  assert.equal(normalizeZipPath("/etc/passwd"), null);
  assert.equal(normalizeZipPath("foo/../../secret"), null);
  assert.equal(normalizeZipPath("C:\\Windows\\x"), null);
  assert.equal(normalizeZipPath("css/tokens.css"), "css/tokens.css");
  assert.equal(normalizeZipPath("__MACOSX/foo"), null);
  assert.equal(normalizeZipPath(".DS_Store"), null);
});

test("authorization confirmation is required", () => {
  assert.equal(assertAuthorized(false), "Najprv zaškrtnite, že na to máte právo.");
  assert.equal(assertAuthorized(true), null);
  const denied = importBlueprintZip(buildSampleBlueprintZip(), {
    filename: "ok.zip",
    authorized: false,
  });
  assert.equal(denied.ok, false);
  if (!denied.ok) {
    assert.ok(denied.errors.some((error) => error.includes("právo")));
  }
});

test("rejects missing required members", () => {
  const missingBlueprint = importBlueprintZip(
    zip({ "manifest.json": "{}", "index.html": "<html></html>" }),
    { filename: "bad.zip", authorized: true },
  );
  const missingManifest = importBlueprintZip(
    zip({ "blueprint.json": "{}", "index.html": "<html></html>" }),
    { filename: "bad.zip", authorized: true },
  );
  const missingHtml = importBlueprintZip(
    zip({ "blueprint.json": "{}", "manifest.json": "{}" }),
    { filename: "bad.zip", authorized: true },
  );
  assert.equal(missingBlueprint.ok, false);
  assert.equal(missingManifest.ok, false);
  assert.equal(missingHtml.ok, false);
  if (!missingBlueprint.ok) {
    assert.ok(missingBlueprint.errors.some((error) => error.includes("blueprint.json")));
  }
  if (!missingManifest.ok) {
    assert.ok(missingManifest.errors.some((error) => error.includes("manifest.json")));
  }
  if (!missingHtml.ok) {
    assert.ok(missingHtml.errors.some((error) => error.includes("index.html")));
  }
});

test("rejects malformed blueprint and manifest JSON", () => {
  const badBlueprint = importBlueprintZip(
    zip({ ...validFiles, "blueprint.json": "{not-json" }),
    { filename: "bad.zip", authorized: true },
  );
  const badManifest = importBlueprintZip(
    zip({ ...validFiles, "manifest.json": "{not-json" }),
    { filename: "bad.zip", authorized: true },
  );
  assert.equal(badBlueprint.ok, false);
  assert.equal(badManifest.ok, false);
});

test("rejects non-.zip filename and unreadable archive", () => {
  const notZipName = importBlueprintZip(buildSampleBlueprintZip(), {
    filename: "notes.txt",
    authorized: true,
  });
  const garbage = importBlueprintZip(new Uint8Array([1, 2, 3, 4, 5]), {
    filename: "x.zip",
    authorized: true,
  });
  assert.equal(notZipName.ok, false);
  assert.equal(garbage.ok, false);
  if (!notZipName.ok) assert.ok(notZipName.errors.some((error) => error.includes(".zip")));
  if (!garbage.ok) assert.ok(garbage.errors.some((error) => error.includes("could not be read")));
});

test("rejects path traversal entries", () => {
  const result = importBlueprintZip(
    zip({
      ...validFiles,
      "../secret.txt": "nope",
    }),
    { filename: "bad.zip", authorized: true },
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.errors.some((error) => error.toLowerCase().includes("unsafe path")));
  }
});

test("rejects duplicate normalized paths", () => {
  const result = importBlueprintZip(
    zip({
      ...validFiles,
      "css/tokens.css": "a{}",
      "css\\tokens.css": "b{}",
    }),
    { filename: "dup.zip", authorized: true },
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.errors.some((error) => error.toLowerCase().includes("duplicate path")));
  }
});

test("rejects oversized compressed archive", () => {
  const huge = new Uint8Array(ZIP_LIMITS.maxCompressedBytes + 1);
  const result = importBlueprintZip(huge, { filename: "huge.zip", authorized: true });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.errors.some((error) => error.includes("Compressed archive exceeds")));
  }
});

test("rejects oversized decompressed payload using a test-only limit", () => {
  const result = importBlueprintZip(
    zip({
      ...validFiles,
      "assets/blob.bin": new Uint8Array(2048),
    }),
    {
      filename: "bomb.zip",
      authorized: true,
      limits: { maxUncompressedBytes: 512 },
    },
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.errors.some((error) => error.includes("Decompressed archive exceeds")));
  }
});

test("rejects too many files using a test-only limit", () => {
  const result = importBlueprintZip(
    zip({
      ...validFiles,
      "extra.txt": "x",
    }),
    {
      filename: "many.zip",
      authorized: true,
      limits: { maxFiles: 3 },
    },
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.errors.some((error) => error.includes("more than 3 files")));
  }
});

test("strips a shared root folder and ignores macOS junk", () => {
  const result = importBlueprintZip(
    zip({
      "export/blueprint.json": validFiles["blueprint.json"],
      "export/manifest.json": validFiles["manifest.json"],
      "export/index.html": validFiles["index.html"],
      "export/.DS_Store": "junk",
      "__MACOSX/export/._index.html": "junk",
    }),
    { filename: "nested.zip", authorized: true },
  );
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.files, ["blueprint.json", "index.html", "manifest.json"]);
  }
});

test("valid fixture ZIP imports and yields evidence", () => {
  const result = importBlueprintZip(buildSampleBlueprintZip(), {
    filename: "sample.zip",
    authorized: true,
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.ok(result.files.includes("blueprint.json"));
    assert.equal(result.blueprint.sourceUrl, "https://example.com/sample");
    assert.ok(result.evidence.length > 0);
    assert.equal(result.contentHash.length, 64);
    assert.match(result.html, /Home/);
    assert.ok(result.warnings.includes("Partial crawl: 1 page"));
  }
});
