import { SK } from "./strings-sk.ts";

export const SCAN_EVIDENCE_KEY = "scan_evidence";
export const SCAN_EVIDENCE_DB = "cosy-layout-scan";
export const SCAN_EVIDENCE_STORE = "blobs";
/** Soft cap for JPEG evidence (~80 KB). */
export const MAX_JPEG_BYTES = 80 * 1024;

export type ScreenshotResult =
  | { ok: true; bytes: number; message: string }
  | { ok: false; message: string };

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(SCAN_EVIDENCE_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(SCAN_EVIDENCE_STORE)) {
        db.createObjectStore(SCAN_EVIDENCE_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("indexedDB open failed"));
  });
}

/** Persist Blob under key `scan_evidence`. */
export async function saveScanEvidence(blob: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(SCAN_EVIDENCE_STORE, "readwrite");
    tx.objectStore(SCAN_EVIDENCE_STORE).put(blob, SCAN_EVIDENCE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("indexedDB put failed"));
  });
  db.close();
}

export async function loadScanEvidence(): Promise<Blob | null> {
  const db = await openDb();
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(SCAN_EVIDENCE_STORE, "readonly");
    const req = tx.objectStore(SCAN_EVIDENCE_STORE).get(SCAN_EVIDENCE_KEY);
    req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null);
    req.onerror = () => reject(req.error ?? new Error("indexedDB get failed"));
  });
  db.close();
  return blob;
}

/**
 * Capture `element` (or document.body) via html2canvas → JPEG ≤ ~80 KB → IndexedDB.
 * Browser-only; callers in Node should skip or mock.
 */
export async function captureLayoutScreenshot(
  element?: HTMLElement,
): Promise<ScreenshotResult> {
  if (typeof document === "undefined" || typeof indexedDB === "undefined") {
    return { ok: false, message: SK.screenshotFailed };
  }

  try {
    const html2canvas = (await import("html2canvas")).default;
    const target = element ?? document.body;
    const canvas = await html2canvas(target, {
      useCORS: true,
      logging: false,
      scale: 1,
    });

    let quality = 0.72;
    let blob: Blob | null = await canvasToJpeg(canvas, quality);
    while (blob && blob.size > MAX_JPEG_BYTES && quality > 0.28) {
      quality -= 0.08;
      blob = await canvasToJpeg(canvas, quality);
    }

    if (!blob) {
      return { ok: false, message: SK.screenshotFailed };
    }

    // Last resort: downscale if still over budget
    if (blob.size > MAX_JPEG_BYTES) {
      const scaled = document.createElement("canvas");
      const ratio = Math.sqrt(MAX_JPEG_BYTES / blob.size) * 0.95;
      scaled.width = Math.max(1, Math.floor(canvas.width * ratio));
      scaled.height = Math.max(1, Math.floor(canvas.height * ratio));
      const ctx = scaled.getContext("2d");
      if (ctx) {
        ctx.drawImage(canvas, 0, 0, scaled.width, scaled.height);
        blob = await canvasToJpeg(scaled, 0.55);
      }
    }

    if (!blob) {
      return { ok: false, message: SK.screenshotFailed };
    }

    await saveScanEvidence(blob);
    return {
      ok: true,
      bytes: blob.size,
      message: SK.screenshotSaved,
    };
  } catch {
    return { ok: false, message: SK.screenshotFailed };
  }
}

function canvasToJpeg(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
  });
}
