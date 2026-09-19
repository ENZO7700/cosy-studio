import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assessCompleteness } from "./completeness.ts";
import { mapLayoutSections, type LayoutNode } from "./mapper.ts";
import { SK } from "./strings-sk.ts";
import type { LayoutMap, LayoutSection } from "./types.ts";

function node(
  tagName: string,
  opts: {
    id?: string;
    className?: string;
    role?: string;
    text?: string;
    children?: LayoutNode[];
  } = {},
): LayoutNode {
  return {
    tagName,
    id: opts.id ?? null,
    className: opts.className ?? null,
    textContent: opts.text ?? "",
    children: opts.children ?? [],
    getAttribute: (name: string) =>
      name === "role" ? (opts.role ?? null) : null,
  };
}

function section(
  role: LayoutSection["role"],
  text: string,
): LayoutSection {
  return {
    id: `mock-${role}`,
    role,
    selector: `.${role}`,
    tagName: "section",
    ariaRole: null,
    textDensity: 0.5,
    contentText: text,
    childCount: 2,
    source: "heuristic",
  };
}

describe("layout mapper", () => {
  it("maps html5 landmarks to roles", () => {
    const root = node("BODY", {
      children: [
        node("HEADER", { text: "Logo TipSport" }),
        node("NAV", { text: "Šport Live Casino" }),
        node("SECTION", {
          className: "hero banner-main",
          text: "Vitajte v hre. Bonus až 100 € na prvý vklad.",
        }),
        node("SECTION", {
          className: "listing cards matches",
          text: "Zápas A vs B. Zápas C vs D. Zápas E vs F. Ďalšie kurzy.",
        }),
        node("FOOTER", { text: "© 2026 TipSport. Ochrana údajov." }),
      ],
    });

    const layout = mapLayoutSections(root);
    const roles = layout.sections.map((s) => s.role);
    assert.ok(roles.includes("header"));
    assert.ok(roles.includes("nav"));
    assert.ok(roles.includes("footer"));
    assert.equal(layout.hasShellOnly, false);
  });

  it("flags shell-only SPA before content hydrates", () => {
    const root = node("BODY", {
      children: [
        node("HEADER", { text: "Logo" }),
        node("NAV", { text: "Menu" }),
        node("FOOTER", { text: "©" }),
      ],
    });
    const layout = mapLayoutSections(root);
    assert.equal(layout.hasShellOnly, true);
  });
});

describe("layout completeness", () => {
  it("fixture with 4 mock sections → 100%", () => {
    const layout: LayoutMap = {
      sections: [
        section("header", "Horná lišta s logom a prihlásením"),
        section("hero", "Hlavný banner s bonusom a krátkym popisom hry"),
        section(
          "listing",
          "Zoznam zápasov: A vs B, C vs D, E vs F, G vs H",
        ),
        section("footer", "Pätka s odkazmi na pravidlá a kontakt"),
      ],
      hasShellOnly: false,
      contentTextChars: 200,
    };

    const result = assessCompleteness(layout);
    assert.equal(result.score, 100);
    assert.equal(result.complete, true);
    assert.equal(result.hint, null);
  });

  it("shell without contentText caps at 40% with SK hint", () => {
    const layout: LayoutMap = {
      sections: [
        section("header", "Logo"),
        section("nav", "Menu"),
      ],
      hasShellOnly: true,
      contentTextChars: 8,
    };
    // short contentText → treat as shell (override text to be tiny)
    layout.sections[0]!.contentText = "Logo";
    layout.sections[1]!.contentText = "Menu";

    const result = assessCompleteness(layout);
    assert.equal(result.score, 40);
    assert.equal(result.complete, false);
    assert.equal(result.message, SK.shellOnly);
    assert.equal(result.hint, SK.rescanWait);
  });
});
