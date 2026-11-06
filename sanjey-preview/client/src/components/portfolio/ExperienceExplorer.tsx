import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { experiences } from "@/data/portfolio";

const filters = [
  "All",
  "Data Engineering",
  "AI / ML",
  "Leadership & Events",
  "Business & Creative",
];
const categories = [[1], [2], [3], [4], [1, 2], [2], [4], [4]];
const starts = [81, 79, 79, 77, 72, 72, 44, 0];
const skills = [
  ["Python", "SQL (PostgreSQL)", "Frappe Framework", "REST APIs"],
  ["Python", "pandas", "scikit-learn", "XGBoost", "Streamlit", "Plotly"],
  ["Video Editing", "Event Planning"],
  [],
  ["Python", "SQL", "Docker", "Streamlit", "Supabase", "RAG"],
  ["Model Evaluation", "Training Data"],
  [],
  ["SEO", "Analytical Skills", "Video Editing"],
];
const impacts: Record<number, string[]> = {
  3: ["100% order accuracy", "150+ transactions per shift"],
  4: ["~80% less data-collection time (estimated)", "1,000+ records analyzed"],
  5: ["100+ LLM failures found"],
};

export default function ExperienceExplorer({ frozen }: { frozen: boolean }) {
  const [filter, setFilter] = useState(0);
  const [selected, setSelected] = useState(0);
  const [skill, setSkill] = useState("");
  const [month, setMonth] = useState(82);
  const [scrubbed, setScrubbed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [manual, setManual] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const visible = experiences
    .map((_, i) => i)
    .filter(i => filter === 0 || categories[i].includes(filter));
  const current = visible.includes(selected) ? selected : visible[0];
  const role = experiences[current];
  function select(index: number) {
    setSelected(index);
    setExpanded(false);
    setManual(true);
  }
  useEffect(() => {
    if (frozen || matchMedia("(max-width:760px)").matches) return;
    function scroll() {
      if (!root.current) return;
      const rect = root.current.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setManual(false);
        return;
      }
      if (manual) return;
      const progress = Math.max(
        0,
        Math.min(
          0.999,
          -rect.top / Math.max(1, rect.height - window.innerHeight)
        )
      );
      setSelected(visible[Math.floor(progress * visible.length)]);
      setExpanded(false);
    }
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, [frozen, manual, filter]);
  function detail(mobile = false) {
    return (
      <motion.div
        key={current}
        id={(mobile ? "mobile-role-panel-" : "role-panel-") + current}
        role="tabpanel"
        aria-labelledby={(mobile ? "mobile-role-tab-" : "role-tab-") + current}
        className="explorer-detail"
        initial={frozen ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.23 }}
      >
        <span className="explorer-meta">
          Current · {82 - starts[current] + 1} months
        </span>
        <h3>{role.role}</h3>
        <p className="explorer-org">{role.org}</p>
        <p className="explorer-secondary">
          {[role.type, role.location].filter(Boolean).join(" · ")}
        </p>
        <p className="explorer-meta">{role.dates}</p>
        <ul>
          {(current === 7 ? [] : role.bullets)
            .slice(0, expanded ? undefined : 3)
            .map(b => (
              <li key={b}>{b}</li>
            ))}
        </ul>
        {role.bullets.length > 3 && (
          <button
            className="explorer-text-button"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
        <div className="explorer-chips">
          {skills[current].map(item => (
            <button
              key={item}
              aria-pressed={skill === item}
              onClick={() => {
                setSkill(skill === item ? "" : item);
                setManual(true);
              }}
            >
              {item}
            </button>
          ))}
        </div>
        {skill && (
          <p className="explorer-meta" role="status">
            {skill} · Used in{" "}
            {skills.filter(group => group.includes(skill)).length} roles{" "}
            <button onClick={() => setSkill("")}>Clear</button>
          </p>
        )}
        <div className="explorer-impacts">
          {impacts[current]?.map(value => (
            <strong key={value}>{value}</strong>
          ))}
        </div>
        <div className="explorer-paging">
          <button
            disabled={visible.indexOf(current) === 0}
            onClick={() => select(visible[visible.indexOf(current) - 1])}
          >
            ← Previous
          </button>
          <span>
            Role {visible.indexOf(current) + 1} of {visible.length}
          </span>
          <button
            disabled={visible.indexOf(current) === visible.length - 1}
            onClick={() => select(visible[visible.indexOf(current) + 1])}
          >
            Next →
          </button>
        </div>
      </motion.div>
    );
  }
  return (
    <div
      className={frozen ? "explorer-run explorer-static" : "explorer-run"}
      ref={root}
    >
      <div className="experience-explorer">
        <div className="explorer-filters" aria-label="Filter experience">
          {filters.map((name, i) => (
            <button
              key={name}
              aria-pressed={filter === i}
              onClick={() => {
                setFilter(i);
                setSelected(
                  categories.findIndex(c => i === 0 || c.includes(i))
                );
                setManual(true);
                setExpanded(false);
              }}
            >
              {name}
            </button>
          ))}
          <span>{visible.length} of 8 roles</span>
        </div>
        {!manual && <p className="explorer-meta">Scroll or click to explore</p>}
        <div className="explorer-timeline">
          <div className="explorer-years">
            {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map(y => (
              <span key={y}>{y}</span>
            ))}
          </div>
          {visible.map(i => (
            <motion.button
              layout={!frozen}
              key={i}
              className={"explorer-bar " + (i === current ? "selected" : "")}
              style={{
                marginLeft: (starts[i] / 83) * 100 + "%",
                width: ((83 - starts[i]) / 83) * 100 + "%",
                opacity:
                  (skill && !skills[i].includes(skill)) ||
                  (scrubbed && starts[i] > month)
                    ? 0.25
                    : 1,
              }}
              title={
                experiences[i].role +
                " · " +
                experiences[i].org +
                " · " +
                experiences[i].dates +
                " · " +
                (83 - starts[i]) +
                " months"
              }
              aria-label={
                "Select " + experiences[i].role + " at " + experiences[i].org
              }
              onClick={() => select(i)}
            >
              <span>{experiences[i].org}</span>
            </motion.button>
          ))}
          <label className="explorer-scrub">
            Active in{" "}
            {new Date(2020, month, 1).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
            <input
              type="range"
              min="0"
              max="82"
              value={month}
              onChange={e => {
                setMonth(Number(e.target.value));
                setScrubbed(true);
                setManual(true);
              }}
            />
          </label>
        </div>
        <div className="explorer-layout">
          <div
            className="explorer-rail"
            role="tablist"
            aria-label="Experience roles"
            aria-orientation="vertical"
          >
            {visible.map(i => (
              <button
                ref={node => {
                  tabs.current[i] = node;
                }}
                key={i}
                role="tab"
                id={"role-tab-" + i}
                aria-selected={current === i}
                aria-controls={"role-panel-" + i}
                tabIndex={current === i ? 0 : -1}
                style={{
                  opacity: skill && !skills[i].includes(skill) ? 0.35 : 1,
                }}
                onClick={() => select(i)}
                onKeyDown={e => {
                  let pos = visible.indexOf(i);
                  if (e.key === "ArrowDown")
                    pos = Math.min(visible.length - 1, pos + 1);
                  else if (e.key === "ArrowUp") pos = Math.max(0, pos - 1);
                  else if (e.key === "Home") pos = 0;
                  else if (e.key === "End") pos = visible.length - 1;
                  else return;
                  e.preventDefault();
                  select(visible[pos]);
                  tabs.current[visible[pos]]?.focus();
                }}
              >
                <span className="explorer-meta">{experiences[i].org}</span>
                <strong>{experiences[i].role}</strong>
                <span className="explorer-meta">{experiences[i].dates}</span>
              </button>
            ))}
          </div>
          <div className="explorer-desktop">{detail()}</div>
        </div>
        <div className="explorer-mobile">
          {visible.map(i => (
            <div key={i}>
              <button
                id={"mobile-role-tab-" + i}
                className="explorer-accordion"
                aria-controls={"mobile-role-panel-" + i}
                aria-expanded={current === i}
                onClick={() => select(i)}
              >
                {experiences[i].org}
                <strong>{experiences[i].role}</strong>
              </button>
              {current === i && detail(true)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
