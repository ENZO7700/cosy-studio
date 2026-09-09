import assert from "node:assert/strict";
import { test } from "node:test";
import {
  extractEvidence,
  parseBlueprintJson,
  parseManifestJson,
} from "./schema.ts";

test("Zod accepts a scanner-shaped blueprint object", () => {
  const parsed = parseBlueprintJson(
    JSON.stringify({
      version: 1,
      source_url: "https://example.com",
      pages: [{ path: "/" }],
      extraVendorField: true,
    }),
  );
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.data.source_url, "https://example.com");
    assert.equal(parsed.data.extraVendorField, true);
  }
});

test("Zod rejects non-object and invalid JSON", () => {
  assert.equal(parseBlueprintJson("[]").ok, false);
  assert.equal(parseBlueprintJson("null").ok, false);
  assert.equal(parseBlueprintJson("not-json").ok, false);
  assert.equal(parseBlueprintJson("\"string\"").ok, false);
});

test("Zod rejects malformed manifest JSON and non-objects", () => {
  assert.equal(parseManifestJson("{").ok, false);
  assert.equal(parseManifestJson("[]").ok, false);
  const ok = parseManifestJson(JSON.stringify({ name: "Site", extra: 1 }));
  assert.equal(ok.ok, true);
});

test("extractEvidence normalizes WP, tech, forms, tokens, warnings", () => {
  const items = extractEvidence({
    sourceUrl: "https://example.com/iluminat",
    wordpress: { core: "6.4.3", theme: "Astra Child" },
    techSignals: [
      { name: "WordPress", confidence: 0.96 },
      { name: "Elementor", confidence: 0.6 },
    ],
    forms: [{ name: "Contact" }],
    pages: [{ path: "/" }, { path: "/work" }],
    designTokens: { colors: { accent: "#D8A84B" } },
    warnings: ["Partial crawl"],
    limitations: ["Public frontend only"],
  });

  const byLabel = Object.fromEntries(items.map((item) => [item.label, item]));
  assert.equal(byLabel.core?.value, "6.4.3");
  assert.equal(byLabel.WordPress?.state, "detected");
  assert.equal(byLabel.Elementor?.state, "inferred");
  assert.equal(byLabel["Public forms"]?.value, "1");
  assert.equal(byLabel["Captured pages"]?.value, "2");
  assert.equal(byLabel["Design tokens"]?.value, "present");
  assert.equal(byLabel["Scan warning"]?.value, "Partial crawl");
  assert.equal(byLabel.Limitation?.state, "confirmed");
  assert.equal(byLabel["Source URL"]?.value, "https://example.com/iluminat");
});

test("extractEvidence uses source_url fallback and skips nameless tech rows", () => {
  const items = extractEvidence({
    source_url: "https://fallback.example",
    technology: [{ version: "1.0" }, { label: "Vite", confidence: 0.9 }],
  });
  assert.ok(items.some((item) => item.label === "Vite" && item.state === "detected"));
  assert.ok(items.some((item) => item.value === "https://fallback.example"));
  assert.equal(items.filter((item) => item.category === "technology").length, 1);
});
