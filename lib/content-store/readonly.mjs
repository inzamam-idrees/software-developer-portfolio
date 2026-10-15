import { createFilesystemReader } from "./filesystem.mjs";
import { ContentStoreError } from "./errors.mjs";

export function createReadonlyStore({ root }) {
  return Object.freeze({
    kind: "readonly",
    root,
    capabilities: Object.freeze({ writable: false, liveAfterWrite: false }),
    ...createFilesystemReader({ root }),
    async write() {
      throw new ContentStoreError(
        "READ_ONLY",
        "Content editing is not configured for this deployment",
      );
    },
  });
}
