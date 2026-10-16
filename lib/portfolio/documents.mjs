import {
  cinematicCopySchema,
  codingCopySchema,
  executiveCopySchema,
  sharedCopySchema,
  spatialCopySchema,
} from "./copy-schemas.mjs";
import {
  aboutSchema,
  articlesSchema,
  awardsSchema,
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

export class UnknownDocumentError extends Error {
  constructor() {
    super("Unknown portfolio document");
    this.name = "UnknownDocumentError";
    this.code = "UNKNOWN_DOCUMENT";
  }
}

function contentDocument(id, label, schema) {
  return {
    id,
    name: id,
    group: "content",
    label,
    path: `content/${id}.json`,
    schema,
    canonicalPath: ["content", id],
  };
}

function settingsDocument(id, label, schema) {
  return {
    id,
    name: id,
    group: "settings",
    label,
    path: `settings/${id}.json`,
    schema,
    canonicalPath: ["settings", id],
  };
}

function copyDocument(key, label, schema) {
  return {
    id: `copy-${key}`,
    name: `copy.${key}`,
    group: "copy",
    label,
    path: `settings/copy/${key}.json`,
    schema,
    canonicalPath: ["settings", "copy", key],
  };
}

// ── Canonical documents, in load and display order ──
export const documentRegistry = Object.freeze(
  [
    contentDocument("profile", "Profile", profileSchema),
    contentDocument("about", "About", aboutSchema),
    contentDocument("projects", "Projects", projectsSchema),
    contentDocument("experience", "Experience", experiencesSchema),
    contentDocument("education", "Education", educationsSchema),
    contentDocument("awards", "Awards", awardsSchema),
    contentDocument("skills", "Skills", skillsSchema),
    contentDocument("resume", "Resume", resumeSchema),
    contentDocument("articles", "Articles", articlesSchema),
    contentDocument("social", "Social links", socialSchema),
    contentDocument("contact", "Contact", contactSchema),
    settingsDocument("site", "Site", siteSettingsSchema),
    settingsDocument("navigation", "Navigation", navigationSettingsSchema),
    settingsDocument("features", "Features", featureSettingsSchema),
    settingsDocument("theme", "Active theme", themeSettingsSchema),
    settingsDocument("seo", "SEO", seoSettingsSchema),
    copyDocument("shared", "Shared copy", sharedCopySchema),
    copyDocument("coding", "Coding theme copy", codingCopySchema),
    copyDocument("cinematic", "Cinematic theme copy", cinematicCopySchema),
    copyDocument("executive", "Executive theme copy", executiveCopySchema),
    copyDocument("spatial", "Spatial theme copy", spatialCopySchema),
  ].map((definition) => Object.freeze(definition)),
);

const definitionsById = new Map(
  documentRegistry.map((definition) => [definition.id, definition]),
);

export function getDocumentDefinition(id) {
  const definition = typeof id === "string" ? definitionsById.get(id) : null;
  if (!definition) throw new UnknownDocumentError();
  return definition;
}

export function assignDocument(portfolio, definition, value) {
  const [group, ...rest] = definition.canonicalPath;
  let target = portfolio[group];
  for (const key of rest.slice(0, -1)) {
    target[key] ??= {};
    target = target[key];
  }
  target[rest.at(-1)] = value;
}

export function documentForCanonicalPath(segments) {
  return documentRegistry
    .filter((definition) =>
      definition.canonicalPath.every((part, index) => segments[index] === part),
    )
    .sort((left, right) => right.canonicalPath.length - left.canonicalPath.length)[0];
}
