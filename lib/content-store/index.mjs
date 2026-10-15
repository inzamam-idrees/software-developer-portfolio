import { configuredDataRoot } from "../portfolio/loader.mjs";
import { ContentStoreError } from "./errors.mjs";
import { createFilesystemStore } from "./filesystem.mjs";
import { createGithubStore } from "./github.mjs";
import { createReadonlyStore } from "./readonly.mjs";

export { ContentStoreError } from "./errors.mjs";

const STORE_KINDS = ["filesystem", "github", "readonly"];

function unavailable(message) {
  return new ContentStoreError("STORE_UNAVAILABLE", message);
}

function requiredSetting(env, name) {
  const value = env[name];
  if (typeof value !== "string" || !value.trim()) {
    throw unavailable(`GitHub content storage requires ${name}`);
  }
  return value.trim();
}

export function createContentStore(env = process.env, { fetch } = {}) {
  const configured = env.PORTFOLIO_CONTENT_STORE?.trim();
  const kind =
    configured || (env.NODE_ENV === "production" ? "readonly" : "filesystem");
  if (!STORE_KINDS.includes(kind)) {
    throw unavailable(`PORTFOLIO_CONTENT_STORE must be one of ${STORE_KINDS.join(", ")}`);
  }

  if (kind === "github") {
    const repo = requiredSetting(env, "GITHUB_CONTENT_REPO");
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
      throw unavailable("GITHUB_CONTENT_REPO must have the form owner/name");
    }
    return createGithubStore({
      token: requiredSetting(env, "GITHUB_CONTENT_TOKEN"),
      repo,
      branch: requiredSetting(env, "GITHUB_CONTENT_BRANCH"),
      ...(fetch ? { fetch } : {}),
    });
  }

  const root = configuredDataRoot(env);
  return kind === "filesystem"
    ? createFilesystemStore({ root })
    : createReadonlyStore({ root });
}
