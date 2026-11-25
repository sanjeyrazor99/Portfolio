import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Check, Copy, Menu, Target, Layers, Workflow, ListChecks } from "lucide-react";
import HeroGradientBackground from "@/components/portfolio/HeroGradientBackground";
import ExperienceGallery from "@/components/portfolio/ExperienceGallery";
import ProjectArtwork from "@/components/portfolio/ProjectArtwork";
import SkillsExplorer from "@/components/portfolio/SkillsExplorer";
import PortfolioChat from "@/components/portfolio/PortfolioChat";
import { useStudioMotion } from "@/hooks/useStudioMotion";
import {
  certifications,
  chatProfile,
  experiences,
  portfolioLinks,
  projects,
  aboutBio,
} from "@/data/portfolio";

const PortfolioJourney = lazy(() => import("@/components/portfolio/PortfolioJourney"));

const HeroFloatingForm = lazy(() => import("@/components/portfolio/HeroFloatingForm"));

const links = [
  ["About", "#about"],
  ["Projects", "#projects"],
  ["Experience", "#experience"],
  ["Skills", "#skills"],
  ["Chat", "#contact"],
] as const;

const workflow = [
  ["Define", "Start with the question, the people using the result, and what a good outcome looks like."],
  ["Prototype", "Build a small version first so the important assumptions can be tested early."],
  ["Build", "Connect the data, application, and model around a flow that is easy to inspect."],
  ["Evaluate", "Check the output, document failure cases, and use what breaks to guide the next iteration."],
] as const;

type ProjectKind = (typeof projects)[number]["kind"];

const projectKinds: Record<ProjectKind, string> = {
  game: "Games",
  ai: "AI",
  analytics: "Analytics",
  pipeline: "Pipelines",
  robot: "Robotics",
};

const processIcons = [Target, Layers, Workflow, ListChecks] as const;

const projectVisuals = {
  game: { stages: ["Player", "Game server", "AI player"] },
  ai: { stages: ["Collect", "Read images", "Analyze"] },
  analytics: { stages: ["Shot data", "xG model", "Goalie visuals"] },
  pipeline: { stages: ["5 sources", "Python ETL", "Database"] },
  robot: { stages: ["Sense", "Decide", "Navigate"] },
} satisfies Record<ProjectKind, { stages: string[] }>;


export default function Home() {
  const studio = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDetailsElement>(null);
  const coverSequence = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("portfolio-comic-theme");
      if (saved === "light" || saved === "dark") setTheme(saved);
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
    } catch {
      // The theme still works for this visit if storage is unavailable.
    }
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try {
      localStorage.setItem("portfolio-comic-theme", next);
    } catch {
      // Keep the selected theme in memory.
    }
  }

  const [aboutVisible, setAboutVisible] = useState(false);
  const [aboutStarted, setAboutStarted] = useState(false);

  useEffect(() => {
    const sequence = coverSequence.current;
    const cover = sequence?.querySelector<HTMLElement>(".studio-cover-shell");
    const checkpoint = sequence?.querySelector<HTMLElement>(".studio-about-anchor");
    if (!sequence || !cover || !checkpoint) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const previewMotion = import.meta.env.DEV && new URLSearchParams(location.search).get("motion") === "on";
    let frame = 0;

    function update() {
      frame = 0;
      if (!sequence || !cover || !checkpoint) return;
      const scrolled = Math.max(0, -sequence.getBoundingClientRect().top);
      const progress = Math.min(1, scrolled / Math.max(1, checkpoint.offsetTop));
      const reveal = preference.matches && !previewMotion ? Number(progress >= 0.5) : progress;
      cover.style.setProperty("--about-progress", String(reveal));
      setAboutVisible(reveal >= 0.65);
      setAboutStarted(reveal > 0);
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    preference.addEventListener("change", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      preference.removeEventListener("change", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  const [query, setQuery] = useState("");
  const [projectKind, setProjectKind] = useState<ProjectKind | "all">("all");
  const [activeProject, setActiveProject] = useState("");
  const [chapter, setChapter] = useState("home");
  const [step, setStep] = useState(0);
  useStudioMotion(studio, setActiveProject, setChapter);
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    let frame = 0;
    function revealLinkedProject() {
      const id = location.hash.slice(1);
      if (!projects.some(project => id === "project-" + project.id)) return;
      if (!document.getElementById(id)) {
        setProjectKind("all");
        setQuery("");
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    }
    revealLinkedProject();
    window.addEventListener("hashchange", revealLinkedProject);
    return () => {
      window.removeEventListener("hashchange", revealLinkedProject);
      cancelAnimationFrame(frame);
    };
  }, []);
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visibleProjects = projects.filter(project => {
    const text = [project.title, project.subtitle, project.description, ...project.tags].join(" ").toLowerCase();
    return (projectKind === "all" || project.kind === projectKind) && words.every(word => text.includes(word));
  });

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(portfolioLinks.email);
      setCopyStatus("Email copied");
    } catch {
      setCopyStatus("Copy the address directly or select it to open your email app.");
    }
  }

  return (
    <div className="studio" ref={studio} data-comic-theme={theme}>
      <svg className="studio-portrait-inks" aria-hidden="true" width="0" height="0">
        <defs>
          <filter id="portrait-warm-ink" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="1.13 0 0 0 .025  0 .88 0 0 .005  0 0 .73 0 .025  0 0 0 1 0" />
          </filter>
          <filter id="portrait-violet-ink" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="1.09 0 0 0 .035  0 .89 0 0 .012  0 0 1.22 0 .06  0 0 0 1 0" />
          </filter>
        </defs>
      </svg>
      <Suspense fallback={null}><PortfolioJourney theme={theme} /></Suspense>
      <nav className="studio-chapter-dock" aria-label="Portfolio sections">
        <a href="#home" aria-current={chapter === "home" ? "location" : undefined}>Home</a>
        {[...links.slice(0, 2), ["Process", "#process"], ...links.slice(2)].map(([label, href]) => (
          <a key={href} href={href} aria-current={chapter === href.slice(1) ? "location" : undefined}>{label}</a>
        ))}
        <button type="button" className="studio-theme-toggle" onClick={toggleTheme} aria-pressed={theme === "dark"} aria-label="Dark theme">
          {theme === "dark" ? "Dark" : "Light"}
        </button>
      </nav>
      <a className="studio-skip" href="#main">Skip to content</a>
      <main id="main">
        <div id="home" ref={coverSequence} className="studio-cover-sequence">
          <div id="about" className="studio-about-anchor" aria-hidden="true" />
          <div className="studio-cover-shell" data-about-started={aboutStarted}>
            <section className="studio-hero" aria-labelledby="hero-name">
              <HeroGradientBackground paused={aboutStarted} theme={theme} />
              <Suspense fallback={null}><HeroFloatingForm /></Suspense>
              <div className="studio-portrait">
                <img
                  src={`${import.meta.env.BASE_URL}sanjey-portrait-extended.png`}
                  width={1122}
                  height={1402}
                  alt="Portrait of Sanjey Manian"
                  fetchPriority="high"
                />
                <img
                  className="studio-portrait-shoulders"
                  aria-hidden="true"
                  src={`${import.meta.env.BASE_URL}sanjey-portrait-extended.png`}
                  width={1122}
                  height={1402}
                  alt=""
                />
              </div>
              <header className="studio-header studio-wrap">
                <p className="studio-location"><span>Based in</span><br />Plano, Texas</p>
                <nav className="studio-cover-nav" aria-label="Main navigation">
                  {links.slice(0, -1).map(([label, href]) => <a key={href} href={href}>{label}</a>)}
                </nav>
                <a className="studio-cover-contact" href="#contact">Ask my portfolio <ArrowUpRight size={16} strokeWidth={1.5} /></a>
                <details ref={menu} className="studio-menu" onKeyDown={event => {
                  if (event.key === "Escape" && menu.current?.open) {
                    menu.current.open = false;
                    menu.current.querySelector("summary")?.focus();
                  }
                }}>
                  <summary><Menu size={16} strokeWidth={1.5} /> Menu</summary>
                  <nav aria-label="Main navigation">
                    {links.map(([label, href]) => (
                      <a key={href} href={href} onClick={() => {
                        if (menu.current) menu.current.open = false;
                      }}>{label}<ArrowDownRight size={16} strokeWidth={1.5} /></a>
                    ))}
                  </nav>
                </details>
              </header>
              <div className="studio-wrap studio-hero-inner">
                <h1 id="hero-name"><span>SANJEY</span>{" "}<span>MANIAN</span></h1>
                <p className="studio-hero-copy">I build LLM systems, data pipelines, and real-time applications.</p>
              </div>
              <div className="studio-wrap studio-cover-footer">
                <div className="studio-cover-links">
                  <a href={portfolioLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={16} strokeWidth={1.5} /></a>
                  {portfolioLinks.resume && <a href={portfolioLinks.resume} download>Résumé <ArrowUpRight size={16} strokeWidth={1.5} /></a>}
                </div>
                <a className="studio-button studio-cover-cta" href="#projects">View my work <ArrowDownRight size={16} strokeWidth={1.5} /></a>
              </div>
            </section>
            <section
              id="about-panel"
              className="studio-cover-about"
              aria-labelledby="about-heading"
              inert={!aboutVisible}
            >
              <div className="studio-about-bio">
                <a className="studio-cover-about-back" href="#home">Back to cover</a>
                <h2 id="about-heading">About me</h2>
                {aboutBio.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                <a className="studio-about-link" href="#projects">
                  View projects <ArrowDownRight size={16} strokeWidth={1.5} aria-hidden="true" />
                </a>
              </div>
            </section>
          </div>
        </div>

        <section id="projects" className="studio-section studio-warm-section studio-work-gallery" aria-labelledby="work-heading">
          <div className="studio-wrap studio-gallery-layout">
            <aside className="studio-gallery-sidebar">
              <h2 id="work-heading">Selected work</h2>
              <nav className="studio-project-index" aria-label="Project index">
                {visibleProjects.map(project => (
                  <a key={project.id} href={`#project-${project.id}`} aria-current={project.id === (visibleProjects.some(item => item.id === activeProject) ? activeProject : visibleProjects[0]?.id) ? "true" : undefined}>
                    <span aria-hidden="true">{String(projects.indexOf(project) + 1).padStart(2, "0")}</span>{project.title}
                  </a>
                ))}
              </nav>
              <div className="studio-search">
                <label htmlFor="project-search">Search projects</label>
                <input id="project-search" type="search" value={query} onChange={event => setQuery(event.target.value)} />
              </div>
              <div className="studio-filters" role="group" aria-label="Filter projects by category">
                <button type="button" aria-pressed={projectKind === "all"} onClick={() => setProjectKind("all")}>All projects</button>
                {projects.map(({ kind }) => kind).filter((kind, index, kinds) => kinds.indexOf(kind) === index).map(kind => (
                  <button key={kind} type="button" aria-pressed={projectKind === kind} onClick={() => setProjectKind(kind)}>{projectKinds[kind]}</button>
                ))}
              </div>
              <p className="studio-gallery-count" role="status">{visibleProjects.length} of {projects.length} projects</p>
            </aside>
            <div className="studio-projects">
              {visibleProjects.map(project => {
                const { stages } = projectVisuals[project.kind];
                return (
                  <article key={project.id} id={`project-${project.id}`} className="studio-project" data-reveal>
                    <figure className="studio-project-figure">
                      <div className="studio-display-bar" aria-hidden="true"><span>{project.title}</span><span><i /> {projectKinds[project.kind]}</span></div>
                      <div className="studio-project-visual" data-kind={project.kind} aria-hidden="true">
                        <ProjectArtwork kind={project.kind} />
                      </div>
                      <figcaption>{stages.join(" → ")}</figcaption>
                    </figure>
                    <header className="studio-project-heading">
                      <p className="studio-project-category">{projectKinds[project.kind]}</p>
                      <h3>{project.title}</h3>
                      <p className="studio-project-context">{project.subtitle}</p>
                    </header>
                    <div className="studio-project-notes">
                      <p>{project.description}</p>
                      <ul className="studio-tags" aria-label="Technologies">
                        {project.tags.map(tag => <li key={tag}>{tag}</li>)}
                      </ul>
                    </div>
                    {project.github && <a href={project.github} target="_blank" rel="noreferrer">View on GitHub <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" /></a>}
                  </article>
                );
              })}
              {!visibleProjects.length && <p>No projects match these filters. <button type="button" onClick={() => { setProjectKind("all"); setQuery(""); }}>Clear filters</button></p>}
            </div>
          </div>
        </section>

        <section id="process" className="studio-section studio-warm-section" aria-labelledby="process-heading">
          <div className="studio-wrap studio-process-scene">
            <div className="studio-section-head" data-reveal="heading">
              <div><h2 id="process-heading">How I work</h2></div>

            </div>
            <ol className="studio-process-list" aria-label="Work process">
              {workflow.map(([title, description], index) => {
                const Icon = processIcons[index];
                return (
                  <li key={title} data-selected={step === index} data-reveal={index % 2 ? "right" : "left"}>
                    <span className="studio-process-step" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <h3><button type="button" onClick={() => setStep(index)} aria-pressed={step === index}>{title}</button></h3>
                    <div className="studio-process-visual" aria-hidden="true"><Icon size={34} strokeWidth={1.25} /></div>
                    <p>{description}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section id="experience" className="studio-section studio-warm-section" aria-labelledby="experience-heading">
          <div className="studio-wrap studio-experience-gallery-wrap">
            <ExperienceGallery roles={experiences} />
          </div>
        </section>

        <section id="skills" className="studio-section studio-warm-section" aria-labelledby="skills-heading">
          <div className="studio-wrap studio-skills-scene">
            <div className="studio-section-head" data-reveal="heading">
              <div><h2 id="skills-heading">Technical skills</h2></div>
              <p>{chatProfile.education}</p>
            </div>
            <SkillsExplorer />
            <div className="studio-education" data-reveal>
              <div><h3>Coursework</h3><p>{chatProfile.coursework}</p></div>
              <div><h3>Certifications &amp; training</h3><ul>{certifications.map(item => <li key={item}>{item}</li>)}</ul></div>
            </div>
          </div>
        </section>

        <section id="contact" className="studio-section studio-warm-section" aria-labelledby="portfolio-chat-title">
          <div id="contact-panel" className="studio-wrap studio-chat-workspace">
            <PortfolioChat>
              <a href={"mailto:" + portfolioLinks.email}>Email</a>
              <button type="button" onClick={copyEmail} aria-label="Copy email address">
                {copyStatus === "Email copied" ? <Check size={16} /> : <Copy size={16} />}
              </button>
              <a href={portfolioLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14} /></a>
              <span className="sr-only" role="status">{copyStatus}</span>
            </PortfolioChat>
          </div>
        </section>
      </main>
      <footer className="studio-footer studio-paper">
        <div className="studio-wrap studio-footer-inner">
          <div><span>© Sanjey Manian</span><a href="#home">Back to top <ArrowUpRight size={16} strokeWidth={1.5} /></a></div>
          <p className="studio-footer-mark" aria-hidden="true" data-reveal="heading">SANJEY MANIAN</p>
        </div>
      </footer>
    </div>
  );
}
