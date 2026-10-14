import ProjectCard from "@/app/components/homepage/projects/project-card";
import { createCodingPresentation } from "./adapter.mjs";

export default function CodingProjects({ portfolio }) {
  const { projectsData } = createCodingPresentation(portfolio);

  return (
    <section className="relative z-50 py-8" aria-labelledby="projects-title">
      <div className="flex justify-center my-5 lg:py-8">
        <div className="flex items-center">
          <span className="w-12 sm:w-24 h-[2px] bg-[#1a1443]" />
        <h1
          id="projects-title"
            className="bg-[#1a1443] w-fit whitespace-nowrap text-white p-2 px-5 text-xl sm:text-2xl rounded-md"
        >
            All Projects
        </h1>
          <span className="w-12 sm:w-24 h-[2px] bg-[#1a1443]" />
        </div>
      </div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5 lg:gap-8 xl:gap-10"
        data-coding-project-grid="true"
      >
        {projectsData.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
