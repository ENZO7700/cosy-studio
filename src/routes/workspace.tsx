import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { getWorkspaceOrg, selectWorkspacePlan } from "@/lib/server/workspace";
import { planFace, roleFace } from "@/lib/copy";

export const Route = createFileRoute("/workspace")({
  loader: () => getWorkspaceOrg(),
  component: WorkspacePage,
});

function WorkspacePage() {
  const data = Route.useLoaderData();
  const [name, setName] = useState(data.org.name);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    const result = await selectWorkspacePlan({ data: { plan: data.org.plan, name } });
    setMessage(result.ok ? "Názov uložený." : result.errors.join(" "));
  }

  return (
    <AppShell kicker="Tím" title="Pracovný priestor">
      <div className="mx-auto grid max-w-3xl gap-4">
        <section className="rounded-lg bg-panel p-5 shadow-[0_0_0_1px_var(--color-line)]">
          <h2 className="text-sm font-semibold">Spoločný priestor</h2>
          <p className="mt-2 text-sm text-muted">
            Toto je spoločný priestor bez prihlásenia. Mena a role sú len nápisy, nie účty.
          </p>
          <label className="mt-4 block text-sm">
            Názov
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-md bg-elevated px-3 text-fg shadow-[0_0_0_1px_var(--color-line)]"
            />
          </label>
          <p className="mt-3 font-mono text-xs text-muted">Aktuálny plán — {planFace(data.org.plan)}</p>
          <Button type="button" className="mt-4" onClick={() => void save()}>
            Uložiť
          </Button>
          {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
        </section>
        <section className="rounded-lg bg-elevated p-5 shadow-[0_0_0_1px_var(--color-line)]">
          <h2 className="text-sm font-semibold">Role</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.members.map((member) => (
              <li key={member.id} className="flex justify-between gap-3">
                <span>{member.display_name}</span>
                <span className="font-mono text-xs uppercase text-accent">{roleFace(member.role)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
