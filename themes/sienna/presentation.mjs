import { createSiennaView } from "./view.mjs";
import { buildStats } from "./stats.mjs";
import { formatMonth } from "../../lib/portfolio/current-view.mjs";

// ── Constants ──
const SOCIAL_ORDER = ["linkedIn", "github", "x", "facebook", "dev", "stackOverflow", "leetcode"];

// ── Helpers ──
function primaryNavigation(view) {
  const disabled = new Set(
    view.settings.navigation.items.filter((item) => !item.enabled).map((item) => item.id),
  );
  const labels = view.copy.navigation.items;
  return [
    { id: "home", section: "home" },
    { id: "about", section: "about" },
    { id: "skills", section: "skills" },
    { id: "experience", section: "experience", hidden: !view.experience.length },
    { id: "projects", section: "projects", match: "/project" },
    { id: "blog", href: "/blog", match: "/blog", section: "writing", hidden: !view.settings.features.articles },
    { id: "contact", section: "contact" },
  ]
    .filter((item) => !item.hidden && !disabled.has(item.id))
    .map(({ id, section, href = `/#${section}`, match = null }) => ({ id, section, href, match, label: labels[id] }));
}

/** Featured projects first (by featuredOrder), then the rest in canonical order. */
export function orderProjects(projects) {
  const featured = projects
    .filter((project) => project.featured)
    .sort((a, b) => (a.featuredOrder ?? Infinity) - (b.featuredOrder ?? Infinity));
  const rest = projects.filter((project) => !project.featured).sort((a, b) => a.order - b.order);
  return [...featured, ...rest];
}

/**
 * Skills/Tools tabs: each copy group lists canonical category ids. Every
 * canonical skill appears exactly once; skills outside the listed categories
 * join the last group. Empty groups are dropped.
 */
export function groupSkills(skills, groups) {
  const byCategory = new Map(skills.categories.map((category) => [category.id, category.technologies]));
  const seen = new Set();
  const result = groups.map((group) => ({
    id: group.id,
    label: group.label,
    skills: group.categories.flatMap((id) => byCategory.get(id) ?? []).filter((name) => !seen.has(name) && seen.add(name)),
  }));
  const rest = skills.all.filter((name) => !seen.has(name));
  if (rest.length && result.length) result[result.length - 1].skills.push(...rest);
  return result.filter((group) => group.skills.length);
}

/** Experience period labels: "Jul 2022 – Present" (sorted by canonical order). */
export function experiencePeriods(experience, present) {
  return [...experience]
    .sort((a, b) => a.order - b.order)
    .map((item) => ({ ...item, period: [formatMonth(item.startDate), item.current || !item.endDate ? present : formatMonth(item.endDate)] }));
}

/** Hero image source: composed artwork, else a cut-out on the SVG splash, else the photo. */
export function heroPortrait(profile) {
  if (profile.heroImage) return { src: profile.heroImage, kind: "artwork" };
  if (profile.cutoutImage) return { src: profile.cutoutImage, kind: "cutout" };
  return { src: profile.image, kind: "photo" };
}

export function firstName(name) {
  return name.trim().split(/\s+/)[0];
}

// ── Presentation ──
export function createSiennaPresentation(portfolio, now = new Date()) {
  const view = createSiennaView(portfolio);
  const { profile } = view;
  return {
    ...view,
    brand: firstName(profile.name),
    navigation: primaryNavigation(view),
    portrait: heroPortrait(profile),
    stats: buildStats(view, view.copy.home.stats.items, now),
    orderedProjects: orderProjects(view.projects),
    skillGroups: groupSkills(view.skills, view.copy.home.skills.groups),
    timeline: experiencePeriods(view.experience, view.copy.home.experience.present),
    aboutImage: profile.cutoutImage || profile.image,
    aboutCutout: Boolean(profile.cutoutImage),
    resumeEnabled: view.settings.features.resume,
    year: now.getFullYear(),
    socialLinks: SOCIAL_ORDER.filter((key) => view.social[key]).map((key) => ({
      key,
      href: view.social[key],
      label: view.copy.socialLabels[key],
    })),
  };
}
