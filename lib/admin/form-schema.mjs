import { z } from "zod";
import { getDocumentDefinition } from "../portfolio/documents.mjs";

/** Plain JSON so the schema can cross the server/client component boundary. */
export function documentFormSchema(id, { fieldCopy } = {}) {
  const schema = z.toJSONSchema(getDocumentDefinition(id).schema, {
    io: "input",
    unrepresentable: "any",
  });
  if (id === "experience" && fieldCopy?.experienceOutcome) {
    const field = schema.items.properties.outcome;
    field.title = fieldCopy.experienceOutcome.label;
    field.description = fieldCopy.experienceOutcome.help;
  }
  return JSON.parse(JSON.stringify(schema));
}
