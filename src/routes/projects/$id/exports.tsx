import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useState } from "react";
import { EngineActions } from "@/components/projects/engine-actions";
import { Button } from "@/components/ui/button";
import { exportProjectZip } from "@/lib/server/workspace";

const projectRoute = getRouteApi("/projects/$id");

export const Route = createFileRoute("/projects/$id/exports")({
  component: ExportsPage,
});

function downloadBase64(filename: string, base64: string) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ExportsPage() {
  const detail = projectRoute.useLoaderData();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"application" | "cursor_plan" | null>(null);
  if (!detail) return null;

  async function run(kind: "application" | "cursor_plan") {
    setBusy(kind);
    setError(null);
    try {
      const result = await exportProjectZip({ data: { id: detail!.project.id, kind } });
      if (!result.ok) {
        setError(result.errors.join(" "));
        return;
      }
      downloadBase64(result.filename, result.base64);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sťahovanie sa nepodarilo.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <EngineActions
        projectId={detail.project.id}
        hasArchitecture={detail.architecture.length > 0}
        hasFiles={detail.files.length > 0}
      />
      <section className="rounded-lg bg-panel p-6 shadow-[0_0_0_1px_var(--color-line)]">
        <p className="text-[11px] uppercase tracking-[0.16em] text-accent">Stiahnuť</p>
        <h2 className="mt-2 text-lg font-semibold">Zobrať si prácu so sebou</h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Jeden balík súbory novej aplikácie. Druhý balík plán prác. Najprv musia byť pripravené
          súbory.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" disabled={busy !== null} onClick={() => void run("application")}>
            {busy === "application" ? "Balím…" : "Stiahnuť aplikáciu"}
          </Button>
          <Button type="button" variant="secondary" disabled={busy !== null} onClick={() => void run("cursor_plan")}>
            {busy === "cursor_plan" ? "Balím…" : "Stiahnuť plán prác"}
          </Button>
        </div>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        {detail.exports.length > 0 ? (
          <ul className="mt-6 space-y-2 text-sm text-muted">
            {detail.exports.map((item) => (
              <li key={item.id} className="font-mono text-xs">
                {item.type} · {item.storageRef}
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
