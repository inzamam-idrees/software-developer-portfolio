import SkillLevel from "@/themes/shared/skill-level";
import ChapterHeading from "../ui/chapter-heading";
export default function Expertise({ skills, copy, additionalLabel, proficiencyTemplate }) {
  const categorized = new Set(skills.categories.flatMap((group) => group.technologies));
  const additionalSkills = skills.all.filter((skill) => !categorized.has(skill));
  return (
    <section
      id="skills"
      className="chapter container"
      aria-labelledby="skills-heading"
    >
      <ChapterHeading
        id="skills"
        number="03"
        label={copy.label}
        title={copy.heading}
        description={copy.description}
      />
      <div className="capability-list">
        {skills.categories.map((group, index) => (
          <article key={group.id} data-reveal>
            <span className="capability-number">0{index + 1}</span>
            <div>
              <p className="eyebrow capability-domain">{group.label}</p>
              <h3>{group.title}</h3>
              <p className="body-copy">{group.summary}</p>
            </div>
            <ul className="technology-list">
              {group.technologies.map((t) => (
                <li key={t}>{t}<SkillLevel name={t} proficiency={skills.proficiency} template={proficiencyTemplate} /></li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      {additionalSkills.length > 0 && (
        <div className="additional-capabilities">
          <h3 className="eyebrow accent">{additionalLabel}</h3>
          <ul className="technology-list">
            {additionalSkills.map((skill) => <li key={skill}>{skill}<SkillLevel name={skill} proficiency={skills.proficiency} template={proficiencyTemplate} /></li>)}
          </ul>
        </div>
      )}
    </section>
  );
}
