import { getThemeDefinition, listThemes } from "./registry.mjs";

export class ThemeSelectionError extends Error {
  constructor(code) {
    super("The requested theme preview is not available");
    this.name = "ThemeSelectionError";
    this.code = code;
  }
}

export function listPreviewableThemes(themes = listThemes()) {
  return themes.filter((theme) => theme.status === "available");
}

export function resolveThemeSelection({
  settings,
  previewThemeId,
  authorized = false,
  themes,
}) {
  const activeTheme = getThemeDefinition(settings?.theme?.activeTheme);
  if (!authorized || !previewThemeId) {
    return Object.freeze({ theme: activeTheme, mode: "public" });
  }

  const candidates = themes ?? listThemes();
  const previewTheme = candidates.find((theme) => theme.id === previewThemeId);
  if (!previewTheme) {
    throw new ThemeSelectionError("INVALID_PREVIEW_THEME");
  }
  if (previewTheme.status !== "available") {
    throw new ThemeSelectionError("UNAVAILABLE_PREVIEW_THEME");
  }

  return Object.freeze({ theme: previewTheme, mode: "preview" });
}
