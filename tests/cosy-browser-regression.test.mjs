import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";
import { zipSync, strToU8 } from "fflate";
import { BASE, requirePreview } from "./cosy-harness.mjs";

const PAGES = [
  {
    path: "/",
    name: "landing",
    must: ["COSY Studio", "Začať projekt", "Pozrieť ukážku"],
    mustNot: ["Something went wrong"],
  },
  {
    path: "/projects",
    name: "projects",
    must: ["ILUMINAT Agency Site", "Vieme o stránke 62 %"],
    mustNot: ["clone %"],
  },
  {
    path: "/projects/demo-iluminat/blueprint",
    name: "blueprint",
    must: ["Kód súboru", "Zoznam dôkazov", "Astra"],
    mustNot: ["Tento projekt sme nenašli"],
  },
  {
    path: "/projects/demo-iluminat/canvas",
    name: "canvas",
    must: ["Náhľad"],
    mustNot: ["Scheduled for Milestone 6", "Live preview ready"],
  },
  {
    path: "/projects/new",
    name: "wizard",
    must: ["Súbor zo skenera", "Len napísaný nápad", "Ďalej"],
    mustNot: ["Something went wrong"],
  },
  {
    path: "/workspace",
    name: "workspace",
    must: ["Spoločný priestor", "Role"],
    mustNot: ["Something went wrong"],
  },
  {
    path: "/billing",
    name: "billing",
    must: ["Karta sa nestrháva", "Štúdio"],
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
      assert.deepEqual(realConsole, []);
      await page.screenshot({ path: `/workspace/screenshots/regression-${pageDef.name}.png` });
      await page.close();
    });
  }
});

test("wizard ZIP persist: authorized sample ZIP creates a project", async (t) => {
  mkdirSync("/workspace/screenshots", { recursive: true });
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  t.after(async () => {
    await browser.close();
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(`${BASE}/projects/new`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Ďalej" }).click();
  const zip = zipSync({
    "blueprint.json": strToU8(
      JSON.stringify({
        version: "1.0",
        sourceUrl: "https://example.com/sample",
        pages: [{ path: "/", title: "Home" }],
        forms: [{ name: "Newsletter", fields: 2 }],
        techSignals: [{ name: "WordPress", confidence: 0.9 }],
        designTokens: { colors: { accent: "#D8A84B" } },
        wordpress: { core: "6.4.3", theme: "Sample" },
        warnings: ["Partial crawl: 1 page"],
        limitations: ["Public frontend only"],
      }),
    ),
    "manifest.json": strToU8(JSON.stringify({ name: "Sample Blueprint" })),
    "index.html": strToU8("<!doctype html><title>Sample</title><h1>Home</h1>"),
  });
  const input = page.locator('input[type="file"]');
  await input.setInputFiles({
    name: "sample.zip",
    mimeType: "application/zip",
    buffer: Buffer.from(zip),
  });
  await page.locator('input[type="checkbox"]').check();
  await page.getByRole("button", { name: "Ďalej" }).click();
  await page.getByRole("button", { name: "Ďalej" }).click();
  await page.getByRole("button", { name: "Ďalej" }).click();
  await page.getByRole("button", { name: "Vytvoriť projekt" }).click();
  await page.getByText("Zhrnutie zdroja").waitFor({ timeout: 25000 });
  const body = await page.locator("body").innerText();
  assert.match(body, /Zhrnutie zdroja|Kód súboru|Zoznam dôkazov/);
  await page.screenshot({ path: "/workspace/screenshots/regression-zip-import.png" });
});
