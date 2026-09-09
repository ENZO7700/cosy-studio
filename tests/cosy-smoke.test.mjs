import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { assertHas, BASE, getHtml, requirePreview } from "./cosy-harness.mjs";

test("preview is reachable", async () => {
  await requirePreview();
});

test("landing smoke: product face and CTAs", async () => {
  const { status, text } = await getHtml("/");
  assert.equal(status, 200);
  assertHas(text, ["COSY Studio", "Blueprint Scanner", "Start a Blueprint", "View Demo Project"], "/");
});

test("projects smoke: demo row and readiness, not clone %", async () => {
  const { status, text } = await getHtml("/projects");
  assert.equal(status, 200);
  assertHas(text, ["ILUMINAT Agency Site", "Demo", "Readiness 62%"], "/projects");
  assert.equal(text.includes("clone %"), false);
});

test("demo overview smoke", async () => {
  const { status, text } = await getHtml("/projects/demo-iluminat");
  assert.equal(status, 200);
  assertHas(text, ["ILUMINAT Agency Site", "Demo", "Open Blueprint workspace"], "/projects/demo-iluminat");
});

test("blueprint smoke: evidence, checksum, wordpress", async () => {
  const { status, text } = await getHtml("/projects/demo-iluminat/blueprint");
  assert.equal(status, 200);
  assertHas(
    text,
    ["Source summary", "Checksum", "WordPress", "Evidence ledger", "Limitation"],
    "/projects/demo-iluminat/blueprint",
  );
});

test("canvas smoke: honest M6 empty state (browser, not RSC shell)", async (t) => {
  mkdirSync("/workspace/screenshots", { recursive: true });
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  t.after(async () => {
    await browser.close();
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const response = await page.goto(`${BASE}/projects/demo-iluminat/canvas`, {
    waitUntil: "networkidle",
  });
  assert.equal(response?.ok(), true);
  const body = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  assert.ok(/scheduled for milestone 6/i.test(body));
  assert.ok(/cosy canvas/i.test(body));
  assert.ok(/honest empty state/i.test(body));
  assert.equal(/build verified/i.test(body), false);
  await page.screenshot({ path: "/workspace/screenshots/smoke-canvas.png" });
});

test("new project wizard smoke", async () => {
  const { status, text } = await getHtml("/projects/new");
  assert.equal(status, 200);
  assertHas(
    text,
    ["Start a Blueprint", "Blueprint Scanner ZIP", "Written idea"],
    "/projects/new",
  );
});
