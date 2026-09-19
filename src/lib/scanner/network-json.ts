/**
 * Public same-origin JSON capture + enrichment helpers for SPA blueprints.
 * SSRF-safe: caller must only feed public http(s) URLs already validated.
 */

export const MAX_PUBLIC_API_SNAPSHOTS = 15;
export const MAX_PUBLIC_API_BYTES = 200_000;
export const MAX_SITEMAP_URLS = 8;

export type JsonSample =
  | string
  | number
  | boolean
  | null
  | JsonSample[]
  | { [key: string]: JsonSample };

export type PublicApiSnapshot =
  | {
      url: string;
      status: number;
      keys: string[];
      sample: JsonSample;
      blocked?: false;
    }
  | {
      url: string;
      status: number;
      blocked: true;
      reason: string;
      keys?: string[];
    };

const SENSITIVE_URL_RE =
  /\/(auth|oauth|login|logout|session|token|refresh|signin|signup|password|odds|stream|websocket|ws)\b/i;
const SENSITIVE_KEY_RE =
  /^(access_token|refresh_token|id_token|api_key|apikey|client_secret|password|passwd|secret|authorization|auth_token|session_id|bearer)$/i;

export function isJsonContentType(ct: string | null | undefined): boolean {
  if (!ct) return false;
  const v = ct.toLowerCase();
  return (
    v.includes("application/json") ||
    v.includes("+json") ||
    v.includes("text/json")
  );
}

export function looksLikeJsonUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return /\.json($|\?)/i.test(u.pathname) || /\/api\//i.test(u.pathname);
  } catch {
    return false;
  }
}

export function collectJsonKeys(
  value: unknown,
  out = new Set<string>(),
  depth = 0,
): string[] {
  if (depth > 4 || value == null) return [...out];
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 20)) collectJsonKeys(item, out, depth + 1);
    return [...out];
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out.add(k);
      if (out.size > 80) break;
      collectJsonKeys(v, out, depth + 1);
    }
  }
  return [...out];
}

export function buildJsonSample(value: unknown, depth = 0): JsonSample {
  if (depth > 3) return "[…]";
  if (value === null) return null;
  if (value === undefined) return null;
  if (typeof value === "string") return value.length > 120 ? `${value.slice(0, 120)}…` : value;
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    return value.slice(0, 5).map((v) => buildJsonSample(v, depth + 1));
  }
  if (typeof value === "object") {
    const out: { [key: string]: JsonSample } = {};
    let n = 0;
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = buildJsonSample(v, depth + 1);
      if (++n >= 12) break;
    }
    return out;
  }
  return String(value) as JsonSample;
}

export function classifySensitiveJson(
  url: string,
  keys: string[],
): string | null {
  if (SENSITIVE_URL_RE.test(url)) {
    return "url looks like auth/token/odds-stream";
  }
  for (const k of keys) {
    if (SENSITIVE_KEY_RE.test(k)) return `sensitive key: ${k}`;
  }
  return null;
}

export function sameOrigin(a: string, b: string): boolean {
  try {
    return new URL(a).origin === new URL(b).origin;
  } catch {
    return false;
  }
}

/** Walk JSON for human-facing strings / image URLs / list labels / CTAs */
export function enrichFromPublicJson(snapshots: PublicApiSnapshot[]): {
  headings: Array<{ level: number; text: string; source: "network" }>;
  links: Array<{ href: string; text: string; internal: boolean; source: "network" }>;
  ctaTexts: Array<{ text: string; source: "network" }>;
  imageUrls: Array<{ url: string; source: "network" }>;
} {
  const headings: Array<{ level: number; text: string; source: "network" }> = [];
  const links: Array<{ href: string; text: string; internal: boolean; source: "network" }> = [];
  const ctaTexts: Array<{ text: string; source: "network" }> = [];
  const imageUrls: Array<{ url: string; source: "network" }> = [];
  const seenH = new Set<string>();
  const seenL = new Set<string>();
  const seenC = new Set<string>();
  const seenI = new Set<string>();

  const TITLE_KEYS = /^(title|name|label|heading|headline|nav_?label|menu_?title|section)$/i;
  const CTA_KEYS = /^(cta|button|action_?label|btn_?text|submit_?text|call_?to_?action)$/i;
  const HREF_KEYS = /^(href|url|link|path|permalink|slug)$/i;
  const IMG_KEYS = /^(image|img|src|thumbnail|thumb|icon|logo|banner|og_?image|cover)$/i;

  function walk(node: unknown, baseUrl: string, depth = 0) {
    if (depth > 6 || node == null) return;
    if (Array.isArray(node)) {
      for (const item of node.slice(0, 40)) walk(item, baseUrl, depth + 1);
      return;
    }
    if (typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    let title: string | null = null;
    let href: string | null = null;
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "string" && v.trim()) {
        if (TITLE_KEYS.test(k) && !title) title = v.trim().slice(0, 160);
        if (CTA_KEYS.test(k)) {
          const t = v.trim().slice(0, 120);
          if (!seenC.has(t)) {
            seenC.add(t);
            ctaTexts.push({ text: t, source: "network" });
          }
        }
        if (HREF_KEYS.test(k) && !href) {
          try {
            href = new URL(v, baseUrl).toString();
          } catch {
            href = v;
          }
        }
        if (IMG_KEYS.test(k) || /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(v)) {
          try {
            const u = new URL(v, baseUrl).toString();
            if (/^https?:/i.test(u) && !seenI.has(u)) {
              seenI.add(u);
              imageUrls.push({ url: u, source: "network" });
            }
          } catch {
            /* ignore */
          }
        }
      } else if (v && typeof v === "object") {
        walk(v, baseUrl, depth + 1);
      }
    }
    if (title && !seenH.has(title)) {
      seenH.add(title);
      headings.push({ level: 2, text: title, source: "network" });
    }
    if (title && href && !seenL.has(href)) {
      seenL.add(href);
      let internal = false;
      try {
        internal = new URL(href).origin === new URL(baseUrl).origin;
      } catch {
        internal = href.startsWith("/");
      }
      links.push({ href, text: title, internal, source: "network" });
    }
  }

  for (const snap of snapshots) {
    if ("blocked" in snap && snap.blocked) continue;
    if (!("sample" in snap)) continue;
    walk(snap.sample, snap.url);
  }

  return {
    headings: headings.slice(0, 40),
    links: links.slice(0, 60),
    ctaTexts: ctaTexts.slice(0, 30),
    imageUrls: imageUrls.slice(0, 40),
  };
}

export function parseSitemapLocs(xml: string, origin: string): string[] {
  const locs: string[] = [];
  const re = /<loc>\s*([^<]+)\s*<\/loc>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) && locs.length < 40) {
    const raw = m[1].trim();
    try {
      const u = new URL(raw);
      if (u.origin === origin && (u.protocol === "http:" || u.protocol === "https:")) {
        locs.push(u.toString());
      }
    } catch {
      /* skip */
    }
  }
  return [...new Set(locs)].slice(0, MAX_SITEMAP_URLS);
}

export function extractJsonLdBlocks(html: string): JsonSample[] {
  const out: JsonSample[] = [];
  const re =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && out.length < 8) {
    try {
      out.push(JSON.parse(m[1].trim()) as JsonSample);
    } catch {
      /* ignore bad ld+json */
    }
  }
  return out;
}

export function extractOgImage(html: string, base: string): string | null {
  const m =
    html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    ) ||
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    );
  if (!m?.[1]) return null;
  try {
    return new URL(m[1], base).toString();
  } catch {
    return m[1];
  }
}

export function snapshotFromJsonBody(opts: {
  url: string;
  status: number;
  bodyText: string;
}): PublicApiSnapshot {
  const { url, status, bodyText } = opts;
  let parsed: unknown;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    return { url, status, blocked: true, reason: "invalid json" };
  }
  const keys = collectJsonKeys(parsed);
  const reason = classifySensitiveJson(url, keys);
  if (reason) {
    return { url, status, blocked: true, reason, keys: keys.slice(0, 20) };
  }
  return {
    url,
    status,
    keys: keys.slice(0, 40),
    sample: buildJsonSample(parsed),
  };
}
