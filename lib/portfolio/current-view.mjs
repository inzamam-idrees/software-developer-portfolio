function formatMonth(value) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function experienceDuration(experience) {
  const end = experience.current
    ? "Present"
    : formatMonth(experience.endDate);
  return `(${formatMonth(experience.startDate)} - ${end})`;
}

function compactLocation(location) {
  const parts = location.split(",").map((part) => part.trim()).filter(Boolean);
  return parts.length > 2 ? `${parts[0]}, ${parts.at(-1)}` : location;
}

export function buildCurrentPortfolioView(portfolio) {
  const { content, settings } = portfolio;
  return {
    ...content,
    settings,
    displayLocation: compactLocation(content.profile.location),
    featuredProjects: content.projects
      .filter((project) => project.featured)
      .sort((left, right) => left.featuredOrder - right.featuredOrder),
    experience: content.experience.map((experience) => ({
      ...experience,
      duration: experienceDuration(experience),
    })),
    education: content.education.map((education) => ({
      ...education,
      duration: `${education.startYear} - ${education.endYear}`,
    })),
  };
}
