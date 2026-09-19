export type {
  CompletenessResult,
  LayoutMap,
  LayoutRole,
  LayoutSection,
} from "./types.ts";

export { SK as layoutStringsSk } from "./strings-sk.ts";
export { mapLayoutSections, type LayoutNode } from "./mapper.ts";
export { assessCompleteness, KEY_ROLES } from "./completeness.ts";
export {
  SCAN_EVIDENCE_KEY,
  MAX_JPEG_BYTES,
  captureLayoutScreenshot,
  saveScanEvidence,
  loadScanEvidence,
  type ScreenshotResult,
} from "./screenshot.ts";
