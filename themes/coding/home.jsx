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
  const result = await getArticles(presentation.personalData.devUsername);

  return (
    <>
      <PersonJsonLd portfolio={presentation.view} />
      <HeroSection
        personalData={presentation.personalData}
        skillsData={presentation.skillsData}
      />
      <AboutSection personalData={presentation.personalData} />
      <Experience experiences={presentation.experiences} />
      <Skills skillsData={presentation.skillsData} />
      <Projects projectsData={presentation.projectsData} />
      <Education
        educations={presentation.educations}
        awards={presentation.awards}
      />
      {result.articles.length > 0 && (
        <CodingBlogList blogs={result.articles} />
      )}
      <ContactSection
        personalData={presentation.personalData}
        form={<CodingContactForm />}
      />
    </>
  );
}
