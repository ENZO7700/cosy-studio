import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useState } from "react";
import { EngineActions } from "@/components/projects/engine-actions";
import { Button } from "@/components/ui/button";
import { postCanvasMessage } from "@/lib/server/workspace";
import { useRouter } from "@tanstack/react-router";

const projectRoute = getRouteApi("/projects/$id");

export const Route = createFileRoute("/projects/$id/canvas")({
  component: CanvasPage,
});

export function CanvasPage() {
  const detail = projectRoute.useLoaderData();
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  if (!detail) return null;
  const html = detail.files.find((file) => file.path === "index.html")?.code;
  const verified = detail.builds[0]?.exitCode === 0;
  const code = detail.files.find((file) => file.path === "src/App.tsx")?.code;

  async function send() {
    if (!note.trim()) return;
    setBusy(true);
    try {
      await postCanvasMessage({ data: { id: detail!.project.id, body: note.trim() } });
      setNote("");
      await router.invalidate();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <EngineActions
        projectId={detail.project.id}
        hasArchitecture={detail.architecture.length > 0}
        hasFiles={detail.files.length > 0}
      />
      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <section className="rounded-lg bg-panel p-4 shadow-[0_0_0_1px_var(--color-line)]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-accent">Náhľad</p>
          <h2 className="mt-2 text-lg font-semibold">
            {html ? "Náhľad novej verzie" : "Najprv pripravte súbory"}
          </h2>
          <p className="mt-2 text-sm text-muted">
            Vidíte nový základ, nie pôvodný WordPress. Starý súbor sa tu nespúšťa.
            {verified ? " Posledná kontrola bola v poriadku." : " Kontrola ešte neprešla."}
          </p>
          {html ? (
            <iframe
              title="Náhľad novej verzie"
              className="mt-4 h-[28rem] w-full rounded-md bg-canvas shadow-[0_0_0_1px_var(--color-line)]"
              sandbox=""
              srcDoc={html}
            />
          ) : (
            <div className="mt-4 flex h-64 items-center rounded-md bg-elevated px-4 text-sm text-muted">
              Pripravte súbory, aby sa ukázal náhľad.
            </div>
          )}
        </section>
        <div className="space-y-4">
          <section className="rounded-lg bg-elevated p-4 shadow-[0_0_0_1px_var(--color-line)]">
            <h3 className="text-sm font-semibold">Súbory</h3>
            <pre className="mt-3 max-h-48 overflow-auto font-mono text-[11px] text-muted">
              {code ?? "Súbor src/App.tsx ešte nie je."}
            </pre>
          </section>
          <section className="rounded-lg bg-panel p-4 shadow-[0_0_0_1px_var(--color-line)]">
            <h3 className="text-sm font-semibold">Poznámky</h3>
            <ul className="mt-3 max-h-40 space-y-2 overflow-auto text-sm text-muted">
              {detail.canvasMessages.length === 0 ? <li>Zatiaľ žiadne poznámky.</li> : null}
              {detail.canvasMessages.map((message) => (
                <li key={message.id}>
                  <span className="font-mono text-[10px] uppercase text-accent">{message.role}</span>
                  <p>{message.body}</p>
                </li>
              ))}
            </ul>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              className="mt-3 w-full rounded-md bg-elevated p-3 text-sm text-fg shadow-[0_0_0_1px_var(--color-line)]"
              placeholder="Píšte, čo pri prestavbe nesmie vypadnúť."
            />
            <Button type="button" className="mt-3" disabled={busy} onClick={() => void send()}>
              {busy ? "Ukladám…" : "Pridať poznámku"}
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
