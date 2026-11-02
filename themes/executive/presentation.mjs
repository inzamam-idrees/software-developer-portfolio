import { projectDetailSections } from "../shared/project-detail.mjs";
import { createExecutiveView } from "./view.mjs";
import { buildContentNavigation } from "../shared/content-navigation.mjs";
import { techIcon } from "./tech-icons.mjs";

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

function suspiciousCredential(value) {
  let decoded = value || "";
  try { decoded = decodeURIComponent(decoded); } catch {}
  return /xyz[\s_-]*123|example|todo|lorem|placeholder/i.test(decoded);
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
  // Preserve the record's facts; placeholder credential metadata is never presented.
  const usableCertificates = view.certificates.filter((item) => [item.title, item.issuer].every((value) => value?.trim() && !value.trim().startsWith("[TODO:")));
  const suppressedCertificateCredentials = usableCertificates.filter((item) => suspiciousCredential(item.credentialId) || suspiciousCredential(item.credentialUrl));
  const certificates = usableCertificates.map((item) => suppressedCertificateCredentials.includes(item) ? { ...item, credentialId: null, credentialUrl: null } : item);
  const hiddenCertificates = view.certificates.filter((item) => !usableCertificates.includes(item));
  const verifiedCertificateCount = certificates.filter((item) => item.status === "verified").length;
  const proofEmployers = [...new Set(view.experience.map((item) => item.company).filter(Boolean))];
  const seen = new Set();
  const navigation = buildContentNavigation({ ...view, certificates }).map((item) =>
    ["about", "education", "awards"].includes(item.id)
      ? { ...item, id: "background", href: "/#background", label: view.copy.home.background.heading }
      : item,
  ).filter((item) => { if (seen.has(item.id)) return false; seen.add(item.id); return true; });
  const introduction = view.profile.shortIntroduction?.trim() || view.profile.longIntroduction;
  const positioning = [...new Intl.Segmenter("en", { granularity: "sentence" }).segment(introduction)].slice(0, 2).map(({ segment }) => segment.trim()).join(" ");
  const experience = view.experience.map((item) => ({ ...item,
    impact: typeof item.outcome === "string" && item.outcome.trim() ? item.outcome : null,
    primaryHighlights: item.highlights.slice(0, 2), moreHighlights: item.highlights.slice(2),
    primaryTechnologies: item.technologies.slice(0, 8), moreTechnologies: item.technologies.slice(8),
  }));
  const professionalSocials = professionalSocialKeys
    .filter((key) => Boolean(view.social[key]))
    .map((key) => ({
      key,
      label: view.copy.socialLabels[key],
      href: view.social[key],
    }));

  const nav = view.copy.navigation;
  const features = view.settings.features;
  const siteNavigation = [
    ["hero", nav.home, true],
    ["about", nav.about, Boolean(view.about?.summary || view.profile.longIntroduction)],
    ["experience", nav.experience, view.experience.length > 0],
    ["projects", nav.projects, view.featuredProjects.length > 0],
    ["skills", nav.skills, view.skills.categories.length > 0],
    ["education", nav.education, view.education.length > 0],
    ["awards", nav.awards, view.awards.length > 0],
    ["writing", nav.blog, features.articles],
    ["contact", nav.contact, true],
  ].filter(([, , shown]) => shown).map(([id, label]) => ({ id, label, href: `/#${id}` }));
  const stats = [
    [view.copy.home.brief.experience, view.profile.experienceLabel],
    [view.copy.home.stats.projects, view.projects.length ? String(view.projects.length) : null],
    [view.copy.home.stats.technologies, view.skills.all.length ? String(view.skills.all.length) : null],
    [view.copy.home.stats.certifications, certificates.length ? String(certificates.length) : null],
  ].filter(([, value]) => value).map(([label, value]) => ({ label, value }));
  const abbreviate = (name) => {
    const words = name.split(/[^A-Za-z0-9]+/).filter(Boolean);
    return (words.length > 1 ? words.map((word) => word[0]).join("").slice(0, 3) : name.slice(0, 2)).replace(/^./, (char) => char.toUpperCase());
  };
  const withIcon = (name, label) => { const icon = techIcon(name); return icon ? { name, label, icon, abbreviation: abbreviate(name) } : null; };
  const tilePool = view.skills.categories.map((category) => category.technologies.map((name) => withIcon(name, category.label)).filter(Boolean));
  const skillTiles = [];
  for (let index = 0; skillTiles.length < 12 && tilePool.some((list) => index < list.length); index += 1) {
    for (const list of tilePool) if (list[index] && skillTiles.length < 12) skillTiles.push(list[index]);
  }
  const tiled = new Set(skillTiles.map((tile) => tile.name));
  const skillMarquee = tilePool.flat().filter((tile) => !tiled.has(tile.name));
  const codeLabels = view.copy.home.codeCard;
  const codeLines = [
    [codeLabels.experience, view.profile.experienceLabel],
    [codeLabels.focus, view.profile.focusLabel],
    [codeLabels.roles, view.profile.roles.join(" / ")],
    [codeLabels.stack, view.skills.featured.join(", ")],
    [codeLabels.location, view.displayLocation],
  ].filter(([, value]) => value);
  const sentences = [...new Intl.Segmenter("en", { granularity: "sentence" }).segment(view.profile.longIntroduction)].map(({ segment }) => segment.trim()).filter(Boolean);
  const aboutLead = sentences.slice(0, 2).join(" ");
  const aboutMore = sentences.slice(2).join(" ");
  const currentRole = experience.find((item) => item.current) ?? experience[0] ?? null;

  return Object.freeze({
    ...view,
    navigation,
    siteNavigation,
    stats,
    aboutLead,
    aboutMore,
    skillTiles,
    skillMarquee,
    codeLines,
    currentRole,
    certificates,
    hiddenCertificates,
    suppressedCertificateCredentials,
    verifiedCertificateCount,
    proofEmployers,
    proofStack: view.skills.featured,
    experience,
    positioning,
    professionalSocials,
    monogram: monogramOf(view.profile.name),
  });
}
