import { useCallback, useEffect, useRef, useState } from "react";
import { Braces, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "./reveal";
import { FILM, Film } from "./film";

export const SAMPLE_BLUEPRINT = `{
  "page": {
    "url": "https://klient.sk",
    "title": "Domov",
    "template": "elementor_header_footer"
  },
  "content": {
    "sections": [
      { "type": "hero", "id": "s-01" },
      { "type": "listing", "id": "s-02" }
    ]
  },
  "tokens": {
    "colors": ["#0d0d0d", "#e0a94a"],
    "fonts": ["Archivo", "JetBrains Mono"],
    "radius": "8px"
  },
  "settings": {
    "plugins": ["elementor", "jet-engine"],
    "forms": 2,
    "assets": 34
  },
  "scanStatus": "complete"
}`;

const TABS = [
  { id: "all", label: "celý" },
  { id: "page", label: "stránka" },
  { id: "tokens", label: "tokeny" },
  { id: "status", label: "stav" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const STATS = [
  { n: "70–90 %", l: "evidencie frontendu", hint: "nie pixely — koľko signálu má brief" },
  { n: "≤ 20", l: "strán na sken", hint: "rovnaká doména, chyba jednej URL nespadne celý prechod" },
  { n: "40", l: "snímok v trezore", hint: "lokálny trezor, bez účtu" },
  { n: "4", l: "exportné formáty", hint: "JSON · ZIP · Elementor · prompt" },
] as const;

function JsonDemo({ tab, hex }: { tab: TabId; hex: string | null }) {
  const on = (id: TabId) => tab === "all" || tab === id;
  const hx = (v: string) =>
    hex === v ? "landing-json-hex is-on" : "landing-json-hex";

  return (
    <pre className="landing-json-pre">
      <code>
        {on("page") || on("tokens") || on("status") ? (
          <>
            <span className="landing-json-line">{"{"}</span>
            {on("page") ? (
              <>
                <span className="landing-json-line">
                  {"  "}
                  <span className="j-key">"page"</span>: {"{"}
                </span>
                <span className="landing-json-line">
                  {"    "}
                  <span className="j-key">"url"</span>:{" "}
                  <span className="j-str">"https://klient.sk"</span>,
                </span>
                <span className="landing-json-line">
                  {"    "}
                  <span className="j-key">"title"</span>: <span className="j-str">"Domov"</span>,
                </span>
                <span className="landing-json-line">
                  {"    "}
                  <span className="j-key">"template"</span>:{" "}
                  <span className="j-str">"elementor_header_footer"</span>
                </span>
                <span className="landing-json-line">
                  {"  "}
                  {"}"}
                  {on("tokens") || on("status") ? "," : ""}
                </span>
              </>
            ) : null}
            {tab === "all" ? (
              <>
                <span className="landing-json-line">
                  {"  "}
                  <span className="j-key">"content"</span>: {"{"}
                </span>
                <span className="landing-json-line">
                  {"    "}
                  <span className="j-key">"sections"</span>: [
                </span>
                <span className="landing-json-line">
                  {"      "}
                  {"{ "}
                  <span className="j-key">"type"</span>: <span className="j-str">"hero"</span>,{" "}
                  <span className="j-key">"id"</span>: <span className="j-str">"s-01"</span>
                  {" }"},
                </span>
                <span className="landing-json-line">
                  {"      "}
                  {"{ "}
                  <span className="j-key">"type"</span>: <span className="j-str">"listing"</span>,{" "}
                  <span className="j-key">"id"</span>: <span className="j-str">"s-02"</span>
                  {" }"}
                </span>
                <span className="landing-json-line">
                  {"    "}]
                </span>
                <span className="landing-json-line">
                  {"  },"}
                </span>
              </>
            ) : null}
            {on("tokens") ? (
              <>
                <span className="landing-json-line">
                  {"  "}
                  <span className="j-key">"tokens"</span>: {"{"}
                </span>
                <span className="landing-json-line">
                  {"    "}
                  <span className="j-key">"colors"</span>: [
                  <span className={hx("#0d0d0d")}>"#0d0d0d"</span>,{" "}
                  <span className={hx("#e0a94a")}>"#e0a94a"</span>],
                </span>
                <span className="landing-json-line">
                  {"    "}
                  <span className="j-key">"fonts"</span>: [
                  <span className="j-str">"Archivo"</span>,{" "}
                  <span className="j-str">"JetBrains Mono"</span>],
                </span>
                <span className="landing-json-line">
                  {"    "}
                  <span className="j-key">"radius"</span>: <span className="j-str">"8px"</span>
                </span>
                <span className="landing-json-line">
                  {"  "}
                  {"}"}
                  {tab === "all" ? "," : ""}
                </span>
              </>
            ) : null}
            {tab === "all" ? (
              <>
                <span className="landing-json-line">
                  {"  "}
                  <span className="j-key">"settings"</span>: {"{"}
                </span>
                <span className="landing-json-line">
                  {"    "}
                  <span className="j-key">"plugins"</span>: [
                  <span className="j-str">"elementor"</span>,{" "}
                  <span className="j-str">"jet-engine"</span>],
                </span>
                <span className="landing-json-line">
                  {"    "}
                  <span className="j-key">"forms"</span>: <span className="j-num">2</span>,
                </span>
                <span className="landing-json-line">
                  {"    "}
                  <span className="j-key">"assets"</span>: <span className="j-num">34</span>
                </span>
                <span className="landing-json-line">
                  {"  },"}
                </span>
              </>
            ) : null}
            {on("status") ? (
              <span className="landing-json-line">
                {"  "}
                <span className="j-key">"scanStatus"</span>:{" "}
                <span className="j-ok">"complete"</span>
              </span>
            ) : null}
            <span className="landing-json-line">
              {"}"}
              <span className="landing-json-caret" aria-hidden="true" />
            </span>
          </>
        ) : null}
      </code>
    </pre>
  );
}

export function Output() {
  const rootRef = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);
  const [tab, setTab] = useState<TabId>("all");
  const [hex, setHex] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.22 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SAMPLE_BLUEPRINT);
      setCopied(true);
      toast.message("JSON v schránke");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Kopírovanie zlyhalo");
    }
  }, []);

  return (
    <section
      id="vystup"
      ref={rootRef}
      data-on={on}
      data-testid="landing-output"
      className="landing-output relative isolate border-t border-gold-line py-16 sm:py-24 lg:py-32"
    >
      <Film src={FILM.output} pos="50% 50%" />
      <div className="relative z-10 mx-auto grid max-w-7xl items-start gap-10 px-4 sm:gap-14 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center">
        <div>
          <span className="bp-eyebrow">výstup</span>
          <h2 className="mt-4 text-[clamp(1.75rem,5.4vw,3.15rem)] font-bold tracking-tight text-balance uppercase">
            Nie snímka. Blueprint.
          </h2>
          <p className="mt-5 max-w-md text-[0.975rem] leading-relaxed text-pretty text-muted-foreground">
            Verzionovaný JSON: tokeny, sekcie, stav. Uložíš, porovnáš, odošleš. Pixelová kópia to
            nie je — je to evidencia, z ktorej sa stavajú.
          </p>
          <dl className="landing-output-stats mt-9">
            {STATS.map((s, i) => (
              <div
                key={s.l}
                className="landing-output-stat"
                style={{ transitionDelay: `${120 + i * 70}ms` }}
                title={s.hint}
              >
                <dt>{s.n}</dt>
                <dd>{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Reveal delay={80}>
          <div className="landing-json">
            <div className="landing-json-chrome">
              <div className="flex min-w-0 items-center gap-2">
                <Braces className="h-3.5 w-3.5 shrink-0 text-gold" />
                <span className="truncate font-mono text-xs tracking-widest text-muted-foreground uppercase">
                  blueprint.json
                </span>
                <span className="landing-json-live">hotovo</span>
              </div>
              <div className="flex items-center gap-1">
                {(["#0d0d0d", "#e0a94a"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`token ${c}`}
                    className={hex === c ? "landing-swatch is-on" : "landing-swatch"}
                    style={{ background: c }}
                    onMouseEnter={() => {
                      setHex(c);
                      setTab("tokens");
                    }}
                    onFocus={() => {
                      setHex(c);
                      setTab("tokens");
                    }}
                    onMouseLeave={() => setHex(null)}
                    onBlur={() => setHex(null)}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => void copy()}
                  className="landing-json-copy"
                  aria-label="Kopírovať JSON"
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
            </div>

            <div className="landing-json-tabs" role="tablist" aria-label="Časti blueprintu">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  className={tab === t.id ? "is-on" : undefined}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="landing-json-body">
              <JsonDemo tab={tab} hex={hex} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
