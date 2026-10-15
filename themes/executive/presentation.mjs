import { projectDetailSections } from "../shared/project-detail.mjs";
import { createExecutiveView } from "./view.mjs";

export { projectDetailSections };

const professionalSocialKeys = Object.freeze([
  "linkedIn",
  "github",
  "stackOverflow",
  "dev",
]);

const linkLabelKeys = Object.freeze({
  demo: "viewProject",
  source: "viewSource",
});

export function projectLinkLabel(kind, labels) {
  return labels[linkLabelKeys[kind]] ?? kind;
}

function monogramOf(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .join("");
}

export function createExecutivePresentation(portfolio) {
  const view = createExecutiveView(portfolio);
  const navigation = view.settings.navigation.items
    .filter((item) => item.enabled)
    .sort((left, right) => left.order - right.order)
    .map(({ id, label, href }) => ({ id, label, href }));
  const professionalSocials = professionalSocialKeys
    .filter((key) => Boolean(view.social[key]))
    .map((key) => ({
      key,
      label: view.copy.socialLabels[key],
      href: view.social[key],
    }));

  return Object.freeze({
    ...view,
    navigation,
    professionalSocials,
    monogram: monogramOf(view.profile.name),
  });
}
