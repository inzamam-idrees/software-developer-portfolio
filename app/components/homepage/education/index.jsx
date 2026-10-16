// @flow strict
import Image from "next/image";
import { BsMortarboard, BsTrophy } from "react-icons/bs";
import GlowCard from "../../helper/glow-card";
import SectionHeading from "../section-heading";

function TimelineCard({ identifier, icon, duration, title, subtitle, ...rest }) {
  return (
    <li>
      <GlowCard identifier={identifier}>
        <article className="p-3 relative text-white" {...rest}>
          <div className="flex items-start gap-x-5 px-3 py-4">
            <div className="text-violet-500 pt-1" aria-hidden="true">
              {icon}
            </div>
            <div>
              <p className="text-xs sm:text-sm text-[#16f2b3] mb-1">{duration}</p>
              <h4 className="text-base sm:text-lg mb-1 font-semibold">{title}</h4>
              <p className="text-sm sm:text-base text-[#d3d8e8]">{subtitle}</p>
            </div>
          </div>
        </article>
      </GlowCard>
    </li>
  );
}

function Education({ educations, awards = [], copy }) {
  return (
    <section
      id="education"
      aria-labelledby="education-title"
      className="relative z-50 border-t my-12 lg:my-24 border-[#25213b]"
    >
      <Image
        src="/section.svg"
        alt=""
        width={1572}
        height={795}
        className="absolute top-0 -z-10"
      />
      <div className="flex justify-center -translate-y-[1px]">
        <div className="w-3/4">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent  w-full" />
        </div>
      </div>

      <SectionHeading id="education-title">{copy.heading}</SectionHeading>

      <div
        className={`py-8 grid grid-cols-1 gap-10 lg:gap-16 ${
          awards.length > 0 ? "lg:grid-cols-2" : "max-w-3xl mx-auto"
        }`}
      >
        <div aria-labelledby="degrees-title">
          <h3 id="degrees-title" className="text-[#16f2b3] text-lg font-medium mb-5">
            {copy.degreesHeading}
          </h3>
          <ol className="flex flex-col gap-5">
            {educations.map((education) => (
              <TimelineCard
                key={education.id}
                identifier={`education-${education.id}`}
                icon={<BsMortarboard size={30} />}
                duration={education.duration}
                title={education.title}
                subtitle={education.institution}
              />
            ))}
          </ol>
        </div>

        {awards.length > 0 && (
          <div aria-labelledby="awards-title">
            <h3 id="awards-title" className="text-[#16f2b3] text-lg font-medium mb-5">
              {copy.awardsHeading}
            </h3>
            <ol className="flex flex-col gap-5">
              {awards.map((award) => (
                <TimelineCard
                  key={`award-${award.id}`}
                  identifier={`award-${award.id}`}
                  icon={<BsTrophy size={30} />}
                  duration={award.duration}
                  title={award.title}
                  subtitle={award.issuer}
                  data-award
                />
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
};

export default Education;
