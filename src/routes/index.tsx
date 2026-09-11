import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: Home });

const PANELS = [
  {
    kicker: "01 Pozrieme stránku",
    title: "Čo je verejne vidieť",
    rows: [
      "WordPress 6.4.3",
      "Téma: Astra Child",
      "Doplnky: 23 aktívnych",
      "Obsah: 1 842 stránok",
      "Formuláre: 6",
      "Napojenia: 3",
    ],
  },
  {
    kicker: "02 Povieme, čo tam je",
    title: "Ako je stránka poskladaná",
    rows: [
      "WordPress · téma · pluginy",
      "Šablóny: 42",
      "Vlastné polia: 57",
      "Kategórie: 12",
      "Menu: 7",
    ],
  },
  {
    kicker: "03 Ukážeme riziká",
    title: "Čo sa môže pokaziť",
    rows: [
      "Vysoké: verzia PHP",
      "Vysoké: závislosť na pluginoch",
      "Stredné: vlastný kód",
      "Celkovo: vyššie riziko",
    ],
  },
  {
    kicker: "04 Pripravíme plán",
    title: "Čo spraviť ako prvé",
    rows: [
      "Nový vzhľad a šablóny — 8 h",
      "Typy obsahu — 6 h",
      "Nahradiť pluginy — 8 h",
      "Spolu: 30 h",
    ],
  },
];

function Home() {
  return (
    <div className="cosy-grid min-h-dvh bg-canvas text-fg">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <ScanSearch className="size-4 text-accent" />
          <span className="text-sm font-semibold">COSY Studio</span>
        </div>
        <Link to="/projects" className="text-sm text-muted hover:text-fg">
          Otvoriť projekty
        </Link>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-accent">Nástroj na prestavbu webu</p>
        <p className="mt-2 text-xs text-muted">COSY Studio</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-fg md:text-5xl">
          Z starej stránky urobíte novú aplikáciu.
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Vložíte odkaz alebo súbor zo stránky. COSY vám ukáže, čo na nej vidí, a pripraví základ
          novej aplikácie. Nie je to kópia jedna k jednej — je to nový začiatok podľa toho, čo je na
          verejnej stránke vidieť.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/projects/new">
            <Button>
              Začať projekt
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link to="/scan">
            <Button variant="secondary">Otvoriť skener</Button>
          </Link>
          <Link to="/projects/$id" params={{ id: "demo-iluminat" }}>
            <Button variant="secondary">Pozrieť ukážku</Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted">
          Iba verejné veci. Nič súkromné. Ukážkový projekt ILUMINAT má pripravenosť 62 % — slušný
          obraz, nie všetko.
        </p>

        <div className="mt-12 grid gap-3 md:grid-cols-3">
          {[
            {
              title: "Pozrieme stránku",
              body: "Odkaz alebo súbor. Iba verejné veci. Nič súkromné.",
            },
            {
              title: "Povieme vám, čo tam je",
              body: "Farby, formuláre, WordPress, kde sú riziká.",
            },
            {
              title: "Pripravíme nový základ",
              body: "Súbory, ktoré viete stiahnuť a ďalej upraviť.",
            },
          ].map((card) => (
            <article
              key={card.title}
              className="rounded-lg bg-elevated p-4 shadow-[0_0_0_1px_var(--color-line)]"
            >
              <h2 className="text-sm font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm text-muted">{card.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-3 md:grid-cols-2">
          {PANELS.map((panel) => (
            <article
              key={panel.kicker}
              className="rounded-lg bg-panel p-4 shadow-[0_0_0_1px_var(--color-line)]"
            >
              <div className="text-[10px] uppercase tracking-[0.16em] text-accent">{panel.kicker}</div>
              <h2 className="mt-2 text-sm font-semibold">{panel.title}</h2>
              <ul className="mt-3 space-y-1 font-mono text-xs text-muted">
                {panel.rows.map((row) => (
                  <li key={row}>{row}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <section className="mt-16 max-w-2xl">
          <h2 className="text-xl font-semibold">Od verejnej stránky k novému základu</h2>
          <p className="mt-3 text-sm text-muted">
            Pre vážne prestavby, nie pre falošné náhľady. Číslo pripravenosti hovorí, koľko o stránke
            vieme — nie ako presne ju skopírujeme.
          </p>
        </section>
      </section>
    </div>
  );
}
