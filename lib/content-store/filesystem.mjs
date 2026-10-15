import { createHash, randomUUID } from "node:crypto";
import { readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { documentRegistry, getDocumentDefinition } from "../portfolio/documents.mjs";
import { ContentStoreError, serializeDocument } from "./errors.mjs";

function revisionOf(source) {
  return createHash("sha256").update(source).digest("hex");
}

async function readSource(root, definition) {
  try {
    return await readFile(path.join(root, definition.path), "utf8");
  } catch {
    throw new ContentStoreError(
      "STORE_UNAVAILABLE",
      `Could not read the ${definition.label} document`,
    );
  }
}

export function createFilesystemReader({ root }) {
  async function read(id) {
    const definition = getDocumentDefinition(id);
    const source = await readSource(root, definition);
    return { data: JSON.parse(source), revision: revisionOf(source) };
  }

  async function readAll() {
    const entries = [];
    for (const definition of documentRegistry) {
      entries.push([definition.id, (await read(definition.id)).data]);
    }
    return Object.fromEntries(entries);
  }

  return { read, readAll };
}

export function createFilesystemStore({ root }) {
  const reader = createFilesystemReader({ root });
  const locks = new Map();

  async function writeLocked(definition, data, expectedRevision) {
    const current = await readSource(root, definition);
    if (revisionOf(current) !== expectedRevision) {
      throw new ContentStoreError(
        "CONFLICT",
        `${definition.label} changed since it was loaded`,
      );
    }
    const target = path.join(root, definition.path);
    const temporary = `${target}.${randomUUID()}.tmp`;
    const source = serializeDocument(data);
    try {
      await writeFile(temporary, source, "utf8");
      await rename(temporary, target);
    } catch {
      await rm(temporary, { force: true });
      throw new ContentStoreError(
        "STORE_UNAVAILABLE",
        `Could not write the ${definition.label} document`,
      );
    }
    return { revision: revisionOf(source), commitUrl: null };
  }

  function write(id, data, { expectedRevision }) {
    const definition = getDocumentDefinition(id);
    const previous = locks.get(definition.id) ?? Promise.resolve();
    const next = previous
      .catch(() => {})
      .then(() => writeLocked(definition, data, expectedRevision));
    locks.set(definition.id, next);
    return next;
  }

  return Object.freeze({
    kind: "filesystem",
    root,
    capabilities: Object.freeze({ writable: true, liveAfterWrite: true }),
    ...reader,
    write,
  });
}
