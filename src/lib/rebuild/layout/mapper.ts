import type { LayoutMap, LayoutRole, LayoutSection } from "./types.ts";

/** Minimal DOM surface so mapper runs in browser OR with fixtures (no real DOM needed). */
export interface LayoutNode {
  tagName: string;
  id?: string | null;
  className?: string | null;
  getAttribute?(name: string): string | null;
  textContent?: string | null;
  children?: LayoutNode[];
}

const ROLE_BY_TAG: Record<string, LayoutRole> = {
  HEADER: "header",
  NAV: "nav",
  FOOTER: "footer",
  MAIN: "content",
  ASIDE: "content",
  SECTION: "content",
  ARTICLE: "content",
};

const ROLE_BY_ARIA: Record<string, LayoutRole> = {
  banner: "header",
  navigation: "nav",
  contentinfo: "footer",
  main: "content",
  complementary: "content",
};

function normTag(n: LayoutNode): string {
  return (n.tagName || "").toUpperCase();
}

function ariaRole(n: LayoutNode): string | null {
  const r = n.getAttribute?.("role") || null;
  return r ? r.toLowerCase() : null;
}

function textOf(n: LayoutNode): string {
  return (n.textContent || "").replace(/\s+/g, " ").trim();
}

function density(text: string, childCount: number): number {
  const len = text.length;
  if (len === 0) return 0;
  return Math.min(1, len / Math.max(40, childCount * 12 + 20));
}

function heuristicRole(n: LayoutNode, text: string, dens: number): LayoutRole | null {
  const idc = `${n.id || ""} ${n.className || ""}`.toLowerCase();
  if (/hero|jumbotron|banner-main|masthead/.test(idc)) return "hero";
  if (/cta|call-to-action|promo-box/.test(idc)) return "cta";
  if (/list|grid|cards|listing|matches|menu-items/.test(idc)) return "listing";
  if (/footer/.test(idc)) return "footer";
  if (/header|topbar/.test(idc)) return "header";
  if (/nav|menu/.test(idc)) return "nav";
  // hero: short block near top with medium density headline-ish
  if (dens > 0.15 && dens < 0.7 && text.length >= 20 && text.length <= 280) {
    if (/btn|button|cta/.test(idc)) return "cta";
  }
  if (dens >= 0.35 && text.length > 80) return "content";
  return null;
}

function pickRole(n: LayoutNode, text: string, dens: number): {
  role: LayoutRole;
  source: LayoutSection["source"];
} {
  const tag = normTag(n);
  const aria = ariaRole(n);
  if (aria && ROLE_BY_ARIA[aria]) {
    return { role: ROLE_BY_ARIA[aria], source: "aria" };
  }
  if (ROLE_BY_TAG[tag]) {
    let role = ROLE_BY_TAG[tag];
    // SECTION with hero-like class upgrades
    if (tag === "SECTION") {
      const h = heuristicRole(n, text, dens);
      if (h === "hero" || h === "cta" || h === "listing") role = h;
    }
    return { role, source: "html5" };
  }
  const h = heuristicRole(n, text, dens);
  if (h) return { role: h, source: "heuristic" };
  return { role: "unknown", source: "heuristic" };
}

function selectorFor(n: LayoutNode, index: number): string {
  const tag = normTag(n).toLowerCase() || "div";
  if (n.id) return `#${n.id}`;
  const cls = (n.className || "").toString().trim().split(/\s+/).filter(Boolean)[0];
  if (cls) return `${tag}.${cls}`;
  return `${tag}:nth-section(${index + 1})`;
}

/**
 * Map hydrated DOM-like tree → layout.sections with roles.
 * Expects top-level landmark / section-ish children (or a root with children).
 */
export function mapLayoutSections(root: LayoutNode): LayoutMap {
  const kids =
    root.children && root.children.length
      ? root.children
      : [root];

  const sections: LayoutSection[] = [];
  let contentTextChars = 0;

  kids.forEach((child, i) => {
    const tag = normTag(child);
    // skip scripts/styles
    if (["SCRIPT", "STYLE", "NOSCRIPT", "LINK", "META"].includes(tag)) return;

    const text = textOf(child);
    const childCount = child.children?.length ?? 0;
    const dens = density(text, childCount);
    const { role, source } = pickRole(child, text, dens);
    contentTextChars += text.length;

    sections.push({
      id: `sec-${i}-${role}`,
      role,
      selector: selectorFor(child, i),
      tagName: tag.toLowerCase() || "div",
      ariaRole: ariaRole(child),
      textDensity: Number(dens.toFixed(3)),
      contentText: text.slice(0, 500),
      childCount,
      source,
    });
  });

  const roles = new Set(sections.map((s) => s.role));
  const hasContentful = sections.some(
    (s) =>
      (s.role === "content" || s.role === "hero" || s.role === "listing" || s.role === "cta") &&
      s.contentText.replace(/\s+/g, "").length > 20,
  );
  const hasShell = roles.has("header") || roles.has("nav") || roles.has("footer");
  const hasShellOnly = hasShell && !hasContentful;

  return {
    sections,
    hasShellOnly,
    contentTextChars,
  };
}
