import { projectDetailSections } from "../shared/project-detail.mjs";
import { createExecutiveView } from "./view.mjs";
import { buildContentNavigation } from "../shared/content-navigation.mjs";

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
    primaryHighlights: item.highlights.slice(0, 3), moreHighlights: item.highlights.slice(3),
    primaryTechnologies: item.technologies.slice(0, 8), moreTechnologies: item.technologies.slice(8),
  }));
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
