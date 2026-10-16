import SkillsExplorer from "../client/skills-explorer";
import ModelPlan from "./model-plan";

export default function Skills({ view }) {
  const copy = view.copy.home.skills;
  return (
    <section
      className="spatial-section spatial-field"
      id="skills"
      aria-labelledby="spatial-skills-title"
    >
      <div className="spatial-frame">
        <div className="spatial-section-head">
          <h2 id="spatial-skills-title" className="spatial-section-title">
            {copy.heading}
          </h2>
          <p>{copy.intro}</p>
        </div>
        <div className="spatial-slot spatial-slot-skills" data-spatial-slot="skills" aria-hidden="true">
          <ModelPlan graph={view.graph} label={copy.heading} />
        </div>
        <SkillsExplorer
          skillGroups={view.skillGroups}
          unmatchedTechnologies={view.unmatchedTechnologies}
          projects={view.projects.map(({ id, title }) => ({ id, title }))}
          experience={view.experience.map(({ id, role, company }) => ({ id, role, company }))}
          copy={copy}
        />
      </div>
    </section>
  );
}
