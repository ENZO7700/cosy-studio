import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { importZipProject, createIdeaProject, sampleZip } from "@/lib/server/projects";
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

const STEPS = ["Source", "Details", "Target", "Scope", "Confirm"];

export function NewProjectForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [source, setSource] = useState<SourceType>("blueprint_zip");
  const [name, setName] = useState("Agency rebuild");
  const [idea, setIdea] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState<TargetStack>("next_ts_tailwind");
  const [scope, setScope] = useState<ProjectScope>("frontend_rebuild");
  const [authorized, setAuthorized] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const sourceBlocked =
    source === "url" ? "Public URL scanning is scheduled for Milestone 3." : null;
  const appZipNote =
    source === "app_zip"
      ? "Existing app ZIP import (no execution) lands with the builder in Milestone 5. Use a Blueprint ZIP now."
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
      if (source !== "blueprint_zip") {
        setErrors([sourceBlocked ?? appZipNote ?? "This source is not available in Milestone 2."]);
        return;
      }
      if (!file) {
        setErrors(["Drop a .zip file first."]);
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
      setErrors([error instanceof Error ? error.message : "Import failed."]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <ol className="mb-6 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.14em] text-muted">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={cn(index === step && "text-accent")}
          >
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
          {sourceBlocked ? <p className="text-sm text-warning">{sourceBlocked}</p> : null}
          {appZipNote ? <p className="text-sm text-warning">{appZipNote}</p> : null}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <label className="block text-sm">
            Project name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-md bg-elevated px-3 text-fg shadow-[0_0_0_1px_var(--color-line)]"
            />
          </label>
          {source === "blueprint_zip" && (
            <div>
              <p className="text-sm">Blueprint ZIP</p>
              <p className="mt-1 text-xs text-muted">
                Expects blueprint.json, manifest.json, index.html. Optional css/, assets/, pages.json.
                Archives are never executed.
              </p>
              <input
                type="file"
                accept=".zip,application/zip"
                className="mt-3 block w-full text-sm"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <button type="button" className="mt-3 text-sm text-accent" onClick={() => void downloadSample()}>
                Download a valid sample ZIP
              </button>
            </div>
          )}
          {source === "blank" && (
            <label className="block text-sm">
              Project goal
              <textarea
                value={idea}
                onChange={(event) => setIdea(event.target.value)}
                rows={5}
                className="mt-2 w-full rounded-md bg-elevated p-3 text-fg shadow-[0_0_0_1px_var(--color-line)]"
                placeholder="Who it is for, core features, preferred stack."
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
            I confirm I am authorized to upload this public site evidence or archive.
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
        <div className="space-y-3 rounded-lg bg-panel p-4 shadow-[0_0_0_1px_var(--color-line)] text-sm">
          <p>
            <span className="text-muted">Name</span> {name}
          </p>
          <p>
            <span className="text-muted">Source</span> {SOURCE_LABELS[source]}
          </p>
          <p>
            <span className="text-muted">Target</span> {TARGET_LABELS[target]}
          </p>
          <p>
            <span className="text-muted">Scope</span> {SCOPE_LABELS[scope]}
          </p>
          <p>
            <span className="text-muted">Authorized</span> {authorized ? "Yes" : "No"}
          </p>
          {file ? (
            <p className="font-mono text-xs text-muted">
              {file.name} · {file.size} bytes
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
            Back
          </Button>
        ) : null}
        {step < 4 ? (
          <Button type="button" onClick={() => setStep((value) => value + 1)}>
            Continue
          </Button>
        ) : (
          <Button type="button" disabled={busy} onClick={() => void submit()}>
            {busy ? "Creating…" : "Create project"}
          </Button>
        )}
      </div>
    </div>
  );
}
