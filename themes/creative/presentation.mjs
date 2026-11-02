import { createCreativeView } from "./view.mjs";
import { buildContentNavigation } from "../shared/content-navigation.mjs";

// ── Helpers ──
const skillKey = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

function primaryNavigation(view) {
  const disabled = new Set(
    view.settings.navigation.items.filter((item) => !item.enabled).map((item) => item.id),
  );
  const labels = view.copy.navigation.items;
  return [
    { id: "home", href: "/" },
    { id: "about", href: "/#about" },
    { id: "projects", href: "/#projects", match: "/project" },
    { id: "blog", href: "/blog", match: "/blog", section: "writing", hidden: !view.settings.features.articles },
    { id: "contact", href: "/#contact" },
  ]
    .filter((item) => !item.hidden && !disabled.has(item.id))
    .map(({ id, href, match = href === "/" ? "/" : null, section = href.startsWith("/#") ? href.slice(2) : null }) => ({ id, href, match, section, label: labels[id] }));
}

function skillGroups(view) {
  const seen = new Set();
  const groups = view.skills.categories.map((group) => ({
    ...group,
    technologies: group.technologies.filter((name) => !seen.has(name) && seen.add(name)),
  }));
  const rest = view.skills.all.filter((name) => !seen.has(name));
  if (rest.length) groups.push({ id: "additional", label: view.copy.contentSections.skillsAdditional, title: "", summary: "", technologies: rest });
  return groups.filter((group) => group.technologies.length);
}

// The strip prefers the copy's order but only shows canonical skills.
function stripTechnologies(view) {
  const canonical = new Map(view.skills.all.map((name) => [skillKey(name), name]));
  const preferred = view.copy.home.technologies.items
    .map((name) => canonical.get(skillKey(name)))
    .filter(Boolean);
  const fallback = [...view.skills.featured, ...view.skills.all].filter((name) => !preferred.includes(name));
  return [...new Set([...preferred, ...fallback])].slice(0, 6);
}

// ── Presentation ──
export function createCreativePresentation(portfolio) {
  const view = createCreativeView(portfolio);
  const featured = view.featuredProjects.length ? view.featuredProjects : view.projects;
  return {
    ...view,
    navigation: primaryNavigation(view),
    sectionNavigation: buildContentNavigation(view),
    skillGroups: skillGroups(view),
    technologies: stripTechnologies(view),
    homeProjects: featured.slice(0, 3),
    resumeEnabled: view.settings.features.resume,
    socialLinks: ["github", "linkedIn", "dev", "stackOverflow", "x"]
      .filter((key) => view.social[key])
      .map((key) => ({ key, href: view.social[key], label: view.copy.socialLabels[key] })),
  };
}
