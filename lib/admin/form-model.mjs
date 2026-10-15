function isNullSchema(schema) {
  return schema?.type === "null";
}

export function unwrapNullable(schema) {
  const options = schema?.anyOf;
  if (Array.isArray(options) && options.some(isNullSchema)) {
    const rest = options.filter((option) => !isNullSchema(option));
    return { schema: rest.length === 1 ? rest[0] : { anyOf: rest }, nullable: true };
  }
  return { schema, nullable: false };
}

function allStrings(options) {
  return options.every((option) =>
    option.type === "string" || (option.anyOf && allStrings(option.anyOf)),
  );
}

export function fieldKind(schema) {
  const { schema: inner } = unwrapNullable(schema);
  if (!inner) return "json";
  if (Array.isArray(inner.enum)) return "enum";
  if (inner.const !== undefined) return "const";
  if (inner.anyOf || inner.oneOf) {
    return allStrings(inner.anyOf ?? inner.oneOf) ? "string" : "json";
  }
  if (inner.type === "object") {
    return inner.properties ? "object" : "record";
  }
  if (["array", "string", "integer", "number", "boolean"].includes(inner.type)) {
    return inner.type;
  }
  return "json";
}

// ── Defaults ──
export function emptyValueFor(schema) {
  const { schema: inner, nullable } = unwrapNullable(schema);
  if (nullable) return null;
  switch (fieldKind(inner)) {
    case "object":
      return Object.fromEntries(
        (inner.required ?? []).map((key) => [key, emptyValueFor(inner.properties[key])]),
      );
    case "record":
      return {};
    case "array":
      return [];
    case "boolean":
      return false;
    case "integer":
    case "number": {
      if (typeof inner.minimum === "number") return inner.minimum;
      if (typeof inner.exclusiveMinimum === "number") return inner.exclusiveMinimum + 1;
      return 0;
    }
    case "enum":
      return inner.enum[0];
    case "const":
      return inner.const;
    default:
      return "";
  }
}

// ── Submission ──
export function normalizeFormValue(schema, value) {
  const { schema: inner, nullable } = unwrapNullable(schema);
  if (value === "" && nullable) return null;
  const kind = fieldKind(inner);

  if (kind === "array" && Array.isArray(value)) {
    return value.map((item) => normalizeFormValue(inner.items, item));
  }
  if (kind === "object" && value && typeof value === "object") {
    const required = new Set(inner.required ?? []);
    const result = {};
    for (const [key, entry] of Object.entries(value)) {
      const propertySchema = inner.properties[key];
      if (!propertySchema) {
        result[key] = entry;
        continue;
      }
      const normalized = normalizeFormValue(propertySchema, entry);
      if (normalized === "" && !required.has(key)) continue;
      result[key] = normalized;
    }
    return result;
  }
  if (kind === "record" && value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        normalizeFormValue(inner.additionalProperties, entry),
      ]),
    );
  }
  return value;
}

// ── Immutable edits ──
export function setAtPath(value, path, next) {
  if (path.length === 0) return next;
  const [head, ...rest] = path;
  const container = Array.isArray(value) ? [...value] : { ...value };
  container[head] = setAtPath(value?.[head], rest, next);
  return container;
}

export function moveItem(list, from, to) {
  if (to < 0 || to >= list.length || from < 0 || from >= list.length) {
    return [...list];
  }
  const result = [...list];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}
