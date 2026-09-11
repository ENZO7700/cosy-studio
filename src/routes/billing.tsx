import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { getWorkspaceOrg, selectWorkspacePlan } from "@/lib/server/workspace";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/billing")({
  loader: () => getWorkspaceOrg(),
  component: BillingPage,
});

function BillingPage() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function choose(plan: string) {
    setBusy(plan);
    setMessage(null);
    try {
      const result = await selectWorkspacePlan({ data: { plan } });
      if (!result.ok) {
        setMessage(result.errors.join(" "));
        return;
      }
      setMessage("Plán zapísaný. Karta sa nestrhla.");
      await router.invalidate();
    } finally {
      setBusy(null);
    }
  }

  return (
    <AppShell kicker="Plán" title="Plán">
      <div className="mx-auto max-w-4xl">
        <p className="mb-6 max-w-2xl text-sm text-muted">
          Výber plánu pre ukážku. Karta sa nestrháva. Žiadna ostrá platba.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {data.plans.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                "rounded-lg bg-panel p-5 shadow-[0_0_0_1px_var(--color-line)]",
                data.org.plan === plan.id && "bg-elevated",
              )}
            >
              <p className="text-[11px] uppercase tracking-[0.16em] text-accent">{plan.label}</p>
              <h2 className="mt-2 text-xl font-semibold">{plan.price}</h2>
              <p className="mt-2 text-sm text-muted">{plan.blurb}</p>
              <Button
                type="button"
                variant={data.org.plan === plan.id ? "secondary" : "primary"}
                className="mt-5 w-full"
                disabled={busy !== null}
                onClick={() => void choose(plan.id)}
              >
                {data.org.plan === plan.id
                  ? "Tento plán"
                  : busy === plan.id
                    ? "Zapisujem…"
                    : "Použiť tento plán"}
              </Button>
            </article>
          ))}
        </div>
        {message ? <p className="mt-4 text-sm text-muted">{message}</p> : null}
        {data.billing.length > 0 ? (
          <ul className="mt-8 space-y-2 text-sm text-muted">
            {data.billing.map((event) => (
              <li key={event.id} className="font-mono text-xs">
                {event.provider} · {event.plan} · {event.note}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </AppShell>
  );
}
