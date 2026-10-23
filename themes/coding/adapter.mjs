import { projectPath } from "../../lib/portfolio/projects.mjs";
import { createCodingView } from "./view.mjs";

const legacySkillLabels = {
  JavaScript: "Javascript",
  TypeScript: "Typescript",
  "Next.js": "Next JS",
  "Node.js": "Node JS",
  "Tailwind CSS": "Tailwind",
  "Material UI": "MaterialUI",
  jQuery: "JQuery",
};

export function createCodingPresentation(portfolio) {
  const view = createCodingView(portfolio);
  return {
    view,
    copy: view.copy,
    personalData: {
      name: view.profile.name,
      profile: view.profile.image,
      designation: view.profile.designation,
      roles: view.profile.roles ?? [view.profile.designation],
      shortIntroduction: view.profile.shortIntroduction,
      displayLocation: view.displayLocation,
      contactHeading: view.contact.heading,
      contactIntroduction: view.contact.introduction,
      canonicalProfile: view.profile,
      about: view.about,
      resumeEnabled: view.settings.features.resume,
      dev: view.social.dev,
      description: view.profile.longIntroduction,
      traits: view.profile.traits,
      email: view.contact.email,
      phone: view.contact.phone,
      address: view.contact.location,
      github: view.social.github,
      facebook: view.social.facebook,
      linkedIn: view.social.linkedIn,
      twitter: view.social.x,
      stackOverflow: view.social.stackOverflow,
      leetcode: view.social.leetcode,
      devUsername: view.articles.provider.username,
      resume: view.resume.url,
    },
    projectsData: view.projects.map((project) => ({
      id: project.id,
      href: projectPath(project),
      name: project.title,
      summary: project.shortDescription || project.longDescription,
      description: project.longDescription || project.shortDescription,
      tools: project.technologies,
      role: project.role,
      code: project.links.source || "",
      demo: project.links.demo || "",
      features: project.features,
      responsibilities: project.responsibilities,
    })),
    experiences: view.experience.map((experience) => ({
      id: experience.id,
      title: experience.role,
      company: experience.company,
      location: experience.location,
      description: experience.description,
      technologies: experience.technologies,
      highlights: experience.highlights,
      duration: experience.duration,
    })),
    awards: view.awards.map(({ id, title, issuer, location, duration }) => ({
      id,
      title,
      issuer,
      location,
      duration,
    })),
    educations: view.education.map((education) => ({
      id: education.id,
      title: education.qualification,
      duration: education.duration,
      institution: education.institution,
      description: education.description,
      location: education.location,
    })),
    skillsData: view.skills.all.map(
      (skill) => legacySkillLabels[skill] || skill,
    ),
  };
}
