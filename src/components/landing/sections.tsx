import { useCallback, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Copy,
  ShieldCheck,
  Terminal,
  XOctagon,
} from "lucide-react";
import { toast } from "sonner";
import { LANDING_REPO_SLUG, LANDING_REPO_URL } from "@/lib/landing";
import { MantraMark } from "@/components/landing/mantra-mark";
import { FILM, Film } from "@/components/landing/film";

const pipeline = [
  {
    step: "01",
    beat: "Skenuj",
    gold: false,
    body: "Verejná URL alebo vložené HTML. Enter spustí sken. Localhost a súkromné siete ostanú za zámkou.",
    out: "vstup zamknutý",
  },
  {
    step: "02",
    beat: "Škáluj",
    gold: true,
    body: "Najprv headless vyrenderuje JS. Padne? HTTP. Padne aj to? Wayback. Prechod ostáva na rovnakej doméne, najviac 20 strán.",
    out: "DOM · WP · tokeny",
  },
  {
    step: "03",
    beat: "Spi",
    gold: false,
    body: "Blueprint JSON s hashom. CCT, listingy, Elementor, formuláre. Trezor je tvoj — lokálne, 40 snímok.",
    out: "snímka v trezore",
  },
  {
    step: "04",
    beat: "Opakuj",
    gold: true,
    body: "Brief pre Cursor, Next.js, HTML+CSS, Tailwind, špecifikácia. Kopírovať alebo súbor. Žiadny klon. Inventár.",
    out: "prilep a stavaj",
  },
] as const;

export function Pipeline() {
  return (
    <section
      id="pipeline"
      data-testid="landing-pipeline"
      className="landing-pipeline relative isolate border-t border-gold-line py-16 sm:py-24 lg:py-32"
    >
      <Film src={FILM.pipeline} pos="50% 40%" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-20">
          <div className="max-w-xl">
            <span className="bp-eyebrow">takt 01–04</span>
            <h2 className="mt-4 text-[clamp(1.75rem,5.4vw,3.15rem)] font-bold tracking-tight text-balance uppercase">
              Cudzí web sa tu končí
            </h2>
          </div>
          <p className="max-w-md text-[0.975rem] leading-relaxed text-pretty text-muted-foreground lg:pb-1">
            Štyri údery, jeden sken. Dole máš prompt pre Cursor — nie kópiu stránky, nie hádanie
            farieb z DevTools.
          </p>
        </div>

        <div className="landing-pipeline-shell mt-10 sm:mt-12">
          <ol className="landing-pipeline-track">
            {pipeline.map((item) => (
              <li key={item.step} className="landing-pipeline-step">
                <div className="landing-pipeline-index" aria-hidden="true">
                  {item.step}
                </div>
                <h3
                  className={
                    item.gold
                      ? "mt-4 text-[1.65rem] font-bold tracking-tight uppercase text-gold"
                      : "mt-4 text-[1.65rem] font-bold tracking-tight uppercase"
                  }
                >
                  {item.beat}
                </h3>
                <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-pretty text-muted-foreground">
                  {item.body}
                </p>
                <p className="mt-5 font-mono text-[11px] tracking-[0.16em] text-gold uppercase">
                  {item.out}
                </p>
              </li>
            ))}
          </ol>

          <div className="landing-pipeline-io">
            <p className="landing-pipeline-io-line">
              <span className="landing-pipeline-io-k">vstup</span>
              URL / HTML
              <span className="landing-pipeline-io-arrow" aria-hidden="true">
                →
              </span>
              <span className="landing-pipeline-io-k">výstup</span>
              brief · JSON · ZIP
              <span className="landing-pipeline-io-rule">nikdy server · DB · .env</span>
            </p>
            <Link
              to="/scan"
              search={{}}
              className="inline-flex min-h-11 shrink-0 items-center justify-end gap-2 font-mono text-xs text-gold transition-colors hover:text-gold-soft"
            >
              spustiť sken
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    step: "01",
    title: "URL aj HTML",
    body: "Verejná adresa, alebo vložený zdroj stránky. Základná URL drží relatívne cesty.",
  },
  {
    step: "02",
    title: "Prechod strán",
    body: "Až 20 strán na rovnakej doméne. Chyba jednej adresy nezhodí celý sken.",
  },
  {
    step: "03",
    title: "Reťazec",
    body: "Headless → HTTP → Wayback. JS sa vyrenderuje, až potom sa vzdávame.",
  },
  {
    step: "04",
    title: "Tokeny",
    body: "Farby, písmo, CSS premenné, formuláre, meta, technológie.",
  },
  {
    step: "05",
    title: "WordPress",
    body: "REST, CCT, JetEngine listingy, globálne štýly, Elementor import.",
  },
  {
    step: "06",
    title: "Brief pre Cursor",
    body: "Prompt na prestavbu a Tailwind fragment. Prilep. Nestavaj od nuly.",
  },
];

export function Features() {
  return (
    <section id="funkcie" className="relative isolate border-t border-gold-line py-16 sm:py-24 lg:py-32">
      <Film src={FILM.features} pos="50% 50%" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <span className="bp-eyebrow">čo to drží</span>
            <h2 className="mt-4 text-[clamp(1.75rem,5.4vw,3.15rem)] font-bold tracking-tight text-balance uppercase">
              Signál, nie snímka
            </h2>
          </div>
          <p className="max-w-md text-[0.975rem] leading-relaxed text-pretty text-muted-foreground">
            Šesť vrstiev, ktoré brief naozaj potrebuje. Žiadne ozdobné karty — inventár.
          </p>
        </div>
        <ol className="landing-feat-track mt-10 sm:mt-12">
          {features.map((f) => (
            <li key={f.step} className="landing-feat-row">
              <span className="landing-feat-n" aria-hidden="true">
                {f.step}
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-1.5 max-w-[42ch] text-sm leading-relaxed text-pretty text-muted-foreground">
                  {f.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export { Output } from "./output-panel";

const exportsList = [
  {
    file: "blueprint.json",
    title: "JSON",
    body: "Celý záznam. Kopírovať alebo stiahnuť zo skenu.",
  },
  {
    file: "capture.zip",
    title: "ZIP",
    body: "Zachytené súbory spolu s JSON. Na odovzdanie ďalej.",
  },
  {
    file: "elementor-template-import.json",
    title: "Elementor",
    body: "Importovateľná šablóna. v0.4, nie magický 1:1.",
  },
  {
    file: "cursor-brief.md",
    title: "Prompt",
    body: "Prompt na prestavbu a architektúra. Shift v skene stiahne súbor.",
  },
];

export function Exports() {
  return (
    <section id="exporty" className="relative isolate border-t border-gold-line py-16 sm:py-24 lg:py-32">
      <Film src={FILM.exports} pos="50% 58%" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <span className="bp-eyebrow">exporty</span>
            <h2 className="mt-4 text-[clamp(1.75rem,5.4vw,3.15rem)] font-bold tracking-tight text-balance uppercase">
              Štyri súbory. Nula klonov.
            </h2>
          </div>
          <p className="max-w-md text-[0.975rem] leading-relaxed text-pretty text-muted-foreground">
            Čo si odnesieš zo skenu. Nie web. Inventár, ktorý ide do editora.
          </p>
        </div>
        <ol className="landing-export-track mt-10 sm:mt-12">
          {exportsList.map((e) => (
            <li key={e.file} className="landing-export-card">
              <p className="font-mono text-[11px] tracking-[0.14em] text-gold uppercase">{e.file}</p>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">{e.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">{e.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const notDoing = [
  { k: "server", v: "Žiadny backend, databáza, .env, API kľúče ani relácia." },
  { k: "prihlásenie", v: "Neobchádza prihlasovacie steny. Nezbiera cookies." },
  { k: "1:1", v: "Nesľubuje kópiu celého stacku. Je to snímka frontendu." },
];

const limits = [
  ["SSRF", "localhost, súkromné siete a cloud metadata — zamknuté"],
  ["Súbory", "10 MB na súbor · 50 MB spolu · 40 súborov"],
  ["Prechod", "najviac 20 strán na rovnakej doméne"],
  ["SPA", "bez headless renderu môže ostať prázdny obal"],
];

export function Boundaries() {
  return (
    <section id="hranice" className="relative isolate border-t border-gold-line py-16 sm:py-24 lg:py-32">
      <Film src={FILM.boundaries} pos="50% 46%" />
      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 sm:gap-12 sm:px-6 lg:grid-cols-2 lg:items-start">
        <div>
          <span className="bp-eyebrow">čestne</span>
          <h2 className="mt-4 text-[clamp(1.75rem,5.4vw,3.15rem)] font-bold tracking-tight text-balance uppercase">
            Toto nie je klon
          </h2>
          <p className="mt-5 max-w-md text-[0.975rem] leading-relaxed text-pretty text-muted-foreground">
            Verejný frontend: prestavba, audit, tokeny. To, čo nie je verejné, sa sem nedostane.
          </p>
          <ul className="landing-bound-list mt-8">
            {notDoing.map((n) => (
              <li key={n.k}>
                <XOctagon className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" strokeWidth={1.5} />
                <span>
                  <strong className="font-mono text-[11px] tracking-[0.14em] text-gold uppercase">
                    {n.k}
                  </strong>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{n.v}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="landing-bound-sheet">
          <div className="flex items-center gap-2 border-b border-gold-line px-5 py-3">
            <ShieldCheck className="h-4 w-4 text-gold" />
            <span className="bp-eyebrow">zámky</span>
          </div>
          <dl>
            {limits.map(([k, v]) => (
              <div key={k} className="landing-bound-row">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

const START_CMDS = `git clone git@github.com:${LANDING_REPO_SLUG}.git
cd dawn-cabin-raven-baker
npm ci && npm run dev`;

export function QuickStart() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(START_CMDS);
      setCopied(true);
      toast.message("Príkazy v schránke");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Kopírovanie zlyhalo");
    }
  }, []);

  return (
    <section id="start" className="relative isolate border-t border-gold-line py-16 sm:py-24 lg:py-32">
      <Film src={FILM.start} pos="50% 55%" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <span className="bp-eyebrow">tri príkazy</span>
            <h2 className="mt-4 text-[clamp(1.75rem,5.4vw,3.15rem)] font-bold tracking-tight text-balance uppercase">
              Klonuj. Nainštaluj. Skenuj.
            </h2>
          </div>
          <p className="max-w-md text-[0.975rem] leading-relaxed text-pretty text-muted-foreground">
            Beží u teba. Žiadny účet. Vlož verejnú URL a stlač Enter.
          </p>
        </div>

        <div className="landing-json mt-10 sm:mt-12">
          <div className="landing-json-chrome">
            <div className="flex min-w-0 items-center gap-2">
              <Terminal className="h-3.5 w-3.5 shrink-0 text-gold" />
              <span className="truncate font-mono text-xs tracking-widest text-muted-foreground uppercase">
                terminál
              </span>
            </div>
            <button
              type="button"
              onClick={() => void copy()}
              className="landing-json-copy"
              aria-label="Kopírovať príkazy"
            >
              <span className={copied ? "is-off abs" : "is-on abs"} aria-hidden>
                <Copy className="h-3.5 w-3.5" />
              </span>
              <span className={copied ? "is-on abs" : "is-off abs"} aria-hidden>
                <Check className="h-3.5 w-3.5" />
              </span>
              {copied ? "hotovo" : "kopírovať"}
            </button>
          </div>
          <pre className="landing-start-pre">
            <code>
              <span className="landing-start-line">
                <span className="j-num">01</span> <span className="j-key">git clone</span>{" "}
                <span className="j-str">git@github.com:{LANDING_REPO_SLUG}.git</span>
              </span>
              <span className="landing-start-line">
                <span className="j-num">02</span> <span className="j-key">cd</span>{" "}
                <span className="j-str">dawn-cabin-raven-baker</span>
              </span>
              <span className="landing-start-line">
                <span className="j-num">03</span> <span className="j-key">npm ci</span>
                <span className="text-muted-foreground"> && </span>
                <span className="j-key">npm run dev</span>
              </span>
            </code>
          </pre>
        </div>
        <ol className="landing-start-steps mt-6">
          <li>otvor aplikáciu</li>
          <li>vlož verejnú URL</li>
          <li>Vytvoriť blueprint</li>
        </ol>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section id="cta" className="landing-cta relative isolate border-t border-gold-line">
      <Film src={FILM.cta} pos="50% 48%" />
      <div className="bp-grid landing-cta-grid absolute inset-0" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:flex-row lg:items-end lg:justify-between lg:py-28">
        <div className="max-w-2xl">
          <MantraMark size={36} className="text-foreground" />
          <h2 className="mt-5 text-[clamp(2rem,6.2vw,3.6rem)] font-extrabold tracking-tight text-balance uppercase">
            Sken. Škála.
            <br />
            <span className="text-gold">Pauza. Znova.</span>
          </h2>
          <p className="mt-5 max-w-md text-[0.975rem] leading-relaxed text-pretty text-muted-foreground">
            Jeden brief do Cursoru. Nie týždeň v DevTools. Nie klon. Inventár.
          </p>
        </div>
        <Link
          to="/scan"
          search={{}}
          data-testid="landing-cta-final"
          className="bp-glow inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-gold px-8 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 active:scale-[0.96] sm:w-auto"
        >
          Spustiť sken
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative isolate border-t border-gold-line py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-10">
      <Film src={FILM.cta} pos="50% 82%" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center font-mono text-xs text-muted-foreground sm:flex-row sm:px-6 sm:text-left">
        <span className="inline-flex items-center gap-2">
          <MantraMark size={16} className="text-foreground" />
          Skenuj · Škáluj · Spi · Opakuj
        </span>
        <div className="flex gap-6">
          <Link to="/scan" search={{}} className="transition-colors hover:text-gold">
            Aplikácia
          </Link>
          <a href={LANDING_REPO_URL} className="transition-colors hover:text-gold">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
