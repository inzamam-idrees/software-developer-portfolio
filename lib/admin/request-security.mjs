function expectedOrigins(request) {
  const requestUrl = new URL(request.url);
  const origins = new Set([requestUrl.origin]);
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host");
  const protocol =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    requestUrl.protocol.replace(":", "");
  if (host && ["http", "https"].includes(protocol)) {
    origins.add(`${protocol}://${host}`);
  }
  return origins;
}

export function requestHasSameOrigin(request) {
  const origins = expectedOrigins(request);

  const origin = request.headers.get("origin");
  if (origin) return origins.has(origin);

  if (request.headers.get("sec-fetch-site") !== "same-origin") return false;
  const referer = request.headers.get("referer");
  if (!referer) return false;
  try {
    return origins.has(new URL(referer).origin);
  } catch {
    return false;
  }
}

export function sameOriginUrl(request, path) {
  if (!requestHasSameOrigin(request)) {
    throw new Error("Cannot create a redirect for an unverified request origin");
  }
  const origins = expectedOrigins(request);
  const origin = request.headers.get("origin");
  if (origin && origins.has(origin)) return new URL(path, origin);
  const referer = request.headers.get("referer");
  if (referer) {
    const refererOrigin = new URL(referer).origin;
    if (origins.has(refererOrigin)) return new URL(path, refererOrigin);
  }
  return new URL(path, request.url);
}
