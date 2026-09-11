import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { importZipProject, createIdeaProject, sampleZip, scanPublicProject } from "@/lib/server/projects";
import {
  SCOPE_LABELS,
  SOURCE_LABELS,
  TARGET_LABELS,
  type ProjectScope,
  type SourceType,
  type TargetStack,
} from "@/lib/cosy/types";
import { cn } from "@/lib/utils";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const STEPS = ["Odkiaľ", "Názov", "Ako to chcete", "Ako veľké", "Kontrola"];

export function NewProjectForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [source, setSource] = useState<SourceType>("blueprint_zip");
  const [name, setName] = useState("Prestavba webu");
  const [idea, setIdea] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [pastedHtml, setPastedHtml] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState<TargetStack>("next_ts_tailwind");
  const [scope, setScope] = useState<ProjectScope>("frontend_rebuild");
  const [authorized, setAuthorized] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const appZipNote =
    source === "app_zip"
      ? "Súbor zo starého projektu zatiaľ nespúšťame. Použite odkaz alebo súbor zo skenera."
      : null;

  async function downloadSample() {
    const sample = await sampleZip();
    const bytes = Uint8Array.from(atob(sample.base64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sample.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function submit() {
    setErrors([]);
    setBusy(true);
    try {
      if (source === "app_zip") {
        setErrors([appZipNote ?? "Použite odkaz alebo súbor zo skenera."]);
        return;
      }
      if (source === "blank") {
        const result = await createIdeaProject({
          data: {
            name,
            ideaBrief: idea,
            targetStack: target,
            scope,
            authorized,
          },
        });
        if (!result.ok) {
          setErrors(result.errors);
          return;
        }
        await navigate({ to: "/projects/$id", params: { id: result.id } });
        return;
      }
      if (source === "url") {
        const result = await scanPublicProject({
          data: {
            name,
            sourceUrl,
            pastedHtml,
            targetStack: target,
            scope,
            authorized,
          },
        });
        if (!result.ok) {
          setErrors(result.errors);
          return;
        }
        await navigate({ to: "/projects/$id/blueprint", params: { id: result.id } });
        return;
      }
      if (!file) {
        setErrors(["Najprv vyberte súbor ZIP."]);
        return;
      }
      const zipBase64 = await fileToBase64(file);
      const result = await importZipProject({
        data: {
          name,
          filename: file.name,
          zipBase64,
          targetStack: target,
          scope,
          authorized,
        },
      });
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      await navigate({ to: "/projects/$id/blueprint", params: { id: result.id } });
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Načítanie sa nepodarilo."]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <ol className="mb-6 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.14em] text-muted">
        {STEPS.map((label, index) => (
          <li key={label} className={cn(index === step && "text-accent")}>
            {String(index + 1).padStart(2, "0")} {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="grid gap-2">
          {(Object.keys(SOURCE_LABELS) as SourceType[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSource(key)}
              className={cn(
                "min-h-14 rounded-lg bg-panel px-4 text-left text-sm shadow-[0_0_0_1px_var(--color-line)]",
                source === key && "bg-elevated text-fg",
              )}
            >
              {SOURCE_LABELS[key]}
            </button>
          ))}
          {appZipNote ? <p className="text-sm text-warning">{appZipNote}</p> : null}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <label className="block text-sm">
            Názov projektu
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-md bg-elevated px-3 text-fg shadow-[0_0_0_1px_var(--color-line)]"
            />
          </label>
          {source === "url" && (
            <div className="space-y-3">
              <label className="block text-sm">
                Adresa webu
                <input
                  value={sourceUrl}
                  onChange={(event) => setSourceUrl(event.target.value)}
                  placeholder="https://example.com"
                  className="mt-2 min-h-11 w-full rounded-md bg-elevated px-3 text-fg shadow-[0_0_0_1px_var(--color-line)]"
                />
              </label>
              <label className="block text-sm">
                Vložiť HTML
                <textarea
                  value={pastedHtml}
                  onChange={(event) => setPastedHtml(event.target.value)}
                  rows={6}
                  className="mt-2 w-full rounded-md bg-elevated p-3 font-mono text-xs text-fg shadow-[0_0_0_1px_var(--color-line)]"
                  placeholder="Voliteľné. Keď stránka nejde otvoriť, vložte sem text stránky."
                />
              </label>
              <p className="text-xs text-muted">
                Súkromné adresy (localhost, interná sieť) neberieme. Text sa iba číta, nespúšťa.
              </p>
            </div>
          )}
          {source === "blueprint_zip" && (
            <div>
              <p className="text-sm">Súbor zo skenera</p>
              <p className="mt-1 text-xs text-muted">
                Očakávame popis stránky, zoznam súborov a úvodnú stránku. Balík sa iba číta, nespúšťa.
              </p>
              <input
                type="file"
                accept=".zip,application/zip"
                className="mt-3 block w-full text-sm"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <button type="button" className="mt-3 text-sm text-accent" onClick={() => void downloadSample()}>
                Stiahnuť ukážkový súbor
              </button>
            </div>
          )}
          {source === "blank" && (
            <label className="block text-sm">
              Pre koho to je a čo má robiť
              <textarea
                value={idea}
                onChange={(event) => setIdea(event.target.value)}
                rows={5}
                className="mt-2 w-full rounded-md bg-elevated p-3 text-fg shadow-[0_0_0_1px_var(--color-line)]"
                placeholder="Pre koho to je, čo má robiť, aký má byť vzhľad."
              />
            </label>
          )}
          <label className="flex min-h-11 items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={authorized}
              onChange={(event) => setAuthorized(event.target.checked)}
              className="mt-1 size-4"
            />
            Potvrdzujem, že mám právo s touto stránkou pracovať.
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-2">
          {(Object.keys(TARGET_LABELS) as TargetStack[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTarget(key)}
              className={cn(
                "min-h-12 rounded-lg bg-panel px-4 text-left text-sm shadow-[0_0_0_1px_var(--color-line)]",
                target === key && "bg-elevated",
              )}
            >
              {TARGET_LABELS[key]}
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-2">
          {(Object.keys(SCOPE_LABELS) as ProjectScope[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setScope(key)}
              className={cn(
                "min-h-12 rounded-lg bg-panel px-4 text-left text-sm shadow-[0_0_0_1px_var(--color-line)]",
                scope === key && "bg-elevated",
              )}
            >
              {SCOPE_LABELS[key]}
            </button>
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3 rounded-lg bg-panel p-4 text-sm shadow-[0_0_0_1px_var(--color-line)]">
          <p>
            <span className="text-muted">Názov</span> {name}
          </p>
          <p>
            <span className="text-muted">Odkiaľ</span> {SOURCE_LABELS[source]}
          </p>
          {source === "url" && sourceUrl ? (
            <p className="font-mono text-xs text-muted">{sourceUrl}</p>
          ) : null}
          <p>
            <span className="text-muted">Ako</span> {TARGET_LABELS[target]}
          </p>
          <p>
            <span className="text-muted">Rozsah</span> {SCOPE_LABELS[scope]}
          </p>
          <p>
            <span className="text-muted">Súhlas</span> {authorized ? "Áno" : "Nie"}
          </p>
          {file ? (
            <p className="font-mono text-xs text-muted">
              {file.name} · {file.size} bajtov
            </p>
          ) : null}
        </div>
      )}

      {errors.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm text-danger">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {step > 0 ? (
          <Button type="button" variant="secondary" onClick={() => setStep((value) => value - 1)}>
            Späť
          </Button>
        ) : null}
        {step < 4 ? (
          <Button type="button" onClick={() => setStep((value) => value + 1)}>
            Ďalej
          </Button>
        ) : (
          <Button type="button" disabled={busy} onClick={() => void submit()}>
            {busy ? "Pracujem…" : "Vytvoriť projekt"}
          </Button>
        )}
      </div>
    </div>
  );
}
