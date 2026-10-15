import { readFile } from "node:fs/promises";
import path from "node:path";
import { ZodError } from "zod";
import {
  aboutSchema,
  awardsSchema,
  articlesSchema,
  canonicalPortfolioSchema,
  contactSchema,
  educationsSchema,
  experiencesSchema,
  featureSettingsSchema,
  navigationSettingsSchema,
  profileSchema,
  projectsSchema,
  resumeSchema,
  seoSettingsSchema,
  siteSettingsSchema,
  skillsSchema,
  socialSchema,
  themeSettingsSchema,
} from "./schemas.mjs";
import {
  cinematicCopySchema,
  codingCopySchema,
  executiveCopySchema,
  sharedCopySchema,
} from "./copy-schemas.mjs";

const documentManifest = [
  ["content", "profile", "content/profile.json", profileSchema],
  ["content", "about", "content/about.json", aboutSchema],
  ["content", "projects", "content/projects.json", projectsSchema],
  ["content", "experience", "content/experience.json", experiencesSchema],
  ["content", "education", "content/education.json", educationsSchema],
  ["content", "awards", "content/awards.json", awardsSchema],
  ["content", "skills", "content/skills.json", skillsSchema],
  ["content", "resume", "content/resume.json", resumeSchema],
  ["content", "articles", "content/articles.json", articlesSchema],
  ["content", "social", "content/social.json", socialSchema],
  ["content", "contact", "content/contact.json", contactSchema],
  ["settings", "site", "settings/site.json", siteSettingsSchema],
  [
    "settings",
    "navigation",
    "settings/navigation.json",
    navigationSettingsSchema,
  ],
  ["settings", "features", "settings/features.json", featureSettingsSchema],
  ["settings", "theme", "settings/theme.json", themeSettingsSchema],
  ["settings", "seo", "settings/seo.json", seoSettingsSchema],
  ["settings", "copy.shared", "settings/copy/shared.json", sharedCopySchema],
  ["settings", "copy.coding", "settings/copy/coding.json", codingCopySchema],
  [
    "settings",
    "copy.cinematic",
    "settings/copy/cinematic.json",
    cinematicCopySchema,
  ],
  [
    "settings",
    "copy.executive",
    "settings/copy/executive.json",
    executiveCopySchema,
  ],
];

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

export async function loadCanonicalPortfolio({ env = process.env } = {}) {
  const root = configuredDataRoot(env);
  const portfolio = { content: {}, settings: {} };

  for (const [group, name, relativePath, schema] of documentManifest) {
    const value = await loadDocument(root, name, relativePath, schema);
    const [parent, child] = name.split(".");
    if (child) {
      portfolio[group][parent] ??= {};
      portfolio[group][parent][child] = value;
    } else {
      portfolio[group][name] = value;
    }
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
