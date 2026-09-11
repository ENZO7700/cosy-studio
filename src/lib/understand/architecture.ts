import type { Blueprint } from "../blueprint/schema.ts";
import type { Json } from "../cosy/types.ts";

export type ArchitectureDraft = {
  category: string;
  title: string;
  parentKey: string | null;
  key: string;
  data: Json;
  state: "detected" | "inferred" | "draft";
};

function rec(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function buildArchitecture(blueprint: Blueprint): ArchitectureDraft[] {
  const nodes: ArchitectureDraft[] = [
    {
      key: "root",
      parentKey: null,
      category: "site",
      title: "Verejná stránka",
      data: {
        url: blueprint.finalUrl ?? blueprint.sourceUrl ?? blueprint.source_url ?? null,
      },
      state: "detected",
    },
  ];

  const wp = rec(blueprint.wordpress);
  if (wp) {
    nodes.push({
      key: "platform",
      parentKey: "root",
      category: "platform",
      title: `WordPress ${String(wp.core ?? "detected")}`,
      data: wp as Json,
      state: "detected",
    });
    if (wp.theme) {
      nodes.push({
        key: "theme",
        parentKey: "platform",
        category: "theme",
        title: String(wp.theme),
        data: { theme: String(wp.theme) },
        state: "inferred",
      });
    }
    const plugins = Array.isArray(wp.plugins) ? wp.plugins : [];
    if (plugins.length || wp.pluginsActive) {
      nodes.push({
        key: "plugins",
        parentKey: "platform",
        category: "plugins",
        title: `${Number(wp.pluginsActive ?? plugins.length)} pluginov (z verejnej stránky)`,
        data: { plugins: plugins.slice(0, 40).map(String), count: Number(wp.pluginsActive ?? plugins.length) },
        state: "inferred",
      });
    }
  }

  if (blueprint.elementor) {
    nodes.push({
      key: "elementor",
      parentKey: wp ? "platform" : "root",
      category: "builder",
      title: "Elementor",
      data: (rec(blueprint.elementor) as Json) ?? { present: true },
      state: "detected",
    });
  }

  const pages = Array.isArray(blueprint.pages) ? blueprint.pages : [];
  if (pages.length) {
    nodes.push({
      key: "routes",
      parentKey: "root",
      category: "routes",
      title: `${pages.length} ${pages.length === 1 ? "stránka" : pages.length < 5 ? "stránky" : "stránok"}`,
      data: { pages: pages.slice(0, 40) as Json },
      state: "detected",
    });
    pages.slice(0, 12).forEach((page, index) => {
      const row = rec(page) ?? { title: String(page) };
      nodes.push({
        key: `page-${index}`,
        parentKey: "routes",
        category: "page",
        title: String(row.title ?? row.path ?? `Stránka ${index + 1}`),
        data: row as Json,
        state: "detected",
      });
    });
  }

  const forms = Array.isArray(blueprint.forms) ? blueprint.forms : [];
  if (forms.length) {
    nodes.push({
      key: "forms",
      parentKey: "root",
      category: "forms",
      title: `${forms.length} verejn${forms.length === 1 ? "ý formulár" : "é formuláre"}`,
      data: { forms: forms as Json },
      state: "detected",
    });
  }

  const tokens = rec(blueprint.designTokens) ?? rec(blueprint.tokens);
  if (tokens) {
    nodes.push({
      key: "tokens",
      parentKey: "root",
      category: "tokens",
      title: "Farby a písmo",
      data: tokens as Json,
      state: "detected",
    });
  }

  const limitations = Array.isArray(blueprint.limitations) ? blueprint.limitations : [];
  if (limitations.length) {
    nodes.push({
      key: "limits",
      parentKey: "root",
      category: "limitation",
      title: "Hranice prestavby",
      data: { limitations: limitations as Json },
      state: "detected",
    });
  }

  return nodes;
}
