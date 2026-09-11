import { zipSync, strToU8 } from "fflate";
import type { GeneratedDraft } from "../rebuild/generate.ts";
import type { TaskDraft } from "../understand/tasks.ts";

export type BuiltZip = {
  filename: string;
  bytes: Uint8Array;
};

export function zipApplication(name: string, files: GeneratedDraft[]): BuiltZip {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cosy-app";
  const bundle: Record<string, Uint8Array> = {};
  for (const file of files) {
    bundle[file.path] = strToU8(file.code);
  }
  return {
    filename: `${slug}-application.zip`,
    bytes: zipSync(bundle, { level: 6 }),
  };
}

export function zipCursorPlan(
  name: string,
  files: GeneratedDraft[],
  tasks: { title: string; phase: string; description: string; estimateHours: number | null }[] | TaskDraft[],
): BuiltZip {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cosy-plan";
  const plan = files.find((file) => file.path === "cursor-plan.md")?.code ?? `# Cursor plan — ${name}\n`;
  const taskJson = JSON.stringify(
    tasks.map((task) => ({
      title: task.title,
      phase: "phase" in task ? task.phase : "",
      description: "description" in task ? task.description : "",
      estimateHours: "estimateHours" in task ? task.estimateHours : null,
    })),
    null,
    2,
  );
  return {
    filename: `${slug}-cursor-plan.zip`,
    bytes: zipSync(
      {
        "cursor-plan.md": strToU8(plan),
        "tasks.json": strToU8(taskJson),
      },
      { level: 6 },
    ),
  };
}
