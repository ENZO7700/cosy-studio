import { createFileRoute, getRouteApi } from "@tanstack/react-router";

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

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        <section className="rounded-lg bg-panel p-5 shadow-[0_0_0_1px_var(--color-line)]">
          <h2 className="text-sm font-semibold">Source summary</h2>
          <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-muted">URL</dt>
              <dd className="font-mono text-xs">{String(data?.finalUrl ?? data?.sourceUrl ?? "—")}</dd>
            </div>
            <div>
              <dt className="text-muted">Checksum</dt>
              <dd className="font-mono text-xs">{detail.blueprint?.contentHash ?? sourceImport?.checksum ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Archive</dt>
              <dd className="font-mono text-xs">{sourceImport?.filename ?? "seeded demo"}</dd>
            </div>
            <div>
              <dt className="text-muted">Validation</dt>
              <dd>{sourceImport?.validationStatus ?? "n/a"}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg bg-panel p-5 shadow-[0_0_0_1px_var(--color-line)]">
          <h2 className="text-sm font-semibold">Technology and WordPress</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {detail.evidence
              .filter((item) => ["technology", "wordpress", "platform", "theme", "plugins", "elementor"].includes(item.category))
              .map((item) => (
                <article key={item.id} className="rounded-md bg-elevated p-3">
                  <div className="text-xs text-muted">{item.category} · {item.state}</div>
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
          <h2 className="text-sm font-semibold">Pages, forms, tokens</h2>
          <p className="mt-2 text-sm text-muted">
            {pages.length} page{pages.length === 1 ? "" : "s"} · {forms.length} form{forms.length === 1 ? "" : "s"}
          </p>
          {tokens ? (
            <pre className="mt-3 overflow-auto font-mono text-[11px] text-muted">
              {JSON.stringify(tokens, null, 2)}
            </pre>
          ) : (
            <p className="mt-3 text-sm text-muted">No design tokens in this Blueprint.</p>
          )}
        </section>
      </div>

      <aside className="space-y-4">
        <section className="rounded-lg bg-elevated p-4 shadow-[0_0_0_1px_var(--color-line)]">
          <h2 className="text-sm font-semibold">Limitations and gaps</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {limitations.length === 0 && warnings.length === 0 ? <li>None recorded.</li> : null}
            {[...limitations, ...warnings].map((row, index) => (
              <li key={index}>{typeof row === "string" ? row : JSON.stringify(row)}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg bg-panel p-4 shadow-[0_0_0_1px_var(--color-line)]">
          <h2 className="text-sm font-semibold">Evidence ledger</h2>
          <ul className="mt-3 space-y-2 text-xs">
            {detail.evidence.map((item) => (
              <li key={item.id}>
                <div className="text-fg">{item.label}</div>
                <div className="font-mono text-muted">
                  {item.state}
                  {item.confidence !== null ? ` · ${Math.round(item.confidence * 100)}%` : ""}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}
