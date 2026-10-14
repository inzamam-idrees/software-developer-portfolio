import { verifyPassword } from "@/lib/admin/auth.mjs";
import {
  ADMIN_SESSION_COOKIE,
  THEME_PREVIEW_COOKIE,
  adminCookieOptions,
  getAdminConfiguration,
  issueAdminSession,
  requestHasSameOrigin,
  sameOriginUrl,
} from "@/lib/admin/server.mjs";
import { NextResponse } from "next/server";

export async function POST(request) {
  if (!requestHasSameOrigin(request)) {
    return NextResponse.json({ error: "Request rejected" }, { status: 403 });
  }

  const configuration = getAdminConfiguration();
  if (!configuration.configured) {
    return NextResponse.json(
      { error: "Administrator access is unavailable" },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const valid = await verifyPassword(
    form.get("password"),
    configuration.passwordHash,
  );
  if (!valid) {
    return NextResponse.redirect(
      sameOriginUrl(request, "/admin/login?error=credentials"),
      303,
    );
  }

  const response = NextResponse.redirect(sameOriginUrl(request, "/admin/theme"), 303);
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    issueAdminSession(configuration),
    { ...adminCookieOptions(), maxAge: 8 * 60 * 60 },
  );
  response.cookies.set(THEME_PREVIEW_COOKIE, "", {
    ...adminCookieOptions(),
    maxAge: 0,
  });
  return response;
}
