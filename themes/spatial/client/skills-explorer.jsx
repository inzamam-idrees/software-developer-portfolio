"use client";
import { useEffect, useState } from "react";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { useSelection } from "./selection";
import SkillLevel from "../../shared/skill-level";

function Technology({ technology, interactive, selectedId, select }) {
  if (!interactive) {
    return <span className="spatial-chip">{technology.label}</span>;
  }
  const pressed = selectedId === technology.nodeId;
  return (
    <button
      type="button"
      className="spatial-chip"
      aria-pressed={pressed}
      onClick={() => select(pressed ? null : technology.nodeId)}
    >
      {technology.label}
    </button>
  );
}

export default function SkillsExplorer({
  skillGroups,
  unmatchedTechnologies,
  proficiency,
  proficiencyTemplate,
  projects,
  experience,
  copy,
}) {
  const { selectedId, related, select } = useSelection();
  const [interactive, setInteractive] = useState(false);
  const statusId = "spatial-skills-evidence";
  useEffect(() => setInteractive(true), []);

  const labels = new Map([
    ...skillGroups.flatMap((group) =>
      group.technologies.map(({ nodeId, label }) => [nodeId, label]),
    ),
    ...unmatchedTechnologies.map(({ nodeId, label }) => [nodeId, label]),
  ]);
  const projectTitles = new Map(
    projects.map((project) => [`project:${project.id}`, project.title]),
  );
  const roleTitles = new Map(
    experience.map((role) => [`role:${role.id}`, `${role.role}, ${role.company}`]),
  );
  const matched = related
    ? [
        [copy.projectsLabel, related.projects.map((id) => projectTitles.get(id))],
        [copy.rolesLabel, related.roles.map((id) => roleTitles.get(id))],
      ].filter(([, items]) => items.length > 0)
    : [];
  const shared = { interactive, selectedId, select };

  return (
    <div className="spatial-explorer">
      <div className="spatial-explorer-groups">
        {skillGroups.map((group) => (
          <section
            key={group.id}
            className="spatial-skill-group"
            aria-labelledby={`${statusId}-${group.id}`}
          >
            <h3 id={`${statusId}-${group.id}`}>{group.title}</h3>
            <p>{group.summary}</p>
            <ul className="spatial-chips">
              {group.technologies.map((technology) => (
                <li key={technology.nodeId}>
                  <Technology technology={technology} {...shared} />
                  <SkillLevel name={technology.label} proficiency={proficiency} template={proficiencyTemplate} />
                </li>
              ))}
            </ul>
          </section>
        ))}
        {unmatchedTechnologies.length > 0 && (
          <section
            className="spatial-skill-group is-unmatched"
            aria-labelledby={`${statusId}-unmatched`}
          >
            <h3 id={`${statusId}-unmatched`}>{copy.unmatchedGroup}</h3>
            <ul className="spatial-chips">
              {unmatchedTechnologies.map((technology) => (
                <li key={technology.nodeId}>
                  <Technology technology={technology} {...shared} />
                  <SkillLevel name={technology.label} proficiency={proficiency} template={proficiencyTemplate} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      { (
        <aside className="spatial-explorer-result">
          <div id={statusId} role="status" aria-live="polite">
            {selectedId ? (
              <div key={selectedId} className="spatial-explorer-change">
                <h3>{formatCopy(copy.usedIn, { name: labels.get(selectedId) })}</h3>
                {matched.length > 0 ? (
                  matched.map(([heading, items]) => (
                    <div key={heading} className="spatial-explorer-list">
                      <h4>{heading}</h4>
                      <ul>
                        {items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p>{copy.noMatches}</p>
                )}
              </div>
            ) : (
              <div><h3>{copy.selectPrompt}</h3><p>{copy.intro}</p><h4>{copy.projectsLabel}</h4><ul>{projects.slice(0, 3).map((project) => <li key={project.id}><a className="spatial-text-link" href={`#project-${project.id}`}>{project.title}</a></li>)}</ul><h4>{copy.rolesLabel}</h4><ul>{experience.map((role) => <li key={role.id}>{role.role}</li>)}</ul></div>
            )}
          </div>
          {selectedId && (
            <button
              type="button"
              className="spatial-text-link"
              onClick={() => select(null)}
            >
              {copy.clearSelection}
            </button>
          )}
        </aside>
      )}
    </div>
  );
}
