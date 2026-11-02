const monthIndex = (value) => {
  const [year, month] = value.split("-").map(Number);
  return year * 12 + (month - 1);
};

// ── Derived figures ──
// Every number shown in the stats bar is computed from canonical records.

/** Whole years from the earliest experience start to `now` (career span, gaps included). */
export function yearsOfExperience(experience, now = new Date()) {
  const starts = experience.map((item) => item.startDate).filter(Boolean);
  if (!starts.length) return 0;
  const first = Math.min(...starts.map(monthIndex));
  const current = now.getUTCFullYear() * 12 + now.getUTCMonth();
  return Math.max(0, Math.floor((current - first) / 12));
}

export function companyCount(experience) {
  return new Set(experience.map((item) => item.company.trim().toLowerCase())).size;
}

/** Stats cards in reference order; cards with no data are dropped. */
export function buildStats({ experience, projects }, labels, now = new Date()) {
  return [
    { id: "experience", icon: "award", value: yearsOfExperience(experience, now), plus: true, href: "#experience" },
    { id: "projects", icon: "check", value: projects.length, plus: false, href: "#projects" },
    { id: "companies", icon: "work", value: companyCount(experience), plus: false, href: "#experience" },
  ]
    .filter((item) => item.value > 0)
    .map((item) => ({ ...item, label: labels[item.id] }));
}
