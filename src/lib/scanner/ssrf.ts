const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
  "metadata.goog",
  "instance-data",
]);

export function isPrivateIp(ip: string): boolean {
  const value = ip.trim().toLowerCase();
  if (value === "::1" || value === "0:0:0:0:0:0:0:1") return true;
  if (value.startsWith("fe80:") || value.startsWith("fc") || value.startsWith("fd")) return true;
  if (value.startsWith("::ffff:")) return isPrivateIp(value.slice(7));

  const parts = value.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

export function hostnameBlocked(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.$/, "");
  if (!host) return true;
  if (BLOCKED_HOSTS.has(host)) return true;
  if (host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (isPrivateIp(host)) return true;
  return false;
}

export type PublicUrlOk = { ok: true; url: URL };
export type PublicUrlErr = { ok: false; error: string };

export async function assertPublicHttpUrl(raw: string): Promise<PublicUrlOk | PublicUrlErr> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, error: "Dajte platnú adresu začínajúcu na https://." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, error: "Iba verejné adresy http(s)." };
  }
  if (url.username || url.password) {
    return { ok: false, error: "Adresa s menom a heslom sa nedá použiť." };
  }
  if (hostnameBlocked(url.hostname)) {
    return { ok: false, error: "Túto adresu nemôžeme otvoriť. Skúste verejný web alebo vložte HTML." };
  }

  try {
    const dns = await import("node:dns/promises");
    const records = await dns.lookup(url.hostname, { all: true });
    if (records.length === 0) {
      return { ok: false, error: "Hostiteľ sa nenašiel." };
    }
    if (records.some((row) => isPrivateIp(row.address))) {
      return { ok: false, error: "Táto adresa nie je verejná. Otvorenie sme zastavili." };
    }
  } catch {
    return { ok: false, error: "Adresu sa nepodarilo overiť ako verejnú." };
  }

  return { ok: true, url };
}
