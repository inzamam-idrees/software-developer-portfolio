const detailKinds = Object.freeze(["features", "responsibilities"]);

export function projectDetailSections(project) {
  return detailKinds
    .filter((kind) => project[kind]?.length > 0)
    .map((kind) => ({ kind, items: project[kind] }));
}
