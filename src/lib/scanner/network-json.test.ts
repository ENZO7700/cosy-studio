import test from "node:test";
import assert from "node:assert/strict";
import {
  snapshotFromJsonBody,
  enrichFromPublicJson,
  parseSitemapLocs,
  classifySensitiveJson,
  extractJsonLdBlocks,
  extractOgImage,
} from "./network-json.ts";

test("snapshotFromJsonBody stores menu JSON keys+sample", () => {
  const body = JSON.stringify({
    menu: [
      { title: "Sports", href: "/sports" },
      { title: "Live", href: "/live", image: "https://cdn.example.com/live.png" },
    ],
    cta: "Bet now",
  });
  const snap = snapshotFromJsonBody({
    url: "https://example.com/api/menu.json",
    status: 200,
    bodyText: body,
  });
  assert.equal("blocked" in snap && snap.blocked, false);
  assert.ok("keys" in snap && Array.isArray(snap.keys) && snap.keys.includes("menu"));
  assert.ok("sample" in snap);
});

test("auth/token JSON is blocked without body sample", () => {
  const snap = snapshotFromJsonBody({
    url: "https://example.com/api/session",
    status: 200,
    bodyText: JSON.stringify({ access_token: "secret", user: "a" }),
  });
  assert.equal(snap.blocked, true);
  assert.ok(snap.reason);
  assert.equal("sample" in snap, false);
});

test("odds-stream URL blocked", () => {
  assert.ok(classifySensitiveJson("https://ex.com/odds/stream", ["x"]));
});

test("enrichFromPublicJson extracts nav+images with source network", () => {
  const snap = snapshotFromJsonBody({
    url: "https://example.com/api/nav",
    status: 200,
    bodyText: JSON.stringify({
      items: [{ title: "Home", href: "/", banner: "https://example.com/b.jpg" }],
      button: "Join",
    }),
  });
  assert.equal(snap.blocked, undefined);
  const en = enrichFromPublicJson([snap]);
  assert.ok(en.headings.some((h) => h.text === "Home" && h.source === "network"));
  assert.ok(en.links.some((l) => l.href.includes("example.com") && l.source === "network"));
  assert.ok(en.imageUrls.some((i) => i.url.includes("b.jpg")));
  assert.ok(en.ctaTexts.some((c) => c.text === "Join"));
});

test("parseSitemapLocs keeps same-origin max 8", () => {
  const xml = `<?xml version="1.0"?>
  <urlset>${Array.from({ length: 12 }, (_, i) => `<url><loc>https://example.com/p${i}</loc></url>`).join("")}
  <url><loc>https://evil.test/x</loc></url></urlset>`;
  const locs = parseSitemapLocs(xml, "https://example.com");
  assert.equal(locs.length, 8);
  assert.ok(locs.every((u) => u.startsWith("https://example.com/")));
});

test("json-ld + og:image extract", () => {
  const html = `<html><head>
    <meta property="og:image" content="/og.png"/>
    <script type="application/ld+json">{"@type":"WebSite","name":"Demo"}</script>
  </head></html>`;
  assert.equal(extractOgImage(html, "https://example.com/"), "https://example.com/og.png");
  const ld = extractJsonLdBlocks(html);
  assert.equal((ld[0] as { name: string }).name, "Demo");
});
