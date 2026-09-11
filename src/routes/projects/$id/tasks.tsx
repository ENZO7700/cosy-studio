import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { EngineActions } from "@/components/projects/engine-actions";

const projectRoute = getRouteApi("/projects/$id");

export const Route = createFileRoute("/projects/$id/tasks")({
  component: TasksPage,
});

export function TasksPage() {
  const detail = projectRoute.useLoaderData();
  if (!detail) return null;
  return (
    <div>
      <EngineActions
        projectId={detail.project.id}
        hasArchitecture={detail.architecture.length > 0}
        hasFiles={detail.files.length > 0}
      />
      {detail.tasks.length === 0 ? (
        <section className="rounded-lg bg-panel p-6 shadow-[0_0_0_1px_var(--color-line)]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-accent">Úlohy</p>
          <h2 className="mt-2 text-lg font-semibold">Zatiaľ žiadny plán</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">Najprv „Zistiť, čo tam je“.</p>
        </section>
      ) : (
        <ol className="space-y-3">
          {detail.tasks.map((task) => (
            <li key={task.id} className="rounded-lg bg-panel p-4 shadow-[0_0_0_1px_var(--color-line)]">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                {task.phase} · {task.priority} · {task.estimateHours ?? "?"} h
              </p>
              <h3 className="mt-1 text-sm font-semibold">{task.title}</h3>
              <p className="mt-2 text-sm text-muted">{task.description}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
