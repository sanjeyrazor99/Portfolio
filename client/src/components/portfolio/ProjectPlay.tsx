import type { CSSProperties } from "react";

const plays = {
  game: { route: "M90 193 Q148 176 320 74 Q415 110 550 187", positions: [[90, 193], [320, 74], [550, 187]], accent: "#78e7ff" },
  ai: { route: "M84 145 H257 V79 H383 V145 H257 V211 H383 V145 H553", positions: [[84, 145], [320, 145], [553, 145]], accent: "#f5bcff" },
  analytics: { route: "M93 217 C174 262 241 162 315 138 S475 34 565 109", positions: [[93, 217], [315, 138], [565, 109]], accent: "#ffce80" },
  pipeline: { route: "M82 79 Q199 79 320 144 H555", positions: [[82, 79], [320, 144], [555, 144]], accent: "#9bf0ab" },
  robot: { route: "M87 200 Q132 200 170 102 T259 173 T343 119 T429 180 T552 102", positions: [[87, 200], [343, 119], [552, 102]], accent: "#ff9f9e" },
};

export default function ProjectPlay({ kind, stages }: { kind: keyof typeof plays; stages: string[] }) {
  const { route, positions, accent } = plays[kind];
  return (
    <svg className="project-play" viewBox="0 0 640 280" style={{ "--play-accent": accent } as CSSProperties}>
      <rect width="640" height="280" rx="12" fill="#102d2b" />
      <path className="project-play-grass" d="M80 0v280m160-280v280m160-280v280m160-280v280" />
      <g className="project-play-markings">
        <rect x="24" y="21" width="592" height="238" rx="5" />
        <path d="M320 21v238M24 78h91v124H24m592-124h-91v124h91M24 112h35v56H24m592-56h-35v56h35" />
        <circle cx="320" cy="140" r="49" />
      </g>
      {kind === "pipeline" && (
        <path className="project-play-route" d="M82 46Q199 46 320 144M82 113Q199 113 320 144M82 179Q199 179 320 144M82 218Q199 218 320 144" />
      )}
      {kind === "robot" && (
        <path className="project-play-cones" d="m153 155 12-23 12 23zm90-24 12-23 12 23zm90 62 12-23 12 23zm86-63 12-23 12 23z" />
      )}
      {kind === "analytics" && (
        <g className="project-play-markings">
          <path d="M93 217 565 70v78Z" />
          <circle cx="565" cy="109" r="23" />
        </g>
      )}
      {kind === "ai" && <rect className="project-play-markings" x="247" y="66" width="146" height="158" rx="8" />}
      {kind === "game" && <path className="project-play-markings" d="M90 193h460M90 193 320 74 550 187" />}
      <path className="project-play-route" d={route} />
      <path className="project-play-trail" d={route} pathLength="100" />
      {positions.map(([x, y], index) => (
        <g key={stages[index]} transform={`translate(${x} ${y})`}>
          <circle className="project-play-player-ring" r="19" />
          <circle className="project-play-player" r="12" />
          <text className="project-play-label" y={y > 170 ? -29 : 38}>{stages[index]}</text>
        </g>
      ))}
      <g className="project-play-ball" style={{ offsetPath: `path("${route}")` }}>
        <circle r="10" fill="#fef6de" stroke="#101c2d" strokeWidth="2" />
        <path fill="#101c2d" d="m0-5 5 4-2 6h-6l-2-6z" />
      </g>
    </svg>
  );
}
