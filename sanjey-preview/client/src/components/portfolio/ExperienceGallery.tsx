import { useEffect, useRef, useState } from "react";
import { ArrowDownRight } from "lucide-react";
import type { Experience } from "@/data/portfolio";

export default function ExperienceGallery({ roles }: { roles: readonly Experience[] }) {
  const gallery = useRef<HTMLDivElement>(null);
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
      let closest = 0;
      let distance = Infinity;

      panels.forEach((panel, index) => {
        const bounds = panel.getBoundingClientRect();
        const gap = Math.max(bounds.top - focalLine, focalLine - bounds.bottom, 0);
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
