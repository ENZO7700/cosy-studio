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

export type ArchitectureNode = {
  id: string;
  parentId: string | null;
  category: string;
  title: string;
  data: Json;
  state: string;
};

export type RiskItem = {
  id: string;
  severity: string;
  score: number | null;
  confidence: number | null;
  evidence: string | null;
  mitigation: string | null;
  status: string;
};

export type TaskItem = {
  id: string;
  phase: string | null;
  title: string;
  description: string | null;
  priority: string | null;
  estimateHours: number | null;
  acceptanceCriteria: Json;
  status: string;
};

export type GeneratedFile = {
  id: string;
  path: string;
  code: string;
  language: string | null;
  version: number;
};

export type BuildRun = {
  id: string;
  status: string;
  command: string | null;
  stdout: string | null;
  stderr: string | null;
  exitCode: number | null;
  startedAt: string;
  completedAt: string | null;
};

export type ExportArtifact = {
  id: string;
  type: string;
  storageRef: string | null;
  createdAt: string;
};

export type CanvasMessage = {
  id: string;
  role: string;
  body: string;
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
  architecture: ArchitectureNode[];
  risks: RiskItem[];
  tasks: TaskItem[];
  files: GeneratedFile[];
  builds: BuildRun[];
  exports: ExportArtifact[];
  canvasMessages: CanvasMessage[];
};

export const TARGET_LABELS: Record<TargetStack, string> = {
  next_ts_tailwind: "Moderná webová aplikácia (Next.js)",
  react_vite_ts: "Jednoduchšia React aplikácia",
  headless_wp: "Nový vzhľad nad WordPressom",
  elementor: "Šablóna pre Elementor",
  cursor_plan: "Len plán prác",
};

export const SCOPE_LABELS: Record<ProjectScope, string> = {
  ui_prototype: "Len vzhľad",
  frontend_rebuild: "Nový frontend",
  fullstack_starter: "Aj začiatok zadnej časti",
  migration_audit: "Len prehľad, bez stavby",
};

export const SOURCE_LABELS: Record<SourceType, string> = {
  url: "Verejná adresa webu",
  blueprint_zip: "Súbor zo skenera",
  app_zip: "Súbor zo starého projektu",
  blank: "Len napísaný nápad",
};

