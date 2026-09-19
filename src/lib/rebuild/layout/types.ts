export type LayoutRole =
  | "header"
  | "nav"
  | "hero"
  | "listing"
  | "cta"
  | "footer"
  | "content"
  | "unknown";

export interface LayoutSection {
  id: string;
  role: LayoutRole;
  selector: string;
  tagName: string;
  ariaRole: string | null;
  textDensity: number;
  contentText: string;
  childCount: number;
  source: "html5" | "aria" | "heuristic";
}

export interface LayoutMap {
  sections: LayoutSection[];
  hasShellOnly: boolean;
  contentTextChars: number;
}

export interface CompletenessResult {
  score: number;
  complete: boolean;
  message: string;
  hint: string | null;
  missingRoles: LayoutRole[];
}
