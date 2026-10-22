import { THEME_IDS } from "./ids.mjs";

const requiredContent = [
  "profile",
  "about",
  "projects",
  "experience",
  "education",
  "awards",
  "skills",
  "resume",
  "articles",
  "social",
  "contact",
  "settings",
];

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function mergeCopy(base, override) {
  const merged = { ...base };
  for (const [key, value] of Object.entries(override)) {
    merged[key] =
      isPlainObject(value) && isPlainObject(base[key])
        ? mergeCopy(base[key], value)
        : value;
  }
  return merged;
}

export function createThemeView(themeId, portfolio) {
  if (!THEME_IDS.includes(themeId)) {
    throw new Error(`Unknown portfolio theme: ${themeId}`);
  }
  for (const key of requiredContent) {
    if (portfolio?.[key] == null) {
      throw new Error(`Theme ${themeId} requires canonical ${key} content`);
    }
  }
  const copy = portfolio.settings.copy;
  if (!copy?.shared || !copy[themeId]) {
    throw new Error(`Theme ${themeId} requires canonical copy`);
  }
  const { copy: _allCopy, ...settings } = portfolio.settings;
  const { certificates, ...common } = portfolio;
  return Object.freeze({
    themeId,
    ...common,
    ...(themeId === "prism" ? { certificates: certificates ?? [] } : {}),
    settings,
    copy: mergeCopy(copy.shared, copy[themeId]),
  });
}
