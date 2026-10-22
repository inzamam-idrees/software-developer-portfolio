import { createPrismView } from "./view.mjs";

export function createPrismPresentation(portfolio) {
  const view = createPrismView(portfolio);
  const seen = new Set();
  const skillGroups = view.skills.categories.map((group) => ({
    ...group,
    technologies: group.technologies.filter((name) => {
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    }),
  }));
  const unmatched = view.skills.all.filter((name) => !seen.has(name));
  if (unmatched.length) skillGroups.push({
    id: "additional", title: view.copy.home.skills.additional,
    summary: "", technologies: unmatched,
  });
  const navigation = ["about", "skills", "projects", "experience", "certificates", "writing", "resume", "contact"]
    .filter((id) => id !== "certificates" || view.certificates.length)
    .filter((id) => id !== "writing" || view.settings.features.articles)
    .filter((id) => id !== "resume" || view.settings.features.resume)
    .map((id) => ({ id, href: `/#${id}`, label: view.copy.navigation.items[id] }));
  return {
    ...view, skillGroups, navigation,
    monogram: view.profile.name.split(/\s+/).map((word) => word[0]).join(""),
    roles: view.profile.roles ?? [view.profile.designation],
    portraitBadges: [view.profile.experienceLabel, view.profile.focusLabel],
    socialLinks: ["github", "linkedIn", "dev", "stackOverflow"]
      .filter((key) => view.social[key])
      .map((key) => ({ key, href: view.social[key], label: view.copy.socialLabels[key] })),
  };
}
