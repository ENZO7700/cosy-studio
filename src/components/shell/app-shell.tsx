import { Link, useRouterState } from "@tanstack/react-router";
import {
  Box,
  FolderKanban,
  Home,
  MoreHorizontal,
  Plus,
  ScanSearch,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/projects/new", label: "New", icon: Plus },
];

export function AppShell({
  children,
  title,
  kicker,
  actions,
}: {
  children: ReactNode;
  title: string;
  kicker?: string;
  actions?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="cosy-grid min-h-dvh bg-canvas text-fg">
      <aside className="fixed inset-y-0 left-0 hidden w-56 border-r border-line bg-panel md:flex md:flex-col">
        <div className="flex items-center gap-2 px-4 py-5">
          <ScanSearch className="size-4 text-accent" />
          <div>
            <div className="text-sm font-semibold tracking-tight">COSY Studio</div>
            <div className="text-[11px] text-muted">Scan. Understand. Rebuild.</div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : item.to === "/projects"
                  ? pathname === "/projects"
                  : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-md px-3 text-sm",
                  active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated hover:text-fg",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="mt-6 px-3 text-[10px] uppercase tracking-[0.16em] text-muted">Later</div>
          <div className="px-3 py-2 text-xs text-muted">Templates, Team, Billing — Milestone 8</div>
        </nav>
      </aside>

      <div className="md:pl-56">
        <header className="sticky top-0 z-20 flex min-h-14 items-center justify-between gap-3 border-b border-line bg-panel/90 px-4 backdrop-blur-sm">
          <div className="min-w-0">
            {kicker ? (
              <div className="text-[10px] uppercase tracking-[0.16em] text-accent">{kicker}</div>
            ) : null}
            <h1 className="truncate text-sm font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">{actions}</div>
        </header>
        <main className="px-4 py-6 pb-24 md:pb-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-panel md:hidden">
        {[
          { to: "/", label: "Home", icon: Home },
          { to: "/projects", label: "Projects", icon: Box },
          { to: "/projects/new", label: "New", icon: Plus },
          { to: "/projects", label: "More", icon: MoreHorizontal },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className="flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] text-muted"
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
