import { lazy, Suspense, useEffect, useRef } from "react";
import DetailedEarthFallback from './DetailedEarthFallback';
const EarthScene = lazy(() => import("./EarthScene"));

export default function BackgroundWorld({
  frozen,
  onReady,
}: {
  frozen: boolean;
  onReady: (value: boolean) => void;
}) {
  const world = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let frame = 0;
    let smooth = 0;
    let target = 0;
    function read() {
      target =
        scrollY /
        Math.max(1, document.documentElement.scrollHeight - innerHeight);
    }
    function draw() {
      smooth += (target - smooth) * (frozen ? 1 : 0.07);
      const p = smooth;
      world.current?.style.setProperty('--world-depth',String(p));
      const chapters = [
        "home",
        "about",
        "projects",
        "experience",
        "skills",
        "contact",
      ];
      const positions = [
        [50, 48, 1],
        [78, 40, 1.4],
        [74, 88, 3],
        [55, 100, 3.8],
        [22, 42, 1.5],
        [50, 45, 1.1],
      ];
      let section = 0;
      let blend = 0;
      for (let i = 1; i < chapters.length; i++) {
        const node = document.getElementById(chapters[i]);
        if (node && scrollY >= node.offsetTop - innerHeight * 0.6) {
          section = i;
        }
      }
      const next = document.getElementById(chapters[Math.min(5, section + 1)]);
      if (next && section < 5)
        blend = Math.max(
          0,
          Math.min(1, 1 - next.getBoundingClientRect().top / innerHeight)
        );
      const a = positions[section],
        b = positions[Math.min(5, section + 1)];
      const x = a[0] + (b[0] - a[0]) * blend;
      const y = a[1] + (b[1] - a[1]) * blend;
      const scale = a[2] + (b[2] - a[2]) * blend;
      world.current?.style.setProperty("--world-x", x + "vw");
      if (world.current) world.current.dataset.chapter = chapters[section];
      world.current?.style.setProperty("--world-y", y + "vh");
      world.current?.style.setProperty("--world-scale", String(scale));
      if (progress.current) progress.current.style.top = p * 100 + "%";
      frame = requestAnimationFrame(draw);
    }
    read();
    draw();
    addEventListener("scroll", read, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", read);
    };
  }, [frozen]);
  return (
    <>
      <div
        className={"background-world " + (frozen ? "world-static" : "")}
        aria-hidden="true"
        data-chapter="home"
        ref={world}
      >
        <div className="world-stars" />
        <div className="world-planet">
          <div className="world-fallback">
            <DetailedEarthFallback />
          </div>
          {!frozen && (
            <Suspense fallback={null}>
              <EarthScene
                ambient
                onReady={ready => {
                  if (world.current) world.current.dataset.earthReady = String(ready);
                  onReady(ready);
                }}
              />
            </Suspense>
          )}
        </div>
        <div className="world-moon" />
        <div className="world-vignette" />
      </div>
      <nav className="orbit-progress" aria-label="Page chapters">
        <span ref={progress} aria-hidden="true">
          ●
        </span>
        {["about", "projects", "experience", "skills", "contact"].map(
          (id, i) => (
            <a href={"#" + id} key={id} aria-label={"Go to " + id}>
              {"•"}
            </a>
          )
        )}
      </nav>
    </>
  );
}

