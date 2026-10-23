import { z } from "zod";
import { getDocumentDefinition } from "../portfolio/documents.mjs";

/** Plain JSON so the schema can cross the server/client component boundary. */
export function documentFormSchema(id) {
  const schema = z.toJSONSchema(getDocumentDefinition(id).schema, {
    io: "input",
    unrepresentable: "any",
  });
  return JSON.parse(JSON.stringify(schema));
}
