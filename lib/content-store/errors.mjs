export class ContentStoreError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ContentStoreError";
    this.code = code;
  }
}

export function serializeDocument(data) {
  return JSON.stringify(data, null, 2) + "\n";
}
