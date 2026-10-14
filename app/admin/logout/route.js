import {
  ADMIN_SESSION_COOKIE,
  THEME_PREVIEW_COOKIE,
  adminCookieOptions,
  requestHasSameOrigin,
  sameOriginUrl,
} from "@/lib/admin/server.mjs";
import { NextResponse } from "next/server";

export async function POST(request) {
  if (!requestHasSameOrigin(request)) {
    return NextResponse.json({ error: "Request rejected" }, { status: 403 });
  }
  const response = NextResponse.redirect(sameOriginUrl(request, "/"), 303);
  for (const name of [ADMIN_SESSION_COOKIE, THEME_PREVIEW_COOKIE]) {
    response.cookies.set(name, "", { ...adminCookieOptions(), maxAge: 0 });
  }
  return response;
}
