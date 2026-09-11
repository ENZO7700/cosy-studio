export function readinessFace(score: number | null): string {
  return score === null ? "Ešte nevieme dosť" : `Vieme o stránke ${score} %`;
}

export function riskFace(level: string | null | undefined): string {
  if (!level) return "neznáme";
  if (level === "elevated") return "vyššie";
  if (level === "watch") return "sledovať";
  if (level === "stable") return "v poriadku";
  return level;
}

export function severityFace(value: string): string {
  if (value === "high") return "vysoké";
  if (value === "medium") return "stredné";
  if (value === "low") return "nízke";
  return value;
}

export function categoryFace(value: string): string {
  const map: Record<string, string> = {
    site: "Verejná stránka",
    platform: "WordPress",
    wordpress: "WordPress",
    technology: "Technológia",
    theme: "Téma",
    plugins: "Pluginy",
    builder: "Skladanie stránky",
    elementor: "Elementor",
    routes: "Stránky",
    page: "Stránka",
    forms: "Formuláre",
    tokens: "Farby a písmo",
    limitation: "Hranice prestavby",
    warning: "Upozornenie",
  };
  return map[value] ?? value;
}

export function statusFace(value: string): string {
  const map: Record<string, string> = {
    draft: "koncept",
    importing: "načítavam",
    blueprint_ready: "máme prehľad",
    failed: "nepodarilo sa",
    detected: "videli sme",
    inferred: "odhad",
    confirmed: "potvrdené",
    valid: "v poriadku",
    open: "otvorené",
    todo: "na práci",
    passed: "prešla",
    failed_run: "neprešla",
  };
  return map[value] ?? value.replaceAll("_", " ");
}

export function roleFace(value: string): string {
  if (value === "owner") return "Prevádzkovateľ";
  if (value === "operator") return "Operátor";
  if (value === "reviewer") return "Recenzent agentúry";
  return value;
}

export function planFace(value: string): string {
  if (value === "free") return "Zadarmo";
  if (value === "studio") return "Štúdio";
  if (value === "agency") return "Agentúra";
  return value;
}

export const AUTH_REQUIRED = "Najprv zaškrtnite, že na to máte právo.";
export const PROJECT_MISSING = "Tento projekt sme nenašli.";
export const EXPORT_NEEDS_FILES = "Najprv pripravte súbory, až potom sťahujte.";
