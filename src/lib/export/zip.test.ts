import assert from "node:assert/strict";
import { test } from "node:test";
import { unzipSync, strFromU8 } from "fflate";
import { generateApplication } from "../rebuild/generate.ts";
import { zipApplication, zipCursorPlan } from "./zip.ts";

test("application and cursor plan ZIPs contain expected members", () => {
  const files = generateApplication({
    name: "Export Case",
    targetStack: "next_ts_tailwind",
    scope: "frontend_rebuild",
    blueprint: { version: "1.0", pages: [{ path: "/", title: "Home" }] },
  });
  const app = zipApplication("Export Case", files);
  const appFiles = unzipSync(app.bytes);
  assert.ok(appFiles["package.json"]);
  assert.ok(strFromU8(appFiles["index.html"]).includes("<!doctype html"));

  const plan = zipCursorPlan("Export Case", files, [
    { title: "Rebuild home", phase: "routes", description: "Home route", estimateHours: 4 },
  ]);
  const planFiles = unzipSync(plan.bytes);
  assert.ok(planFiles["cursor-plan.md"]);
  assert.ok(planFiles["tasks.json"]);
});
