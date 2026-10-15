import AboutSection from "@/app/components/homepage/about";
import ContactSection from "@/app/components/homepage/contact";
import Education from "@/app/components/homepage/education";
import Experience from "@/app/components/homepage/experience";
import HeroSection from "@/app/components/homepage/hero-section";
import Projects from "@/app/components/homepage/projects";
import Skills from "@/app/components/homepage/skills";
import { getArticles } from "@/lib/articles.mjs";
import PersonJsonLd from "@/themes/shared/person-json-ld";
import { createCodingPresentation } from "./adapter.mjs";
import CodingBlogList from "./blog-list";
import CodingContactForm from "./contact-form";

export default async function CodingHome({ portfolio }) {
  const presentation = createCodingPresentation(portfolio);
  const home = presentation.copy.home;
  const result = await getArticles(presentation.personalData.devUsername);

  return (
    <>
      <PersonJsonLd portfolio={presentation.view} />
      <HeroSection
        personalData={presentation.personalData}
        skillsData={presentation.skillsData}
        copy={home.hero}
      />
      <AboutSection personalData={presentation.personalData} copy={home.about} />
      <Experience
        experiences={presentation.experiences}
        copy={home.experience}
      />
      <Skills skillsData={presentation.skillsData} copy={home.skills} />
      <Projects projectsData={presentation.projectsData} copy={home.projects} />
      <Education
        educations={presentation.educations}
        awards={presentation.awards}
        copy={home.education}
      />
      {result.articles.length > 0 && (
        <CodingBlogList
          blogs={result.articles}
          copy={presentation.copy}
        />
      )}
      <ContactSection
        personalData={presentation.personalData}
        copy={home.contact}
        form={<CodingContactForm copy={presentation.copy.contactForm} />}
      />
    </>
  );
}
