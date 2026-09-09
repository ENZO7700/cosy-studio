import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: Home });

const PANELS = [
  {
    kicker: "01 Scan Site",
    title: "Evidence summary",
    rows: [
      "WordPress 6.4.3",
      "Theme: Astra Child",
      "Plugins: 23 active",
      "Content: 1,842 posts/pages",
      "Forms: 6",
      "Integrations: 3",
    ],
  },
  {
    kicker: "02 Reconstruct Blueprint",
    title: "Architecture overview",
    rows: [
      "WordPress Core · Theme · Plugins",
      "Templates: 42",
      "Custom Fields: 57",
      "Taxonomies: 12",
      "Menu locations: 7",
    ],
  },
  {
    kicker: "03 Detect Migration Risks",
    title: "Risk summary",
    rows: [
      "High: PHP version compatibility",
      "High: Plugin dependency risk",
      "Medium: Custom code complexity",
      "Overall: Elevated",
    ],
  },
  {
    kicker: "04 Generate Cursor Plan",
    title: "Prioritized tasks",
    rows: [
      "Migrate theme and templates — 8h",
      "Rebuild custom post types — 6h",
      "Replace plugin functionality — 8h",
      "Total: 30h",
    ],
  },
];

function Home() {
  return (
    <div className="cosy-grid min-h-dvh bg-canvas text-fg">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <ScanSearch className="size-4 text-accent" />
          <span className="text-sm font-semibold">COSY Studio</span>
        </div>
        <Link to="/projects" className="text-sm text-muted hover:text-fg">
          Open workspace
        </Link>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-accent">Blueprint Scanner</p>
        <p className="mt-2 text-xs text-muted">Powered by COSY Studio</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-fg md:text-5xl">
          Website intelligence that becomes a real application workspace.
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Scan a public website or upload a Blueprint ZIP. COSY Studio reconstructs the visible
          architecture, identifies migration risks, generates an implementation plan, and builds a
          verified application foundation.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/projects/new">
            <Button>
              Start a Blueprint
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link to="/projects/$id" params={{ id: "demo-iluminat" }}>
            <Button variant="secondary">View Demo Project</Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted">
          Public frontend intelligence. No private data extraction. No vendor lock-in.
        </p>

        <div className="mt-12 grid gap-3 md:grid-cols-2">
          {PANELS.map((panel) => (
            <article
              key={panel.kicker}
              className="rounded-lg bg-panel p-4 shadow-[0_0_0_1px_var(--color-line)]"
            >
              <div className="text-[10px] uppercase tracking-[0.16em] text-accent">{panel.kicker}</div>
              <h2 className="mt-2 text-sm font-semibold">{panel.title}</h2>
              <ul className="mt-3 space-y-1 font-mono text-xs text-muted">
                {panel.rows.map((row) => (
                  <li key={row}>{row}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <section className="mt-16 max-w-2xl">
          <h2 className="text-xl font-semibold">From website evidence to working code</h2>
          <p className="mt-3 text-sm text-muted">
            Built for serious rebuilds, not generic mockups. This slice ships foundation plus
            Blueprint ZIP import. Scanner, Canvas, live builds, and billing stay scheduled — and
            labeled as such.
          </p>
        </section>
      </section>
    </div>
  );
}
