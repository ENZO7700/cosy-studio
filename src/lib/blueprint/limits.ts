export type ZipLimits = {
  maxCompressedBytes: number;
  maxUncompressedBytes: number;
  maxFiles: number;
};

export const ZIP_LIMITS: ZipLimits = {
  maxCompressedBytes: 8 * 1024 * 1024,
  maxUncompressedBytes: 32 * 1024 * 1024,
  maxFiles: 200,
};

export const REQUIRED_ZIP_FILES = [
  "blueprint.json",
  "manifest.json",
  "index.html",
] as const;
