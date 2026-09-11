import assert from "node:assert/strict";
import { test } from "node:test";
import { generateApplication } from "./generate.ts";
import { repairGeneratedTree, verifyGeneratedTree } from "./verify.ts";

const blueprint = {
  version: "1.0",
  sourceUrl: "https://example.com/iluminat",
  pages: [{ path: "/", title: "Home" }, { path: "/work", title: "Work" }],
  forms: [{ name: "Contact", fields: 5 }],
  designTokens: { colors: { accent: "#D8A84B" }, fonts: { body: "Inter" } },
  wordpress: { core: "6.4.3", theme: "Astra Child", pluginsActive: 23 },
  elementor: { present: true },
  limitations: ["Public frontend only"],
};

test("generated tree verifies with exit 0", () => {
  const files = generateApplication({
    name: "ILUMINAT Agency Site",
    targetStack: "next_ts_tailwind",
    scope: "frontend_rebuild",
    blueprint,
  });
  const verified = verifyGeneratedTree(files);
  assert.equal(verified.exitCode, 0);
  assert.equal(verified.command, "cosy-verify generated-tree");
  assert.ok(files.some((file) => file.path === "index.html" && file.code.includes("<!doctype html")));
});

test("repair restores missing required files", () => {
  const full = generateApplication({
    name: "Repair case",
    targetStack: "react_vite_ts",
    scope: "ui_prototype",
    blueprint,
  });
  const broken = full.filter((file) => file.path !== "README.md");
  assert.equal(verifyGeneratedTree(broken).exitCode, 1);
  const repaired = repairGeneratedTree(broken, full);
  assert.equal(verifyGeneratedTree(repaired).exitCode, 0);
});
