export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

export type SourceType = "url" | "blueprint_zip" | "app_zip" | "blank";

export type TargetStack =
  | "next_ts_tailwind"
  | "react_vite_ts"
  | "headless_wp"
  | "elementor"
  | "cursor_plan";

export type ProjectScope =
  | "ui_prototype"
  | "frontend_rebuild"
  | "fullstack_starter"
  | "migration_audit";

export type ProjectStatus =
  | "draft"
  | "importing"
  | "blueprint_ready"
  | "failed";

export type ProjectListItem = {
  id: string;
  name: string;
  sourceType: SourceType;
  status: ProjectStatus;
  targetStack: string | null;
  scope: string | null;
  readinessScore: number | null;
  riskLevel: string | null;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EvidenceItem = {
  id: string;
  category: string;
  label: string;
  value: string | null;
  confidence: number | null;
  sourceReference: string | null;
  state: string;
  notes: string | null;
};

export type SourceImport = {
  id: string;
  filename: string | null;
  sourceUrl: string | null;
  checksum: string | null;
  importedAt: string;
  validationStatus: string;
  importMetadata: Json;
  errorMessage: string | null;
};

export type ActivityEvent = {
  id: string;
  actor: string;
  type: string;
  message: string;
  createdAt: string;
};

export type ProjectDetail = {
  project: ProjectListItem & { ideaBrief: string | null };
  blueprint: {
    id: string;
    version: number;
    data: Json;
    contentHash: string | null;
    createdAt: string;
  } | null;
  evidence: EvidenceItem[];
  imports: SourceImport[];
  activity: ActivityEvent[];
};

export const TARGET_LABELS: Record<TargetStack, string> = {
  next_ts_tailwind: "Next.js + TypeScript + Tailwind",
  react_vite_ts: "React + Vite + TypeScript",
  headless_wp: "Headless WordPress frontend",
  elementor: "Elementor template output",
  cursor_plan: "Cursor migration plan only",
};

export const SCOPE_LABELS: Record<ProjectScope, string> = {
  ui_prototype: "UI prototype",
  frontend_rebuild: "Frontend rebuild",
  fullstack_starter: "Full-stack starter",
  migration_audit: "Migration audit only",
};

export const SOURCE_LABELS: Record<SourceType, string> = {
  url: "Public URL",
  blueprint_zip: "Blueprint Scanner ZIP",
  app_zip: "Existing application ZIP",
  blank: "Written idea",
};
