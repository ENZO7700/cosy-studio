import { createFileRoute, Link, getRouteApi } from "@tanstack/react-router";
import { EngineActions } from "@/components/projects/engine-actions";
import { SOURCE_LABELS } from "@/lib/cosy/types";
import { riskFace, statusFace } from "@/lib/copy";

const projectRoute = getRouteApi("/projects/$id");

export const Route = createFileRoute("/projects/$id/")({
  component: OverviewPage,
});

function OverviewPage() {
  const detail = projectRoute.useLoaderData();
  const { id } = projectRoute.useParams();
  if (!detail) return null;
  const { project, evidence, activity, architecture, files, builds } = detail;
  const latest = builds[0];
  return (
    <div>
      <EngineActions
        projectId={project.id}
        hasArchitecture={architecture.length > 0}
        hasFiles={files.length > 0}
      />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-lg bg-panel p-5 shadow-[0_0_0_1px_var(--color-line)]">
          <h2 className="text-sm font-semibold">Odkiaľ to je</h2>
          <p className="mt-2 text-sm text-muted">
            {SOURCE_LABELS[project.sourceType]}
            {project.isDemo ? " · Ukážkový projekt" : ""}
          </p>
          <p className="mt-4 font-mono text-xs text-muted">
            Stav {statusFace(project.status)} · riziko {riskFace(project.riskLevel)}
            {latest
              ? latest.exitCode === 0
                ? " · posledná kontrola prešla"
                : " · posledná kontrola neprešla"
              : ""}
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {evidence.slice(0, 6).map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span>{item.label}</span>
                <span className="font-mono text-xs text-muted">{item.value}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <Link to="/projects/$id/blueprint" params={{ id }} className="text-accent">
              Otvoriť, čo sme našli
            </Link>
            <Link to="/projects/$id/canvas" params={{ id }} className="text-muted hover:text-fg">
              Otvoriť náhľad
            </Link>
          </div>
        </section>
        <section className="rounded-lg bg-elevated p-5 shadow-[0_0_0_1px_var(--color-line)]">
          <h2 className="text-sm font-semibold">Čo sa dialo</h2>
          <ul className="mt-3 space-y-3 text-sm text-muted">
            {activity.length === 0 ? <li>Zatiaľ nič.</li> : null}
            {activity.map((event) => (
              <li key={event.id}>
                <div className="text-fg">{event.message}</div>
                <div className="font-mono text-[11px]">{event.actor}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
