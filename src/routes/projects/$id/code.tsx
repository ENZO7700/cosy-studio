import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useState } from "react";
import { EngineActions } from "@/components/projects/engine-actions";
import { cn } from "@/lib/utils";

const projectRoute = getRouteApi("/projects/$id");

export const Route = createFileRoute("/projects/$id/code")({
  component: CodePage,
});

export function CodePage() {
  const detail = projectRoute.useLoaderData();
  const [active, setActive] = useState<string | null>(null);
  if (!detail) return null;
  const current = detail.files.find((file) => file.path === active) ?? detail.files[0];
  return (
    <div>
      <EngineActions
        projectId={detail.project.id}
        hasArchitecture={detail.architecture.length > 0}
        hasFiles={detail.files.length > 0}
      />
      {detail.files.length === 0 ? (
        <section className="rounded-lg bg-panel p-6 shadow-[0_0_0_1px_var(--color-line)]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-accent">Súbory</p>
          <h2 className="mt-2 text-lg font-semibold">Ešte tu nič nie je</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Až po „Pripraviť súbory“. Toto nie je snímka starej stránky.
          </p>
        </section>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
          <ul className="rounded-lg bg-panel p-2 shadow-[0_0_0_1px_var(--color-line)]">
            {detail.files.map((file) => (
              <li key={file.id}>
                <button
                  type="button"
                  onClick={() => setActive(file.path)}
                  className={cn(
                    "flex min-h-11 w-full items-center rounded-md px-3 text-left font-mono text-xs",
                    current?.path === file.path ? "bg-elevated text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {file.path}
                </button>
              </li>
            ))}
          </ul>
          <pre className="max-h-[70vh] overflow-auto rounded-lg bg-elevated p-4 font-mono text-[11px] text-muted shadow-[0_0_0_1px_var(--color-line)]">
            {current?.code}
          </pre>
        </div>
      )}
    </div>
  );
}
