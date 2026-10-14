import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { configuredDataRoot } from "../portfolio/loader.mjs";
import { themeSettingsSchema } from "../portfolio/schemas.mjs";
import { getThemeDefinition } from "./registry.mjs";

export class ThemeActivationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ThemeActivationError";
    this.code = code;
  }
}

/**
 * Validates and atomically updates the active portfolio theme.
 */
export async function activateTheme(
  themeId,
  { env = process.env, onActivated } = {},
) {
  let theme;
  try {
    theme = getThemeDefinition(themeId);
  } catch {
    throw new ThemeActivationError(
      "INVALID_THEME",
      `Unknown portfolio theme: ${themeId}`,
    );
  }

  if (theme.status !== "available") {
    throw new ThemeActivationError(
      "UNAVAILABLE_THEME",
      `Theme ${themeId} is not available for activation`,
    );
  }

  const validatedSettings = themeSettingsSchema.parse({
    activeTheme: theme.id,
  });

  const root = configuredDataRoot(env);
  const settingsDir = path.join(root, "settings");
  await mkdir(settingsDir, { recursive: true });

  const targetPath = path.join(settingsDir, "theme.json");
  const tempPath = path.join(
    settingsDir,
    `theme.json.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`,
  );

  const payload = JSON.stringify(validatedSettings, null, 2) + "\n";
  await writeFile(tempPath, payload, "utf8");
  await rename(tempPath, targetPath);

  if (typeof onActivated === "function") {
    await onActivated(theme);
  }

  return { success: true, themeId: theme.id, label: theme.label };
}
