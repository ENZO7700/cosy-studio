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
  assertHas(text, ["COSY Studio", "Nástroj na prestavbu webu", "Začať projekt", "Pozrieť ukážku"], "/");
});

test("projects smoke: demo row and readiness, not clone %", async () => {
  const { status, text } = await getHtml("/projects");
  assert.equal(status, 200);
  assertHas(text, ["ILUMINAT Agency Site", "Ukážka", "Vieme o stránke 62 %"], "/projects");
  assert.equal(text.includes("clone %"), false);
});

test("demo overview smoke", async () => {
  const { status, text } = await getHtml("/projects/demo-iluminat");
  assert.equal(status, 200);
  assertHas(text, ["ILUMINAT Agency Site", "Ukážkový projekt", "Otvoriť, čo sme našli"], "/projects/demo-iluminat");
});

test("blueprint smoke: evidence, checksum, wordpress", async () => {
  const { status, text } = await getHtml("/projects/demo-iluminat/blueprint");
  assert.equal(status, 200);
  assertHas(
    text,
    ["Zhrnutie zdroja", "Kód súboru", "WordPress", "Zoznam dôkazov", "Čo nevieme"],
    "/projects/demo-iluminat/blueprint",
  );
});

test("canvas smoke: generated preview shell (browser, not RSC shell)", async (t) => {
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
  assert.ok(/náhľad/i.test(body));
  assert.ok(/najprv pripravte súbory|náhľad novej verzie/i.test(body));
  assert.equal(/scheduled for milestone 6/i.test(body), false);
  await page.screenshot({ path: "/workspace/screenshots/smoke-canvas.png" });
});

test("new project wizard smoke", async () => {
  const { status, text } = await getHtml("/projects/new");
  assert.equal(status, 200);
  assertHas(
    text,
    ["Začať projekt", "Súbor zo skenera", "Len napísaný nápad"],
    "/projects/new",
  );
});
