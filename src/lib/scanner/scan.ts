import { createHash } from "node:crypto";
import { extractEvidence, type Blueprint, type EvidenceDraft } from "../blueprint/schema.ts";
import { assertPublicHttpUrl } from "./ssrf.ts";
import { extractSameOriginHrefs, parsePublicHtml } from "./html-parse.ts";

const FETCH_TIMEOUT_MS = 8000;
const MAX_HTML_BYTES = 1_500_000;
const MAX_PAGES = 5;

export type ScanSuccess = {
  ok: true;
  blueprint: Blueprint;
  evidence: EvidenceDraft[];
  html: string;
  contentHash: string;
  warnings: string[];
  files: string[];
  uncompressedBytes: number;
  partial: boolean;
};

export type ScanFailure = {
  ok: false;
  errors: string[];
};

export type ScanResult = ScanSuccess | ScanFailure;

function hash(html: string, url: string): string {
  return createHash("sha256").update(`${url}\n${html}`).digest("hex");
}

async function fetchPublicText(url: string): Promise<{ ok: true; url: string; text: string } | { ok: false; error: string }> {
  const allowed = await assertPublicHttpUrl(url);
  if (!allowed.ok) return { ok: false, error: allowed.error };

  let current = allowed.url;
  for (let hop = 0; hop < 4; hop += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(current, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "user-agent": "COSY-Studio-Scanner/1.0 (+https://github.com/ENZO7700/cosy-studio)",
          accept: "text/html,application/xhtml+xml",
        },
      });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) return { ok: false, error: "Redirect without Location." };
        const next = new URL(location, current);
        const nextAllowed = await assertPublicHttpUrl(next.toString());
        if (!nextAllowed.ok) return { ok: false, error: nextAllowed.error };
        current = nextAllowed.url;
        continue;
      }
      if (!response.ok) {
        return { ok: false, error: `HTTP ${response.status} from ${current.host}.` };
      }
      const length = Number(response.headers.get("content-length") ?? "0");
      if (length > MAX_HTML_BYTES) {
        return { ok: false, error: "Response exceeds scanner size limit." };
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.byteLength > MAX_HTML_BYTES) {
        return { ok: false, error: "Response exceeds scanner size limit." };
      }
      return { ok: true, url: current.toString(), text: buffer.toString("utf8") };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fetch failed.";
      return { ok: false, error: message === "This operation was aborted" ? "Stránka neodpovedala načas." : message };
    } finally {
      clearTimeout(timer);
    }
  }
  return { ok: false, error: "Too many redirects." };
}

async function waybackFallback(url: string): Promise<{ ok: true; url: string; text: string } | { ok: false; error: string }> {
  const available = await fetchPublicText(
    `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`,
  );
  if (!available.ok) return available;
  try {
    const json = JSON.parse(available.text) as {
      archived_snapshots?: { closest?: { available?: boolean; url?: string } };
    };
    const snapshot = json.archived_snapshots?.closest;
    if (!snapshot?.available || !snapshot.url) {
      return { ok: false, error: "No Wayback snapshot." };
    }
    return fetchPublicText(snapshot.url);
  } catch {
    return { ok: false, error: "Wayback response was not JSON." };
  }
}

function toSuccess(html: string, sourceUrl: string, extras: Parameters<typeof parsePublicHtml>[2], partial: boolean): ScanSuccess {
  const blueprint = parsePublicHtml(html, sourceUrl, extras);
  const evidence = extractEvidence(blueprint);
  const warnings = Array.isArray(blueprint.warnings)
    ? blueprint.warnings.map((row) => (typeof row === "string" ? row : JSON.stringify(row)))
    : [];
  return {
    ok: true,
    blueprint,
    evidence,
    html: html.slice(0, MAX_HTML_BYTES),
    contentHash: hash(html, sourceUrl),
    warnings,
    files: ["blueprint.json", "manifest.json", "index.html"],
    uncompressedBytes: Buffer.byteLength(html),
    partial,
  };
}

export async function scanPublicSource(input: {
  authorized: boolean;
  sourceUrl?: string;
  pastedHtml?: string;
}): Promise<ScanResult> {
  if (!input.authorized) {
    return { ok: false, errors: ["Najprv zaškrtnite, že na to máte právo."] };
  }

  const pasted = input.pastedHtml?.trim() ?? "";
  const rawUrl = input.sourceUrl?.trim() ?? "";

  if (!rawUrl && !pasted) {
    return { ok: false, errors: ["Dajte verejnú adresu alebo vložte HTML."] };
  }

  if (pasted && !rawUrl) {
    const sourceUrl = "https://scanned.local/pasted";
    return toSuccess(pasted, sourceUrl, { warnings: ["Použili sme text, ktorý ste vložili."] }, true);
  }

  const homepage = await fetchPublicText(rawUrl);
  let html: string | null = homepage.ok ? homepage.text : null;
  let finalUrl = homepage.ok ? homepage.url : rawUrl;
  const warnings: string[] = [];
  let partial = false;

  if (!homepage.ok) {
    warnings.push(`Živú stránku sa nepodarilo otvoriť: ${homepage.error}`);
    const archived = await waybackFallback(rawUrl);
    if (archived.ok) {
      html = archived.text;
      finalUrl = rawUrl;
      warnings.push("Použili sme staršiu uloženú verziu stránky.");
      partial = true;
    } else if (pasted) {
      html = pasted;
      warnings.push("Použili sme text, ktorý ste vložili, lebo živá stránka ani záloha nešli.");
      partial = true;
    } else {
      return {
        ok: false,
        errors: [
          homepage.error,
          archived.ok === false ? archived.error : "Wayback fallback failed.",
        ],
      };
    }
  }

  const extraPages: { url: string; html: string }[] = [];
  if (html && homepage.ok) {
    const hrefs = extractSameOriginHrefs(html, finalUrl, MAX_PAGES - 1);
    for (const href of hrefs) {
      const page = await fetchPublicText(href);
      if (!page.ok) {
        warnings.push(`Partial crawl: skipped ${href} (${page.error})`);
        partial = true;
        continue;
      }
      extraPages.push({ url: page.url, html: page.text });
    }
  }

  return toSuccess(html!, finalUrl, { extraPages, warnings }, partial);
}
