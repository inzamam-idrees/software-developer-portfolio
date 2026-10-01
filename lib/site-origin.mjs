import { isIP } from "node:net";

export function getSiteOrigin(value = process.env.SITE_URL) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      return null;
    if (
      host === "localhost" ||
      host.endsWith(".localhost") ||
      (!isIP(host) && !host.includes("."))
    )
      return null;
    if (isIP(host) === 4) {
      const [a, b] = host.split(".").map(Number);
      if (
        a === 0 ||
        a === 10 ||
        a === 127 ||
        a >= 224 ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        (a === 100 && b >= 64 && b <= 127)
      )
        return null;
    }
    if (
      isIP(host) === 6 &&
      (/^(fc|fd|fe[89ab]|ff)/i.test(host) ||
        host === "::" ||
        host === "::1" ||
        host.startsWith("::ffff:"))
    )
      return null;
    return url.origin;
  } catch {
    return null;
  }
}
export function canonicalMetadata(path = "/") {
  const origin = getSiteOrigin();
  return origin
    ? { alternates: { canonical: new URL(path, origin).href } }
    : {};
}
