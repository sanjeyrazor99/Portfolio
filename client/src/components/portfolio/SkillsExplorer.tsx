import { useState } from "react";
import { ArrowUpRight, Braces, BrainCircuit, Clapperboard } from "lucide-react";
import { projects, skillGroups } from "@/data/portfolio";

const categoryIcons = [Braces, BrainCircuit, Clapperboard];

function skillKey(label: string) {
  return label.split(" (")[0].trim().toLowerCase();
}

export default function SkillsExplorer() {
  const [category, setCategory] = useState(0);
  const [selected, setSelected] = useState(skillGroups[0].skills[0]);
  const group = skillGroups[category];
  const relatedProjects = projects.filter(project =>
    project.tags.some(tag => skillKey(tag) === skillKey(selected))
  );

  return (
    <div className="studio-skills-explorer">
      <div className="studio-skills-categories" role="group" aria-label="Skill categories">
        {skillGroups.map((item, index) => {
          const Icon = categoryIcons[index];
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === index}
              aria-controls="skill-bank"
              onClick={() => {
                if (category === index) return;
                setCategory(index);
                setSelected(item.skills[0]);
              }}
            >
              {Icon && <Icon size={22} strokeWidth={1.5} aria-hidden="true" />}
              <span>{item.title}</span>
              <small>{item.skills.length}</small>
            </button>
          );
        })}
      </div>
      <div className="studio-skills-workspace">
        <section id="skill-bank" className="studio-skill-bank" aria-labelledby="skill-bank-heading">
          <h3 id="skill-bank-heading">{group.title}</h3>
          <ul key={group.id}>
            {group.skills.map(skill => (
              <li key={skill}>
                <button
                  type="button"
                  aria-pressed={selected === skill}
                  aria-controls="skill-inspector"
                  onClick={() => setSelected(skill)}
                >
                  {skill}
                </button>
              </li>
            ))}
          </ul>
        </section>
        <aside id="skill-inspector" className="studio-skill-inspector" aria-labelledby="skill-inspector-heading">
          <div key={selected} className="studio-skill-inspector-content">
            <div className="studio-skill-signal" aria-hidden="true">
              <svg viewBox="0 0 260 82" fill="none">
                <path d="M8 61h43l22-39h34l23 39h33l21-39h37l31 39" />
                <circle cx="8" cy="61" r="4" /><circle cx="107" cy="22" r="4" /><circle cx="252" cy="61" r="4" />
              </svg>
            </div>
            <h3 id="skill-inspector-heading">{selected}</h3>
            <p className="studio-skill-inspector-label">Related projects</p>
            {relatedProjects.length > 0 ? (
              <ul>
                {relatedProjects.map(project => (
                  <li key={project.id}>
                    <a href={"#project-" + project.id}>{project.title}<ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" /></a>
                  </li>
                ))}
              </ul>
            ) : <p className="studio-skill-no-projects">No listed projects for this skill.</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
