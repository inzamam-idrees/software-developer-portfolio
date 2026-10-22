// @flow strict

import { formatCopy } from '@/lib/portfolio/format-copy.mjs';
import Link from 'next/link';
import Expandable from '../expandable';

// ── Constants ──
const VISIBLE_ITEMS = 3;

function DetailList({ label, items, copy }) {
  if (!items?.length) return null;
  const visible = items.slice(0, VISIBLE_ITEMS);
  const hidden = items.slice(VISIBLE_ITEMS);

  return (
    <div data-project-detail>
      <h4 className="text-sm font-semibold text-white mb-2">{label}</h4>
      <ul className="list-disc pl-5 space-y-1 text-sm text-[#d3d8e8]">
        {visible.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {hidden.length > 0 && (
        <Expandable
          showLabel={formatCopy(copy.showMore, { count: hidden.length })}
          hideLabel={copy.showLess}
        >
          <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-[#d3d8e8]">
            {hidden.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Expandable>
      )}
    </div>
  );
}

function ProjectCard({ project, copy }) {
  return (
    <article className="from-[#0d1224] border-[#1b2c68a0] relative rounded-lg border bg-gradient-to-r to-[#0a0d37] w-full h-full flex flex-col">
      <div className="flex flex-row" aria-hidden="true">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-pink-500 to-violet-600"></div>
        <div className="h-[1px] w-full bg-gradient-to-r from-violet-600 to-transparent"></div>
      </div>
      <div className="px-4 lg:px-8 py-3 lg:py-5 relative">
        <div className="flex flex-row space-x-1 lg:space-x-2 absolute top-1/2 -translate-y-1/2" aria-hidden="true">
          <div className="h-2 w-2 lg:h-3 lg:w-3 rounded-full bg-red-400"></div>
          <div className="h-2 w-2 lg:h-3 lg:w-3 rounded-full bg-orange-400"></div>
          <div className="h-2 w-2 lg:h-3 lg:w-3 rounded-full bg-green-200"></div>
        </div>
        <h3 className="text-center px-10 text-[#16f2b3] text-base lg:text-xl">
          <Link
            href={project.href}
            className="underline-offset-4 hover:underline focus-visible:underline"
          >
            {project.name}
          </Link>
        </h3>
      </div>
      <div className="flex flex-1 flex-col gap-5 border-t-[2px] border-indigo-900 px-4 lg:px-8 py-5 lg:py-6">
        <p className="text-sm lg:text-base text-gray-100 leading-relaxed max-w-[65ch]">
          {project.summary}
        </p>

        <dl className="grid grid-cols-1 gap-3 text-sm">
          {project.role && (
            <div>
              <dt className="font-semibold text-white mb-1">{copy.role}</dt>
              <dd className="text-orange-300">{project.role}</dd>
            </div>
          )}
          {project.tools.length > 0 && (
            <div>
              <dt className="font-semibold text-white mb-2">{copy.stack}</dt>
              <dd>
                <ul className="flex flex-wrap gap-2">
                  {project.tools.map((tool) => (
                    <li
                      key={tool}
                      className="rounded border border-[#2a2e5a] bg-[#11152c] px-2 py-0.5 font-mono text-xs text-amber-300"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>

        <DetailList label={copy.features} items={project.features} copy={copy} />
        <DetailList label={copy.tasks} items={project.responsibilities} copy={copy} />

        <p className="mt-auto text-sm">
          {project.demo ? (
            <Link
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-pink-400 underline underline-offset-4 hover:text-pink-300"
            >
              {copy.demo}
            </Link>
          ) : (
            <span className="text-gray-400">
              {copy.demo}: {copy.noDemo}
            </span>
          )}
        </p>
      </div>
    </article>
  );
};

export default ProjectCard;
