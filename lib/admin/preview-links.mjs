// ── Preview routing ──
const PREVIEWABLE_PATHS = new Map([
  ["/", ""],
  ["/project", "/project"],
  ["/project/", "/project"],
  ["/blog", "/blog"],
  ["/blog/", "/blog"],
]);
const PROJECT_DETAIL_PATH = /^\/project\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/;

function previewablePage(pathname) {
  const page = PREVIEWABLE_PATHS.get(pathname);
  if (page !== undefined) return page;
  const detail = PROJECT_DETAIL_PATH.exec(pathname);
  return detail ? `/project/${detail[1]}` : undefined;
}

export const PREVIEW_PAGES = Object.freeze([
  { id: "home", label: "Home", path: "" },
  { id: "projects", label: "Projects", path: "/project" },
  { id: "blog", label: "Blog", path: "/blog" },
]);

export function previewPath(themeId, page = "") {
  return `/preview/${encodeURIComponent(themeId)}${page}`;
}

/**
 * Maps a public portfolio link to the same page inside a theme preview, so
 * navigating a previewed theme never falls back to the live theme. Returns
 * null for links that should behave normally (other origins, assets, admin).
 */
export function previewHref(href, themeId, origin) {
  let url;
  try {
    url = new URL(href, origin);
  } catch {
    return null;
  }
  if (url.origin !== origin) return null;
  const page = previewablePage(url.pathname);
  if (page === undefined) return null;
  return `${previewPath(themeId, page)}${url.search}${url.hash}`;
}

/**
 * The preview page ("", "/project", "/blog") a preview pathname shows. A
 * project detail page counts as "/project".
 */
export function previewPageOf(pathname, themeId) {
  const prefix = previewPath(themeId);
  if (!pathname?.startsWith(prefix)) return "";
  const rest = pathname.slice(prefix.length).replace(/\/$/, "");
  if (PROJECT_DETAIL_PATH.test(rest)) return "/project";
  return PREVIEW_PAGES.some((page) => page.path === rest) ? rest : "";
}
