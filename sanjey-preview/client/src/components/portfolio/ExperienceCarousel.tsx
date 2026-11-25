import { useEffect, useRef, useState, useId, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { Experience } from "@/data/portfolio";

const roleDuration = 8000;

export default function ExperienceCarousel({ roles }: { roles: readonly Experience[] }) {
  const [selected, setSelected] = useState(0);
  const [turnDirection, setTurnDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const stageId = useId();
  const stage = useRef<HTMLDivElement>(null);
  const count = roles.length;
  const playing = count > 1 && !paused && visible && tabVisible && motionAllowed;
  const role = roles[selected];

  useEffect(() => {
    function followRoleLink() {
      const match = /^#experience-role-(\d+)$/.exec(window.location.hash);
      if (!match) return;
      const index = Number(match[1]) - 1;
      if (index < 0 || index >= count) return;
      setSelected(index);
      setPaused(true);
      document.getElementById("experience")?.scrollIntoView({ behavior: "instant" });
    }

    followRoleLink();
    window.addEventListener("hashchange", followRoleLink);
    return () => window.removeEventListener("hashchange", followRoleLink);
  }, [count]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const previewMotion = import.meta.env.DEV && new URLSearchParams(location.search).get("motion") === "on";
    function updateMotion() {
      setMotionAllowed(previewMotion || !preference.matches);
    }
    function updateTabVisibility() {
      setTabVisible(!document.hidden);
    }
    updateMotion();
    updateTabVisibility();
    preference.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateTabVisibility);

    const observer = typeof IntersectionObserver === "undefined" ? undefined
      : new IntersectionObserver(([entry]) => setVisible(entry.intersectionRatio >= 0.5), { threshold: 0.5 });
    if (stage.current) observer?.observe(stage.current);
    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateTabVisibility);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      setTurnDirection(1);
      setSelected(current => (current + 1) % count);
    }, roleDuration);
    return () => window.clearTimeout(timer);
  }, [playing, selected, count]);

  useEffect(() => {
    const viewport = stage.current;
    const deck = viewport?.firstElementChild;
    if (!viewport || !(deck instanceof HTMLElement) || typeof ResizeObserver === "undefined") return;

    const measure = () => viewport.style.setProperty("--role-stage-height", deck.offsetHeight + "px");
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(deck);
    return () => observer.disconnect();
  }, [count]);

  if (!role) return null;

  function rotate(direction: number) {
    setPaused(true);
    setTurnDirection(direction);
    setSelected(current => (current + direction + count) % count);
  }

  return (
    <div className="studio-role-carousel" role="group" aria-label="Experience carousel">
      <div className="studio-role-index">
        {motionAllowed && count > 1 && (
          <div className="studio-role-playback">
            <button type="button" onClick={() => setPaused(value => !value)}>
              {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
              {paused ? "Play rotation" : "Pause rotation"}
            </button>
            <div className="studio-role-countdown" aria-hidden="true">
              {playing && <span key={selected} style={{ animationDuration: roleDuration + "ms" }} />}
            </div>
          </div>
        )}
        <div
          className="studio-role-timeline"
          role="group"
          aria-label="Choose a role"
          style={{ "--role-progress": count > 1 ? selected / (count - 1) : 0 } as CSSProperties}
        >
          {roles.map((item, index) => (
            <button
              key={item.org}
              type="button"
              aria-label={`Role ${index + 1}: ${item.org}, ${item.role}`}
              aria-controls={stageId}
              aria-current={index === selected ? "step" : undefined}
              onFocus={() => setPaused(true)}
              onClick={() => {
                setPaused(true);
                const forward = (index - selected + count) % count;
                setTurnDirection(forward <= count / 2 ? 1 : -1);
                setSelected(index);
              }}
            >
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.org}</strong>
            </button>
          ))}
        </div>
      </div>

      <div
        id={stageId}
        ref={stage}
        className="studio-role-carousel-stage"
        data-playing={playing}
        style={{ "--role-turn": turnDirection } as CSSProperties}
      >
        <div className="studio-role-carousel-deck">
          {roles.map((item, index) => {
            const half = Math.floor(count / 2);
            const offset = (index - selected + count + half) % count - half;
            const current = offset === 0;
            return (
              <article
                key={item.org}
                className="studio-role-carousel-card"
                data-position={Math.abs(offset) <= 1 ? offset : "offstage"}
                style={{ "--role-offset": Math.max(-2, Math.min(2, offset)) } as CSSProperties}
                aria-hidden={!current}
              >
                <header>
                  <p className="studio-role-card-company">{item.org}</p>
                  <h3>{item.role}</h3>
                  <p className="studio-role-card-dates">{item.dates}</p>
                </header>
                {current && (
                  <div className="studio-role-carousel-details">
                    {(item.type || item.location) && <p className="studio-role-card-context">{[item.type, item.location].filter(Boolean).join(" · ")}</p>}
                    {item.bullets.length > 0 && <ul>{item.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul>}
                    {item.aside && <p>{item.aside}</p>}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      <div className="studio-role-carousel-controls">
        <button type="button" onFocus={() => setPaused(true)} onClick={() => rotate(-1)} aria-label="Previous role" disabled={count < 2}>
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <span aria-live={playing ? "off" : "polite"} aria-atomic="true">
          <span className="sr-only">{role.org}, {role.role}. Role </span>
          {selected + 1} / {count}
        </span>
        <button type="button" onFocus={() => setPaused(true)} onClick={() => rotate(1)} aria-label="Next role" disabled={count < 2}>
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
