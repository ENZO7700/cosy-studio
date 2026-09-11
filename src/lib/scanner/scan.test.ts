import assert from "node:assert/strict";
import { test } from "node:test";
import { scanPublicSource } from "./scan.ts";

test("scan requires authorization", async () => {
  const result = await scanPublicSource({
    authorized: false,
    pastedHtml: "<html><title>No</title></html>",
  });
  assert.equal(result.ok, false);
});

test("pasted HTML produces a partial blueprint without fetching", async () => {
  const result = await scanPublicSource({
    authorized: true,
    pastedHtml: `<!doctype html><html><head><title>Paste</title><meta name="generator" content="WordPress 6.4.3" /></head><body><form><input /></form></body></html>`,
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.partial, true);
  assert.ok(result.evidence.length > 0);
  assert.ok(result.html.includes("Paste"));
});
