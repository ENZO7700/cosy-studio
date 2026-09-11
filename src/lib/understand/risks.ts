import type { Blueprint } from "../blueprint/schema.ts";
import type { EvidenceDraft } from "../blueprint/schema.ts";

export type RiskDraft = {
  severity: "high" | "medium" | "low";
  score: number;
  confidence: number;
  evidence: string;
  mitigation: string;
  status: "open";
};

function rec(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function buildRisks(blueprint: Blueprint, evidence: EvidenceDraft[]): RiskDraft[] {
  const risks: RiskDraft[] = [];
  const wp = rec(blueprint.wordpress);
  const pluginCount = Number(wp?.pluginsActive ?? 0);
  const hasElementor = Boolean(blueprint.elementor) || evidence.some((item) => item.category === "elementor");
  const limitations = Array.isArray(blueprint.limitations) ? blueprint.limitations : [];
  const forms = Array.isArray(blueprint.forms) ? blueprint.forms : [];

  if (limitations.length) {
    risks.push({
      severity: "high",
      score: 86,
      confidence: 1,
      evidence: limitations.map((row) => (typeof row === "string" ? row : JSON.stringify(row))).join("; "),
      mitigation: "Berte to ako novú aplikáciu podľa verejných stôp, nie ako kópiu jedna k jednej.",
      status: "open",
    });
  }

  if (pluginCount >= 8) {
    risks.push({
      severity: "high",
      score: 78,
      confidence: 0.64,
      evidence: `${pluginCount} pluginov odhadnutých z verejnej stránky — nie z administrácie.`,
      mitigation: "Funkcie pluginov nahraďte vlastnými stránkami a formulármi.",
      status: "open",
    });
  }

  if (hasElementor) {
    risks.push({
      severity: "medium",
      score: 61,
      confidence: 0.88,
      evidence: "Na verejnej stránke je vidieť Elementor.",
      mitigation: "Rozloženie zložte z farieb a blokov, nie zo súborov Elementora.",
      status: "open",
    });
  }

  const theme = evidence.find((item) => item.category === "theme");
  if (theme) {
    risks.push({
      severity: "medium",
      score: 54,
      confidence: theme.confidence ?? 0.7,
      evidence: `Téma: ${theme.value ?? theme.label}`,
      mitigation: "Farby a písmo zoberte z nájdených vzoriek, nie z PHP témy.",
      status: "open",
    });
  }

  if (forms.length) {
    risks.push({
      severity: "low",
      score: 32,
      confidence: 0.8,
      evidence: `${forms.length} verejný formulár / formuláre.`,
      mitigation: "Formuláre zložte nanovo. Staré odosielanie nepoužívajte.",
      status: "open",
    });
  }

  if (risks.length === 0) {
    risks.push({
      severity: "low",
      score: 22,
      confidence: 0.5,
      evidence: "Málo verejných stôp — obraz stránky je neúplný.",
      mitigation: "Pozrite viac stránok alebo vložte súbor zo skenera, až potom pripravujte súbory.",
      status: "open",
    });
  }

  return risks;
}
