import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { categoryFace, statusFace } from "@/lib/copy";

const projectRoute = getRouteApi("/projects/$id");

export const Route = createFileRoute("/projects/$id/blueprint")({
  component: BlueprintPage,
});

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function BlueprintPage() {
  const detail = projectRoute.useLoaderData();
  if (!detail) return null;
  const data = asRecord(detail.blueprint?.data);
  const tokens = asRecord(data?.designTokens) ?? asRecord(data?.tokens);
  const wp = asRecord(data?.wordpress);
  const pages = Array.isArray(data?.pages) ? data.pages : [];
  const forms = Array.isArray(data?.forms) ? data.forms : [];
  const warnings = Array.isArray(data?.warnings) ? data.warnings : [];
  const limitations = Array.isArray(data?.limitations) ? data.limitations : [];
  const sourceImport = detail.imports[0];

  if (!detail.blueprint && detail.evidence.length === 0) {
    return (
      <section className="rounded-lg bg-panel p-6 shadow-[0_0_0_1px_var(--color-line)]">
        <h2 className="text-lg font-semibold">Zatiaľ nič</h2>
        <p className="mt-2 max-w-xl text-sm text-muted">Najprv vložte odkaz alebo súbor.</p>
      </section>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        <section className="rounded-lg bg-panel p-5 shadow-[0_0_0_1px_var(--color-line)]">
          <h2 className="text-sm font-semibold">Zhrnutie zdroja</h2>
          <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-muted">Adresa</dt>
              <dd className="font-mono text-xs">{String(data?.finalUrl ?? data?.sourceUrl ?? "—")}</dd>
            </div>
            <div>
              <dt className="text-muted">Kód súboru</dt>
              <dd className="font-mono text-xs">{detail.blueprint?.contentHash ?? sourceImport?.checksum ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Súbor</dt>
              <dd className="font-mono text-xs">{sourceImport?.filename ?? "ukážka"}</dd>
            </div>
            <div>
              <dt className="text-muted">Stav</dt>
              <dd>{sourceImport?.validationStatus ? statusFace(sourceImport.validationStatus) : "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg bg-panel p-5 shadow-[0_0_0_1px_var(--color-line)]">
          <h2 className="text-sm font-semibold">Technológie</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {detail.evidence
              .filter((item) =>
                ["technology", "wordpress", "platform", "theme", "plugins", "elementor"].includes(item.category),
              )
              .map((item) => (
                <article key={item.id} className="rounded-md bg-elevated p-3">
                  <div className="text-xs text-muted">
                    {categoryFace(item.category)} · {statusFace(item.state)}
                  </div>
                  <div className="mt-1 text-sm">{item.label}</div>
                  <div className="font-mono text-xs text-accent">{item.value}</div>
                </article>
              ))}
          </div>
          {wp ? (
            <pre className="mt-4 overflow-auto font-mono text-[11px] text-muted">
              {JSON.stringify(wp, null, 2)}
            </pre>
          ) : null}
        </section>

        <section className="rounded-lg bg-panel p-5 shadow-[0_0_0_1px_var(--color-line)]">
          <h2 className="text-sm font-semibold">Stránky, formuláre, farby</h2>
          <p className="mt-2 text-sm text-muted">
            {pages.length} strán{pages.length === 1 ? "ka" : pages.length >= 2 && pages.length <= 4 ? "ky" : "ok"} ·{" "}
            {forms.length} formulár{forms.length === 1 ? "" : "e"}
          </p>
          {tokens ? (
            <pre className="mt-3 overflow-auto font-mono text-[11px] text-muted">
              {JSON.stringify(tokens, null, 2)}
            </pre>
          ) : (
            <p className="mt-3 text-sm text-muted">Farby a písmo v tomto zdroji nie sú.</p>
          )}
        </section>
      </div>

      <aside className="space-y-4">
        <section className="rounded-lg bg-elevated p-4 shadow-[0_0_0_1px_var(--color-line)]">
          <h2 className="text-sm font-semibold">Čo nevieme</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {limitations.length === 0 && warnings.length === 0 ? <li>Zatiaľ nič zapísané.</li> : null}
            {[...limitations, ...warnings].map((row, index) => (
              <li key={index}>{typeof row === "string" ? row : JSON.stringify(row)}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg bg-panel p-4 shadow-[0_0_0_1px_var(--color-line)]">
          <h2 className="text-sm font-semibold">Zoznam dôkazov</h2>
          <ul className="mt-3 space-y-2 text-xs">
            {detail.evidence.map((item) => (
              <li key={item.id}>
                <div className="text-fg">{item.label}</div>
                <div className="font-mono text-muted">
                  {statusFace(item.state)}
                  {item.confidence !== null ? ` · ${Math.round(item.confidence * 100)} %` : ""}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}
