export function MilestoneState({ milestone, feature }: { milestone: number; feature: string }) {
  return (
    <section className="rounded-lg bg-panel p-6 shadow-[0_0_0_1px_var(--color-line)]">
      <p className="text-[11px] uppercase tracking-[0.16em] text-accent">Scheduled for Milestone {milestone}</p>
      <h2 className="mt-2 text-lg font-semibold">{feature}</h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        This screen is honest empty state, not a mock. No fake build verification, live preview, or
        generated application lives here yet.
      </p>
    </section>
  );
}
