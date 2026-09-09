import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { listProjects } from "@/lib/server/projects";
import { SOURCE_LABELS, type ProjectListItem } from "@/lib/cosy/types";

export const Route = createFileRoute("/projects/")({
  loader: () => listProjects(),
  component: ProjectsPage,
});

function StatusChip({ project }: { project: ProjectListItem }) {
  const label = project.isDemo ? "Demo" : project.status.replaceAll("_", " ");
  return (
    <span className="rounded-full bg-elevated px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-accent">
      {label}
    </span>
  );
}

function ProjectsPage() {
  const projects = Route.useLoaderData();
  return (
    <AppShell
      kicker="Workspace"
      title="Projects"
      actions={
        <Link to="/projects/new">
          <Button>New project</Button>
        </Link>
      }
    >
      <div className="mx-auto max-w-5xl">
        <p className="mb-6 max-w-2xl text-sm text-muted">
          Evidence-backed rebuilds. Face metric is rebuild readiness, never clone percentage.
        </p>
        <ul className="space-y-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                to="/projects/$id"
                params={{ id: project.id }}
                className="block rounded-lg bg-panel p-4 shadow-[0_0_0_1px_var(--color-line)] transition-colors hover:bg-elevated"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <strong>{project.name}</strong>
                    <StatusChip project={project} />
                  </div>
                  <span className="font-mono text-xs text-muted">
                    {project.readinessScore !== null
                      ? `Readiness ${project.readinessScore}%`
                      : "Readiness pending"}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted">
                  {SOURCE_LABELS[project.sourceType]} · {project.scope?.replaceAll("_", " ") ?? "scope unset"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
