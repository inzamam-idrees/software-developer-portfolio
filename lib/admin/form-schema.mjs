import { z } from "zod";
import { getDocumentDefinition } from "../portfolio/documents.mjs";

export function documentFormSchema(id) {
  return z.toJSONSchema(getDocumentDefinition(id).schema, {
    io: "input",
    unrepresentable: "any",
  });
}
