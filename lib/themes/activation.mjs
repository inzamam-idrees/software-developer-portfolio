import { ContentStoreError } from "../content-store/errors.mjs";
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
 * Validates a theme and records it as active through the given content store.
 */
export async function activateTheme(themeId, { store, onActivated } = {}) {
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
  if (!store) {
    throw new ThemeActivationError("STORE_UNAVAILABLE", "No content store was provided");
  }

  const settings = themeSettingsSchema.parse({ activeTheme: theme.id });
  let result;
  try {
    const { revision } = await store.read("theme");
    result = await store.write("theme", settings, {
      expectedRevision: revision,
      message: "content: update theme via admin",
    });
  } catch (error) {
    if (error instanceof ContentStoreError) {
      throw new ThemeActivationError(error.code, error.message);
    }
    throw error;
  }

  if (typeof onActivated === "function") {
    await onActivated(theme);
  }

  return {
    success: true,
    themeId: theme.id,
    label: theme.label,
    commitUrl: result.commitUrl ?? null,
    liveAfterWrite: Boolean(store.capabilities?.liveAfterWrite),
  };
}
