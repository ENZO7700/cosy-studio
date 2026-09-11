/** In-app landing links — never point at a third-party preview host. */
export const LANDING_REPO_URL =
  "https://github.com/ENZO7700/dawn-cabin-raven-baker";
export const LANDING_REPO_SLUG = "ENZO7700/dawn-cabin-raven-baker";

export function normalizeLandingUrl(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
