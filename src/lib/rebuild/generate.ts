import type { Blueprint } from "../blueprint/schema.ts";
import type { Json } from "../cosy/types.ts";

export type GeneratedDraft = {
  path: string;
  language: string;
  code: string;
};

function rec(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pagesOf(blueprint: Blueprint): { path: string; title: string }[] {
  const pages = Array.isArray(blueprint.pages) ? blueprint.pages : [];
  const mapped = pages
    .map((page) => {
      const row = rec(page);
      return {
        path: String(row?.path ?? "/"),
        title: String(row?.title ?? row?.path ?? "Page"),
      };
    })
    .filter((page) => page.path);
  return mapped.length ? mapped : [{ path: "/", title: "Home" }];
}

function tokensOf(blueprint: Blueprint): { accent: string; canvas: string; text: string; font: string } {
  const tokens = rec(blueprint.designTokens) ?? rec(blueprint.tokens) ?? {};
  const colors = rec(tokens.colors) ?? {};
  const fonts = rec(tokens.fonts) ?? {};
  return {
    accent: String(colors.accent ?? "#D8A84B"),
    canvas: String(colors.canvas ?? "#08090A"),
    text: String(colors.text ?? "#F6F4EF"),
    font: String(fonts.body ?? "Inter"),
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "\u0026amp;")
    .replaceAll("<", "\u0026lt;")
    .replaceAll(">", "\u0026gt;")
    .replaceAll('"', "\u0026quot;");
}

export function generateApplication(input: {
  name: string;
  targetStack: string;
  scope: string;
  blueprint: Blueprint;
}): GeneratedDraft[] {
  const pages = pagesOf(input.blueprint);
  const tokens = tokensOf(input.blueprint);
  const forms = Array.isArray(input.blueprint.forms) ? input.blueprint.forms : [];
  const source = String(
    input.blueprint.finalUrl ?? input.blueprint.sourceUrl ?? input.blueprint.source_url ?? "public evidence",
  );
  const stack =
    input.targetStack === "react_vite_ts" ? "react-vite-ts" : "next-ts-tailwind";

  const nav = pages
    .map(
      (page) =>
        `<a href="#${escapeHtml(page.path)}" style="color:inherit;margin-right:1rem">${escapeHtml(page.title)}</a>`,
    )
    .join("");

  const sections = pages
    .map((page) => {
      return `<section id="${escapeHtml(page.path)}" style="padding:48px 0;border-top:1px solid #3a311c">
  <p style="letter-spacing:0.16em;text-transform:uppercase;font-size:11px;color:${escapeHtml(tokens.accent)}">Route ${escapeHtml(page.path)}</p>
  <h2 style="margin:8px 0 12px;font-size:28px">${escapeHtml(page.title)}</h2>
  <p style="max-width:40rem;color:#9b9ca1">Rebuilt from public evidence. This is a new application surface, not a cloned WordPress runtime.</p>
</section>`;
    })
    .join("\n");

  const formBlock = forms.length
    ? `<section style="padding:48px 0">
  <h2 style="font-size:28px">Forms to replace</h2>
  <ul>${forms
    .map((form) => {
      const row = rec(form) ?? { name: String(form) };
      return `<li>${escapeHtml(String(row.name ?? "Form"))} · ${escapeHtml(String(row.fields ?? "fields"))}</li>`;
    })
    .join("")}</ul>
</section>`
    : "";

  const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(input.name)}</title>
  <style>
    :root { color-scheme: dark; }
    body { margin:0; font-family:${escapeHtml(tokens.font)}, system-ui, sans-serif; background:${escapeHtml(tokens.canvas)}; color:${escapeHtml(tokens.text)}; }
    header, main { max-width: 960px; margin: 0 auto; padding: 24px; }
    a { color: ${escapeHtml(tokens.accent)}; }
  </style>
</head>
<body>
  <header>
    <p style="letter-spacing:0.18em;text-transform:uppercase;font-size:11px;color:${escapeHtml(tokens.accent)}">COSY reconstruction</p>
    <h1>${escapeHtml(input.name)}</h1>
    <p style="color:#9b9ca1">Source ${escapeHtml(source)} · stack ${escapeHtml(stack)} · scope ${escapeHtml(input.scope)}</p>
    <nav>${nav}</nav>
  </header>
  <main>
    ${sections}
    ${formBlock}
  </main>
</body>
</html>
`;

  const appTsx = `const pages = ${JSON.stringify(pages, null, 2)} as const;
const tokens = ${JSON.stringify(tokens, null, 2)} as const;

export function App() {
  return (
    <main style={{ fontFamily: tokens.font, background: tokens.canvas, color: tokens.text, minHeight: "100vh", padding: 24 }}>
      <p style={{ color: tokens.accent, letterSpacing: "0.16em", textTransform: "uppercase", fontSize: 11 }}>COSY reconstruction</p>
      <h1>${input.name.replace(/`/g, "")}</h1>
      <ul>
        {pages.map((page) => (
          <li key={page.path}>{page.title} — {page.path}</li>
        ))}
      </ul>
    </main>
  );
}
`;

  const mainTsx = `import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(<App />);
`;

  const styles = `:root {
  --canvas: ${tokens.canvas};
  --fg: ${tokens.text};
  --accent: ${tokens.accent};
  --font: ${tokens.font}, system-ui, sans-serif;
}
html, body { margin: 0; background: var(--canvas); color: var(--fg); font-family: var(--font); }
`;

  const pkg = {
    name: input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cosy-rebuild",
    private: true,
    type: "module",
    scripts: {
      dev: "vite",
      build: "tsc --noEmit && vite build",
      preview: "vite preview",
    },
    dependencies: {
      react: "^19.2.0",
      "react-dom": "^19.2.0",
    },
    devDependencies: {
      typescript: "^5.8.2",
      vite: "^7.1.3",
      "@types/react": "^19.2.0",
      "@types/react-dom": "^19.2.0",
    },
  };

  const readme = `# ${input.name}

Generated by COSY Studio from public frontend evidence.

- Source: ${source}
- Stack: ${stack}
- Scope: ${input.scope}

This is a new application foundation, not a pixel-perfect clone and not an executed archive.

## Verify

COSY workspace verification checks required files and JSON/HTML integrity.
A stored \`build_runs.exit_code\` of 0 means that verifier passed — it is not a claim that the original WordPress site was copied.
`;

  const cursorPlan = `# Cursor plan — ${input.name}

## Goal
Rebuild the public site as ${stack} using only captured evidence.

## Evidence
- Pages: ${pages.map((page) => page.path).join(", ")}
- Forms: ${forms.length}
- Tokens: accent ${tokens.accent}

## Rules
- Do not execute uploaded ZIP members.
- Do not claim 1:1 clone completeness.
- Replace plugin and Elementor behavior with first-party components.
`;

  const notes = JSON.stringify(
    {
      source,
      generatedAt: new Date().toISOString(),
      pages,
      limitations: input.blueprint.limitations ?? [],
    },
    null,
    2,
  );

  return [
    { path: "index.html", language: "html", code: indexHtml },
    { path: "package.json", language: "json", code: JSON.stringify(pkg, null, 2) },
    { path: "src/main.tsx", language: "tsx", code: mainTsx },
    { path: "src/App.tsx", language: "tsx", code: appTsx },
    { path: "src/styles.css", language: "css", code: styles },
    { path: "README.md", language: "md", code: readme },
    { path: "cursor-plan.md", language: "md", code: cursorPlan },
    { path: "public/blueprint-notes.json", language: "json", code: notes },
  ];
}
