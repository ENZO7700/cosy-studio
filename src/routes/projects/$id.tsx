import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/app-shell";
import { getProject } from "@/lib/server/projects";
import { cn } from "@/lib/utils";
import { readinessFace } from "@/lib/copy";

export const Route = createFileRoute("/projects/$id")({
  loader: ({ params }) => getProject({ data: { id: params.id } }),
  component: ProjectLayout,
});

const TABS = [
  { to: ".", label: "Prehľad" },
  { to: "blueprint", label: "Čo sme našli" },
  { to: "architecture", label: "Stavba stránky" },
  { to: "risks", label: "Riziká" },
  { to: "tasks", label: "Úlohy" },
  { to: "build", label: "Kontrola" },
  { to: "code", label: "Súbory" },
  { to: "canvas", label: "Náhľad" },
  { to: "exports", label: "Stiahnuť" },
] as const;

function ProjectLayout() {
  const detail = Route.useLoaderData();
  const { id } = Route.useParams();
  if (!detail) {
    return (
      <AppShell title="Projekt">
        <p className="text-muted">Tento projekt sme nenašli.</p>
      </AppShell>
    );
  }
  const { project } = detail;
  return (
    <AppShell
      kicker={project.isDemo ? "Ukážkový projekt" : "Projekt"}
      title={project.name}
      actions={
        <span className="font-mono text-xs text-muted">{readinessFace(project.readinessScore)}</span>
      }
    >
      <div className="mx-auto max-w-6xl">
        <nav className="-mx-1 mb-6 flex gap-1 overflow-x-auto pb-2">
          {TABS.map((tab) => (
            <Link
              key={tab.label}
              to={tab.to === "." ? "/projects/$id" : `/projects/$id/${tab.to}`}
              params={{ id }}
              className={cn(
                "min-h-10 shrink-0 rounded-md px-3 text-sm text-muted hover:text-fg",
                "[&.active]:bg-elevated [&.active]:text-fg",
              )}
              activeOptions={{ exact: tab.to === "." }}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <Outlet />
      </div>
    </AppShell>
  );
}
