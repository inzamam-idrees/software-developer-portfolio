import {
  THEME_PREVIEW_COOKIE,
  adminCookieOptions,
  getAdminRequestState,
  requestHasSameOrigin,
  sameOriginUrl,
} from "@/lib/admin/server.mjs";
import { createContentStore } from "@/lib/content-store/index.mjs";
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

  let result;
  try {
    result = await activateTheme(themeId, { store: createContentStore() });
    if (result.liveAfterWrite) revalidatePath("/", "layout");
  } catch (error) {
    const code =
      error instanceof ThemeActivationError || error?.code === "STORE_UNAVAILABLE"
        ? error.code
        : "ACTIVATION_FAILED";
    return NextResponse.redirect(
      sameOriginUrl(request, `/admin/theme?error=${encodeURIComponent(code)}`),
      303,
    );
  }

  const pending = result.liveAfterWrite ? "" : "&pending=1";
  const response = NextResponse.redirect(
    sameOriginUrl(
      request,
      `/admin/theme?activated=${encodeURIComponent(result.themeId)}${pending}`,
    ),
    303,
  );
  response.cookies.set(THEME_PREVIEW_COOKIE, "", {
    ...adminCookieOptions(),
    maxAge: 0,
  });
  return response;
}
