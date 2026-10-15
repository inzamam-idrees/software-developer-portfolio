import { ContentStoreError } from "../content-store/errors.mjs";
import { getDocumentDefinition } from "../portfolio/documents.mjs";
import { validateDocument, validatePortfolio } from "../portfolio/loader.mjs";

export const MAX_CONTENT_BYTES = 256 * 1024;

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

function storeFailure(error) {
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
  const portfolioResult = validatePortfolio({
    ...documents,
    [definition.id]: documentResult.value,
  });
  if (!portfolioResult.ok) {
    return failure(422, "INVALID", {
      issues: relativeTo(definition.id, portfolioResult.issues),
    });
  }

  try {
    const result = await store.write(definition.id, documentResult.value, {
      expectedRevision,
      message: `content: update ${definition.id} via admin`,
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
    return storeFailure(error);
  }
}
