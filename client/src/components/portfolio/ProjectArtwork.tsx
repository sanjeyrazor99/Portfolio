import { useEffect, useRef, type CSSProperties } from "react";
import type { Project } from "@/data/portfolio";

type ProjectKind = Project["kind"];

function Packet({ route, delay = 0 }: { route: string; delay?: number }) {
  return <circle className="project-flow-packet" r="6"
    style={{ offsetPath: `path("${route}")`, "--flow-delay": delay + "s" } as CSSProperties} />;
}

const illustrations = {
  game: (
    <>
      <path className="project-wire" d="M168 242 360 144 552 242M168 242H552" />
      <Packet route="M168 242L360 144L552 242" />
      <Packet route="M552 242L360 144L168 242" delay={1.9} />
      <rect className="project-panel" x="294" y="93" width="132" height="94" rx="12" />
      <path d="M319 124h82m-82 29h82" />
      <circle cx="328" cy="124" r="3" className="project-hot" />
      <circle cx="328" cy="153" r="3" className="project-hot" />
      <circle className="project-panel" cx="168" cy="242" r="53" />
      <circle className="project-panel" cx="552" cy="242" r="53" />
      <circle cx="168" cy="228" r="12" />
      <path d="M144 268v-5a24 24 0 0 1 48 0v5m338-23 14 14 14-28 14 14h10" />
      <text x="168" y="329">Player</text><text x="360" y="68">Game server</text><text x="552" y="329">AI player</text>
    </>
  ),
  ai: (
    <>
      <rect className="project-panel" x="97" y="78" width="233" height="229" rx="12" />
      <rect x="122" y="102" width="183" height="133" rx="4" />
      <path d="m123 219 44-48 30 25 42-62 66 85m-176 42h132m-132 20h96" />
      <circle cx="165" cy="135" r="10" />
      <path className="project-scan" d="M122 133h183" />
      <path className="project-wire" d="M330 190h70" />
      <rect className="project-panel" x="400" y="116" width="223" height="151" rx="12" />
      <path d="M432 210h159" />
      {[23, 38, 27, 59, 46].map((height, index) => (
        <rect key={index} className="project-trend-bar" x={440 + index * 35} y={202 - height} width="9"
          height={height} style={{ "--flow-delay": 1.7 + index * .13 + "s" } as CSSProperties} />
      ))}
      <Packet route="M330 190H400" delay={1.25} />
      <text x="214" y="344">Image + OCR</text><text x="512" y="302">Trend analysis</text>
    </>
  ),
  analytics: (
    <>
      <rect className="project-panel" x="93" y="91" width="534" height="246" rx="93" />
      <path d="M360 91v246m-102-246v246m204-246v246" />
      <circle cx="360" cy="214" r="44" /><circle cx="228" cy="161" r="28" /><circle cx="228" cy="267" r="28" />
      <circle cx="492" cy="161" r="28" /><circle cx="492" cy="267" r="28" />
      <path d="M577 189v50m0-40h16v30h-16" />
      <path className="project-wire" d="m478 153 99 61m-99 63 99-63m-49 0h49m-45-91 45 91" />
      <g className="project-hot">
        <circle cx="478" cy="153" r="5" /><circle cx="478" cy="277" r="5" /><circle cx="528" cy="214" r="5" /><circle cx="532" cy="123" r="5" />
      </g>
      <Packet route="M478 153Q520 170 578 214" />
      <Packet route="M478 277Q515 252 578 214" delay={1.3} />
      <Packet route="M532 123Q563 143 578 214" delay={2.6} />
      <text x="360" y="61">Illustrative shot map</text>
    </>
  ),
  pipeline: (
    <>
      <path className="project-wire" d="M182 103 330 199m-148-48 148 48m-148 0h148m-148 48 148-48m-148 96 148-96m102 0h105" />
      {[103, 151, 199, 247, 295].map(y => <rect className="project-panel" key={y} x="109" y={y - 14} width="73" height="28" rx="5" />)}
      <rect className="project-panel" x="330" y="150" width="102" height="98" rx="12" />
      <path d="m365 184-14 15 14 15m32-30 14 15-14 15m-23 9 14-48" />
      <path className="project-panel" d="M537 168c0-28 88-28 88 0v64c0 28-88 28-88 0Z" />
      <ellipse cx="581" cy="168" rx="44" ry="18" />
      <path d="M537 199c0 25 88 25 88 0" />
      {[103, 151, 199, 247, 295].map((y, index) => (
        <Packet key={y} route={`M182 ${y}L330 199H535`} delay={index * .36} />
      ))}
      <text x="146" y="344">5 sources</text><text x="381" y="288">Python ETL</text><text x="581" y="288">Database</text>
    </>
  ),
  robot: (
    <>
      <path className="project-wire" d="M125 300h145q59 0 59-59v-8q0-56 56-56h196" />
      <rect className="project-panel" x="489" y="240" width="87" height="75" rx="8" />
      <path d="m501 302 63-48m-43 48 43-33" />
      <g className="project-rover project-rover-path">
        <rect className="project-panel" x="168" y="248" width="91" height="52" rx="10" />
        <circle className="project-panel" cx="186" cy="302" r="12" /><circle className="project-panel" cx="241" cy="302" r="12" />
        <circle cx="211" cy="267" r="6" /><circle cx="234" cy="267" r="6" />
        <path className="project-wire project-rover-sonar" d="M270 254q19 18 0 37m13-49q32 29 0 59" />
      </g>
      <text x="528" y="346">Obstacle</text><text x="360" y="105">Ultrasonic navigation</text>
    </>
  ),
} satisfies Record<ProjectKind, React.ReactNode>;

export default function ProjectArtwork({ kind }: { kind: ProjectKind }) {
  const artwork = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const element = artwork.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      element.toggleAttribute("data-playing", entry.isIntersecting);
    }, { threshold: 0.15 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <svg ref={artwork} className="project-illustration" viewBox="0 0 720 400" aria-hidden="true">
      {illustrations[kind]}
    </svg>
  );
}
