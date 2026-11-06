import FallbackName from "./FallbackName";
import { createPortal } from "react-dom";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import RedFist from "./RedFist";

const FistMesh = lazy(() => import("./FistMesh"));
export default function FistStage({
  frozen,
  webgl,
  onWebgl,
}: {
  frozen: boolean;
  webgl: boolean;
  onWebgl: (active: boolean) => void;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const charged = useRef(false);

  const resumeTimer = useRef<number | undefined>(undefined);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [impact, setImpact] = useState(false);
  const stopped = frozen || paused || !inView;

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const loop = gsap.timeline({ repeat: -1, paused: true });
    loop
      .set(element, {
        "--punch-scale": 1,
        "--heat": 0.45,
        "--flame-length": 1,
        "--burst": 0,
      })
      .to(element, {
        "--punch-scale": 1.025,
        "--heat": 0.6,
        duration: 0.9,
        ease: "sine.inOut",
      })
      .to(element, {
        "--punch-scale": 0.85,
        "--heat": 1,
        "--flame-length": 0.7,
        duration: 0.5,
        ease: "power2.in",
      })
      .to(element, {
        "--punch-scale": 1.55,
        "--heat": 1.4,
        "--flame-length": 1.8,
        duration: 0.2,
        ease: "power4.in",
      })
      .set(element, { "--burst": 1 }, 1.56)
      .fromTo(
        element.querySelector(".loop-flash"),
        { opacity: 0.48 },
        { opacity: 0, duration: 0.075 },
        1.56
      )
      .fromTo(
        element.querySelector(".loop-ring"),
        { scale: 0.4, opacity: 0.9 },
        { scale: 3.8, opacity: 0, duration: 0.6, ease: "power2.out" },
        1.56
      )
      .fromTo(
        element.querySelector(".loop-don"),
        { opacity: 0.95, scale: 0.8 },
        { opacity: 0, scale: 1.4, duration: 0.45 },
        1.6
      )
      .to(
        element,
        { "--punch-scale": 1.42, "--heat": 1.15, duration: 0.5 },
        1.6
      )
      .to(
        element,
        {
          "--punch-scale": 0.96,
          "--heat": 0.35,
          "--flame-length": 1,
          "--burst": 0,
          duration: 0.75,
          ease: "power3.out",
        },
        2.1
      )
      .to(
        element,
        {
          "--punch-scale": 1,
          "--heat": 0.45,
          duration: 0.35,
          ease: "sine.inOut",
        },
        2.85
      );

    const fallbackLetters = element.querySelectorAll("[data-name-letter]");
    if (fallbackLetters.length) {
      loop
        .to(
          fallbackLetters,
          {
            x: (i: number) => ((i % 6) - 2.5) * 24,
            y: (i: number) => (i < 6 ? -35 : 35),
            rotation: (i: number) => ((i % 3) - 1) * 13,
            duration: 0.2,
            ease: "power3.out",
          },
          1.57
        )
        .to(
          fallbackLetters,
          {
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.85,
            ease: "elastic.out(1,.55)",
            stagger: 0.008,
          },
          2.1
        );
    }
    timeline.current = loop;
    return () => {
      loop.kill();
      timeline.current = null;
      clearTimeout(resumeTimer.current);
    };
  }, [webgl]);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    let visible = true;
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      setInView(visible && !document.hidden);
    });
    const visibility = () => setInView(visible && !document.hidden);
    observer.observe(element);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    if (stopped) {
      timeline.current?.pause();
      gsap.set(stage.current?.querySelectorAll("[data-name-letter]") ?? [], {
        x: 0,
        y: 0,
        rotation: 0,
      });
    } else timeline.current?.play();
  }, [stopped, webgl]);

  useEffect(() => {
    if (frozen) return;
    let frame = 0;
    function update() {
      const run = stage.current?.closest(".fist-run");
      if (!run || !stage.current) return;
      const charge = Math.max(
        0,
        Math.min(
          1,
          -run.getBoundingClientRect().top /
            Math.max(1, run.clientHeight - innerHeight)
        )
      );
      stage.current.style.setProperty("--charge", String(charge));
      if (charge < 0.65) charged.current = false;
      if (charge >= 0.98 && !charged.current) {
        charged.current = true;
        setImpact(true);
      }
    }
    function scroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }
    update();
    addEventListener("scroll", scroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", scroll);
    };
  }, [frozen]);

  function punch() {
    if (frozen) return;
    setPaused(false);
    timeline.current?.time(1.35).play();
    if (paused) {
      clearTimeout(resumeTimer.current);
      resumeTimer.current = window.setTimeout(() => setPaused(true), 1850);
    }
  }

  return (
    <div
      className={`fist-stage fire-stage ${webgl ? "name-webgl" : "name-fallback"} ${stopped ? "fire-paused" : ""} ${frozen ? "fire-reduced" : ""}`}
      ref={stage}
      onPointerMove={event => {
        if (frozen || event.pointerType !== "mouse") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty(
          "--tilt-x",
          `${(0.5 - (event.clientY - bounds.top) / bounds.height) * 14}deg`
        );
        event.currentTarget.style.setProperty(
          "--tilt-y",
          `${((event.clientX - bounds.left) / bounds.width - 0.5) * 18}deg`
        );
      }}
      onPointerLeave={event => {
        event.currentTarget.style.removeProperty("--tilt-x");
        event.currentTarget.style.removeProperty("--tilt-y");
        timeline.current?.timeScale(1);
      }}
    >
      {!webgl && <FallbackName />}
      <div className="fist-speed" aria-hidden="true" />
      <div className="fist-sparks" aria-hidden="true" />
      <div className="loop-flash" aria-hidden="true" />
      <button
        className="fist-trigger"
        type="button"
        onClick={punch}
        aria-label="Punch and scatter the name"
        onPointerEnter={() => timeline.current?.timeScale(1.3)}
        onPointerLeave={() => timeline.current?.timeScale(1)}
      >
        <span className="fist-glow" />
        <span className="fist-illustration">
          <span className="fire-aura" aria-hidden="true" />
          <span className="fire-tongues" aria-hidden="true">
            {Array.from({ length: 20 }, (_, i) => (
              <i
                key={i}
                style={{
                  left: 9 + i * 4.1 + "%",
                  top: 34 + Math.sin(i * 2.4) * 18 + "%",
                  animationDelay: -i * 0.17 + "s",
                  rotate: ((i * 17) % 40) - 20 + "deg",
                }}
              />
            ))}
          </span>
          {!webgl && <RedFist />}
          {!frozen && (
            <Suspense fallback={null}>
              <FistMesh ready={onWebgl} paused={stopped} />
            </Suspense>
          )}
          <span className="fire-embers" aria-hidden="true">
            {Array.from({ length: 56 }, (_, i) => (
              <i
                key={i}
                style={{
                  left: ((i * 37) % 100) + "%",
                  top: 30 + ((i * 13) % 65) + "%",
                  animationDelay: -i * 0.11 + "s",
                  animationDuration: 1.3 + (i % 7) * 0.2 + "s",
                }}
              />
            ))}
          </span>
          <span className="loop-ring" aria-hidden="true" />
          <span className="loop-don" aria-hidden="true">
            DON!
          </span>
        </span>
        <span className="fist-label">CLICK TO PUNCH</span>
      </button>
      <button
        className="hero-pause"
        type="button"
        aria-pressed={paused}
        onClick={() => setPaused(!paused)}
      >
        {paused ? "▶ Play animation" : "Ⅱ Pause animation"}
      </button>
      {!frozen &&
        impact &&
        createPortal(
          <div
            className="fist-impact"
            aria-hidden="true"
            onAnimationEnd={event => {
              if (event.target === event.currentTarget) setImpact(false);
            }}
          >
            <span>DON!</span>
            <div className="fist-shards">
              {Array.from({ length: 12 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    rotate: i * 30 + "deg",
                    width: 12 + (i % 4) * 6 + "vw",
                  }}
                />
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
