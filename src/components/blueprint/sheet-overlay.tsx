import type { ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
};

/** Shared History / Compare sheet used on home and dashboard. */
export function SheetOverlay({ title, closeLabel, onClose, children }: Props) {
  return (
    <div
      className="app-overlay z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-bg/70 backdrop-blur-sm"
      data-testid="sheet-overlay"
    >
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
        data-testid="sheet-overlay-backdrop"
      />
      <div className="relative z-10 flex h-full w-full max-h-full flex-col overflow-hidden rounded-none border-0 border-border bg-bg-elevated shadow-soft sm:h-auto sm:max-h-[min(90dvh,var(--app-dvh))] sm:max-w-md sm:rounded-2xl sm:border">
        <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-border bg-bg-elevated px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <h3 className="min-w-0 truncate text-sm font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-md text-fg-subtle hover:bg-bg-subtle hover:text-fg"
            aria-label={closeLabel}
            data-testid="sheet-overlay-close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div
          className="min-h-0 flex-1 overflow-y-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          data-testid="sheet-overlay-body"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
