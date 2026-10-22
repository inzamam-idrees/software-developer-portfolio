import { formatCopy } from "../portfolio/format-copy.mjs";
import { projectPath } from "../portfolio/projects.mjs";
import { getSiteOrigin } from "../site-origin.mjs";

function link(label, path, origin) {
  return `[${label}](${origin ? new URL(path, origin).href : path})`;
}

function oneLine(text) {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Builds /llms.txt (llmstxt.org format) from canonical content only. It is an
 * optional map for non-Google AI tools; Google Search ignores it.
 */
export function buildLlmsText(portfolio, origin = getSiteOrigin()) {
  const { profile, about, projects, social, contact, settings } = portfolio;
  const copy = settings.copy.shared;
  const route = (template) =>
    formatCopy(template, { siteName: settings.site.name });
  const ordered = [...projects].sort((left, right) => left.order - right.order);

  const lines = [
    `# ${profile.name}`,
    "",
    `> ${oneLine(settings.seo.description)}`,
    "",
    oneLine(about.personalStatement),
    "",
    `## ${copy.llms.pagesHeading}`,
    "",
    `- ${link(settings.seo.title, "/", origin)}: ${copy.llms.homePage}`,
    `- ${link(route(copy.routes.projectsTitle), "/project", origin)}: ${oneLine(settings.seo.pages.projects.description)}`,
    `- ${link(route(copy.routes.blogTitle), "/blog", origin)}: ${oneLine(settings.seo.pages.blog.description)}`,
    "",
    `## ${copy.llms.projectsHeading}`,
    "",
    ...ordered.map(
      (project) =>
        `- ${link(project.title, projectPath(project), origin)}: ${oneLine(project.shortDescription)} (${project.technologies.join(", ")})`,
    ),
    "",
    `## ${copy.llms.profilesHeading}`,
    "",
    ...Object.entries(social)
      .filter(([, url]) => url)
      .map(([id, url]) => `- [${copy.socialLabels[id] ?? id}](${url})`),
    "",
    `## ${copy.llms.contactHeading}`,
    "",
    `- ${copy.llms.emailLabel}: ${contact.email}`,
    "",
  ];
  return lines.join("\n");
}
