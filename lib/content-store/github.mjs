import { documentRegistry, getDocumentDefinition } from "../portfolio/documents.mjs";
import { ContentStoreError, serializeDocument } from "./errors.mjs";

const API = "https://api.github.com";
const CONTENT_PREFIX = "portfolio-data";

const MAX_DETAIL_LENGTH = 200;

async function responseMessage(response) {
  try {
    const body = await response.json();
    return typeof body?.message === "string" ? body.message.slice(0, MAX_DETAIL_LENGTH) : "";
  } catch {
    return "";
  }
}

function isRateLimited(response, message) {
  const headers = response.headers;
  return (
    response.status === 429 ||
    /rate limit/i.test(message) ||
    headers?.get?.("x-ratelimit-remaining") === "0" ||
    Boolean(headers?.get?.("retry-after"))
  );
}

async function failureFor(response, label) {
  const { status } = response;
  const message = await responseMessage(response);
  if (status === 409 || (status === 422 && /\bsha\b/i.test(message))) {
    return new ContentStoreError("CONFLICT", `${label} changed since it was loaded`);
  }
  if ((status === 403 || status === 429) && isRateLimited(response, message)) {
    return new ContentStoreError(
      "STORE_UNAVAILABLE",
      "GitHub storage is rate limited; try again in a few minutes",
    );
  }
  if (status === 401 || status === 403) {
    return new ContentStoreError(
      "UNAUTHORIZED_STORE",
      "GitHub rejected the configured storage credentials",
    );
  }
  if (status === 404) {
    return new ContentStoreError(
      "STORE_UNAVAILABLE",
      `${label} was not found in the configured repository`,
    );
  }
  if (status === 422) {
    return new ContentStoreError(
      "STORE_UNAVAILABLE",
      message
        ? `GitHub storage rejected the request: ${message}`
        : "GitHub storage rejected the request",
    );
  }
  return new ContentStoreError("STORE_UNAVAILABLE", `GitHub storage responded with ${status}`);
}

export function createGithubStore({ token, repo, branch, fetch = globalThis.fetch }) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  function contentsUrl(definition) {
    return `${API}/repos/${repo}/contents/${CONTENT_PREFIX}/${definition.path}`;
  }

  async function request(definition, url, init) {
    let response;
    try {
      response = await fetch(url, { ...init, headers: { ...headers, ...init.headers } });
    } catch {
      throw new ContentStoreError("STORE_UNAVAILABLE", "GitHub storage could not be reached");
    }
    if (!response.ok) throw await failureFor(response, definition.label);
    try {
      return await response.json();
    } catch {
      throw new ContentStoreError("STORE_UNAVAILABLE", "GitHub storage returned an invalid response");
    }
  }

  async function read(id) {
    const definition = getDocumentDefinition(id);
    const body = await request(
      definition,
      `${contentsUrl(definition)}?ref=${encodeURIComponent(branch)}`,
      { method: "GET" },
    );
    const source = Buffer.from(String(body.content ?? ""), "base64").toString("utf8");
    try {
      return { data: JSON.parse(source), revision: body.sha };
    } catch {
      throw new ContentStoreError("STORE_UNAVAILABLE", `${definition.label} is not valid JSON in the repository`);
    }
  }

  async function readAll() {
    const entries = await Promise.all(
      documentRegistry.map(async (definition) => [
        definition.id,
        (await read(definition.id)).data,
      ]),
    );
    return Object.fromEntries(entries);
  }

  async function write(id, data, { expectedRevision, message }) {
    const definition = getDocumentDefinition(id);
    const body = await request(definition, contentsUrl(definition), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        content: Buffer.from(serializeDocument(data)).toString("base64"),
        sha: expectedRevision,
        branch,
      }),
    });
    return {
      revision: body.content?.sha ?? null,
      commitUrl: body.commit?.html_url ?? null,
    };
  }

  return Object.freeze({
    kind: "github",
    capabilities: Object.freeze({ writable: true, liveAfterWrite: false }),
    read,
    readAll,
    write,
  });
}
