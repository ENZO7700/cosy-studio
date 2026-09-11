import assert from "node:assert/strict";
import { test } from "node:test";
import { extractEvidence } from "../blueprint/schema.ts";
import { parsePublicHtml } from "./html-parse.ts";

const html = `<!doctype html>
<html>
<head>
  <title>ILUMINAT</title>
  <meta name="generator" content="WordPress 6.4.3" />
  <style>:root { --e-global-color-primary: #D8A84B; font-family: Inter, sans-serif; }</style>
</head>
<body class="elementor-default astra-theme">
  <form name="Contact" action="/contact"><input name="email" /><textarea></textarea></form>
  <a href="/work">Work</a>
  <script src="/wp-content/plugins/elementor/x.js"></script>
</body>
</html>`;

test("HTML parser extracts WordPress, Elementor, forms, and tokens without executing scripts", () => {
  const blueprint = parsePublicHtml(html, "https://example.com/iluminat");
  assert.equal((blueprint.wordpress as { core?: string } | undefined)?.core, "6.4.3");
  assert.equal(Boolean(blueprint.elementor), true);
  assert.ok(Array.isArray(blueprint.forms) && blueprint.forms.length >= 1);
  const tokens = blueprint.designTokens as { colors?: { accent?: string } };
  assert.equal(tokens.colors?.accent, "#D8A84B");
  const evidence = extractEvidence(blueprint);
  assert.ok(evidence.some((item) => item.category === "wordpress" || item.category === "technology"));
});
