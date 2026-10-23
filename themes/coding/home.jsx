import AboutSection from "@/app/components/homepage/about";
import ContactSection from "@/app/components/homepage/contact";
import Education from "@/app/components/homepage/education";
import Experience from "@/app/components/homepage/experience";
import HeroSection from "@/app/components/homepage/hero-section";
import Projects from "@/app/components/homepage/projects";
import Skills from "@/app/components/homepage/skills";
import { getArticles } from "@/lib/articles.mjs";
import { createCodingPresentation } from "./adapter.mjs";
import CodingBlogList from "./blog-list";
import CodingContactForm from "./contact-form";
import Certificates from "../shared/certificates";
import Resume from "../shared/resume";

export default async function CodingHome({ portfolio }) {
  const presentation = createCodingPresentation(portfolio);
  const home = presentation.copy.home;
  const view = presentation.view;
  const result = view.settings.features.articles ? await getArticles(presentation.personalData.devUsername) : null;

  return (
    <>
      <HeroSection
        personalData={presentation.personalData}
        skillsData={presentation.skillsData}
        copy={home.hero}
        rolesLabel={view.copy.contentSections.roles}
        socialLabels={presentation.copy.socialLabels}
      />
      <AboutSection personalData={presentation.personalData} copy={home.about} />
      <Experience
        experiences={presentation.experiences}
        copy={home.experience}
      />
      <Skills skillsData={presentation.skillsData} skills={view.skills} proficiencyTemplate={view.copy.contentSections.proficiency} copy={home.skills} />
      <Projects
        projectsData={presentation.projectsData}
        copy={home.projects}
        cardCopy={presentation.copy.projects}
      />
      <Education
        educations={presentation.educations}
        awards={presentation.awards}
        copy={home.education}
      />
      <Certificates items={view.certificates} copy={view.copy.contentSections.certificates} theme="coding" />
      {result && <section id="writing" aria-label={view.copy.contentSections.navigation.writing}>
        {result.articles.length ? <CodingBlogList blogs={result.articles.slice(0, 3)} copy={presentation.copy} /> : <div className="portfolio-content-section"><h2>{view.copy.blog.emptyHeading}</h2><p>{result.status === "empty" ? view.copy.blog.empty : view.copy.blog.unavailable}</p>{view.social.dev && <a className="portfolio-content-action" href={view.social.dev} target="_blank" rel="noreferrer">{view.copy.blog.profileAction}</a>}</div>}
      </section>}
      {view.settings.features.resume && <Resume resume={view.resume} copy={view.copy.contentSections.resume} theme="coding" />}
      <ContactSection
        personalData={presentation.personalData}
        copy={home.contact}
        socialLabels={presentation.copy.socialLabels}
        form={view.settings.features.contactForm && view.contact.form.enabled ? <CodingContactForm copy={presentation.copy.contactForm} /> : null}
      />
    </>
  );
}
