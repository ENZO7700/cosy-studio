import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { listProjects } from "@/lib/server/projects";
import { SOURCE_LABELS, type ProjectListItem } from "@/lib/cosy/types";
import { readinessFace, statusFace } from "@/lib/copy";

export const Route = createFileRoute("/projects/")({
  loader: () => listProjects(),
  component: ProjectsPage,
});

function StatusChip({ project }: { project: ProjectListItem }) {
  const label = project.isDemo ? "Ukážka" : statusFace(project.status);
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
      kicker="Tím"
      title="Projekty"
      actions={
        <Link to="/projects/new">
          <Button>Nový projekt</Button>
        </Link>
      }
    >
      <div className="mx-auto max-w-5xl">
        <p className="mb-6 max-w-2xl text-sm text-muted">
          Tu sú weby, ktoré chcete prestavať. Číslo vpravo je, koľko o stránke vieme — nie ako presne
          ju skopírujeme.
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
                  <span className="font-mono text-xs text-muted">{readinessFace(project.readinessScore)}</span>
                </div>
                <div className="mt-2 text-xs text-muted">
                  {SOURCE_LABELS[project.sourceType]} ·{" "}
                  {project.scope?.replaceAll("_", " ") ?? "rozsah ešte nie je"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
