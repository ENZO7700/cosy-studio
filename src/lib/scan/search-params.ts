export type ScanSearch = {
  open?: string;
  bp?: string;
  tool?: string;
  tab?: string;
  url?: string;
  render?: boolean;
  wayback?: boolean;
  crawl?: boolean;
  assets?: boolean;
  wp?: boolean;
};

export function parseScanSearch(search: Record<string, unknown>): ScanSearch {
  const out: ScanSearch = {};
  if (typeof search.open === "string") out.open = search.open;
  if (typeof search.bp === "string") out.bp = search.bp;
  if (typeof search.tool === "string") out.tool = search.tool;
  if (typeof search.tab === "string") out.tab = search.tab;
  if (typeof search.url === "string" && search.url.trim()) out.url = search.url.trim();
  if (search.render === "true" || search.render === true) out.render = true;
  if (search.render === "false" || search.render === false) out.render = false;
  if (search.wayback === "true" || search.wayback === true) out.wayback = true;
  if (search.wayback === "false" || search.wayback === false) out.wayback = false;
  if (search.crawl === "true" || search.crawl === true) out.crawl = true;
  if (search.crawl === "false" || search.crawl === false) out.crawl = false;
  if (search.assets === "true" || search.assets === true) out.assets = true;
  if (search.assets === "false" || search.assets === false) out.assets = false;
  if (search.wp === "true" || search.wp === true) out.wp = true;
  if (search.wp === "false" || search.wp === false) out.wp = false;
  return out;
}

export function hasScanIntent(search: ScanSearch): boolean {
  return Boolean(
    search.open ||
      search.bp ||
      search.tool ||
      search.tab ||
      search.url ||
      search.render !== undefined ||
      search.wayback !== undefined ||
      search.crawl !== undefined ||
      search.assets !== undefined ||
      search.wp !== undefined,
  );
}
