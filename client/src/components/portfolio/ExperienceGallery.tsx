import { useEffect, useRef, useState } from "react";
import { ArrowDownRight } from "lucide-react";
import type { Experience } from "@/data/portfolio";

export default function ExperienceGallery({ roles }: { roles: readonly Experience[] }) {
  const gallery = useRef<HTMLDivElement>(null);
  const ball = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = gallery.current;
    if (!root) return;
    const panels = Array.from(root.querySelectorAll<HTMLElement>(".studio-role-exhibit"));
    let frame = 0;
    let lastActive = -1;

    function update() {
      frame = 0;
      const viewport = window.innerHeight;
      const focalLine = viewport * .43;
      const bounds = panels.map(panel => panel.getBoundingClientRect());
      const marker = ball.current;
      const track = marker?.parentElement;
      const first = bounds[0];
      const last = bounds.at(-1);
      if (marker && track && first && last) {
        const trackTop = track.getBoundingClientRect().top;
        const start = first.top - trackTop + 30;
        const finish = last.top - trackTop + 30;
        const center = Math.max(start, Math.min(finish, focalLine - trackTop));
        marker.style.setProperty("--timeline-ball-center", center + "px");
        marker.style.setProperty("--timeline-ball-travel", String(center - start));
      }
      let closest = 0;
      let distance = Infinity;

      panels.forEach((panel, index) => {
        const { top, bottom } = bounds[index];
        const progress = Math.max(0, Math.min(1, (viewport * .96 - top) / (viewport * .36)));
        const eased = 1 - (1 - progress) ** 3;
        panel.style.setProperty("--role-entry", eased.toFixed(3));
        const gap = Math.max(top - focalLine, focalLine - bottom, 0);
        if (gap < distance) {
          closest = index;
          distance = gap;
        }
      });

      if (lastActive !== closest) {
        lastActive = closest;
        setActive(closest);
      }
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    const size = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(schedule);
    size?.observe(root);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      size?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [roles]);

  return (
    <div ref={gallery} className="studio-role-gallery">
      <div className="studio-role-gallery-index">
        <h2 id="experience-heading">Experience</h2>
        <nav aria-label="Experience index">
          {roles.map((role, index) => (
            <a key={role.org} href={`#experience-role-${index + 1}`} aria-current={index === active ? "location" : undefined}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {role.org}
              <ArrowDownRight size={15} aria-hidden="true" />
            </a>
          ))}
        </nav>
      </div>
      <div className="studio-role-exhibits">
        {roles.length > 0 && (
          <svg ref={ball} className="studio-timeline-ball" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="11" fill="#fff7e5" stroke="#253455" />
            <path fill="#253455" d="m12 7 4.6 3.4-1.8 5.3H9.2l-1.8-5.3zM8 2.3 6 6l-4.2.9A11 11 0 0 1 8 2.3Zm8 0 2 3.7 4.2.9A11 11 0 0 0 16 2.3ZM1.5 15l4 1 1 4.1A11 11 0 0 1 1.5 15Zm21 0-4 1-1 4.1a11 11 0 0 0 5-5.1ZM9 22l3-3 3 3a11 11 0 0 1-6 0Z" />
            <path d="m12 7 0-5m4.6 8.4 5.6-3.5m-7.4 8.8 3.1 4.8m-8.7-4.8-3.1 4.8m1.3-10.1L2 7" fill="none" stroke="#253455" strokeWidth=".6" />
          </svg>
        )}
        {roles.map((role, index) => (
          <article key={role.org} id={`experience-role-${index + 1}`} className="studio-role-exhibit" data-active={index === active} aria-labelledby={`experience-title-${index + 1}`}>
            <div className="studio-role-screen">
              <header className="studio-role-screen-header">
                <div className="studio-role-file-meta"><p>{role.org}</p><p>{role.dates}</p></div>
                <h3 id={`experience-title-${index + 1}`}>{role.role}</h3>
              </header>
              <div className="studio-role-screen-body">
                {(role.type || role.location) && <p className="studio-role-screen-context">{[role.type, role.location].filter(Boolean).join(" · ")}</p>}
                {role.bullets.length > 0 && <ul>{role.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul>}
                {role.aside && <p>{role.aside}</p>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
