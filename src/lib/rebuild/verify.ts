import type { GeneratedDraft } from "./generate.ts";

export const REQUIRED_PATHS = [
  "package.json",
  "index.html",
  "src/App.tsx",
  "src/styles.css",
  "README.md",
] as const;

export type VerifyResult = {
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  missing: string[];
};

export function verifyGeneratedTree(files: GeneratedDraft[]): VerifyResult {
  const command = "cosy-verify generated-tree";
  const byPath = new Map(files.map((file) => [file.path, file]));
  const missing = REQUIRED_PATHS.filter((path) => {
    const file = byPath.get(path);
    return !file || !file.code.trim();
  });
  const logs: string[] = [];
  const errors: string[] = [];

  logs.push(`checking ${files.length} generated file(s)`);

  for (const path of missing) {
    errors.push(`missing or empty: ${path}`);
  }

  const pkg = byPath.get("package.json");
  if (pkg) {
    try {
      const parsed = JSON.parse(pkg.code) as { name?: string };
      if (!parsed.name) errors.push("package.json is missing name");
      else logs.push(`package.json ok (${parsed.name})`);
    } catch {
      errors.push("package.json is not valid JSON");
    }
  }

  const html = byPath.get("index.html");
  if (html && !/<!doctype html/i.test(html.code)) {
    errors.push("index.html is missing doctype");
  } else if (html) {
    logs.push("index.html has doctype");
  }

  const app = byPath.get("src/App.tsx");
  if (app && !/export function App/.test(app.code)) {
    errors.push("src/App.tsx does not export App");
  } else if (app) {
    logs.push("src/App.tsx exports App");
  }

  const exitCode = errors.length ? 1 : 0;
  return {
    command,
    exitCode,
    stdout: logs.join("\n"),
    stderr: errors.join("\n"),
    missing,
  };
}

export function repairGeneratedTree(
  files: GeneratedDraft[],
  replacements: GeneratedDraft[],
): GeneratedDraft[] {
  const map = new Map(files.map((file) => [file.path, file]));
  for (const next of replacements) {
    const current = map.get(next.path);
    if (!current || !current.code.trim()) {
      map.set(next.path, next);
    }
  }
  return [...map.values()].sort((a, b) => a.path.localeCompare(b.path));
}
