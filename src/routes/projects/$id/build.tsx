import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { EngineActions } from "@/components/projects/engine-actions";

const projectRoute = getRouteApi("/projects/$id");

export const Route = createFileRoute("/projects/$id/build")({
  component: BuildPage,
});

export function BuildPage() {
  const detail = projectRoute.useLoaderData();
  if (!detail) return null;
  const latest = detail.builds[0];
  return (
    <div>
      <EngineActions
        projectId={detail.project.id}
        hasArchitecture={detail.architecture.length > 0}
        hasFiles={detail.files.length > 0}
      />
      {!latest ? (
        <section className="rounded-lg bg-panel p-6 shadow-[0_0_0_1px_var(--color-line)]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-accent">Kontrola</p>
          <h2 className="mt-2 text-lg font-semibold">Súbory ešte nie sú</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Najprv „Pripraviť súbory“. Potom skontrolujeme, či nič nechýba.
          </p>
        </section>
      ) : (
        <section className="rounded-lg bg-panel p-6 shadow-[0_0_0_1px_var(--color-line)]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-accent">Posledná kontrola</p>
          <h2 className="mt-2 text-lg font-semibold">
            {latest.exitCode === 0
              ? "Kontrola prešla. Všetky potrebné súbory sú na mieste."
              : "Kontrola neprešla. Chýba súbor. Skúste pripraviť znova."}
          </h2>
          <p className="mt-2 text-sm text-muted">
            To neznamená, že sme skopírovali pôvodný WordPress.
          </p>
          {latest.stdout ? (
            <pre className="mt-4 overflow-auto rounded-md bg-elevated p-3 font-mono text-[11px] text-muted">
              {latest.stdout}
            </pre>
          ) : null}
          {latest.stderr ? (
            <pre className="mt-3 overflow-auto rounded-md bg-elevated p-3 font-mono text-[11px] text-danger">
              {latest.stderr}
            </pre>
          ) : null}
        </section>
      )}
    </div>
  );
}
