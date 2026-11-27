import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useEffectEvent, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import type { Group } from "three";
import { PitchBall, PitchCanvasBoundary, supportsPitchCanvas } from "./PitchBall";

type Slide = { id: string; anchor?: string; label: string; content: ReactNode };

function stageInset(height: number) {
  return Math.min(16, window.innerHeight - height - 56);
}

export function scrollToOrbitWaypoint(id: string, behavior: ScrollBehavior) {
  const waypoint = document.getElementById(id);
  const stage = waypoint?.closest(".card-orbit")?.querySelector<HTMLElement>(".card-orbit-stage");
  if (!waypoint || !stage) return;
  window.scrollTo({
    top: window.scrollY + waypoint.getBoundingClientRect().top - stageInset(stage.offsetHeight),
    behavior,
  });
}

function SpinningBall({ progress }: { progress: RefObject<number> }) {
  const ball = useRef<Group>(null);
  useFrame(() => {
    const angle = progress.current * 3.4;
    ball.current?.rotation.set(.28 + angle, angle * .32, -.32 + angle * .6);
  });
  return <group ref={ball}><PitchBall /></group>;
}

export default function OrbitCarousel({ slides, activeId, label, variant, onSelect }: {
  slides: Slide[];
  activeId: string;
  label: string;
  variant: "scouting" | "match-log";
  onSelect: (id: string) => void;
}) {
  const host = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const requestDraw = useRef<(() => void) | null>(null);
  const [webGL, setWebGL] = useState(false);
  const active = Math.max(0, slides.findIndex(slide => slide.id === activeId));
  const current = slides[active];
  const count = slides.length;
  const vertical = variant === "match-log";
  const slideKey = slides.map(slide => slide.id).join("|");
  const reportActive = useEffectEvent((index: number) => {
    const id = slides[index]?.id;
    if (id && id !== activeId) onSelect(id);
  });

  useEffect(() => {
    const element = host.current;
    const pinned = stage.current;
    if (!element || !pinned) return;
    const cards = Array.from(pinned.querySelectorAll<HTMLElement>(".card-orbit-slide"));
    const motion = matchMedia("(prefers-reduced-motion: no-preference)");
    let nearby = false;
    let frame = 0;
    let pinTop = 0;
    let step = 1;
    let lastPosition = -1;

    function draw() {
      frame = 0;
      if (!element || !nearby) return;
      const travel = Math.max(0, Math.min(cards.length - 1, (pinTop - element.getBoundingClientRect().top) / step));
      const cardIndex = Math.floor(travel);
      const blend = Math.max(0, Math.min(1, (travel - cardIndex - .18) / .64));
      const position = cardIndex + blend * blend * (3 - 2 * blend);
      if (position === lastPosition) return;
      lastPosition = position;
      progress.current = position;
      cards.forEach((card, index) => {
        const distance = Math.max(-2, Math.min(2, index - position));
        card.style.setProperty("--orbit-distance", distance.toFixed(4));
        card.style.setProperty("--orbit-depth", Math.abs(distance).toFixed(4));
      });
      reportActive(Math.round(position));
      requestDraw.current?.();
    }

    function schedule() {
      if (nearby && !frame) frame = requestAnimationFrame(draw);
    }

    function measure() {
      if (!element || !pinned) return;
      pinTop = stageInset(pinned.offsetHeight);
      const waypoints = element.querySelectorAll<HTMLElement>(".card-orbit-waypoint");
      step = Math.max(1, waypoints[1]?.offsetTop ?? 1);
      element.style.setProperty("--orbit-pin-top", pinTop + "px");
      lastPosition = -1;
      schedule();
    }

    const observer = new IntersectionObserver(([entry]) => {
      nearby = entry.isIntersecting;
      setWebGL(nearby && motion.matches && supportsPitchCanvas());
      if (nearby) {
        lastPosition = -1;
        draw();
      }
    }, { rootMargin: "160px" });
    const resize = new ResizeObserver(measure);
    observer.observe(element);
    resize.observe(pinned);
    resize.observe(element);
    const updateMotion = () => {
      setWebGL(nearby && motion.matches && supportsPitchCanvas());
      lastPosition = -1;
      schedule();
    };

    measure();
    motion.addEventListener("change", updateMotion);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      resize.disconnect();
      motion.removeEventListener("change", updateMotion);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(frame);
    };
  }, [slideKey, variant]);

  if (!current) return null;

  return (
    <section className="card-orbit" data-orbit={variant} ref={host} aria-label={label + " cards"}
      style={{ "--orbit-steps": count - 1 } as CSSProperties}>
      {slides.map((slide, index) => (
        <span key={slide.id} className="card-orbit-waypoint" id={slide.anchor ?? slide.id}
          style={{ "--orbit-index": index } as CSSProperties} aria-hidden="true" />
      ))}
      <div className="card-orbit-stage" ref={stage}>
        <div className="card-orbit-toolbar">
          <div className="card-orbit-ball" aria-hidden="true">
            {webGL && (
              <PitchCanvasBoundary>
                <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [0, 0, 1.48], fov: 38 }}
                  onCreated={({ invalidate }) => { requestDraw.current = invalidate; }}
                  gl={{ alpha: true, powerPreference: "low-power", antialias: true }}>
                  <ambientLight intensity={1.4} />
                  <directionalLight position={[-2, 3, 4]} intensity={2.9} color="#ffdfad" />
                  <directionalLight position={[2, 2, -3]} intensity={1.3} color="#a4beff" />
                  <SpinningBall progress={progress} />
                </Canvas>
              </PitchCanvasBoundary>
            )}
          </div>
          <p className="card-orbit-readout" aria-live="polite" aria-atomic="true">
            <span>{active + 1} / {count}</span> {current.label}
          </p>
          {count > 1 && <span className="card-orbit-instruction">Scroll through {label.toLowerCase() === "project" ? "projects" : "roles"}</span>}
        </div>
        <div className="card-orbit-window">
          {slides.map((slide, index) => {
            const offset = Math.max(-2, Math.min(2, index - active));
            return (
              <div key={slide.id} className="card-orbit-slide" data-position={index === active ? "front" : undefined}
                style={{ "--orbit-initial": offset, "--orbit-initial-depth": Math.abs(offset) } as CSSProperties}
                inert={index !== active} aria-hidden={index !== active}>
                {slide.content}
              </div>
            );
          })}
        </div>
        {count > 1 && (
          <div className="card-orbit-indicators" aria-hidden="true">
            {slides.map((slide, index) => <i key={slide.id} data-active={index === active} />)}
          </div>
        )}
      </div>
    </section>
  );
}
