import { useState, useRef, useEffect, type CSSProperties } from "react";
import {
  ArrowUpRight,
  ArrowLeft,
  FolderOpen,
  Github,
  LockKeyhole,
} from "lucide-react";
import type { projects } from "@/data/portfolio";

function ProjectArt({ kind }: { kind: string }) {
  if (kind === "game")
    return (
      <div className="game-art">
        <div className="game-terminal">
          ROOM: HACKTX_26 <span>● LIVE</span>
        </div>
        <div className="game-crew">
          {["#FFD400", "#9f67e9", "#59d3de", "#e65569"].map((c, i) => (
            <div
              className="crew"
              key={c}
              style={{ "--crew": c } as CSSProperties}
            >
              <i />
              <span>{i === 2 ? "AI" : "0" + (i + 1)}</span>
            </div>
          ))}
        </div>
        <div className="game-dialog">
          <span>AI PLAYER</span> Conversational AI<b>_</b>
        </div>
      </div>
    );
  if (kind === "ai")
    return (
      <div className="ai-art">
        <div className="terminal-top">
          <i />
          <i />
          <i />
          <span>memeotron_pipeline.py</span>
        </div>
        <pre>
          <span>from</span> nemotron <span>import</span> intelligence
          <br />
          <br />
          <em>› extracting visual context...</em>
          <br />› detecting emerging trends
          <br />› generating insights
          <br />
          <br />
          <b>PIPELINE COMPLETE · 24H</b>
        </pre>
        <span className="ai-cross">✳</span>
      </div>
    );
  if (kind === "analytics")
    return (
      <svg
        className="analytics-art"
        viewBox="0 0 500 220"
        role="img"
        aria-label="Illustrative hockey shot map, not actual research data"
      >
        <rect
          x="35"
          y="25"
          width="430"
          height="170"
          rx="75"
          fill="none"
          stroke="#53505e"
        />
        <path d="M250 25v170M150 25v170M350 25v170" stroke="#463741" />
        <circle cx="250" cy="110" r="35" fill="none" stroke="#684753" />
        {Array.from({ length: 35 }, (_, i) => (
          <circle
            key={i}
            cx={90 + ((i * 47) % 320)}
            cy={50 + ((i * 31) % 125)}
            r={3 + (i % 4)}
            fill={i % 3 ? "#FFD400" : "#D7263D"}
            opacity=".7"
          />
        ))}
        <text x="50" y="210" fill="#9a99a6" fontSize="9" fontFamily="monospace">
          SHOT MAP / ILLUSTRATIVE
        </text>
      </svg>
    );
  if (kind === "pipeline")
    return (
      <div className="pipeline-art">
        <div className="source-stack">
          {["SEC.GOV", "PATENTSVIEW", "SAM.GOV"].map(x => (
            <span key={x}>{x}</span>
          ))}
        </div>
        <span className="pipe-line">→</span>
        <div className="pipeline-core">
          ETL<span>PYTHON / SQL</span>
        </div>
        <span className="pipe-line">→</span>
        <div className="pipeline-db">
          ▤<span>INTELLIGENCE</span>
        </div>
      </div>
    );
  return (
    <svg
      className="robot-art"
      viewBox="0 0 500 220"
      role="img"
      aria-label="Original geometric wheeled robot diagram"
    >
      <g fill="none" stroke="#353a40">
        <path d="M50 190h400M100 30v160M200 30v160M300 30v160M400 30v160" />
      </g>
      <g stroke="#FFD400" fill="#24242c">
        <path d="M183 101l125-30 39 79-125 31z" />
        <path d="M183 101l-14 55 53 25v-54z" />
        <path d="M222 127l125-30v53l-125 31z" />
        <circle cx="215" cy="172" r="18" />
        <circle cx="325" cy="155" r="18" />
        <rect x="210" y="78" width="57" height="38" />
        <circle cx="225" cy="89" r="8" fill="#b7d5d6" />
        <circle cx="251" cy="83" r="8" fill="#b7d5d6" />
      </g>
      <g stroke="#00E5FF" fill="none" strokeDasharray="4 5">
        <path d="M232 77l-85-43M253 77l87-57" />
      </g>
      <text x="40" y="209" fill="#9a99a6" fontFamily="monospace" fontSize="9">
        ULTRASONIC SENSOR / AUTONOMOUS NAVIGATION
      </text>
    </svg>
  );
}
export default function ProjectCard({
  project,
  index,
  lite,
}: {
  project: (typeof projects)[number];
  index: number;
  lite: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const opener = useRef<HTMLButtonElement>(null),
    back = useRef<HTMLButtonElement>(null),
    hasFlipped = useRef(false);
  useEffect(() => {
    if (flipped) back.current?.focus();
    else if (hasFlipped.current) opener.current?.focus();
  }, [flipped]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    lastX: number;
    lastY: number;
    lastT: number;
    vx: number;
    vy: number;
  } | null>(null);
  const card = useRef<HTMLElement>(null);
  return (
    <article
      id={`project-${project.id}`}
      ref={card}
      className={`project-card ${flipped ? "is-flipped" : ""}`}
      data-manga-panel
      data-manga-onomatopoeia
      onPointerDown={e => {
        if (
          lite ||
          e.pointerType !== "mouse" ||
          (e.target as HTMLElement).closest("button,a")
        )
          return;
        dragStart.current = {
          x: e.clientX,
          y: e.clientY,
          baseX: drag.x,
          baseY: drag.y,
          lastX: e.clientX,
          lastY: e.clientY,
          lastT: performance.now(),
          vx: 0,
          vy: 0,
        };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={e => {
        const d = dragStart.current;
        if (!d) return;
        const now = performance.now(),
          dt = Math.max(1, now - d.lastT);
        d.vx = (e.clientX - d.lastX) / dt;
        d.vy = (e.clientY - d.lastY) / dt;
        d.lastX = e.clientX;
        d.lastY = e.clientY;
        d.lastT = now;
        setDrag({ x: d.baseX + e.clientX - d.x, y: d.baseY + e.clientY - d.y });
      }}
      onPointerUp={e => {
        const d = dragStart.current;
        if (!d) return;
        dragStart.current = null;
        const releaseX = Math.max(-60, Math.min(60, drag.x + d.vx * 105)),
          releaseY = Math.max(-60, Math.min(60, drag.y + d.vy * 105));
        setDrag({ x: releaseX, y: releaseY });
        window.setTimeout(() => setDrag({ x: 0, y: 0 }), 850);
        if (card.current && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 4)
          card.current.dataset.dragged = "true";
      }}
      onMouseMove={e => {
        if (lite || dragStart.current) return;
        const r = e.currentTarget.getBoundingClientRect();
        setTilt({
          x: -(e.clientY - r.top - r.height / 2) / 45,
          y: (e.clientX - r.left - r.width / 2) / 45,
        });
      }}
      onMouseLeave={() => {
        setTilt({ x: 0, y: 0 });
        if (!dragStart.current) dragStart.current = null;
      }}
      style={
        {
          "--rx": `${tilt.x}deg`,
          "--ry": `${tilt.y}deg`,
          "--drag-x": `${drag.x}px`,
          "--drag-y": `${drag.y}px`,
        } as CSSProperties
      }
    >
      <div className="project-inner">
        <div className="project-front" aria-hidden={flipped} inert={flipped}>
          <div className="case-label">
            <span>
              <FolderOpen size={13} /> PROJECT / 00{index + 1}
            </span>
            <span className="case-state">
              {index < 2 ? "HACKATHON" : "ENGINEERING"}
            </span>
          </div>
          <div className={`project-art art-${project.kind}`}>
            <ProjectArt kind={project.kind} />
          </div>
          <div className="project-copy">
            <div className="project-title-row">
              <h3>{project.title}</h3>
              <button
                ref={opener}
                className="project-open"
                onClick={() => {
                  hasFlipped.current = true;
                  setFlipped(true);
                }}
                aria-label={`Open details for ${project.title}`}
                aria-expanded={flipped}
              >
                <ArrowUpRight size={23} />
              </button>
            </div>
            <p className="project-context">{project.subtitle}</p>
            <p className="project-description">{project.description}</p>
            <div className="tags">
              {project.tags.map(t => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="project-back" aria-hidden={!flipped} inert={!flipped}>
          <button
            ref={back}
            className="back-btn"
            onClick={() => setFlipped(false)}
          >
            <ArrowLeft size={16} /> Back to file
          </button>
          <span className="eyebrow">PROJECT DETAILS</span>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <div className="tags">
            {project.tags.map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="project-links">
            {project.github ? (
              <a
                className="btn secondary"
                href={project.github}
                target="_blank"
                rel="noreferrer"
              >
                <Github size={16} /> GitHub
              </a>
            ) : (
              <button className="btn secondary" disabled>
                <LockKeyhole size={14} /> GitHub — coming soon
              </button>
            )}
            {project.demo ? (
              <a
                className="btn secondary"
                href={project.demo}
                target="_blank"
                rel="noreferrer"
              >
                Live demo
                <ArrowUpRight size={16} />
              </a>
            ) : (
              <button className="btn secondary" disabled>
                Demo — coming soon
              </button>
            )}
          </div>
          <p className="form-note">
            {project.github
              ? "Source repository available. Demo link coming soon."
              : "Links will be added by Sanjey."}
          </p>
        </div>
      </div>
    </article>
  );
}
