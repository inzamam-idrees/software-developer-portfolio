import {
  THEME_PREVIEW_COOKIE,
  adminCookieOptions,
  getAdminConfiguration,
  getAdminRequestState,
  requestHasSameOrigin,
  sameOriginUrl,
} from "@/lib/admin/server.mjs";
import { previewPath } from "@/lib/admin/preview-links.mjs";
import { getThemeDefinition } from "@/lib/themes/registry.mjs";
import { NextResponse } from "next/server";

// The public routes no longer read the preview cookie. Selecting a theme here
// sends the admin to its URL preview, and "end" clears any cookie left behind.
export async function POST(request) {
  const admin = await getAdminRequestState();
  if (!admin.session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!requestHasSameOrigin(request)) {
    return NextResponse.json({ error: "Request rejected" }, { status: 403 });
  }

  const form = await request.formData();
  if (form.get("action") === "end") {
    const response = NextResponse.redirect(sameOriginUrl(request, "/admin/theme"), 303);
    response.cookies.set(THEME_PREVIEW_COOKIE, "", {
      ...adminCookieOptions(),
      maxAge: 0,
    });
    return response;
  }

  const themeId = form.get("themeId");
  let theme;
  try {
    theme = getThemeDefinition(themeId);
  } catch {
    return NextResponse.json({ error: "Theme is not available" }, { status: 400 });
  }
  if (theme.status !== "available") {
    return NextResponse.json({ error: "Theme is not available" }, { status: 400 });
  }

  if (!getAdminConfiguration().configured) {
    return NextResponse.json({ error: "Preview is unavailable" }, { status: 503 });
  }
  return NextResponse.redirect(sameOriginUrl(request, previewPath(theme.id)), 303);
}
