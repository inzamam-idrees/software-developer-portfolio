export function buildContentNavigation(view) {
  const { features } = view.settings;
  const available = { certificates: !!view.certificates?.length, education: !!view.education.length, awards: !!view.awards.length, resume: features.resume, writing: features.articles };
  const items = [...view.settings.navigation.items].sort((a,b) => a.order - b.order);
  const navigation = items.filter((item) => item.enabled && available[item.id] !== false);
  for (const id of ['education','awards','certificates','writing','resume']) {
    if (available[id] && !items.some((item) => item.id === id)) navigation.push({ id, href: `/#${id}`, label: view.copy.contentSections.navigation[id], enabled: true, order: navigation.length + 1 });
  }
  return navigation;
}
