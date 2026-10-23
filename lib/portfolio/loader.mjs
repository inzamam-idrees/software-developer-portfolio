import { readFile } from "node:fs/promises";
import path from "node:path";
import { ZodError } from "zod";
import { canonicalPortfolioSchema } from "./schemas.mjs";
import {
  assignDocument,
  documentForCanonicalPath,
  documentRegistry,
  getDocumentDefinition,
} from "./documents.mjs";

export class PortfolioDataError extends Error {
  constructor(code, document, message) {
    super(message);
    this.name = "PortfolioDataError";
    this.code = code;
    this.document = document;
  }
}

export function configuredDataRoot(env) {
  const configured = env?.PORTFOLIO_DATA_DIR;
  return path.resolve(
    typeof configured === "string" && configured.trim()
      ? configured.trim()
      : path.join(process.cwd(), "portfolio-data"),
  );
}

async function loadDocument(root, name, relativePath, schema) {
  let source;
  try {
    source = await readFile(path.join(root, relativePath), "utf8");
  } catch (error) {
    const missing = error?.code === "ENOENT";
    throw new PortfolioDataError(
      missing ? "MISSING_DOCUMENT" : "READ_FAILED",
      name,
      missing
        ? `Required canonical document is missing: ${name}`
        : `Could not read canonical document: ${name}`,
    );
  }

  let value;
  try {
    value = JSON.parse(source);
  } catch {
    throw new PortfolioDataError(
      "MALFORMED_JSON",
      name,
      `Canonical document contains malformed JSON: ${name}`,
    );
  }

  try {
    return schema.parse(value);
  } catch (error) {
    if (!(error instanceof ZodError)) throw error;
    throw new PortfolioDataError(
      "VALIDATION_FAILED",
      name,
      `Canonical document failed validation: ${name}`,
    );
  }
}

function byOrder(items) {
  return [...items].sort((left, right) => left.order - right.order);
}

function normalize(portfolio) {
  return {
    content: {
      ...portfolio.content,
      projects: byOrder(portfolio.content.projects),
      experience: byOrder(portfolio.content.experience),
      education: byOrder(portfolio.content.education),
      awards: byOrder(portfolio.content.awards),
      skills: {
        ...portfolio.content.skills,
        categories: byOrder(portfolio.content.skills.categories),
      },
    },
    settings: {
      ...portfolio.settings,
      navigation: {
        ...portfolio.settings.navigation,
        items: byOrder(portfolio.settings.navigation.items),
      },
    },
  };
}

// ── Issue reporting ──
export function zodIssues(error, prefix = []) {
  return error.issues.map((issue) => ({
    path: [...prefix, ...issue.path].join("."),
    message: issue.message,
  }));
}

function emptyPortfolio() {
  return { content: {}, settings: {} };
}

export function assemblePortfolio(documentsById) {
  const portfolio = emptyPortfolio();
  for (const definition of documentRegistry) {
    assignDocument(portfolio, definition, documentsById[definition.id]);
  }
  return portfolio;
}

export function validateDocument(id, value) {
  const result = getDocumentDefinition(id).schema.safeParse(value);
  return result.success
    ? { ok: true, value: result.data }
    : { ok: false, issues: zodIssues(result.error) };
}

function canonicalIssues(error) {
  return error.issues.map((issue) => {
    const segments = issue.path.map(String);
    const definition = documentForCanonicalPath(segments);
    const field = definition
      ? segments.slice(definition.canonicalPath.length)
      : segments;
    return {
      path: [definition?.id ?? "portfolio", ...field].join("."),
      message: issue.message,
    };
  });
}

export function validatePortfolio(documentsById) {
  const issues = [];
  const parsed = {};
  for (const definition of documentRegistry) {
    const result = definition.schema.safeParse(documentsById[definition.id]);
    if (result.success) parsed[definition.id] = result.data;
    else issues.push(...zodIssues(result.error, [definition.id]));
  }
  if (issues.length) return { ok: false, issues };

  const result = canonicalPortfolioSchema.safeParse(assemblePortfolio(parsed));
  return result.success
    ? { ok: true, portfolio: normalize(result.data) }
    : { ok: false, issues: canonicalIssues(result.error) };
}

export async function loadCanonicalPortfolio({ env = process.env } = {}) {
  const root = configuredDataRoot(env);
  const portfolio = emptyPortfolio();

  for (const definition of documentRegistry) {
    const value = await loadDocument(
      root,
      definition.name,
      definition.path,
      definition.schema,
    );
    assignDocument(portfolio, definition, value);
  }

  try {
    return normalize(canonicalPortfolioSchema.parse(portfolio));
  } catch (error) {
    if (!(error instanceof ZodError)) throw error;
    throw new PortfolioDataError(
      "VALIDATION_FAILED",
      "portfolio",
      "Canonical portfolio failed cross-document validation",
    );
  }
}
