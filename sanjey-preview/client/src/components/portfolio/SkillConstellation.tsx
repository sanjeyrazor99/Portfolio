import React, {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { skillGroups, type PortfolioLens } from "../../data/portfolio";

export interface SkillConstellationProps {
  lite: boolean;
  motionFrozen?: boolean;
}
type SkillNode = {
  id: string;
  skill: string;
  group: PortfolioLens;
  category: string;
  color: string;
  x: number;
  y: number;
  z: number;
  scale: number;
};
type ConstellationStyle = CSSProperties & {
  "--skill-color"?: string;
  "--node-scale"?: number;
  "--node-depth"?: string;
};
const WIDTH = 1000;
const HEIGHT = 480;
const CAMERA = 900;
const nodes: SkillNode[] = skillGroups
  .flatMap((group, groupIndex) =>
    group.skills.map((skill, index) => {
      const angle = index * Math.PI * (3 - Math.sqrt(5)) + groupIndex * 0.8;
      const radius = Math.sqrt((index + 0.65) / group.skills.length);
      const x3d = (groupIndex - 1) * 290 + Math.cos(angle) * radius * 130;
      const y3d = Math.sin(angle) * radius * 170;
      const z3d = Math.cos(angle * 1.4 + groupIndex) * 95;
      const scale = CAMERA / (CAMERA - z3d);
      return {
        id: `${group.id}-${index}`,
        skill,
        group: group.id,
        category: `${group.title} · ${group.subtitle}`,
        color: group.color,
        x: WIDTH / 2 + x3d * scale,
        y: HEIGHT / 2 + y3d * scale,
        z: z3d,
        scale,
      };
    })
  )
  .slice(0, 34);
const edges = nodes.flatMap((node, index) => {
  const siblings = nodes.filter(other => other.group === node.group);
  const localIndex = siblings.findIndex(other => other.id === node.id);
  const next = siblings[(localIndex + 1) % siblings.length];
  const across = siblings[(localIndex + 3) % siblings.length];
  return [
    { id: `${index}-next`, from: node, to: next },
    ...(localIndex % 3 === 0
      ? [{ id: `${index}-across`, from: node, to: across }]
      : []),
  ];
});

/** Keep .skill-lists visible in both modes: it is the complete source of truth. */
export default function SkillConstellation({
  lite,
  motionFrozen = false,
}: SkillConstellationProps) {
  const instanceId = useId();
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [pushPull, setPushPull] = useState<"push" | "pull">("push");
  const [pow, setPow] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const activeId = focused ?? hovered;
  const activeNode = nodes.find(
    node => node.id === activeId && node.id !== dismissed
  );
  const tooltipId = `${instanceId}-skill-tooltip`;
  const locate = (id: string) =>
    positions[id] ?? nodes.find(node => node.id === id)!;
  const dragStart = useRef<{
    id: string;
    x: number;
    y: number;
    px: number;
    py: number;
  } | null>(null);

  const moveBy = (id: string, dx: number, dy: number) => {
    setPositions(current => {
      const point = current[id] ?? nodes.find(node => node.id === id)!;
      return {
        ...current,
        [id]: {
          x: Math.max(16, Math.min(WIDTH - 16, point.x + dx)),
          y: Math.max(16, Math.min(HEIGHT - 16, point.y + dy)),
        },
      };
    });
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (motionFrozen) return;
    const bounds = stageRef.current?.getBoundingClientRect();
    if (!bounds) return;
    if (dragStart.current) {
      const d = dragStart.current;
      moveBy(
        d.id,
        ((event.clientX - d.px) / bounds.width) * WIDTH,
        ((event.clientY - d.py) / bounds.height) * HEIGHT
      );
      d.px = event.clientX;
      d.py = event.clientY;
    } else if (!lite && event.buttons === 0) {
      const x = ((event.clientX - bounds.left) / bounds.width) * WIDTH;
      const y = ((event.clientY - bounds.top) / bounds.height) * HEIGHT;
      nodes.forEach(node => {
        const p = locate(node.id);
        const dx = p.x - x;
        const dy = p.y - y;
        const distance = Math.hypot(dx, dy);
        if (distance < 110 && distance > 0) {
          const force =
            (110 - distance) * 0.035 * (pushPull === "push" ? 1 : -1);
          moveBy(node.id, (dx / distance) * force, (dy / distance) * force);
        }
      });
    }
  };
  const punchAll = () => {
    if (
      motionFrozen ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    )
      return;
    nodes.forEach((node, index) => {
      const el = nodeRefs.current[node.id];
      if (!el || typeof el.animate !== "function") return;
      const angle = (index / nodes.length) * Math.PI * 2;
      const distance = 80 + (index % 5) * 15;
      const animation = el.animate(
        [
          { transform: "translate(-50%, -50%) scale(var(--node-scale, 1))" },
          {
            transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(.65)`,
            opacity: 0.35,
          },
          {
            transform: "translate(-50%, -50%) scale(var(--node-scale, 1))",
            opacity: 1,
          },
        ],
        { duration: 850, easing: "cubic-bezier(.2,.8,.2,1)" }
      );
      animation.onfinish = () => animation.cancel();
    });
  };
  const shockwaveFrom = (origin: SkillNode) => {
    if (
      motionFrozen ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const center = locate(origin.id);
    nodes.forEach((node, index) => {
      if (node.id === origin.id) return;
      const point = locate(node.id);
      const dx = point.x - center.x;
      const dy = point.y - center.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const influence = Math.max(0, 1 - distance / 380);
      if (!influence) return;
      const el = nodeRefs.current[node.id];
      if (!el || typeof el.animate !== "function") return;
      const strength = (36 + (index % 4) * 8) * influence;
      const animation = el.animate(
        [
          { transform: "translate(-50%, -50%) scale(var(--node-scale, 1))" },
          {
            transform: `translate(calc(-50% + ${((dx / distance) * strength).toFixed(1)}px), calc(-50% + ${((dy / distance) * strength).toFixed(1)}px)) scale(.82)`,
            offset: 0.45,
          },
          { transform: "translate(-50%, -50%) scale(var(--node-scale, 1))" },
        ],
        { duration: 560, easing: "cubic-bezier(.2,.8,.2,1)" }
      );
      animation.onfinish = () => animation.cancel();
    });
  };

  return (
    <div
      className={`constellation${lite ? " constellation--lite" : ""}${motionFrozen ? " constellation--frozen" : ""}`}
    >
      <style>{`
      .constellation .skill-node { transform: translate(-50%, -50%) scale(var(--node-scale, 1)); transition: transform 180ms ease, box-shadow 180ms ease; touch-action: none; }
      .constellation:not(.constellation--lite):not(.constellation--frozen) .skill-node { animation: constellation-bob 5s ease-in-out infinite alternate; }
      .constellation .skill-node:hover, .constellation .skill-node:focus-visible, .constellation .skill-node[data-active="true"] { transform: translate(-50%, -50%) scale(calc(var(--node-scale, 1) * 1.22)); }
      .constellation .skill-node:focus-visible { outline: 2px solid currentColor; outline-offset: 5px; }
      .constellation-controls { display:flex; flex-wrap:wrap; gap:.5rem; align-items:center; margin:.5rem 0; }
      .constellation-pow { position:absolute; z-index:8; pointer-events:none; font-weight:900; color:#ffdc59; text-shadow:0 1px 4px #222; transform:rotate(-12deg); }
      @keyframes constellation-bob { from { margin-top:-2px; } to { margin-top:2px; } }
      @media (prefers-reduced-motion: reduce) { .constellation .constellation-stage { display:none; } .constellation .skill-node { transition:none; animation:none !important; } }
    `}</style>
      {!lite && (
        <>
          <p className="constellation-hint" id={`${instanceId}-instructions`}>
            Drag nodes to rearrange them. Select a skill for details. Choose Push or Pull
            to nudge nearby nodes. All skills are listed below.
          </p>
          <div
            className="constellation-controls"
            role="group"
            aria-label="Constellation controls"
          >
            <span>Nearby-node force:</span>
            {(["push", "pull"] as const).map(mode => (
              <button
                key={mode}
                type="button"
                aria-pressed={pushPull === mode}
                onClick={() => setPushPull(mode)}
              >
                {mode === "push" ? "Push" : "Pull"}
              </button>
            ))}
            <button type="button" onClick={punchAll} disabled={motionFrozen}>
              PUNCH ALL ORBS
            </button>
          </div>
          <div
            ref={stageRef}
            className="constellation-stage"
            role="group"
            aria-label="Interactive skill constellation"
            aria-describedby={`${instanceId}-instructions`}
            onPointerMove={onPointerMove}
            onPointerUp={event => {
              if (dragStart.current) {
                event.currentTarget.releasePointerCapture(event.pointerId);
                dragStart.current = null;
              }
            }}
            onPointerCancel={() => {
              dragStart.current = null;
            }}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: `${WIDTH} / ${HEIGHT}`,
              minHeight: 300,
              isolation: "isolate",
              perspective: `${CAMERA}px`,
            }}
          >
            <div
              className="constellation-orbit"
              aria-hidden="true"
              style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
                style={{ position: "absolute", inset: 0, overflow: "visible" }}
              >
                {skillGroups.map((group, index) => (
                  <ellipse
                    key={group.id}
                    cx={WIDTH / 2 + (index - 1) * 290}
                    cy={HEIGHT / 2}
                    rx={155}
                    ry={188}
                    fill="none"
                    stroke={group.color}
                    strokeWidth={0.7}
                    strokeDasharray="3 9"
                    opacity={0.23}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {edges.map(({ id, from, to }) => {
                  const a = locate(from.id);
                  const b = locate(to.id);
                  const connected =
                    activeNode?.id === from.id || activeNode?.id === to.id;
                  return (
                    <line
                      key={id}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={from.color}
                      strokeWidth={connected ? 1.4 : 0.7}
                      opacity={connected ? 0.8 : 0.2}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
              </svg>
            </div>
            {nodes.map(node => {
              const p = locate(node.id);
              const isActive = activeNode?.id === node.id;
              const style: ConstellationStyle = {
                "--skill-color": node.color,
                "--node-scale": node.scale,
                "--node-depth": `${node.z}px`,
                position: "absolute",
                left: `${(p.x / WIDTH) * 100}%`,
                top: `${(p.y / HEIGHT) * 100}%`,
                zIndex: isActive ? 4 : node.z > 0 ? 2 : 1,
                minWidth: 28,
                minHeight: 28,
                cursor: "grab",
              };
              return (
                <React.Fragment key={node.id}>
                  <button
                    ref={el => {
                      nodeRefs.current[node.id] = el;
                    }}
                    type="button"
                    className={`skill-node skill-node--${node.group}`}
                    style={style}
                    data-active={isActive}
                    aria-label={`${node.skill} — ${node.category}. Drag to rearrange; activate for details.`}
                    aria-describedby={isActive ? tooltipId : undefined}
                    onPointerDown={event => {
                      if (motionFrozen || event.button !== 0) return;
                      event.currentTarget.setPointerCapture(event.pointerId);
                      dragStart.current = {
                        id: node.id,
                        x: p.x,
                        y: p.y,
                        px: event.clientX,
                        py: event.clientY,
                      };
                    }}
                    onPointerUp={event => {
                      if (dragStart.current?.id === node.id) {
                        event.currentTarget.releasePointerCapture(
                          event.pointerId
                        );
                        dragStart.current = null;
                      }
                    }}
                    onMouseEnter={() => {
                      setHovered(node.id);
                      setDismissed(null);
                    }}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => {
                      setFocused(node.id);
                      setDismissed(null);
                    }}
                    onBlur={() => setFocused(null)}
                    onClick={() => {
                      setFocused(node.id);
                      setDismissed(null);
                      if (
                        motionFrozen ||
                        window.matchMedia?.("(prefers-reduced-motion: reduce)")
                          .matches
                      )
                        return;
                      shockwaveFrom(node);
                      setPow(node.id);
                      window.setTimeout(
                        () =>
                          setPow(current =>
                            current === node.id ? null : current
                          ),
                        700
                      );
                    }}
                    onKeyDown={event => {
                      if (event.key === "Escape") setDismissed(node.id);
                    }}
                  >
                    <span className="skill-node-core" aria-hidden="true" />
                    <span className="skill-node-label" aria-hidden="true">
                      {node.skill}
                    </span>
                  </button>
                  {pow === node.id && (
                    <span
                      className="constellation-pow"
                      aria-hidden="true"
                      style={{
                        left: `${(p.x / WIDTH) * 100}%`,
                        top: `${(p.y / HEIGHT) * 100}%`,
                      }}
                    >
                      POW!
                    </span>
                  )}
                </React.Fragment>
              );
            })}
            {activeNode && (
              <div
                className="skill-tooltip"
                role="tooltip"
                id={tooltipId}
                style={
                  {
                    "--skill-color": activeNode.color,
                    position: "absolute",
                    left: "50%",
                    bottom: 8,
                    transform: "translateX(-50%)",
                    width: "max-content",
                    maxWidth: "calc(100% - 24px)",
                    zIndex: 5,
                    pointerEvents: "none",
                  } as ConstellationStyle
                }
              >
                <strong>{activeNode.skill}</strong>
                <span style={{ display: "block" }}>{activeNode.category}</span>
              </div>
            )}
          </div>
        </>
      )}
      <div className="skill-lists">
        {skillGroups.map(group => (
          <section
            key={group.id}
            className={`skill-group skill-group--${group.id}`}
            data-manga-panel
            aria-labelledby={`${instanceId}-${group.id}-title`}
            style={{ "--skill-color": group.color } as ConstellationStyle}
          >
            <h3 id={`${instanceId}-${group.id}-title`}>{group.title}</h3>
            <p className="skill-group-subtitle">{group.subtitle}</p>
            <ul className="skill-list">
              {group.skills.map(skill => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
