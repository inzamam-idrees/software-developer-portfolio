import { THEME_IDS } from "./ids.mjs";

export const THEME_SLOTS = Object.freeze([
  "shell",
  "home",
  "projects",
  "project",
  "blog",
]);

export function createThemeDefinition({ id, label, status, loaders }) {
  if (!/^[a-z][a-z0-9-]*$/.test(id)) {
    throw new Error(`Invalid theme ID: ${id}`);
  }
  if (typeof label !== "string" || !label.trim()) {
    throw new Error(`Invalid theme label: ${id}`);
  }
  if (!["available", "architecture-ready"].includes(status)) {
    throw new Error(`Invalid theme status: ${id}`);
  }
  for (const slot of THEME_SLOTS) {
    if (typeof loaders?.[slot] !== "function") {
      throw new Error(`Theme ${id} is missing the ${slot} loader`);
    }
  }
  const extraSlots = Object.keys(loaders).filter(
    (slot) => !THEME_SLOTS.includes(slot),
  );
  if (extraSlots.length) {
    throw new Error(
      `Theme ${id} has unsupported loaders: ${extraSlots.join(", ")}`,
    );
  }
  return Object.freeze({
    id,
    label: label.trim(),
    status,
    loaders: Object.freeze({ ...loaders }),
  });
}

const themes = Object.freeze([
  createThemeDefinition({
    id: "coding",
    label: "Coding",
    status: "available",
    loaders: {
      shell: () => import("../../themes/coding/shell.jsx"),
      home: () => import("../../themes/coding/home.jsx"),
      projects: () => import("../../themes/coding/projects.jsx"),
      project: () => import("../../themes/coding/project.jsx"),
      blog: () => import("../../themes/coding/blog.jsx"),
    },
  }),
  createThemeDefinition({
    id: "cinematic",
    label: "Cinematic",
    status: "available",
    loaders: {
      shell: () => import("../../themes/cinematic/shell.jsx"),
      home: () => import("../../themes/cinematic/home.jsx"),
      projects: () => import("../../themes/cinematic/projects.jsx"),
      project: () => import("../../themes/cinematic/project.jsx"),
      blog: () => import("../../themes/cinematic/blog.jsx"),
    },
  }),
  createThemeDefinition({
    id: "executive",
    label: "Executive",
    status: "available",
    loaders: {
      shell: () => import("../../themes/executive/shell.jsx"),
      home: () => import("../../themes/executive/home.jsx"),
      projects: () => import("../../themes/executive/projects.jsx"),
      project: () => import("../../themes/executive/project.jsx"),
      blog: () => import("../../themes/executive/blog.jsx"),
    },
  }),
  createThemeDefinition({
    id: "spatial",
    label: "Spatial",
    status: "available",
    loaders: {
      shell: () => import("../../themes/spatial/shell.jsx"),
      home: () => import("../../themes/spatial/home.jsx"),
      projects: () => import("../../themes/spatial/projects.jsx"),
      project: () => import("../../themes/spatial/project.jsx"),
      blog: () => import("../../themes/spatial/blog.jsx"),
    },
  }),
  createThemeDefinition({
    id: "prism", label: "Prism", status: "available",
    loaders: {
      shell: () => import("../../themes/prism/shell.jsx"),
      home: () => import("../../themes/prism/home.jsx"),
      projects: () => import("../../themes/prism/projects.jsx"),
      project: () => import("../../themes/prism/project.jsx"),
      blog: () => import("../../themes/prism/blog.jsx"),
    },
  }),
]);

if (themes.some((theme, index) => theme.id !== THEME_IDS[index])) {
  throw new Error("Theme registry order must match THEME_IDS");
}

const themeById = new Map(themes.map((theme) => [theme.id, theme]));

export function listThemes() {
  return [...themes];
}

export function getThemeDefinition(id) {
  const theme = themeById.get(id);
  if (!theme) throw new Error(`Unknown portfolio theme: ${id}`);
  return theme;
}

export function resolveActiveTheme(settings) {
  return getThemeDefinition(settings?.theme?.activeTheme);
}

export async function loadThemeSlot(settings, slot) {
  if (!THEME_SLOTS.includes(slot)) {
    throw new Error(`Unknown theme slot: ${slot}`);
  }
  return resolveActiveTheme(settings).loaders[slot]();
}

export async function loadSelectedThemeSlot(theme, slot) {
  if (!THEME_SLOTS.includes(slot)) {
    throw new Error(`Unknown theme slot: ${slot}`);
  }
  return theme.loaders[slot]();
}
