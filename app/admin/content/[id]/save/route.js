import { handleContentSave, readContentPayload } from "@/lib/admin/content-save.mjs";
import { getAdminRequestState, requestHasSameOrigin } from "@/lib/admin/server.mjs";
import { createContentStore } from "@/lib/content-store/index.mjs";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const { id } = await params;
  const admin = await getAdminRequestState();
  const sameOrigin = requestHasSameOrigin(request);
  const authorized = Boolean(admin.session) && sameOrigin;
  const { contentLength, payload } = authorized
    ? await readContentPayload(request)
    : { contentLength: 0, payload: null };

  let store;
  try {
    store = createContentStore();
  } catch (error) {
    if (!authorized) store = null;
    else {
      return NextResponse.json(
        { ok: false, code: error.code ?? "STORE_UNAVAILABLE", message: error.message },
        { status: 503 },
      );
    }
  }

  const { status, body } = await handleContentSave({
    session: admin.session,
    sameOrigin,
    id,
    contentLength,
    payload,
    store,
  });
  if (status === 200 && body.liveAfterWrite) revalidatePath("/", "layout");
  return NextResponse.json(body, { status });
}
