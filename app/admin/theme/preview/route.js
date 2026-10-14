import {
  THEME_PREVIEW_COOKIE,
  adminCookieOptions,
  getAdminConfiguration,
  getAdminRequestState,
  issueThemePreview,
  requestHasSameOrigin,
  sameOriginUrl,
} from "@/lib/admin/server.mjs";
import { getThemeDefinition } from "@/lib/themes/registry.mjs";
import { NextResponse } from "next/server";

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
    const response = NextResponse.redirect(sameOriginUrl(request, "/"), 303);
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

  const configuration = getAdminConfiguration();
  if (!configuration.configured) {
    return NextResponse.json({ error: "Preview is unavailable" }, { status: 503 });
  }
  const response = NextResponse.redirect(sameOriginUrl(request, "/"), 303);
  response.cookies.set(
    THEME_PREVIEW_COOKIE,
    issueThemePreview(configuration, admin.session, theme.id),
    { ...adminCookieOptions(), maxAge: 2 * 60 * 60 },
  );
  return response;
}
