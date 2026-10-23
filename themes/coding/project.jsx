import Link from "next/link";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { createCodingView } from "./view.mjs";

// ── Building blocks ──
function Block({ label, children }) {
  return (
    <section>
      <h2 className="mb-2 font-mono text-sm font-semibold uppercase tracking-wider text-[#16f2b3]">
        {label}
      </h2>
      {children}
    </section>
  );
}

function BulletList({ items }) {
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-[#d3d8e8] lg:text-base">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

const linkClass =
  "font-semibold text-pink-400 underline underline-offset-4 hover:text-pink-300";

export default function CodingProject({ portfolio, project }) {
  const { copy } = createCodingView(portfolio);
  const story = [
    [copy.project.problem, project.problem],
    [copy.project.solution, project.solution],
    [copy.project.outcome, project.outcome],
  ].filter(([, value]) => value);
  const { demo, source } = project.links;

  return (
    <article className="relative z-50 py-8 lg:py-12">
      <Link href="/project" className={`text-sm ${linkClass}`}>
        {copy.projectDetail.backToProjects}
      </Link>

      <header className="my-6 lg:my-10">
        {project.category && (
          <p className="font-mono text-xs uppercase tracking-wider text-amber-300">
            {project.category}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-bold text-white lg:text-5xl">
          {project.title}
        </h1>
        <p className="mt-3 text-orange-300">
          <span className="font-semibold text-white">{copy.projects.role}: </span>
          {project.role}
        </p>
        <p className="mt-4 max-w-[65ch] leading-relaxed text-gray-100 lg:text-lg">
          {project.shortDescription}
        </p>
      </header>

      <div className="rounded-lg border border-[#1b2c68a0] bg-gradient-to-r from-[#0d1224] to-[#0a0d37]">
        <div className="flex flex-row" aria-hidden="true">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-pink-500 to-violet-600"></div>
          <div className="h-[1px] w-full bg-gradient-to-r from-violet-600 to-transparent"></div>
        </div>
        <div className="flex flex-col gap-8 px-4 py-6 lg:px-8 lg:py-8">
          {project.longDescription && (
            <Block label={copy.projectDetail.overview}>
              <p className="max-w-[65ch] leading-relaxed text-gray-100">
                {project.longDescription}
              </p>
            </Block>
          )}

          {story.length > 0 && (
            <div className="grid gap-6 md:grid-cols-3">
              {story.map(([label, value]) => (
                <Block key={label} label={label}>
                  <p className="text-sm leading-relaxed text-gray-100 lg:text-base">{value}</p>
                </Block>
              ))}
            </div>
          )}

          {project.features.length > 0 && (
            <Block label={copy.projects.features}>
              <BulletList items={project.features} />
            </Block>
          )}

          {project.responsibilities.length > 0 && (
            <Block label={copy.projects.tasks}>
              <BulletList items={project.responsibilities} />
            </Block>
          )}

          <Block label={copy.projects.stack}>
            <ul
              className="flex flex-wrap gap-2"
              aria-label={formatCopy(copy.projects.technologiesLabel, { title: project.title })}
            >
              {project.technologies.map((technology) => (
                <li
                  key={technology}
                  className="rounded border border-[#2a2e5a] bg-[#11152c] px-2 py-0.5 font-mono text-xs text-amber-300"
                >
                  {technology}
                </li>
              ))}
            </ul>
          </Block>

          {(demo || source) && (
            <p className="flex flex-wrap gap-6 text-sm">
              {demo && (
                <a href={demo} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {copy.projects.demo}
                </a>
              )}
              {source && (
                <a href={source} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {copy.project.source}
                </a>
              )}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
