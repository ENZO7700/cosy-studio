export type ReadinessInput = {
  category: string;
  confidence: number | null;
  state: string;
};

export type ReadinessResult = {
  score: number;
  riskLevel: "stable" | "watch" | "elevated";
  breakdown: { label: string; delta: number }[];
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function has(items: ReadinessInput[], category: string) {
  return items.some((item) => item.category === category);
}

export function computeReadiness(evidence: ReadinessInput[]): ReadinessResult {
  const breakdown: { label: string; delta: number }[] = [];
  let score = 20;
  breakdown.push({ label: "Baseline public evidence", delta: 20 });

  const add = (label: string, delta: number) => {
    score += delta;
    breakdown.push({ label, delta });
  };

  if (has(evidence, "platform") || has(evidence, "wordpress") || has(evidence, "technology")) {
    add("Platform detected", 12);
  }
  if (has(evidence, "theme")) add("Theme signal", 6);
  if (has(evidence, "plugins")) add("Plugin evidence", 4);
  if (has(evidence, "elementor")) add("Builder detected", 6);
  if (has(evidence, "forms")) add("Public forms", 6);
  if (has(evidence, "tokens")) add("Design tokens", 9);
  if (has(evidence, "routes")) add("Captured routes", 6);
  if (has(evidence, "limitation")) add("Known limitations", -8);
  if (has(evidence, "warning")) add("Scan warnings", -4);

  const confidences = evidence
    .map((item) => item.confidence)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (confidences.length) {
    const avg = confidences.reduce((sum, value) => sum + value, 0) / confidences.length;
    add("Evidence confidence", Math.round((avg - 0.5) * 20));
  }

  score = clamp(score, 8, 92);

  const highPenalty = has(evidence, "limitation") || has(evidence, "plugins");
  const inferred = evidence.filter((item) => item.state === "inferred").length;
  const riskLevel: ReadinessResult["riskLevel"] = highPenalty
    ? "elevated"
    : inferred >= 2
      ? "watch"
      : "stable";

  return { score, riskLevel, breakdown };
}
