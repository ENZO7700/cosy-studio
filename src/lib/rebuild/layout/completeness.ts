import { SK } from "./strings-sk.ts";
import type { CompletenessResult, LayoutMap, LayoutRole } from "./types.ts";

/** Roles we look for in a hydrated page shell. */
export const KEY_ROLES: LayoutRole[] = [
  "header",
  "nav",
  "hero",
  "listing",
  "cta",
  "footer",
];

/** Fixture / success bar: 4 distinct key roles with real text = complete. */
const COMPLETE_AT = 4;

function isContentfulRole(role: LayoutRole): boolean {
  return (
    role === "content" ||
    role === "hero" ||
    role === "listing" ||
    role === "cta"
  );
}

function hasText(s: { contentText: string }, min = 20): boolean {
  return s.contentText.replace(/\s+/g, "").length > min;
}

function labelSk(r: LayoutRole): string {
  switch (r) {
    case "header":
      return "horná lišta";
    case "nav":
      return "menu";
    case "hero":
      return "úvodný blok";
    case "listing":
      return "zoznam";
    case "cta":
      return "výzva k akcii";
    case "footer":
      return "pätka";
    default:
      return r;
  }
}

/**
 * Completeness from layout map.
 * Shell/nav without contentText → score capped at 40% + SK rescan hint.
 * Four key sections with body text → 100%.
 */
export function assessCompleteness(layout: LayoutMap): CompletenessResult {
  const present = new Set(layout.sections.map((s) => s.role));
  const foundKey = KEY_ROLES.filter((r) => present.has(r));
  const missingRoles = KEY_ROLES.filter((r) => !present.has(r));

  const contentful = layout.sections.filter(
    (s) => isContentfulRole(s.role) && hasText(s),
  );

  const shellish =
    layout.sections.length > 0 &&
    layout.sections.every((s) =>
      ["header", "nav", "footer", "unknown"].includes(s.role),
    );

  if (
    layout.hasShellOnly ||
    (contentful.length === 0 && (shellish || layout.sections.length > 0))
  ) {
    if (layout.hasShellOnly || shellish || contentful.length === 0) {
      return {
        score: 40,
        complete: false,
        message: SK.shellOnly,
        hint: SK.rescanWait,
        missingRoles,
      };
    }
  }

  const score = Math.min(
    100,
    Math.round((foundKey.length / COMPLETE_AT) * 100),
  );

  if (foundKey.length >= COMPLETE_AT && contentful.length > 0) {
    return {
      score: 100,
      complete: true,
      message: SK.completeOk,
      hint: null,
      missingRoles: [],
    };
  }

  const capped = contentful.length === 0 ? Math.min(score, 40) : score;
  const missingSk = missingRoles.map(labelSk).join(", ");

  return {
    score: capped,
    complete: false,
    message: missingSk ? SK.missingParts(missingSk) : SK.shellOnly,
    hint: capped <= 40 ? SK.rescanWait : null,
    missingRoles,
  };
}
