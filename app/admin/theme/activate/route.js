import {
  THEME_PREVIEW_COOKIE,
  adminCookieOptions,
  getAdminRequestState,
  requestHasSameOrigin,
  sameOriginUrl,
} from "@/lib/admin/server.mjs";
import { activateTheme, ThemeActivationError } from "@/lib/themes/activation.mjs";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request) {
  const admin = await getAdminRequestState();
  if (!admin.session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!requestHasSameOrigin(request)) {
    return NextResponse.json({ error: "Request rejected" }, { status: 403 });
  }

  let themeId;
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    themeId = body.themeId;
  } else {
    const form = await request.formData();
    themeId = form.get("themeId");
  }

  try {
    await activateTheme(themeId);
    revalidatePath("/", "layout");
  } catch (error) {
    if (error instanceof ThemeActivationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Activation failed" }, { status: 500 });
  }

  const response = NextResponse.redirect(
    sameOriginUrl(request, `/admin/theme?activated=${encodeURIComponent(themeId)}`),
    303,
  );
  response.cookies.set(THEME_PREVIEW_COOKIE, "", {
    ...adminCookieOptions(),
    maxAge: 0,
  });
  return response;
}
