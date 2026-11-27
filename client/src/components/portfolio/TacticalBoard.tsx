import { useState } from "react";

type Play = { id: string; title: string; stages: string[]; position: number };

const positions = [[23, 26], [55, 20], [79, 42], [44, 65], [69, 77]] as const;

export default function TacticalBoard({ plays }: { plays: Play[] }) {
  const [selected, setSelected] = useState("");
  const play = plays.find(item => item.id === selected) ?? plays[0];
  if (!play) return null;
  const [x, y] = positions[play.position];
  const path = `M 10 79 Q 16 ${y + 13} ${x} ${y} Q ${(x + 91) / 2} ${y - 15} 93 23`;

  return (
    <section className="tactical-board" aria-labelledby="tactical-board-title">
      <header className="tactical-board-header">
        <h3 id="tactical-board-title">Project formation</h3>
        <p>Pick a position to see how the project works.</p>
      </header>
      <div className="tactical-field" aria-label="Choose a project" role="group">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <rect x="4" y="5" width="92" height="90" rx="1" />
          <path d="M50 5V95 M4 28H17V72H4 M96 28H83V72H96 M4 40H9V60H4 M96 40H91V60H96" />
          <ellipse cx="50" cy="50" rx="9" ry="14" />
          <path key={play.id} className="tactical-pass" d={path} pathLength="1" />
          <circle key={play.id + "-ball"} className="tactical-pass-ball" cx="0" cy="0" r="1.55"
            style={{ offsetPath: `path('${path}')` }} />
          <circle className="tactical-endpoint" cx="10" cy="79" r="1.7" />
          <circle className="tactical-endpoint" cx="93" cy="23" r="1.7" />
        </svg>
        {plays.map(item => {
          const [left, top] = positions[item.position];
          return (
            <button key={item.id} type="button" aria-label={item.title} title={item.title}
              aria-pressed={item.id === play.id} onClick={() => setSelected(item.id)}
              style={{ left: left + "%", top: top + "%" }}>
              {String(item.position + 1).padStart(2, "0")}
            </button>
          );
        })}
      </div>
      <div className="tactical-play" aria-live="polite">
        <p>{play.title}</p>
        <ol aria-label="Project flow">
          {play.stages.map(stage => <li key={stage}>{stage}</li>)}
        </ol>
        <a href={`#project-${play.id}`}>View case study <span aria-hidden="true">↘</span></a>
      </div>
    </section>
  );
}
