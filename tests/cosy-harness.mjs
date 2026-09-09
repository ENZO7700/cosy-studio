import assert from "node:assert/strict";

export const BASE = process.env.COSY_BASE ?? "http://127.0.0.1:8080";

export async function requirePreview() {
  try {
    const res = await fetch(BASE, {
      redirect: "follow",
      headers: { accept: "text/html" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `COSY preview is not running at ${BASE} (${reason}). Start the workspace before test:smoke / test:all.`,
    );
  }
}

export async function getHtml(path) {
  const res = await fetch(`${BASE}${path}`, {
    redirect: "follow",
    headers: { accept: "text/html" },
  });
  return { status: res.status, text: await res.text() };
}

export function assertHas(text, snippets, path) {
  const haystack = text.replace(/\s+/g, " ");
  for (const snippet of snippets) {
    assert.ok(
      haystack.toLowerCase().includes(snippet.toLowerCase()),
      `${path} missing ${JSON.stringify(snippet)}\n---\n${haystack.slice(0, 800)}`,
    );
  }
}
