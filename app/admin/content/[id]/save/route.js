import { handleContentSave, MAX_CONTENT_BYTES } from "@/lib/admin/content-save.mjs";
import { getAdminRequestState, requestHasSameOrigin } from "@/lib/admin/server.mjs";
import { createContentStore } from "@/lib/content-store/index.mjs";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

async function readPayload(request) {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_CONTENT_BYTES) return { contentLength: declared, payload: null };
  const text = await request.text();
  const contentLength = Buffer.byteLength(text);
  if (contentLength > MAX_CONTENT_BYTES) return { contentLength, payload: null };
  try {
    return { contentLength, payload: JSON.parse(text) };
  } catch {
    return { contentLength, payload: null };
  }
}

export async function POST(request, { params }) {
  const { id } = await params;
  const admin = await getAdminRequestState();
  const sameOrigin = requestHasSameOrigin(request);
  const authorized = Boolean(admin.session) && sameOrigin;
  const { contentLength, payload } = authorized
    ? await readPayload(request)
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
