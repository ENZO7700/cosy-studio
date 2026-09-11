import type { Blueprint } from "../blueprint/schema.ts";
import type { Json } from "../cosy/types.ts";

export type TaskDraft = {
  phase: string;
  title: string;
  description: string;
  priority: "p0" | "p1" | "p2";
  estimateHours: number;
  acceptanceCriteria: Json;
  status: "todo";
};

function rec(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function buildTasks(blueprint: Blueprint, targetStack: string): TaskDraft[] {
  const pages = Array.isArray(blueprint.pages) ? blueprint.pages : [];
  const forms = Array.isArray(blueprint.forms) ? blueprint.forms : [];
  const wp = rec(blueprint.wordpress);
  const pluginCount = Number(wp?.pluginsActive ?? 0);
  const stackLabel =
    targetStack === "react_vite_ts"
      ? "jednoduchšiu React aplikáciu"
      : targetStack === "headless_wp"
        ? "nový vzhľad nad WordPressom"
        : targetStack === "cursor_plan"
          ? "plán prác"
          : "modernú webovú aplikáciu";

  const tasks: TaskDraft[] = [
    {
      phase: "základ",
      title: "Zafixovať farby a písmo v novom základe",
      description: `Použite nájdené farby, písmo a medzery v ${stackLabel}.`,
      priority: "p0",
      estimateHours: 3,
      acceptanceCriteria: ["Hodnoty sú na jednom mieste", "Žiadne skopírované CSS z WordPressu"],
      status: "todo",
    },
    {
      phase: "stránky",
      title: `Zložiť ${Math.max(pages.length, 1)} verejn${pages.length === 1 ? "ú stránku" : "é stránky"}`,
      description: pages.length
        ? pages
            .slice(0, 6)
            .map((page) => {
              const row = rec(page);
              return String(row?.path ?? row?.title ?? "/");
            })
            .join(", ")
        : "Aspoň úvodná stránka.",
      priority: "p0",
      estimateHours: Math.max(4, pages.length * 2),
      acceptanceCriteria: ["Každá nájdená cesta má novú stránku", "Menu sedí s verejnou štruktúrou"],
      status: "todo",
    },
  ];

  if (forms.length) {
    tasks.push({
      phase: "formuláre",
      title: `Nahradiť ${forms.length} verejn${forms.length === 1 ? "ý formulár" : "é formuláre"}`,
      description: "Nové formuláre s jasnými poľami. Nestláčajte staré PHP odosielanie.",
      priority: "p1",
      estimateHours: forms.length * 3,
      acceptanceCriteria: ["Fields documented from HTML", "Submit handler is new, not inherited"],
      status: "todo",
    });
  }

  if (pluginCount >= 1) {
    tasks.push({
      phase: "pluginy",
      title: "Z pluginov spraviť vlastné funkcie",
      description: `${pluginCount} pluginov odhadnutých z verejnej stránky. Prestavte len to, čo stránka naozaj potrebuje.`,
      priority: "p1",
      estimateHours: Math.min(16, 4 + pluginCount),
      acceptanceCriteria: ["Each needed plugin has a replacement note", "Unused plugins are dropped"],
      status: "todo",
    });
  }

  if (blueprint.elementor) {
    tasks.push({
      phase: "vzhľad",
      title: "Elementor nahradiť vlastnými blokmi",
      description: "Použite nadpisy a farby zo stránky. Súbory Elementora neimportujte.",
      priority: "p0",
      estimateHours: 8,
      acceptanceCriteria: ["Section components exist for home", "No elementor CSS runtime"],
      status: "todo",
    });
  }

  tasks.push({
    phase: "kontrola",
    title: "Skontrolovať súbory a stiahnuť ich",
    description: "Pripravte súbory, počkajte na kontrolu a stiahnite aplikáciu aj plán prác.",
    priority: "p2",
    estimateHours: 2,
    acceptanceCriteria: ["build_runs.exit_code is 0", "Export ZIP contains generated files"],
    status: "todo",
  });

  return tasks;
}
