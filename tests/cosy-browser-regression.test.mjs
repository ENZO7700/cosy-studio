import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import { zipSync, strToU8 } from "fflate";
import { BASE, requirePreview } from "./cosy-harness.mjs";

const PAGES = [
  {
    path: "/",
    name: "landing",
    must: ["COSY Studio", "Start a Blueprint", "View Demo Project"],
    mustNot: ["Something went wrong"],
  },
  {
    path: "/projects",
    name: "projects",
    must: ["ILUMINAT Agency Site", "Readiness 62%"],
    mustNot: ["clone %"],
  },
  {
    path: "/projects/demo-iluminat/blueprint",
    name: "blueprint",
    must: ["Checksum", "Evidence ledger", "Astra"],
    mustNot: ["This project was not found"],
  },
  {
    path: "/projects/demo-iluminat/canvas",
    name: "canvas",
    must: ["Scheduled for Milestone 6", "COSY Canvas"],
    mustNot: ["Live preview ready", "Build verified"],
  },
  {
    path: "/projects/new",
    name: "wizard",
    must: ["Blueprint Scanner ZIP", "Written idea", "Continue"],
    mustNot: ["Something went wrong"],
  },
];

test("preview is reachable", async () => {
  await requirePreview();
});

test("browser regression: key routes render without console errors", async (t) => {
  mkdirSync("/workspace/screenshots", { recursive: true });
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  t.after(async () => {
    await browser.close();
  });

  for (const pageDef of PAGES) {
    await t.test(pageDef.name, async () => {
      const consoleErrors = [];
      const pageErrors = [];
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => pageErrors.push(String(err)));
      const response = await page.goto(`${BASE}${pageDef.path}`, { waitUntil: "networkidle" });
      assert.equal(response?.ok(), true, `${pageDef.path} HTTP ${response?.status()}`);
      const body = (await page.locator("body").innerText()).replace(/\s+/g, " ");
      for (const snippet of pageDef.must) {
        assert.ok(
          body.toLowerCase().includes(snippet.toLowerCase()),
          `${pageDef.path} missing ${JSON.stringify(snippet)} in: ${body.slice(0, 400)}`,
        );
      }
      for (const snippet of pageDef.mustNot) {
        assert.equal(
          body.toLowerCase().includes(snippet.toLowerCase()),
          false,
          `${pageDef.path} unexpectedly contains ${JSON.stringify(snippet)}`,
        );
      }
      assert.deepEqual(pageErrors, []);
      const realConsole = consoleErrors.filter(
        (line) => !/Failed to load resource/i.test(line) || /projects\/demo/.test(line),
      );
      assert.deepEqual(realConsole, [], `${pageDef.path} console: ${realConsole.join(" | ")}`);
      await page.screenshot({
        path: `/workspace/screenshots/regression-${pageDef.name}.png`,
        fullPage: false,
      });
      await page.close();
    });
  }
});

test("browser regression: wizard shows authorization on details step", async (t) => {
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  t.after(async () => {
    await browser.close();
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const response = await page.goto(`${BASE}/projects/new`, { waitUntil: "networkidle" });
  assert.equal(response?.ok(), true);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("checkbox").waitFor({ state: "visible" });
  const body = await page.locator("body").innerText();
  assert.ok(/i confirm i am authorized/i.test(body));
  await page.screenshot({ path: "/workspace/screenshots/regression-wizard-details.png" });
});

test("browser regression: ZIP import persists a Blueprint project", async (t) => {
  const zipPath = "/tmp/cosy-persist-regression.zip";
  const zip = zipSync({
    "blueprint.json": strToU8(
      JSON.stringify({
        version: "1.0",
        sourceUrl: "https://example.com/persist-e2e",
        pages: [{ path: "/", title: "Home" }],
        wordpress: { core: "6.4.3" },
      }),
    ),
    "manifest.json": strToU8(JSON.stringify({ name: "Persist e2e" })),
    "index.html": strToU8("<!doctype html><title>Persist</title>"),
  });
  writeFileSync(zipPath, zip);

  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  t.after(async () => {
    await browser.close();
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const name = `Persist ZIP ${Date.now()}`;
  const response = await page.goto(`${BASE}/projects/new`, { waitUntil: "networkidle" });
  assert.equal(response?.ok(), true);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Project name").fill(name);
  await page.locator('input[type="file"]').setInputFiles(zipPath);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Create project" }).click();
  try {
    await page.getByText("Checksum", { timeout: 20000 }).waitFor();
  } catch (error) {
    const body = (await page.locator("body").innerText()).replace(/\s+/g, " ");
    throw new Error(`ZIP persist did not open Blueprint workspace (${page.url()}): ${body.slice(0, 600)}`);
  }
  const body = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  assert.ok(/checksum/i.test(body), body.slice(0, 400));
  assert.ok(body.includes("https://example.com/persist-e2e"), body.slice(0, 400));
  assert.ok(/wordpress/i.test(body));
  await page.goto(`${BASE}/projects`, { waitUntil: "networkidle" });
  const list = await page.locator("body").innerText();
  assert.ok(list.includes(name), `projects list missing ${name}`);
  await page.screenshot({ path: "/workspace/screenshots/regression-persist-zip.png" });
});
