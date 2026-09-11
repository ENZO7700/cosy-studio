import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { EngineActions } from "@/components/projects/engine-actions";
import type { ArchitectureNode } from "@/lib/cosy/types";
import { categoryFace, statusFace } from "@/lib/copy";

const projectRoute = getRouteApi("/projects/$id");

export const Route = createFileRoute("/projects/$id/architecture")({
  component: ArchitecturePage,
});

function ArchitecturePage() {
  const detail = projectRoute.useLoaderData();
  if (!detail) return null;
  const roots = detail.architecture.filter((node) => !node.parentId);

  return (
    <div>
      <EngineActions
        projectId={detail.project.id}
        hasArchitecture={detail.architecture.length > 0}
        hasFiles={detail.files.length > 0}
      />
      {detail.architecture.length === 0 ? (
        <section className="rounded-lg bg-panel p-6 shadow-[0_0_0_1px_var(--color-line)]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-accent">Stavba stránky</p>
          <h2 className="mt-2 text-lg font-semibold">Ešte nevieme, ako je stránka poskladaná</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">Kliknite „Zistiť, čo tam je“.</p>
        </section>
      ) : (
        <div className="space-y-3">
          {roots.map((node) => (
            <ArchitectureCard key={node.id} node={node} all={detail.architecture} depth={0} />
          ))}
        </div>
      )}
    </div>
  );
}

function ArchitectureCard({
  node,
  all,
  depth,
}: {
  node: ArchitectureNode;
  all: ArchitectureNode[];
  depth: number;
}) {
  const children = all.filter((row) => row.parentId === node.id);
  return (
    <article
      className="rounded-lg bg-panel p-4 shadow-[0_0_0_1px_var(--color-line)]"
      style={{ marginLeft: depth ? depth * 12 : 0 }}
    >
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
        {categoryFace(node.category)} · {statusFace(node.state)}
      </p>
      <h3 className="mt-1 text-sm font-semibold">{node.title}</h3>
      {children.length > 0 ? (
        <div className="mt-3 space-y-3">
          {children.map((child) => (
            <ArchitectureCard key={child.id} node={child} all={all} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </article>
  );
}
