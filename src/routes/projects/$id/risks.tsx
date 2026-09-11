import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { EngineActions } from "@/components/projects/engine-actions";
import { severityFace } from "@/lib/copy";

const projectRoute = getRouteApi("/projects/$id");

export const Route = createFileRoute("/projects/$id/risks")({
  component: RisksPage,
});

export function RisksPage() {
  const detail = projectRoute.useLoaderData();
  if (!detail) return null;
  return (
    <div>
      <EngineActions
        projectId={detail.project.id}
        hasArchitecture={detail.architecture.length > 0}
        hasFiles={detail.files.length > 0}
      />
      {detail.risks.length === 0 ? (
        <section className="rounded-lg bg-panel p-6 shadow-[0_0_0_1px_var(--color-line)]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-accent">Riziká</p>
          <h2 className="mt-2 text-lg font-semibold">Riziká sa ešte nepočítali</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Počítajú sa z toho, čo sme naozaj videli. Nie zo zoznamu „všetko je zlé“.
          </p>
        </section>
      ) : (
        <ul className="space-y-3">
          {detail.risks.map((risk) => (
            <li key={risk.id} className="rounded-lg bg-panel p-4 shadow-[0_0_0_1px_var(--color-line)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[11px] uppercase tracking-wide text-accent">
                  {severityFace(risk.severity)}
                </span>
                <span className="font-mono text-xs text-muted">skóre {risk.score ?? "—"}</span>
              </div>
              <p className="mt-2 text-sm">{risk.evidence}</p>
              <p className="mt-2 text-sm text-muted">{risk.mitigation}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
