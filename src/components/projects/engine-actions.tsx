import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { analyzeProject, rebuildProject } from "@/lib/server/workspace";
import { riskFace } from "@/lib/copy";

export function EngineActions({
  projectId,
  hasArchitecture,
  hasFiles,
}: {
  projectId: string;
  hasArchitecture: boolean;
  hasFiles: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"analyze" | "rebuild" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function run(kind: "analyze" | "rebuild") {
    setBusy(kind);
    setMessage(null);
    try {
      if (kind === "analyze") {
        const result = await analyzeProject({ data: { id: projectId } });
        if (!result.ok) {
          setMessage(result.errors.join(" "));
          return;
        }
        setMessage(`Vieme o stránke ${result.readiness.score} %. Riziko: ${riskFace(result.readiness.riskLevel)}.`);
      } else {
        const result = await rebuildProject({ data: { id: projectId } });
        if (!result.ok) {
          setMessage(result.errors.join(" "));
          return;
        }
        setMessage(
          result.exitCode === 0
            ? `Pripravených ${result.fileCount} súborov. Kontrola prešla.`
            : "Kontrola neprešla. Chýba súbor. Skúste pripraviť znova.",
        );
      }
      await router.invalidate();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Niečo sa pokazilo.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <Button type="button" variant="secondary" disabled={busy !== null} onClick={() => void run("analyze")}>
        {busy === "analyze" ? "Čítam stránku…" : hasArchitecture ? "Znova prečítať" : "Zistiť, čo tam je"}
      </Button>
      <Button type="button" disabled={busy !== null} onClick={() => void run("rebuild")}>
        {busy === "rebuild" ? "Pripravujem súbory…" : hasFiles ? "Pripraviť znova" : "Pripraviť súbory"}
      </Button>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </div>
  );
}
