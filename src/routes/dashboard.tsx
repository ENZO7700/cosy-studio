/**
 * Copilot hub at /dashboard — 4 primary cards + collapsible Advanced.
 */
import { useCallback, useEffect, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  GitCompareArrows,
  History,
  Home,
  Import,
  LayoutDashboard,
  ScanLine,
} from "lucide-react";
import { ComparePanel } from "@/components/blueprint/compare-panel";
import { HistoryList } from "@/components/blueprint/history-list";
import { SheetOverlay } from "@/components/blueprint/sheet-overlay";
import { ToolCard } from "@/components/dashboard/tool-card";
import { normalizeImportedBlueprint } from "@/lib/blueprint/import-normalize";
import { pickJsonFile } from "@/lib/blueprint/pick-json-file";
import {
  PRIMARY_CARDS,
  TOOL_CARDS,
  TOOL_CATEGORIES,
  cardsByCategory,
  type ToolAction,
  type ToolCardDef,
} from "@/lib/dashboard/catalog";
import {
  clear as historyClear,
  ensureBoot,
  getHistoryError,
  getHistoryMode,
  list as historyList,
  remove as historyRemove,
  save as historySave,
  type HistoryMode,
  type HistorySummary,
} from "@/lib/history/store";
import { LanguageSwitcher, useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ScanSearch } from "@/lib/scan/search-params";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

type Overlay = "none" | "history" | "compare";

function homeSearchForAction(action: ToolAction): ScanSearch {
  if (action.type !== "home") return {};
  const search: ScanSearch = {};
  if (action.tool) search.tool = action.tool;
  if (action.options) {
    const o = action.options;
    if (typeof o.render === "boolean") search.render = o.render;
    if (typeof o.wayback === "boolean") search.wayback = o.wayback;
    if (typeof o.crawl === "boolean") search.crawl = o.crawl;
    if (typeof o.assets === "boolean") search.assets = o.assets;
    if (typeof o.wp === "boolean") search.wp = o.wp;
    if (typeof o.url === "string") search.url = o.url;
  }
  return search;
}

function DashboardPage() {
  const { locale, t } = useI18n();
  const navigate = useNavigate();
  const sk = locale === "sk";

  const [overlay, setOverlay] = useState<Overlay>("none");
  const [history, setHistory] = useState<HistorySummary[]>([]);
  const [historyMode, setHistoryMode] = useState<HistoryMode>("local");
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      await ensureBoot();
      setHistoryMode(getHistoryMode());
      const items = await historyList();
      setHistory(items);
      setHistoryError(getHistoryError());
    } catch (e) {
      setHistoryError(e instanceof Error ? e.message : "History failed");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  function closeOverlay() {
    setOverlay("none");
  }

  async function handleImportJson() {
    try {
      const text = await pickJsonFile();
      if (!text) return;
      const parsed = normalizeImportedBlueprint(JSON.parse(text));
      await historySave(parsed);
      await refreshHistory();
      toast.success(t("toast.imported"));
      navigate({
        to: "/scan",
        search: { tab: "brief", bp: parsed.id },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("toast.importFailed"));
    }
  }

  async function handleActivate(card: ToolCardDef) {
    const { action } = card;
    if (action.type === "home") {
      navigate({ to: "/scan", search: homeSearchForAction(action) });
      return;
    }
    if (action.type === "open") {
      if (action.panel === "import") {
        await handleImportJson();
      } else {
        setOverlay(action.panel);
      }
      return;
    }
    if (action.type === "tab") {
      await ensureBoot();
      const items = await historyList();
      if (!items.length) {
        toast.message(t("scan.cta"), {
          description: t("app.subtitle"),
        });
        navigate({ to: "/scan", search: {} });
        return;
      }
      navigate({
        to: "/scan",
        search: { tab: action.tab, bp: items[0].id },
      });
    }
  }

  function handleSelect(id: string) {
    closeOverlay();
    navigate({ to: "/scan", search: { bp: id } });
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("history.deleteConfirm"))) return;
    await historyRemove(id);
    await refreshHistory();
    toast.message(t("toast.deleted"));
  }

  async function handleClearAll() {
    if (!window.confirm(t("history.clearConfirm"))) return;
    await historyClear();
    await refreshHistory();
    toast.message(t("toast.cleared"));
  }

  const sideNav: Array<{
    kind: "link" | "button";
    to?: string;
    label: string;
    icon: typeof Home;
    active: boolean;
    onClick?: () => void;
  }> = [
    {
      kind: "link",
      to: "/",
      label: sk ? "Domov" : "Home",
      icon: Home,
      active: false,
    },
    {
      kind: "link",
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: true,
    },
    {
      kind: "button",
      label: sk ? "História" : "History",
      icon: History,
      active: false,
      onClick: () => setOverlay("history"),
    },
    {
      kind: "button",
      label: sk ? "Porovnať" : "Compare",
      icon: GitCompareArrows,
      active: false,
      onClick: () => setOverlay("compare"),
    },
    {
      kind: "button",
      label: "Import",
      icon: Import,
      active: false,
      onClick: () => void handleImportJson(),
    },
  ];

  return (
    <div className="app-dvh-lock flex bg-bg text-fg">
      <div className="app-pin-tr">
        <LanguageSwitcher />
      </div>

      <aside className="hidden md:flex w-[220px] shrink-0 flex-col border-r border-border bg-bg-elevated/40">
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border">
          <div className="flex size-8 items-center justify-center rounded-[var(--radius-sm)] border border-border bg-bg-subtle text-accent">
            <ScanLine className="size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Blueprint</span>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {sideNav.map((item) => {
            const Icon = item.icon;
            const cls = cn(
              "flex min-h-11 items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors w-full text-left",
              item.active
                ? "bg-bg-subtle text-fg font-medium border border-border"
                : "text-fg-muted hover:text-fg hover:bg-bg-subtle/60",
            );
            if (item.kind === "link" && item.to === "/") {
              return (
                <Link key={item.label} to="/" search={{}} className={cls}>
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            }
            if (item.kind === "link" && item.to) {
              return (
                <Link key={item.label} to={item.to} className={cls}>
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            }
            return (
              <button key={item.label} type="button" className={cls} onClick={item.onClick}>
                <Icon className="size-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border text-[11px] text-fg-subtle space-y-1">
          <p className="font-medium text-fg-muted">Copilot hub</p>
          <p className="mono">/dashboard</p>
          <p>
            {sk
              ? "Štyri karty. Zvyšok v Pokročilé."
              : "Four cards. The rest is Advanced."}
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-bg px-3 pr-[6.75rem] pt-[env(safe-area-inset-top)] md:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <ScanLine className="size-4 shrink-0 text-accent" />
            <span className="truncate text-sm font-semibold">Dashboard</span>
          </div>
          <Link
            to="/"
            search={{}}
            className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs text-fg-muted hover:text-fg"
          >
            {sk ? "Domov" : "Home"}
          </Link>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-8 md:pb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-subtle px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
                <span className="size-1.5 rounded-full bg-accent" />
                Copilot
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
                WordPress to Cursor Migration Copilot
              </h1>
              <p className="text-sm text-fg-muted max-w-2xl text-balance">
                {sk
                  ? "Jeden sken → CCT / Elementor tokeny + Cursor prompt. Rebuild readiness hovorí, koľko práce ostáva — nie že sme web naklonovali."
                  : "One scan → CCT / Elementor tokens + a Cursor prompt. Rebuild readiness is remaining work — not a clone score."}
              </p>
            </div>

            <section className="space-y-3">
              <div className="flex items-end justify-between gap-3 border-b border-border pb-2">
                <div>
                  <h2 className="text-sm font-semibold text-fg">
                    {sk ? "Hlavné karty" : "Start here"}
                  </h2>
                  <p className="text-xs text-fg-subtle mt-0.5">
                    {sk
                      ? "WP migrácia, tokeny, brief, porovnanie"
                      : "WP migrate, tokens, brief, diff"}
                  </p>
                </div>
                <span className="text-[11px] mono text-fg-subtle shrink-0">
                  {PRIMARY_CARDS.length}
                </span>
              </div>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {PRIMARY_CARDS.map((card) => (
                  <ToolCard
                    key={card.id}
                    card={card}
                    onActivate={(c) => void handleActivate(c)}
                  />
                ))}
              </div>
            </section>

            <details className="group rounded-[var(--radius-lg)] border border-border bg-bg-elevated/40">
              <summary className="cursor-pointer list-none flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm font-medium hover:bg-bg-subtle/40 rounded-[var(--radius-lg)]">
                <span className="flex items-center gap-2">
                  {sk ? "Pokročilé" : "Advanced"}
                  <span className="text-[11px] font-normal text-fg-subtle">
                    {sk
                      ? "Ďalšie extractory a exporty"
                      : "More extractors and exports"}
                  </span>
                </span>
                <span className="text-[11px] mono text-fg-subtle">
                  {TOOL_CARDS.length}
                </span>
              </summary>
              <div className="px-4 pb-5 space-y-6 border-t border-border/70 pt-4">
                {TOOL_CATEGORIES.map((cat) => {
                  const cards = cardsByCategory(cat.id);
                  if (cards.length === 0) return null;
                  return (
                    <section key={cat.id} className="space-y-3">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-fg">
                            {sk ? cat.labelSk : cat.labelEn}
                          </h3>
                          {(sk ? cat.descSk : cat.descEn) && (
                            <p className="text-xs text-fg-subtle mt-0.5">
                              {sk ? cat.descSk : cat.descEn}
                            </p>
                          )}
                        </div>
                        <span className="text-[11px] mono text-fg-subtle shrink-0">
                          {cards.length}
                        </span>
                      </div>
                      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {cards.map((card) => (
                          <ToolCard
                            key={card.id}
                            card={card}
                            onActivate={(c) => void handleActivate(c)}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </details>

            <footer className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-4 pb-8 text-xs text-fg-subtle md:pb-8">
              <span>Copilot · /dashboard</span>
              <Link to="/scan" search={{}} className="text-fg-muted hover:text-accent">
                {sk ? "← Späť na sken" : "← Back to scan"}
              </Link>
            </footer>
          </div>
        </main>
      </div>

      <nav
        data-testid="dashboard-mobile-nav"
        className="app-dock grid grid-cols-4 border-t border-border bg-bg/95 backdrop-blur-md md:hidden pb-[env(safe-area-inset-bottom)]"
      >
        <Link
          to="/scan"
          search={{}}
          className="flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium text-fg-muted hover:text-fg"
        >
          <ScanLine className="size-4" />
          {sk ? "Sken" : "Scan"}
        </Link>
        <button
          type="button"
          onClick={() => setOverlay("history")}
          className="flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium text-fg-muted hover:text-fg"
        >
          <History className="size-4" />
          {sk ? "História" : "History"}
        </button>
        <button
          type="button"
          onClick={() => setOverlay("compare")}
          className="flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium text-fg-muted hover:text-fg"
        >
          <GitCompareArrows className="size-4" />
          {sk ? "Porovnať" : "Compare"}
        </button>
        <button
          type="button"
          onClick={() => void handleImportJson()}
          className="flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium text-fg-muted hover:text-fg"
        >
          <Import className="size-4" />
          Import
        </button>
      </nav>

      {overlay === "history" && (
        <SheetOverlay
          title={t("action.historyTitle")}
          closeLabel={t("action.close")}
          onClose={closeOverlay}
        >
          <HistoryList
            items={history}
            mode={historyMode}
            loading={historyLoading}
            error={historyError}
            onSelect={handleSelect}
            onDelete={(id) => void handleDelete(id)}
            onRetry={() => void refreshHistory()}
            onClearAll={() => void handleClearAll()}
          />
        </SheetOverlay>
      )}

      {overlay === "compare" && (
        <SheetOverlay
          title={t("action.compare")}
          closeLabel={t("action.close")}
          onClose={closeOverlay}
        >
          <ComparePanel history={history} />
        </SheetOverlay>
      )}
    </div>
  );
}
