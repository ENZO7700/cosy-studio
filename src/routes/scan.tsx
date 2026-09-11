import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  GitCompareArrows,
  History,
  Import,
  LayoutDashboard,
  RefreshCw,
  ScanLine,
} from "lucide-react";
import {
  ScanForm,
  type ScanFormDeepLink,
} from "@/components/blueprint/scan-form";
import { ScanHeroBg } from "@/components/blueprint/scan-hero-bg";
import { BlueprintView } from "@/components/blueprint/blueprint-view";
import { HistoryList } from "@/components/blueprint/history-list";
import { ComparePanel } from "@/components/blueprint/compare-panel";
import { SheetOverlay } from "@/components/blueprint/sheet-overlay";
import { Button } from "@/components/ui/button";
import { normalizeImportedBlueprint } from "@/lib/blueprint/import-normalize";
import { pickJsonFile } from "@/lib/blueprint/pick-json-file";
import type { Blueprint } from "@/lib/blueprint/types";
import {
  clear as historyClear,
  ensureBoot,
  get as historyGet,
  getHistoryError,
  getHistoryMode,
  list as historyList,
  remove as historyRemove,
  save as historySave,
  type HistoryMode,
  type HistorySummary,
} from "@/lib/history/store";
import { toast } from "sonner";
import { LanguageSwitcher, useI18n } from "@/lib/i18n/context";
import { parseScanSearch, type ScanSearch } from "@/lib/scan/search-params";
import { promoteScanToProject } from "@/lib/server/projects";

export const Route = createFileRoute("/scan")({
  validateSearch: (search: Record<string, unknown>): ScanSearch =>
    parseScanSearch(search),
  component: ScanPage,
});

type Overlay = "none" | "history" | "compare";

function ScanPage() {
  const { t } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [history, setHistory] = useState<HistorySummary[]>([]);
  const [historyMode, setHistoryMode] = useState<HistoryMode>("local");
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>("none");
  const [promoting, setPromoting] = useState(false);

  const deepLink = useMemo((): ScanFormDeepLink | null => {
    const has =
      search.tool ||
      search.url ||
      search.render !== undefined ||
      search.wayback !== undefined ||
      search.crawl !== undefined ||
      search.assets !== undefined ||
      search.wp !== undefined;
    if (!has) return null;
    const dl: ScanFormDeepLink = {};
    if (search.tool) dl.tool = search.tool;
    if (search.url) dl.url = search.url;
    if (search.render !== undefined) dl.render = search.render;
    if (search.wayback !== undefined) dl.wayback = search.wayback;
    if (search.crawl !== undefined) dl.crawl = search.crawl;
    if (search.assets !== undefined) dl.assets = search.assets;
    if (search.wp !== undefined) dl.wp = search.wp;
    return dl;
  }, [search]);

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

  const closeOverlay = useCallback(() => {
    setOverlay("none");
    if (search.open) {
      navigate({ search: (prev) => ({ ...prev, open: undefined }), replace: true });
    }
  }, [navigate, search.open]);

  useEffect(() => {
    if (!search.bp) return;
    const id = search.bp;
    void (async () => {
      await ensureBoot();
      const bp = await historyGet(id);
      if (bp) {
        setBlueprint(bp);
      } else {
        toast.error(t("toast.notFound"));
      }
      navigate({ search: (prev) => ({ ...prev, bp: undefined }), replace: true });
    })();
  }, [search.bp, navigate, t]);

  async function importBlueprintText(text: string) {
    const parsed = normalizeImportedBlueprint(JSON.parse(text));
    await historySave(parsed);
    setBlueprint(parsed);
    await refreshHistory();
    toast.success(t("toast.imported"));
  }

  useEffect(() => {
    if (search.open === "history") {
      setOverlay("history");
    } else if (search.open === "compare") {
      setOverlay("compare");
    } else if (search.open === "import") {
      navigate({ search: (prev) => ({ ...prev, open: undefined }), replace: true });
      void (async () => {
        try {
          const text = await pickJsonFile();
          if (!text) return;
          await importBlueprintText(text);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : t("toast.importFailed"));
        }
      })();
    }
    // importBlueprintText is local and uses latest t/refreshHistory
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.open, t, navigate]);

  useEffect(() => {
    if (!search.tab) return;
    if (!blueprint) {
      toast.message(t("scan.cta"), {
        description: t("app.subtitle"),
      });
    }
  }, [search.tab, blueprint, t]);

  function handleScanned(bp: Blueprint) {
    setBlueprint(bp);
    void refreshHistory();
    toast.success(t("toast.ready"), {
      description: t("toast.readyDesc", {
        id: bp.id,
        pages: bp.stats?.pageCount ?? 1,
      }),
    });
  }

  async function handleSelect(id: string) {
    const bp = await historyGet(id);
    if (!bp) {
      toast.error(t("toast.notFound"));
      return;
    }
    setBlueprint(bp);
    closeOverlay();
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("history.deleteConfirm"))) return;
    await historyRemove(id);
    if (blueprint?.id === id) setBlueprint(null);
    await refreshHistory();
    toast.message(t("toast.deleted"));
  }

  async function handleClearAll() {
    if (!window.confirm(t("history.clearConfirm"))) return;
    await historyClear();
    setBlueprint(null);
    await refreshHistory();
    toast.message(t("toast.cleared"));
  }

  async function handleImportJson() {
    try {
      const text = await pickJsonFile();
      if (!text) return;
      await importBlueprintText(text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("toast.importFailed"));
    }
  }

  const showResult = Boolean(blueprint);
  const dashLinkClass =
    "inline-flex items-center gap-1.5 min-h-11 px-3 text-xs font-medium rounded-lg border border-border bg-bg-elevated/90 text-fg-muted hover:text-fg hover:bg-bg-subtle transition-colors backdrop-blur-sm";

  return (
    <div className="relative overflow-x-clip bg-bg">
      <div className="app-pin-tr">
        <LanguageSwitcher />
      </div>

      {!showResult && (
        <section
          className="app-dvh-frame relative w-full"
          data-testid="scan-hero"
        >
          <ScanHeroBg />

          <div className="app-pin-tl">
            <Link to="/dashboard" className={dashLinkClass}>
              <LayoutDashboard className="size-3.5" />
              Dashboard
            </Link>
          </div>

          <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[540px] flex-col justify-center gap-6 px-4 py-24 sm:gap-8 sm:px-5 sm:py-16">
            <div className="flex min-h-[5.5rem] flex-col items-center gap-2 text-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-bg-subtle/80 border border-border text-accent backdrop-blur-sm">
                  <ScanLine className="size-5" />
                </div>
                <span className="text-2xl font-semibold tracking-tight text-fg drop-shadow-[0_0_24px_color-mix(in_oklab,var(--color-accent)_35%,transparent)]">
                  {t("app.name")}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-medium tracking-tight text-fg text-balance">
                {t("app.tagline")}
              </h1>
              <p className="text-sm text-fg-subtle text-balance max-w-[28rem]">
                {t("app.subtitle")}
              </p>
            </div>

            <div className="panel p-4 sm:p-6 shadow-soft bg-bg-elevated/90 backdrop-blur-md border-border/80">
              <ScanForm
                onScanned={handleScanned}
                busy={busy}
                setBusy={setBusy}
                compact
                deepLink={deepLink}
              />
            </div>

            <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-2 text-xs text-fg-muted border-t border-border/60 pt-5 pb-[max(0.5rem,env(safe-area-inset-bottom))] min-h-[2.75rem]">
              <button
                type="button"
                onClick={() => setOverlay("history")}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 hover:text-fg"
              >
                <History className="size-3.5 text-fg-subtle" />
                {t("action.historyCount", { count: history.length })}
              </button>
              <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
              <button
                type="button"
                onClick={() => void handleImportJson()}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 hover:text-fg"
              >
                <Import className="size-3.5 text-fg-subtle" />
                {t("action.import")}
              </button>
              <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
              <button
                type="button"
                onClick={() => setOverlay("compare")}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 hover:text-fg"
              >
                <GitCompareArrows className="size-3.5 text-fg-subtle" />
                {t("action.compare")}
              </button>
            </div>
          </div>
        </section>
      )}

      {showResult && blueprint && (
        <section
          className="app-dvh-lock flex w-full flex-col bg-bg"
          data-testid="scan-result-shell"
        >
          <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-bg pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(6.75rem,calc(env(safe-area-inset-right)+5.75rem))] pt-[env(safe-area-inset-top)] sm:pl-4 sm:pr-24">
            <div className="flex min-w-0 items-center gap-2.5">
              <Link
                to="/dashboard"
                className="grid size-11 shrink-0 place-items-center rounded-md border border-border bg-bg-subtle text-accent hover:bg-bg-elevated"
                title="Dashboard"
              >
                <LayoutDashboard className="size-4" />
              </Link>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium mono">
                  {blueprint.sourceUrl || blueprint.meta.title || blueprint.id}
                </div>
                <div className="truncate text-[11px] text-fg-subtle">
                  {t("result.pagesAssets", {
                    pages: blueprint.stats?.pageCount ?? 1,
                    assets: blueprint.stats?.capturedAssetCount ?? 0,
                    tech:
                      blueprint.tech?.slice(0, 3).map((x) => x.name).join(" · ") ||
                      "—",
                  })}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOverlay("history")}
                className="min-h-11 min-w-11 justify-center px-2 sm:min-w-[6.5rem] sm:px-3"
              >
                <History className="size-3.5" />
                <span className="hidden sm:inline">{t("action.history")}</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setBlueprint(null);
                  closeOverlay();
                }}
                className="min-h-11 min-w-[6.75rem] justify-center"
              >
                <RefreshCw className="size-3.5" />
                {t("action.newScan")}
              </Button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-6xl px-3 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  disabled={promoting}
                  onClick={() => {
                    void (async () => {
                      setPromoting(true);
                      try {
                        const result = await promoteScanToProject({
                          data: { blueprint, authorized: true },
                        });
                        if (!result.ok) {
                          toast.error(result.errors.join(" "));
                          return;
                        }
                        await navigate({ to: "/projects/$id", params: { id: result.id } });
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Nepodarilo sa otvoriť prestavbu.");
                      } finally {
                        setPromoting(false);
                      }
                    })();
                  }}
                >
                  {promoting ? "Otváram prestavbu…" : "Pokračovať v prestavbe"}
                </Button>
                <Link to="/projects" className="text-sm text-muted hover:text-fg">
                  Otvoriť projekty
                </Link>
              </div>
              <BlueprintView blueprint={blueprint} initialTab={search.tab} />
            </div>
          </div>
        </section>
      )}

      {overlay === "history" && (
        <SheetOverlay
          title={t("action.historyTitle")}
          closeLabel={t("action.close")}
          onClose={closeOverlay}
        >
          <HistoryList
            items={history}
            activeId={blueprint?.id}
            mode={historyMode}
            loading={historyLoading}
            error={historyError}
            onSelect={(id) => void handleSelect(id)}
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
          <ComparePanel history={history} current={blueprint} />
        </SheetOverlay>
      )}
    </div>
  );
}
