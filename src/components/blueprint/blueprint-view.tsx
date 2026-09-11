import { useMemo, useState, type MouseEvent } from "react";
import {
  Box,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileArchive,
  Hash,
  Layers,
  Link2,
  Palette,
  Eye,
  Check,
  Network,
  Clock,
  Bot,
  Archive,
  Files,
  Blocks,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  downloadText,
  downloadElementorTemplate,
  exportBlueprintJson,
} from "@/lib/blueprint/storage";
import type { Blueprint, DomOutlineNode } from "@/lib/blueprint/types";
import { generateAiRebuildPrompt } from "@/lib/ai-rebuild/prompter";
import { generateArchitectureCompilerPrompt } from "@/lib/ai-rebuild/architecture-compiler";
import {
  blueprintToRebuildSpec,
  buildAllRebuildPrompts,
  generateTailwindFromSpec,
  scoreRebuildSpec,
} from "@/lib/rebuild";
import { CompletenessCard } from "@/components/blueprint/completeness-card";
import { ExportRitualBar } from "@/components/blueprint/export-ritual";
import { useI18n } from "@/lib/i18n/context";
import { cn, formatBytes } from "@/lib/utils";

const ADVANCED_TABS = new Set([
  "overview",
  "elementor",
  "pages",
  "assets",
  "preview",
  "json",
]);

/** Keep ?tab=ai-rebuild (and overview) landing on the Architecture Brief. */
const LEGACY_TAB: Record<string, string> = {
  "ai-rebuild": "brief",
  overview: "brief",
};

function resolveMainTab(raw?: string): string {
  if (!raw) return "brief";
  return LEGACY_TAB[raw] ?? raw;
}

function confVariant(c: "high" | "medium" | "low") {
  if (c === "high") return "success" as const;
  if (c === "medium") return "warning" as const;
  return "default" as const;
}

function sourceLabel(source: Blueprint["source"]) {
  if (source === "html") return "HTML import";
  if (source === "wayback") return "Wayback";
  return "URL sken";
}

function OutlineTree({ node, depth = 0 }: { node: DomOutlineNode; depth?: number }) {
  return (
    <div className={cn(depth > 0 && "ml-3 border-l border-border pl-3")}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 py-0.5 text-xs mono">
        <span className="text-info">{`<${node.tag}`}</span>
        {node.id && <span className="text-warning">#{node.id}</span>}
        {node.classes?.slice(0, 4).map((c) => (
          <span key={c} className="text-fg-subtle">
            .{c}
          </span>
        ))}
        {node.role && <span className="text-fg-muted">role={node.role}</span>}
        {node.text && (
          <span className="text-fg-muted truncate max-w-[240px]">“{node.text}”</span>
        )}
      </div>
      {node.children?.map((ch, i) => (
        <OutlineTree key={`${ch.tag}-${i}`} node={ch} depth={depth + 1} />
      ))}
    </div>
  );
}

function BriefCta({
  action,
  copied,
  disabled,
  downloadLabel,
  label,
  onCopy,
  onDownload,
}: {
  action: {
    kind: "react" | "html" | "next" | "tw" | "arch" | "prompt";
    testId: string;
    variant: "default" | "secondary" | "outline" | "ghost";
    size: "lg" | "sm";
    hero?: boolean;
  };
  copied: boolean;
  disabled: boolean;
  downloadLabel: string;
  label: string;
  onCopy: (e: MouseEvent<HTMLButtonElement>) => void;
  onDownload: () => void;
}) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full items-stretch",
        action.hero && "w-full sm:w-auto",
      )}
    >
      <Button
        type="button"
        variant={action.variant}
        size={action.size}
        disabled={disabled}
        data-testid={action.testId}
        className={cn(
          "rounded-r-none min-w-0",
          action.hero && "min-h-12 flex-1 sm:flex-none",
          !action.hero && "min-h-11",
        )}
        onClick={onCopy}
      >
        {copied ? (
          <Check className="size-3.5" />
        ) : action.hero ? (
          <Sparkles className="size-3.5" />
        ) : null}
        {label}
      </Button>
      <Button
        type="button"
        variant={action.variant}
        size={action.size === "lg" ? "lg" : "sm"}
        disabled={disabled}
        data-testid={`${action.testId}-download`}
        className="rounded-l-none border-l-0 px-2.5 min-w-11 min-h-11"
        aria-label={downloadLabel}
        onClick={onDownload}
      >
        <Download className="size-3.5" />
      </Button>
    </div>
  );
}

export function BlueprintView({
  blueprint,
  initialTab,
}: {
  blueprint: Blueprint;
  initialTab?: string;
}) {
  const { t } = useI18n();
  const [tab, setTab] = useState(() => resolveMainTab(initialTab));
  const [copied, setCopied] = useState(false);
  const [copiedAi, setCopiedAi] = useState<
    "prompt" | "tw" | "arch" | "react" | "html" | "next" | null
  >(null);

  const isAdvanced = ADVANCED_TABS.has(tab);

  const rebuildSpec = useMemo(() => blueprintToRebuildSpec(blueprint), [blueprint]);
  const completeness = useMemo(() => scoreRebuildSpec(rebuildSpec), [rebuildSpec]);
  const stackPrompts = useMemo(() => buildAllRebuildPrompts(rebuildSpec), [rebuildSpec]);
  const twFromSpec = useMemo(() => generateTailwindFromSpec(rebuildSpec), [rebuildSpec]);
  const aiRebuild = useMemo(() => generateAiRebuildPrompt(blueprint), [blueprint]);
  const archCompiler = useMemo(
    () => generateArchitectureCompilerPrompt(blueprint),
    [blueprint],
  );

  const fileStem = blueprint.id.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80) || "blueprint";

  const briefActions: Array<{
    kind: "react" | "html" | "next" | "tw" | "arch" | "prompt";
    testId:
      | "brief-cta-cursor"
      | "brief-cta-html"
      | "brief-cta-next"
      | "brief-cta-tw"
      | "brief-cta-arch"
      | "brief-cta-classic";
    text: string;
    filename: string;
    mime: string;
    descKey:
      | "toast.copiedReact"
      | "toast.copiedHtml"
      | "toast.copiedNext"
      | "toast.copiedTw"
      | "toast.copiedArch"
      | "toast.copiedRebuild";
    labelKey:
      | "rebuild.heroCta"
      | "rebuild.stack.html"
      | "rebuild.stack.next"
      | "ai.tailwind"
      | "ai.archPrompt"
      | "ai.classicPrompt";
    variant: "default" | "secondary" | "outline" | "ghost";
    size: "lg" | "sm";
    hero?: boolean;
  }> = [
    {
      kind: "react",
      testId: "brief-cta-cursor",
      text: stackPrompts["react-tailwind"].fullPrompt,
      filename: `cursor-brief-${fileStem}.md`,
      mime: "text/markdown",
      descKey: "toast.copiedReact",
      labelKey: "rebuild.heroCta",
      variant: "default",
      size: "lg",
      hero: true,
    },
    {
      kind: "html",
      testId: "brief-cta-html",
      text: stackPrompts["html-css"].fullPrompt,
      filename: `rebuild-html-css-${fileStem}.md`,
      mime: "text/markdown",
      descKey: "toast.copiedHtml",
      labelKey: "rebuild.stack.html",
      variant: "secondary",
      size: "sm",
    },
    {
      kind: "next",
      testId: "brief-cta-next",
      text: stackPrompts["nextjs-app"].fullPrompt,
      filename: `rebuild-next-app-${fileStem}.md`,
      mime: "text/markdown",
      descKey: "toast.copiedNext",
      labelKey: "rebuild.stack.next",
      variant: "secondary",
      size: "sm",
    },
    {
      kind: "tw",
      testId: "brief-cta-tw",
      text: twFromSpec,
      filename: `tailwind.theme.${fileStem}.js`,
      mime: "text/javascript",
      descKey: "toast.copiedTw",
      labelKey: "ai.tailwind",
      variant: "outline",
      size: "sm",
    },
    {
      kind: "arch",
      testId: "brief-cta-arch",
      text: archCompiler.fullPrompt,
      filename: `architecture-spec-${fileStem}.md`,
      mime: "text/markdown",
      descKey: "toast.copiedArch",
      labelKey: "ai.archPrompt",
      variant: "ghost",
      size: "sm",
    },
    {
      kind: "prompt",
      testId: "brief-cta-classic",
      text: aiRebuild.fullPrompt,
      filename: `classic-rebuild-${fileStem}.md`,
      mime: "text/markdown",
      descKey: "toast.copiedRebuild",
      labelKey: "ai.classicPrompt",
      variant: "ghost",
      size: "sm",
    },
  ];

  const pages = blueprint.pages ?? [];
  const capturedCount =
    blueprint.stats?.capturedAssetCount ??
    blueprint.assets.filter((a) => a.captured).length;

  const previewSrc = useMemo(() => {
    const css = blueprint.cssBundles
      .map((b) => `<style data-src="${b.url}">${b.css}</style>`)
      .join("\n");
    if (/<\/head>/i.test(blueprint.html)) {
      return blueprint.html.replace(/<\/head>/i, `${css}</head>`);
    }
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/>${css}</head><body>${blueprint.html}</body></html>`;
  }, [blueprint]);

  async function copyJson() {
    await navigator.clipboard.writeText(exportBlueprintJson(blueprint));
    setCopied(true);
    toast.success(t("toast.jsonCopied"));
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadJson() {
    downloadText(
      `${blueprint.id}.json`,
      exportBlueprintJson(blueprint),
      "application/json",
    );
    toast.success(t("toast.jsonDownloaded"));
  }

  function downloadElementor() {
    try {
      const tpl = downloadElementorTemplate(blueprint);
      toast.success(
        t("toast.elementorOk", { count: tpl._blueprint?.widgetCount ?? "?" }),
      );
    } catch {
      toast.error(t("toast.elementorFail"));
    }
  }

  async function copyPrompt(
    kind: "react" | "html" | "next" | "tw" | "arch" | "prompt",
    text: string,
    descKey:
      | "toast.copiedReact"
      | "toast.copiedHtml"
      | "toast.copiedNext"
      | "toast.copiedTw"
      | "toast.copiedArch"
      | "toast.copiedRebuild",
    filename: string,
    mime: string,
    opts?: { download?: boolean },
  ) {
    if (!text.trim()) return;
    if (opts?.download) {
      downloadText(filename, text, mime);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAi(kind);
      toast.success(t("toast.copied"), { description: t(descKey) });
      setTimeout(() => setCopiedAi(null), 1600);
    } catch {
      toast.error(t("toast.copyFailed"));
    }
  }

  return (
    <div className="space-y-5">
      <div className="panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">v{blueprint.version}</Badge>
              <Badge variant="default">{sourceLabel(blueprint.source)}</Badge>
              {blueprint.rendered && (
                <Badge variant="info">
                  <Bot className="size-3 mr-1" />
                  headless
                </Badge>
              )}
              {blueprint.waybackUrl && (
                <Badge variant="warning">
                  <Archive className="size-3 mr-1" />
                  wayback
                </Badge>
              )}
              {blueprint.wordpress?.detected && (
                <Badge variant="success">
                  <Blocks className="size-3 mr-1" />
                  WP/Jet
                </Badge>
              )}
              {blueprint.statusCode != null && (
                <Badge variant={blueprint.statusCode < 400 ? "success" : "danger"}>
                  HTTP {blueprint.statusCode}
                </Badge>
              )}
              {blueprint.scanStatus && blueprint.scanStatus !== "complete" && (
                <Badge variant="warning">
                  {blueprint.scanStatus === "aborted"
                    ? t("result.aborted")
                    : t("result.partial")}
                </Badge>
              )}
              {blueprint.isThinHtml && (
                <Badge variant="warning">
                  <AlertTriangle className="size-3 mr-1" />
                  Thin HTML
                </Badge>
              )}
              <Badge
                variant={
                  completeness.score >= 75
                    ? "success"
                    : completeness.score >= 45
                      ? "warning"
                      : "danger"
                }
                data-testid="readiness-badge"
              >
                {completeness.score}% ready
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-balance break-words">
              {blueprint.meta.title || t("result.noTitle")}
            </h2>
            <p className="text-sm text-fg-muted break-all mono">{blueprint.id}</p>
            {blueprint.sourceUrl && (
              <a
                href={blueprint.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg transition-colors"
              >
                <ExternalLink className="size-3.5" />
                {blueprint.finalUrl || blueprint.sourceUrl}
              </a>
            )}
            {blueprint.isThinHtml && (
              <div className="mt-2 flex items-start gap-2 rounded-[var(--radius-md)] border border-warning/50 bg-warning/10 px-3 py-2.5 text-sm text-warning">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-fg">{t("result.thinTitle")}</p>
                  <p className="text-fg-muted">{t("result.thinBody")}</p>
                </div>
              </div>
            )}
          </div>
          <ExportRitualBar blueprint={blueprint}>
            <Button variant="secondary" size="sm" onClick={() => void copyJson()}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              JSON
            </Button>
          </ExportRitualBar>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {[
            { label: "HTML", value: formatBytes(blueprint.stats.htmlBytes), icon: Code2 },
            { label: t("result.pages"), value: String(blueprint.stats?.pageCount ?? 1), icon: Files },
            { label: t("result.assets"), value: String(blueprint.stats.assetCount), icon: Box },
            { label: t("result.captured"), value: String(capturedCount), icon: FileArchive },
            { label: t("result.links"), value: String(blueprint.links.length), icon: Link2 },
            { label: t("result.techLabel"), value: String(blueprint.tech.length), icon: Network },
            { label: t("result.time"), value: `${blueprint.stats.scanMs} ms`, icon: Clock },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-[var(--radius-md)] border border-border bg-bg-subtle/80 px-2.5 py-2 sm:px-3 sm:py-2.5"
            >
              <div className="flex items-center gap-1.5 text-fg-subtle">
                <s.icon className="size-3.5" />
                <span className="text-[11px] font-medium uppercase tracking-wide">
                  {s.label}
                </span>
              </div>
              <div className="mt-1 truncate text-sm font-semibold tabular-nums">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-x-auto -mx-1 px-1">
          <TabsList>
            <TabsTrigger value="brief">{t("tab.brief")}</TabsTrigger>
            <TabsTrigger value="wordpress">{t("tab.wordpress")}</TabsTrigger>
            <TabsTrigger value="design">{t("tab.design")}</TabsTrigger>
            <TabsTrigger value="structure">{t("tab.structure")}</TabsTrigger>
            <TabsTrigger value={isAdvanced ? tab : "overview"}>
              {t("tab.advanced")}
            </TabsTrigger>
          </TabsList>
        </div>
        {isAdvanced && (
          <div className="overflow-x-auto -mx-1 px-1 mt-2">
            <TabsList>
              <TabsTrigger value="overview">{t("tab.overview")}</TabsTrigger>
              <TabsTrigger value="elementor">{t("tab.elementor")}</TabsTrigger>
              <TabsTrigger value="pages">{t("tab.pages")}</TabsTrigger>
              <TabsTrigger value="assets">{t("tab.assets")}</TabsTrigger>
              <TabsTrigger value="preview">{t("tab.preview")}</TabsTrigger>
              <TabsTrigger value="json">{t("tab.json")}</TabsTrigger>
            </TabsList>
          </div>
        )}

        <TabsContent value="brief" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4" />
                {t("rebuild.briefTitle")}
              </CardTitle>
              <CardDescription>{t("rebuild.briefDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CompletenessCard spec={rebuildSpec} report={completeness} />
              <p className="text-sm text-fg" data-testid="readiness-band">
                {completeness.score >= 75
                  ? t("rebuild.readiness.high")
                  : completeness.score >= 45
                    ? t("rebuild.readiness.mid")
                    : t("rebuild.readiness.low")}
              </p>
              <div
                data-testid="extracted-inventory"
                className="rounded-[var(--radius-md)] border border-border bg-bg-subtle/40 px-3 py-2.5 space-y-1"
              >
                <div className="text-[11px] uppercase tracking-wide text-fg-subtle">
                  {t("rebuild.extracted")}
                </div>
                <p className="text-xs text-fg-muted leading-relaxed">
                  {t("rebuild.extractedLine", {
                    cct: blueprint.wordpress?.cctTypes?.length ?? 0,
                    listings: blueprint.wordpress?.listingGrids?.length ?? 0,
                    sections: blueprint.wordpress?.elementorSections?.length ?? 0,
                    colors:
                      Object.keys(blueprint.design?.elementorGlobals?.colors ?? {})
                        .length || (blueprint.design?.colors?.length ?? 0),
                    forms: blueprint.forms?.length ?? 0,
                  })}
                </p>
              </div>
              <p
                data-testid="brief-disclaimer"
                className="text-xs text-fg-muted leading-relaxed rounded-[var(--radius-md)] border border-border bg-bg-subtle/50 px-3 py-2.5"
              >
                {t("rebuild.disclaimer")}
              </p>
              <div className="flex flex-wrap gap-2">
                {briefActions
                  .filter((a) => a.hero)
                  .map((action) => (
                    <BriefCta
                      key={action.testId}
                      action={action}
                      copied={copiedAi === action.kind}
                      disabled={!action.text.trim()}
                      downloadLabel={t("rebuild.downloadFile")}
                      label={t(action.labelKey)}
                      onCopy={(e) => {
                        void copyPrompt(
                          action.kind,
                          action.text,
                          action.descKey,
                          action.filename,
                          action.mime,
                          { download: e.shiftKey },
                        );
                      }}
                      onDownload={() =>
                        void copyPrompt(
                          action.kind,
                          action.text,
                          action.descKey,
                          action.filename,
                          action.mime,
                          { download: true },
                        )
                      }
                    />
                  ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {briefActions
                  .filter((a) => !a.hero)
                  .map((action) => (
                    <BriefCta
                      key={action.testId}
                      action={action}
                      copied={copiedAi === action.kind}
                      disabled={!action.text.trim()}
                      downloadLabel={t("rebuild.downloadFile")}
                      label={t(action.labelKey)}
                      onCopy={(e) => {
                        void copyPrompt(
                          action.kind,
                          action.text,
                          action.descKey,
                          action.filename,
                          action.mime,
                          { download: e.shiftKey },
                        );
                      }}
                      onDownload={() =>
                        void copyPrompt(
                          action.kind,
                          action.text,
                          action.descKey,
                          action.filename,
                          action.mime,
                          { download: true },
                        )
                      }
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wordpress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Blocks className="size-4" />
                {t("tab.wordpress")}
              </CardTitle>
              <CardDescription>
                {blueprint.wordpress ? t("wp.detected") : t("wp.enableHint")}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-fg-muted space-y-2">
              {blueprint.wordpress ? (
                <p>
                  CCT {blueprint.wordpress.cctTypes.length} · listings{" "}
                  {blueprint.wordpress.listingGrids.length} · Elementor sections{" "}
                  {blueprint.wordpress.elementorSections.length}
                </p>
              ) : (
                <p>{t("wp.missing")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="size-4" />
                {t("design.colors")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {blueprint.design.colors.slice(0, 24).map((c) => (
                <div
                  key={c}
                  className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-bg-subtle px-2 py-1.5"
                >
                  <span
                    className="size-5 rounded-[var(--radius-xs)] border border-border-strong shrink-0"
                    style={{ background: c }}
                  />
                  <span className="mono text-[11px] text-fg-muted">{c}</span>
                </div>
              ))}
              {blueprint.design.colors.length === 0 && (
                <p className="text-sm text-fg-muted">{t("design.noColors")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("structure.outline")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-72">
                <div className="pr-3">
                  {blueprint.outline.map((n, i) => (
                    <OutlineTree key={i} node={n} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4" forceMount hidden={tab !== "overview"}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="size-4" />
                {t("overview.tech")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {blueprint.tech.length === 0 && (
                <p className="text-sm text-fg-muted">{t("overview.noTech")}</p>
              )}
              {blueprint.tech.map((tech) => (
                <div
                  key={tech.name}
                  className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] border border-border bg-bg-subtle/60 px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-medium">{tech.name}</div>
                    <div className="text-xs text-fg-muted">{tech.evidence}</div>
                  </div>
                  <Badge variant={confVariant(tech.confidence)}>{tech.confidence}</Badge>
                </div>
              ))}
              <div className="flex items-center gap-2 text-xs text-fg-muted pt-2">
                <Hash className="size-3.5" />
                <span className="mono break-all">{blueprint.contentHash}</span>
              </div>
            </CardContent>
          </Card>

          {(blueprint.notes?.length ?? 0) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-fg-muted">
                  {blueprint.notes.map((note) => (
                    <li key={note} className="flex gap-2">
                      <span className="text-fg-subtle">–</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {(blueprint.limitations?.length ?? 0) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("overview.limitations")}</CardTitle>
                <CardDescription>{t("overview.limitationsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-fg-muted">
                  {blueprint.limitations.map((limitation) => (
                    <li key={limitation} className="flex gap-2">
                      <span className="text-fg-subtle">–</span>
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="elementor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("elementor.compiler")}</CardTitle>
              <CardDescription>{t("elementor.draftNote")}</CardDescription>
            </CardHeader>
            <CardContent>
              {blueprint.elementorTemplate ? (
                <Button size="sm" onClick={downloadElementor}>
                  <Download className="size-3.5" />
                  {t("elementor.downloadTpl")}
                </Button>
              ) : (
                <p className="text-sm text-fg-muted">{t("elementor.notCompiled")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>{t("pages.crawlMap", { count: (pages.length || 0) + 1 })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="mono text-xs text-fg-muted break-all">
                {blueprint.finalUrl || blueprint.sourceUrl || "—"}
              </div>
              {pages.length === 0 && (
                <p className="text-fg-muted">{t("pages.crawlEmpty")}</p>
              )}
              {pages.map((p) => (
                <div key={p.url} className="border-b border-border/50 py-2">
                  <div className="font-medium">{p.title || t("pages.noTitle")}</div>
                  <div className="mono text-xs text-fg-muted break-all">{p.url}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("assets.title", {
                  count: blueprint.assets.length,
                  captured: capturedCount,
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[320px]">
                <div className="space-y-1 pr-3">
                  {blueprint.assets.slice(0, 80).map((a) => (
                    <div key={a.url} className="text-xs mono text-fg-muted break-all py-1">
                      {a.type} · {a.url}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="size-4" />
                {t("preview.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <iframe
                title="Blueprint preview"
                sandbox="allow-same-origin allow-scripts allow-forms"
                srcDoc={previewSrc}
                className="h-[min(70dvh,32rem)] min-h-[280px] w-full bg-white rounded-[var(--radius-md)] border border-border"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle>{t("json.title")}</CardTitle>
              <Button variant="secondary" size="sm" onClick={downloadJson}>
                <Download className="size-3.5" />
                {t("result.download")}
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[360px] rounded-[var(--radius-md)] border border-border bg-bg">
                <pre className="p-4 text-[11px] mono text-fg-muted whitespace-pre-wrap break-all">
                  {exportBlueprintJson({
                    ...blueprint,
                    html:
                      blueprint.html.length > 4000
                        ? `${blueprint.html.slice(0, 4000)}\n/* …truncated… */`
                        : blueprint.html,
                    cssBundles: blueprint.cssBundles.map((b) => ({
                      ...b,
                      css:
                        b.css.length > 1200
                          ? `${b.css.slice(0, 1200)}\n/* …truncated… */`
                          : b.css,
                    })),
                    assets: blueprint.assets.map(({ base64, ...rest }) =>
                      base64 ? { ...rest, base64: `[${base64.length} chars]` } : rest,
                    ),
                  })}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
