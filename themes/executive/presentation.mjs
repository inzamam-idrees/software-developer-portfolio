import { projectDetailSections } from "../shared/project-detail.mjs";
import { createExecutiveView } from "./view.mjs";

export { projectDetailSections };

const professionalSocialLabels = Object.freeze({
  linkedIn: "LinkedIn",
  github: "GitHub",
  stackOverflow: "Stack Overflow",
  dev: "DEV Community",
});

export function createExecutivePresentation(portfolio) {
  const view = createExecutiveView(portfolio);
  const navigation = view.settings.navigation.items
    .filter((item) => item.enabled)
    .sort((left, right) => left.order - right.order)
    .map(({ id, label, href }) => ({ id, label, href }));
  const professionalSocials = Object.entries(professionalSocialLabels)
    .filter(([key]) => Boolean(view.social[key]))
    .map(([key, label]) => ({ key, label, href: view.social[key] }));

  return Object.freeze({
    ...view,
    navigation,
    professionalSocials,
  });
}
