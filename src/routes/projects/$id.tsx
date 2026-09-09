import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/app-shell";
import { getProject } from "@/lib/server/projects";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects/$id")({
  loader: ({ params }) => getProject({ data: { id: params.id } }),
  component: ProjectLayout,
});

const TABS = [
  { to: ".", label: "Overview", milestone: null },
  { to: "blueprint", label: "Blueprint", milestone: null },
  { to: "architecture", label: "Architecture", milestone: 4 },
  { to: "canvas", label: "Canvas", milestone: 6 },
  { to: "build", label: "Build", milestone: 5 },
  { to: "code", label: "Code", milestone: 5 },
  { to: "risks", label: "Risks", milestone: 4 },
  { to: "tasks", label: "Tasks", milestone: 4 },
  { to: "exports", label: "Exports", milestone: 7 },
] as const;

function ProjectLayout() {
  const detail = Route.useLoaderData();
  const { id } = Route.useParams();
  if (!detail) {
    return (
      <AppShell title="Project">
        <p className="text-muted">This project was not found.</p>
      </AppShell>
    );
  }
  const { project } = detail;
  return (
    <AppShell
      kicker={project.isDemo ? "Demo project" : "Project"}
      title={project.name}
      actions={
        <span className="font-mono text-xs text-muted">
          {project.readinessScore !== null
            ? `Readiness ${project.readinessScore}%`
            : "Readiness pending"}
        </span>
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
              {tab.milestone ? (
                <span className="ml-1 text-[10px] text-muted">M{tab.milestone}</span>
              ) : null}
            </Link>
          ))}
        </nav>
        <Outlet />
      </div>
    </AppShell>
  );
}
