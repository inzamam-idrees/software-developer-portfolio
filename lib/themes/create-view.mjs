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

export function createThemeView(themeId, portfolio) {
  if (!THEME_IDS.includes(themeId)) {
    throw new Error(`Unknown portfolio theme: ${themeId}`);
  }
  for (const key of requiredContent) {
    if (portfolio?.[key] == null) {
      throw new Error(`Theme ${themeId} requires canonical ${key} content`);
    }
  }
  return Object.freeze({ themeId, ...portfolio });
}
