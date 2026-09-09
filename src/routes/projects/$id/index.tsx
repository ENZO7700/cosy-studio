import { createFileRoute, Link, getRouteApi } from "@tanstack/react-router";
import { SOURCE_LABELS } from "@/lib/cosy/types";

const projectRoute = getRouteApi("/projects/$id");

export const Route = createFileRoute("/projects/$id/")({
  component: OverviewPage,
});

function OverviewPage() {
  const detail = projectRoute.useLoaderData();
  const { id } = projectRoute.useParams();
  if (!detail) return null;
  const { project, evidence, activity } = detail;
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="rounded-lg bg-panel p-5 shadow-[0_0_0_1px_var(--color-line)]">
        <h2 className="text-sm font-semibold">Source and evidence</h2>
        <p className="mt-2 text-sm text-muted">
          {SOURCE_LABELS[project.sourceType]}
          {project.isDemo ? " · Labeled demo dataset" : ""}
        </p>
        <p className="mt-4 font-mono text-xs text-muted">
          Status {project.status.replaceAll("_", " ")} · risk {project.riskLevel ?? "n/a"}
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {evidence.slice(0, 6).map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span>{item.label}</span>
              <span className="font-mono text-xs text-muted">{item.value}</span>
            </li>
          ))}
        </ul>
        <Link
          to="/projects/$id/blueprint"
          params={{ id }}
          className="mt-5 inline-block text-sm text-accent"
        >
          Open Blueprint workspace
        </Link>
      </section>
      <section className="rounded-lg bg-elevated p-5 shadow-[0_0_0_1px_var(--color-line)]">
        <h2 className="text-sm font-semibold">Activity</h2>
        <ul className="mt-3 space-y-3 text-sm text-muted">
          {activity.length === 0 ? <li>No events yet.</li> : null}
          {activity.map((event) => (
            <li key={event.id}>
              <div className="text-fg">{event.message}</div>
              <div className="font-mono text-[11px]">{event.actor}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
