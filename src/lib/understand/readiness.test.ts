import assert from "node:assert/strict";
import { test } from "node:test";
import { computeReadiness } from "./readiness.ts";

test("demo-shaped evidence lands near 62% and elevated risk", () => {
  const result = computeReadiness([
    { category: "platform", confidence: 0.96, state: "detected" },
    { category: "theme", confidence: 0.74, state: "inferred" },
    { category: "plugins", confidence: 0.61, state: "inferred" },
    { category: "elementor", confidence: 0.91, state: "detected" },
    { category: "forms", confidence: 0.88, state: "detected" },
    { category: "tokens", confidence: 0.8, state: "detected" },
    { category: "limitation", confidence: 1, state: "confirmed" },
  ]);
  assert.equal(result.score, 62);
  assert.equal(result.riskLevel, "elevated");
  assert.ok(result.breakdown.length >= 3);
});
