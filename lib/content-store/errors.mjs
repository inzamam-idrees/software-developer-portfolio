export class ContentStoreError extends Error {
  constructor(code, message, { issues } = {}) {
    super(message);
    this.name = "ContentStoreError";
    this.code = code;
    if (issues) this.issues = issues;
  }
}

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Returns `value` with object keys in the order `template` uses, recursively,
 * so saving parsed data does not reorder the stored file. Keys the template
 * lacks keep their own order after the known ones.
 */
export function orderKeysLike(value, template) {
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      orderKeysLike(item, Array.isArray(template) ? template[index] : undefined),
    );
  }
  if (!isPlainObject(value)) return value;
  const known = isPlainObject(template)
    ? Object.keys(template).filter((key) => Object.hasOwn(value, key))
    : [];
  const keys = [...known, ...Object.keys(value).filter((key) => !known.includes(key))];
  return Object.fromEntries(
    keys.map((key) => [key, orderKeysLike(value[key], isPlainObject(template) ? template[key] : undefined)]),
  );
}

export function serializeDocument(data) {
  return JSON.stringify(data, null, 2) + "\n";
}
