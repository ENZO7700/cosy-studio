/**
 * Quiet scan hero background — vignette, graphite grid, one gold glow.
 * Pure CSS. No canvas, SVG, particles, or decorative icons.
 */
export function ScanHeroBg() {
  return (
    <div className="scan-hero-bg" aria-hidden data-testid="scan-hero-bg">
      <div className="scan-hero-bg__vignette" />
      <div className="scan-hero-bg__grid" />
      <div className="scan-hero-bg__glow scan-hero-bg__glow--gold" />
    </div>
  );
}
