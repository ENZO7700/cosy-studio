export function MilestoneState({ milestone, feature }: { milestone: number; feature: string }) {
  return (
    <section className="rounded-lg bg-panel p-6 shadow-[0_0_0_1px_var(--color-line)]">
      <p className="text-[11px] uppercase tracking-[0.16em] text-accent">Zatiaľ nie je pripravené</p>
      <h2 className="mt-2 text-lg font-semibold">{feature}</h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Táto obrazovka je prázdna úprimne, nie ako falošná ukážka.
      </p>
    </section>
  );
}
