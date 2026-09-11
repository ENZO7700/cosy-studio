import type { Blueprint } from "../blueprint/schema.ts";

export type ParsedPage = {
  path: string;
  title: string;
  url: string;
};

function decode(value: string): string {
  return value
    .replace(/\u0026amp;/g, "&")
    .replace(/\u0026lt;/g, "<")
    .replace(/\u0026gt;/g, ">")
    .replace(/\u0026quot;/g, '"')
    .replace(/\u0026#39;/g, "'")
    .trim();
}

function matchAttr(html: string, tagPattern: RegExp, attr: string): string[] {
  const values: string[] = [];
  const tags = html.match(tagPattern) ?? [];
  const attrRe = new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, "i");
  for (const tag of tags) {
    const found = tag.match(attrRe);
    if (found?.[1]) values.push(decode(found[1]));
  }
  return values;
}

function absoluteUrl(base: string, href: string): URL | null {
  try {
    return new URL(href, base);
  } catch {
    return null;
  }
}

export function extractSameOriginHrefs(html: string, sourceUrl: string, limit = 8): string[] {
  const base = new URL(sourceUrl);
  const hrefs = matchAttr(html, /<a\b[^>]*>/gi, "href");
  const seen = new Set<string>();
  const out: string[] = [];
  for (const href of hrefs) {
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
      continue;
    }
    const url = absoluteUrl(sourceUrl, href);
    if (!url || url.protocol !== base.protocol || url.hostname !== base.hostname) continue;
    url.hash = "";
    const normalized = url.toString();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
    if (out.length >= limit) break;
  }
  return out;
}

export function parsePublicHtml(
  html: string,
  sourceUrl: string,
  extras?: { extraPages?: { url: string; html: string }[]; warnings?: string[] },
): Blueprint {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = decode(titleMatch?.[1] ?? "Untitled");
  const generator =
    html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']generator["']/i)?.[1] ??
    null;

  const hasWp = /wp-content|wp-includes|wordpress/i.test(html);
  const hasElementor = /elementor/i.test(html);
  const hasJet = /jet-engine|jetengine/i.test(html);
  const astra = /astra/i.test(html);
  const wpVersion = generator?.match(/wordpress\s+([0-9.]+)/i)?.[1] ?? null;

  const forms = [...html.matchAll(/<form\b([^>]*)>/gi)].map((match, index) => {
    const attrs = match[1] ?? "";
    const action = attrs.match(/action=["']([^"']*)["']/i)?.[1] ?? "";
    const name = attrs.match(/name=["']([^"']*)["']/i)?.[1] ?? `Form ${index + 1}`;
    const start = match.index ?? 0;
    const slice = html.slice(start, start + 4000);
    const fields = (slice.match(/<input\b|<textarea\b|<select\b/gi) ?? []).length;
    return { name: decode(name), action: decode(action), fields };
  });

  const cssVars: Record<string, string> = {};
  for (const match of html.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    const key = match[1];
    const value = match[2]?.trim();
    if (key && value && !cssVars[key] && Object.keys(cssVars).length < 24) {
      cssVars[key] = value.slice(0, 80);
    }
  }

  const font =
    html.match(/font-family:\s*([^;}{]+)/i)?.[1]?.replace(/['"]/g, "").split(",")[0]?.trim() ?? "Inter";

  const pages: ParsedPage[] = [
    { path: new URL(sourceUrl).pathname || "/", title, url: sourceUrl },
  ];
  for (const extra of extras?.extraPages ?? []) {
    const extraTitle =
      extra.html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? extra.url;
    const path = new URL(extra.url).pathname || "/";
    if (!pages.some((page) => page.path === path)) {
      pages.push({ path, title: decode(extraTitle), url: extra.url });
    }
  }

  const pluginHits = [...html.matchAll(/wp-content\/plugins\/([a-z0-9_-]+)/gi)].map((row) => row[1]);
  const uniquePlugins = [...new Set(pluginHits)].slice(0, 40);

  const techSignals = [
    hasWp ? { name: "WordPress", confidence: wpVersion ? 0.96 : 0.82, version: wpVersion ?? undefined } : null,
    hasElementor ? { name: "Elementor", confidence: 0.9 } : null,
    hasJet ? { name: "JetEngine", confidence: 0.84 } : null,
    astra ? { name: "Astra", confidence: 0.72 } : null,
  ].filter(Boolean);

  const colors: Record<string, string> = {};
  const accent =
    cssVars["e-global-color-primary"] ??
    cssVars["ast-global-color-0"] ??
    cssVars["color-primary"] ??
    null;
  if (accent) colors.accent = accent;
  colors.canvas = cssVars["ast-global-color-4"] ?? "#08090A";
  colors.text = cssVars["ast-global-color-3"] ?? "#F6F4EF";

  const limitations = [
    "Public frontend only",
    "HTML is inspected, never executed",
    "Private APIs and wp-admin are not captured",
  ];

  const warnings = [...(extras?.warnings ?? [])];
  if (!hasWp && !generator) warnings.push("Platform inferred from public HTML only.");
  if (uniquePlugins.length) warnings.push("Plugin list is HTML asset evidence, not wp-admin.");

  return {
    version: "1.0",
    sourceUrl,
    source_url: sourceUrl,
    finalUrl: sourceUrl,
    capturedAt: new Date().toISOString(),
    pages,
    forms,
    techSignals,
    technology: techSignals,
    designTokens: {
      colors,
      fonts: { body: font },
      cssVariables: cssVars,
    },
    wordpress: hasWp
      ? {
          core: wpVersion ?? "detected",
          theme: astra ? "Astra (HTML evidence)" : "unknown",
          pluginsActive: uniquePlugins.length,
          plugins: uniquePlugins,
          generator: generator ?? undefined,
        }
      : undefined,
    elementor: hasElementor ? { present: true } : undefined,
    warnings,
    limitations,
    metadata: {
      title,
      scanner: "cosy-m3",
      capturedBytes: html.length,
    },
  };
}
