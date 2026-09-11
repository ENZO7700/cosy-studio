import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Github, LayoutDashboard, ScanLine } from "lucide-react";
import { LANDING_REPO_SLUG, LANDING_REPO_URL, normalizeLandingUrl } from "@/lib/landing";
import { MantraMark } from "@/components/landing/mantra-mark";
import { FILM, Film } from "@/components/landing/film";

export function Hero() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = normalizeLandingUrl(url);
    void navigate({
      to: "/scan",
      search: next ? { url: next } : {},
    });
  }

  return (
    <header className="landing-hero relative flex app-dvh flex-col overflow-x-clip">
      <Film src={FILM.hero} priority pos="50% 28%" />
      <div className="bp-grid landing-hero-grid absolute inset-0" aria-hidden="true" />
      <div className="landing-hero-fade absolute inset-0" aria-hidden="true" />
      <div className="landing-hero-glow" aria-hidden="true" />

      <nav className="relative z-10 mx-auto flex w-full max-w-7xl shrink-0 items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-5 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <MantraMark size={32} className="text-foreground" />
          <span className="truncate font-mono text-[11px] tracking-[0.16em] text-foreground uppercase sm:text-sm sm:tracking-[0.2em]">
            Blueprint Scanner
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            to="/dashboard"
            className="bp-hairline inline-flex min-h-11 items-center gap-2 rounded-full px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:text-gold sm:px-4"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Prehľad
          </Link>
          <a
            href={LANDING_REPO_URL}
            className="bp-hairline hidden min-h-11 items-center gap-2 rounded-full px-4 py-2 font-mono text-xs text-muted-foreground transition-colors hover:text-gold sm:flex"
          >
            <Github className="h-3.5 w-3.5" />
            {LANDING_REPO_SLUG}
          </a>
        </div>
      </nav>

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col lg:grid lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:px-6 lg:pt-8 lg:pb-20">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 sm:px-6 lg:px-0">
          <div className="landing-hero-stage flex min-h-0 flex-1 flex-col justify-end">
            <span className="bp-eyebrow">WordPress → Cursor. Kopilot na migráciu.</span>
            <h1
              data-testid="landing-hero-title"
              aria-label="Skenuj, škáluj, spi, opakuj"
              className="mt-4 font-extrabold uppercase tracking-tight sm:mt-5"
            >
              <span className="landing-hero-mantra-phone">
                <span>Skenuj</span>
                <span className="text-gold">Škáluj</span>
                <span>Spi</span>
                <span className="text-gold">Opakuj</span>
              </span>
              <span className="landing-hero-mantra-desk">
                <span>Skenuj</span>
                <span className="text-gold">Škáluj</span>
                <span>Spi</span>
                <span className="text-gold">Opakuj</span>
              </span>
            </h1>
            <p className="landing-hero-kicker mt-4 max-w-[22ch] text-base leading-snug text-pretty text-muted-foreground lg:hidden">
              Verejná URL → tokeny, Elementor, Cursor brief.
            </p>
            <p className="mt-6 hidden max-w-xl text-[0.975rem] leading-relaxed text-pretty text-muted-foreground lg:mt-7 lg:block lg:text-lg">
              Skenuj. Škáluj. Spi. Opakuj. Verejná URL alebo HTML sa zmení na tokeny, Elementor
              šablónu a Cursor brief — namiesto týždňa reverzu.
            </p>
          </div>

          <div className="landing-hero-dock shrink-0">
            <div className="neon-border-wrapper">
              <form
                onSubmit={onSubmit}
                data-testid="landing-url-form"
                className="relative z-10 rounded-[inherit] bg-surface-raised/88 p-3.5 backdrop-blur-md sm:p-4"
              >
                <div className="flex items-center gap-3 border-b border-gold-line pb-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  <span className="font-mono text-xs tracking-widest text-gold uppercase">
                    začni tu
                  </span>
                </div>
                <div className="mt-2.5 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <input
                    data-testid="landing-url-input"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    placeholder="https://moj-wordpress-web.sk"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    aria-label="URL na sken"
                    className="min-h-11 min-w-0 flex-1 bg-transparent font-mono text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button
                    type="submit"
                    data-testid="landing-url-submit"
                    className="inline-flex min-h-11 shrink-0 items-center justify-end font-mono text-xs text-gold transition-colors hover:text-gold-soft sm:justify-center"
                  >
                    skenovať →
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:mt-4 sm:flex-row sm:items-center">
              <Link
                to="/scan"
                search={{}}
                data-testid="landing-cta-scan"
                className="bp-glow inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 active:scale-[0.96] sm:w-auto"
              >
                <ScanLine className="h-4 w-4" />
                Vytvoriť blueprint
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="font-mono text-[11px] tracking-wide text-muted-foreground sm:pl-1 sm:text-xs">
                bez registrácie · lokálny vault · JSON / ZIP
              </span>
            </div>

            <a
              href="#pipeline"
              className="landing-hero-scroll mt-3 inline-flex min-h-11 items-center gap-1.5 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase lg:hidden"
            >
              <ChevronDown className="landing-hero-scroll-icon h-4 w-4" />
              ďalej
            </a>
          </div>
        </div>

        <div className="relative hidden min-w-0 lg:block">
          <div className="bp-hairline overflow-hidden rounded-2xl">
            <img
              src={FILM.hero}
              alt="Zlatý wireframe webu v tmavom ateliéri"
              width={1792}
              height={1008}
              className="w-full outline outline-1 -outline-offset-1 outline-fg/10"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
