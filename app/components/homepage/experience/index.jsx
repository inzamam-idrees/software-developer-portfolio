// @flow strict

import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import Image from "next/image";
import { BsPersonWorkspace } from "react-icons/bs";
import GlowCard from "../../helper/glow-card";
import Expandable from "../expandable";
import SectionHeading from "../section-heading";

// ── Constants ──
const VISIBLE_HIGHLIGHTS = 3;

function Experience({ experiences, copy }) {
  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="relative z-50 border-t my-12 lg:my-24 border-[#25213b]"
    >
      <Image
        src="/section.svg"
        alt=""
        width={1572}
        height={795}
        className="absolute top-0 -z-10"
      />

      <SectionHeading id="experience-title">{copy.heading}</SectionHeading>

      <div className="py-8">
        <ol className="mx-auto flex max-w-3xl flex-col gap-6">
          {experiences.map((experience) => {
            const visible = experience.highlights.slice(0, VISIBLE_HIGHLIGHTS);
            const hidden = experience.highlights.slice(VISIBLE_HIGHLIGHTS);

            return (
              <li key={experience.id}>
                <GlowCard identifier={`experience-${experience.id}`}>
                  <article className="p-3 relative">
                    <Image
                      src="/blur-23.svg"
                      alt=""
                      width={1080}
                      height={200}
                      className="pointer-events-none absolute bottom-0 opacity-80"
                    />
                    <div className="relative flex items-start gap-x-5 sm:gap-x-8 px-3 pt-4 pb-3">
                      <div className="text-violet-500 pt-1" aria-hidden="true">
                        <BsPersonWorkspace size={32} />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-[#16f2b3] mb-1">
                          {experience.duration}
                        </p>
                        <h3 className="text-base sm:text-xl mb-1 font-semibold">
                          {experience.title}
                        </h3>
                        <p className="text-sm sm:text-base text-[#d3d8e8]">
                          {experience.company} · {experience.location}
                        </p>
                      </div>
                    </div>
                    {experience.description && <p className="relative px-3 pb-4 text-[#d3d8e8]">{experience.description}</p>}
                    {visible.length > 0 && (
                      <div className="relative pl-[4.25rem] sm:pl-[5.25rem] pr-3 pb-4 text-sm text-[#d3d8e8]" data-highlights>
                        <ul className="list-disc pl-4 space-y-2 max-w-[65ch]">
                          {visible.map((highlight) => (
                            <li key={highlight}>{highlight}</li>
                          ))}
                        </ul>
                        {hidden.length > 0 && (
                          <Expandable
                            showLabel={formatCopy(copy.showMore, { count: hidden.length })}
                            hideLabel={copy.showLess}
                          >
                            <ul className="list-disc pl-4 mt-2 space-y-2 max-w-[65ch]">
                              {hidden.map((highlight) => (
                                <li key={highlight}>{highlight}</li>
                              ))}
                            </ul>
                          </Expandable>
                        )}
                      </div>
                    )}
                    {!!experience.technologies?.length && <ul className="coding-record-tags relative px-3 pb-4">{experience.technologies.map((skill) => <li key={skill}>{skill}</li>)}</ul>}
                  </article>
                </GlowCard>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default Experience;
