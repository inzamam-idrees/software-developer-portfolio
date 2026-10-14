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
    personalData: {
      name: view.profile.name,
      profile: view.profile.image,
      designation: view.profile.designation,
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
      name: project.title,
      description: project.longDescription || project.shortDescription,
      tools: project.technologies,
      role: project.role,
      code: project.links.source || "",
      demo: project.links.demo || "",
    })),
    experiences: view.experience.map((experience) => ({
      id: experience.id,
      title: experience.role,
      company: experience.company,
      duration: experience.duration,
    })),
    educations: view.education.map((education) => ({
      id: education.id,
      title: education.qualification,
      duration: education.duration,
      institution: education.institution,
    })),
    skillsData: view.skills.all.map(
      (skill) => legacySkillLabels[skill] || skill,
    ),
  };
}
