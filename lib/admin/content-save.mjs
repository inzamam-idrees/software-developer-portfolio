import { ContentStoreError, orderKeysLike } from "../content-store/errors.mjs";
import { getDocumentDefinition } from "../portfolio/documents.mjs";
import { validateDocument, validatePortfolio } from "../portfolio/loader.mjs";

export const MAX_CONTENT_BYTES = 256 * 1024;

/**
 * Reads a JSON request body without buffering more than the limit allows.
 * A declared Content-Length over the limit is refused unread; otherwise the
 * stream is counted as it arrives, so a missing or false header cannot make
 * the server hold an oversized body.
 */
export async function readContentPayload(request, limit = MAX_CONTENT_BYTES) {
  const header = request.headers.get("content-length");
  const declared = header !== null && /^\d+$/.test(header) ? Number(header) : null;
  if (declared !== null && declared > limit) return { contentLength: declared, payload: null };
  if (!request.body) return { contentLength: 0, payload: null };

  const reader = request.body.getReader();
  const chunks = [];
  let contentLength = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    contentLength += value.byteLength;
    if (contentLength > limit) {
      await reader.cancel().catch(() => {});
      return { contentLength, payload: null };
    }
    chunks.push(value);
  }
  try {
    return { contentLength, payload: JSON.parse(Buffer.concat(chunks).toString("utf8")) };
  } catch {
    return { contentLength, payload: null };
  }
}

const storeStatus = Object.freeze({
  CONFLICT: 409,
  READ_ONLY: 405,
  UNAUTHORIZED_STORE: 502,
  STORE_UNAVAILABLE: 503,
});

function relativeTo(id, issues) {
  const prefix = `${id}.`;
  return issues.map((issue) => ({
    ...issue,
    path:
      issue.path === id
        ? ""
        : issue.path.startsWith(prefix)
          ? issue.path.slice(prefix.length)
          : issue.path,
  }));
}

function failure(status, code, extra = {}) {
  return { status, body: { ok: false, code, ...extra } };
}

function storeFailure(error, id) {
  if (error instanceof ContentStoreError && error.code === "INVALID" && error.issues) {
    return failure(422, "INVALID", { issues: relativeTo(id, error.issues) });
  }
  if (error instanceof ContentStoreError && storeStatus[error.code]) {
    return failure(storeStatus[error.code], error.code, { message: error.message });
  }
  return failure(500, "SAVE_FAILED");
}

export async function handleContentSave({
  session,
  sameOrigin,
  id,
  contentLength,
  payload,
  store,
}) {
  if (!session) return failure(401, "UNAUTHORIZED");
  if (!sameOrigin) return failure(403, "FORBIDDEN");
  if (!(contentLength <= MAX_CONTENT_BYTES)) return failure(413, "TOO_LARGE");

  let definition;
  try {
    definition = getDocumentDefinition(id);
  } catch {
    return failure(404, "UNKNOWN_DOCUMENT");
  }

  const expectedRevision = payload?.expectedRevision;
  if (
    !payload ||
    typeof payload !== "object" ||
    !("data" in payload) ||
    typeof expectedRevision !== "string" ||
    !expectedRevision
  ) {
    return failure(400, "BAD_REQUEST");
  }

  const documentResult = validateDocument(definition.id, payload.data);
  if (!documentResult.ok) {
    return failure(422, "INVALID", { issues: documentResult.issues });
  }

  let documents;
  try {
    documents = await store.readAll();
  } catch (error) {
    return storeFailure(error);
  }
  const data = orderKeysLike(documentResult.value, documents[definition.id]);
  const portfolioIssues = (current) => {
    const result = validatePortfolio({ ...current, [definition.id]: data });
    return result.ok ? [] : result.issues;
  };
  const issues = portfolioIssues(documents);
  if (issues.length) {
    return failure(422, "INVALID", { issues: relativeTo(definition.id, issues) });
  }

  // Stores that can lock (filesystem) re-run `validate` against their state
  // at write time; the GitHub store cannot, so two different documents saved
  // at the same moment may each pass against the other's previous version.
  try {
    const result = await store.write(definition.id, data, {
      expectedRevision,
      message: `content: update ${definition.id} via admin`,
      validate: portfolioIssues,
    });
    return {
      status: 200,
      body: {
        ok: true,
        revision: result.revision,
        commitUrl: result.commitUrl,
        liveAfterWrite: store.capabilities.liveAfterWrite,
      },
    };
  } catch (error) {
    return storeFailure(error, definition.id);
  }
}
