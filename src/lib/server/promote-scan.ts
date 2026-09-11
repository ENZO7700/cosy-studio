import type { Blueprint as ScanBlueprint } from "@/lib/blueprint/types";
import type { Blueprint as CosyBlueprint } from "@/lib/blueprint/schema";
import { extractEvidence } from "@/lib/blueprint/schema";

export function scannerBlueprintToCosy(bp: ScanBlueprint): CosyBlueprint {
  const pages = [
    {
      path: "/",
      title: bp.meta?.title || "Úvod",
    },
    ...(bp.pages ?? []).map((page) => ({
      path: page.url,
      title: page.title,
    })),
  ];
  const limitations = [
    "Verejná stránka. Súkromné časti (admin, heslá) nevidno.",
    ...(Array.isArray((bp as { limitations?: string[] }).limitations)
      ? ((bp as { limitations?: string[] }).limitations ?? [])
      : []),
  ];
  const warnings = [
    bp.scanStatus === "partial" ? "Sken je čiastočný." : null,
    bp.waybackUrl ? "Použili sme staršiu uloženú verziu stránky." : null,
  ].filter(Boolean) as string[];

  return {
    version: "1.0",
    sourceUrl: bp.sourceUrl ?? bp.finalUrl ?? undefined,
    finalUrl: bp.finalUrl ?? bp.sourceUrl ?? undefined,
    pages,
    forms: bp.forms,
    designTokens: bp.design,
    wordpress: bp.wordpress,
    elementor: bp.elementorTemplate,
    techSignals: bp.tech,
    warnings,
    limitations,
    metadata: {
      scannerId: bp.id,
      contentHash: bp.contentHash,
      source: bp.source,
    },
  };
}

export function evidenceFromScan(bp: ScanBlueprint) {
  return extractEvidence(scannerBlueprintToCosy(bp));
}
