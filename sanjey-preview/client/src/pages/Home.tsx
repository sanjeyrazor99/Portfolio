import HeroGradientBackground from "@/components/portfolio/HeroGradientBackground";
import BackgroundWorld from "@/components/portfolio/BackgroundWorld";
import ExperienceExplorer from "@/components/portfolio/ExperienceExplorer";
import RedFist from "@/components/portfolio/RedFist";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Download,
  Linkedin,
  MapPin,
  Volume2,
  VolumeX,
  Menu,
  X,
  Copy,
  Check,
  Play,
  Zap,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import {
  projects,
  stats,
  portfolioLinks,
  certifications,
} from "@/data/portfolio";
import { RegistryMark, Counter } from "@/components/portfolio/Visuals";
import CharacterArt from "@/components/portfolio/CharacterArt";
import FistStage from "@/components/portfolio/FistStage";
import MangaScrollFX from "@/components/portfolio/MangaScrollFX";
import SkillConstellation from "@/components/portfolio/SkillConstellation";
import ProjectCard from "@/components/portfolio/ProjectCard";
import PortfolioChat from "@/components/portfolio/PortfolioChat";
const nav = ["Home", "About", "Skills", "Experience", "Projects", "Contact"];

export default function Home() {
  const [mode, setMode] = useState<"saitama" | "garou">("saitama");
  const [backgroundWebgl, setBackgroundWebgl] = useState(false);
  const [fistWebgl, setFistWebgl] = useState(false);
  const [lite, setLite] = useState(false);
  const [readMode, setReadMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false);
  const [sound, setSound] = useState(false);
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState("home");
  const [effect, setEffect] = useState("");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const [typed, setTyped] = useState("AI/LLM & Data Engineer • UT Dallas ’28");
  const frozen = lite || readMode || systemReduced;
  const motionActive = !frozen;
  const manualMode = useRef(false);
  const cursor = useRef<HTMLDivElement>(null);
  const inkCanvas = useRef<HTMLCanvasElement>(null);
  const slashTimer = useRef<number | null>(null);
  const progress = useRef<HTMLDivElement>(null);
  const inkProgress = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const reduced = useRef(false);
  function impact(kind: string) {
    if (timer.current) clearTimeout(timer.current);
    setEffect(kind);
    timer.current = setTimeout(
      () => setEffect(""),
      kind === "serious" ? 1800 : 850
    );
    if (sound && !frozen && !reduced.current) {
      try {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        audio.current ??= new AC();
        const ctx = audio.current!;
        void ctx.resume();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(110, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.18);
        g.gain.setValueAtTime(0.12, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.23);
      } catch {
        /* Audio is optional. */
      }
    }
  }
  function characterClick(
    character: "saitama" | "garou" | "earth" | "drone" = mode
  ) {
    if (character === "drone") {
      impact("don");
      return;
    }
    if (character === "earth") {
      impact("punch");
      window.setTimeout(
        () =>
          document.getElementById("skills")?.scrollIntoView({
            behavior:
              lite || readMode || reduced.current ? "instant" : "smooth",
            block: "start",
          }),
        360
      );
      return;
    }
    impact(character === "saitama" ? "serious" : "monster");
  }
  function switchMode() {
    manualMode.current = true;
    setMode(v => (v === "saitama" ? "garou" : "saitama"));
    impact("don");
  }
  useEffect(() => {
    setMounted(true);
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = mq.matches;
    setSystemReduced(mq.matches);
    const change = () => {
      reduced.current = mq.matches;
      setSystemReduced(mq.matches);
    };
    mq.addEventListener("change", change);
    let seq: string[] = [];
    const konami = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];
    const key = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName))
        return;
      seq = [...seq, e.key].slice(-10);
      if (
        seq.join("|").toLowerCase() === konami.join("|").toLowerCase() &&
        !document.querySelector(".lite-mode,.read-mode,.system-reduced")
      )
        impact("serious");
      if (e.key === "Escape") {
        setMenu(false);
        setNotice("");
      }
    };
    const slash = inkCanvas.current;
    const slashContext = slash?.getContext("2d");
    let slashActive = false;
    let slashPoint: { x: number; y: number } | null = null;
    const resizeSlash = () => {
      if (!slash) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      slash.width = window.innerWidth * dpr;
      slash.height = window.innerHeight * dpr;
      slash.style.width = `${window.innerWidth}px`;
      slash.style.height = `${window.innerHeight}px`;
      slashContext?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeSlash();
    window.addEventListener("resize", resizeSlash);
    const startSlash = (e: PointerEvent) => {
      if (
        e.button !== 0 ||
        document.querySelector(".lite-mode,.read-mode,.system-reduced")
      )
        return;
      const origin = e.target;
      if (
        !(origin instanceof Element) ||
        !origin.closest(".hero-scene,.constellation-stage,.projects-grid")
      )
        return;
      slashActive = true;
      slashPoint = { x: e.clientX, y: e.clientY };
      if (slash) {
        if (slashTimer.current) clearTimeout(slashTimer.current);
        slash.style.transition = "none";
        slash.style.opacity = "1";
      }
    };
    const stopSlash = () => {
      slashActive = false;
      slashPoint = null;
      if (slash) {
        slash.style.transition = "opacity 480ms linear";
        slash.style.opacity = "0";
        if (slashTimer.current) clearTimeout(slashTimer.current);
        slashTimer.current = window.setTimeout(
          () =>
            slashContext?.clearRect(
              0,
              0,
              window.innerWidth,
              window.innerHeight
            ),
          500
        );
      }
    };
    const move = (e: PointerEvent) => {
      if (slashActive && slashPoint && slashContext && slash) {
        const frozenPage = document.querySelector(
          ".lite-mode,.read-mode,.system-reduced"
        );
        if (!frozenPage && !reduced.current) {
          slashContext.beginPath();
          slashContext.moveTo(slashPoint.x, slashPoint.y);
          slashContext.lineTo(e.clientX, e.clientY);
          slashContext.strokeStyle =
            getComputedStyle(
              document.querySelector(".portfolio") as HTMLElement
            )
              .getPropertyValue("--accent")
              .trim() || "#ffd400";
          slashContext.lineWidth = 2.5;
          slashContext.lineCap = "round";
          slashContext.globalAlpha = 0.8;
          slashContext.shadowBlur = 7;
          slashContext.shadowColor = slashContext.strokeStyle;
          slashContext.stroke();
          slashContext.globalAlpha = 1;
          slashContext.shadowBlur = 0;
        }
        slashPoint = { x: e.clientX, y: e.clientY };
      }
      if (cursor.current) {
        cursor.current.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
        cursor.current.style.opacity = "1";
      }
      const freezePointer = document.querySelector(
        ".lite-mode,.read-mode,.system-reduced"
      );
      const site = document.querySelector<HTMLElement>(".portfolio");
      if (!freezePointer && site) {
        const angle = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 7;
        site.style.setProperty("--pointer-angle", `${angle.toFixed(2)}deg`);
      }
      const hero = document.getElementById("home");
      const bounds = hero?.getBoundingClientRect();
      if (
        !freezePointer &&
        hero &&
        bounds &&
        e.clientY >= bounds.top &&
        e.clientY <= bounds.bottom
      ) {
        const x = Math.max(
          -1,
          Math.min(
            1,
            (e.clientX - bounds.left) / Math.max(1, bounds.width) - 0.5
          )
        );
        const y = Math.max(
          -1,
          Math.min(
            1,
            (e.clientY - bounds.top) / Math.max(1, bounds.height) - 0.5
          )
        );
        hero.style.setProperty("--pointer-x", `${(x * 18).toFixed(1)}px`);
        hero.style.setProperty("--pointer-y", `${(y * 12).toFixed(1)}px`);
      }
    };
    const scroll = () => {
      const position =
        window.scrollY /
        Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (progress.current)
        progress.current.style.transform = `scaleX(${position})`;
      if (inkProgress.current)
        inkProgress.current.style.transform = `scaleY(${position})`;
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", startSlash, { passive: true });
    document.addEventListener("pointerup", stopSlash, { passive: true });
    document.addEventListener("pointercancel", stopSlash, { passive: true });
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", scroll, { passive: true });
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const id = e.target.id;
            setActive(id);
            if (!manualMode.current)
              setMode(id === "skills" ? "garou" : "saitama");
          }
        });
      },
      { rootMargin: "-12% 0px -65% 0px", threshold: 0 }
    );
    document.querySelectorAll("section[id]").forEach(x => observer.observe(x));
    return () => {
      mq.removeEventListener("change", change);
      if (timer.current) clearTimeout(timer.current);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", startSlash);
      document.removeEventListener("pointerup", stopSlash);
      document.removeEventListener("pointercancel", stopSlash);
      window.removeEventListener("resize", resizeSlash);
      if (slashTimer.current) clearTimeout(slashTimer.current);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", scroll);
      observer.disconnect();
      void audio.current?.close();
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector(
      ".notice-dialog"
    ) as HTMLElement | null;
    const focusables = dialog?.querySelectorAll<HTMLElement>("button,a[href]");
    focusables?.[0]?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key === "Tab" && focusables?.length) {
        const first = focusables[0],
          last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [notice]);
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(portfolioLinks.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setNotice(`Copy this address: ${portfolioLinks.email}`);
    }
  }
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    if (lite || readMode) root.style.scrollBehavior = "auto";
    return () => {
      root.style.scrollBehavior = previous;
    };
  }, [lite, readMode]);
  return (
    <div
      className={`portfolio mode-${mode} ${lite ? "lite-mode" : ""} ${readMode ? "read-mode" : ""} ${systemReduced ? "system-reduced" : ""} ${effect === "serious" ? "serious-mode" : ""} ${effect === "monster" ? "monster-mode" : ""}`}
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="scroll-progress" ref={progress} />
      <div className="manga-ink-progress" aria-hidden="true">
        <i ref={inkProgress} />
      </div>
      <div className="manga-speed-field" aria-hidden="true" />
      <div className="chapter-flash chapter-flash--white" aria-hidden="true" />
      <div className="chapter-flash chapter-flash--black" aria-hidden="true" />
      <svg
        className="manga-filter-defs"
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter
            id="manga-rough-edge"
            x="-5%"
            y="-5%"
            width="110%"
            height="110%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.035"
              numOctaves="2"
              seed="7"
              result="inkNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="inkNoise"
              scale="1.35"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <div className="custom-cursor" ref={cursor} aria-hidden="true"><RedFist /></div>
      <MangaScrollFX enabled={motionActive} />
      {mounted && (
        <canvas
          className="ink-slash-layer"
          ref={inkCanvas}
          aria-hidden="true"
        />
      )}
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Sanjey Manian home">
          <RegistryMark />
          <span>
            SANJEY<span className="brand-dot">.</span>
            <small>SANJEY MANIAN / PORTFOLIO</small>
          </span>
        </a>
        <nav className={menu ? "nav open" : "nav"} aria-label="Main navigation">
          {nav.map(n => (
            <a
              key={n}
              className={active === n.toLowerCase() ? "active" : ""}
              href={"#" + n.toLowerCase()}
              onClick={() => setMenu(false)}
            >
              {n}
            </a>
          ))}
        </nav>
        <div className="header-controls">
          <button
            className={`read-switch ${readMode ? "enabled" : ""}`}
            onClick={() => setReadMode(v => !v)}
            aria-pressed={readMode}
            aria-label={
              readMode
                ? "Turn off Read Mode and restore motion"
                : "Turn on Read Mode to freeze motion and simplify reading"
            }
          >
            <BookOpen size={12} /> READ<span>{readMode ? "ON" : "OFF"}</span>
          </button>
          <button
            className="mode-switch"
            onClick={switchMode}
            aria-label={`Switch to ${mode === "saitama" ? "Garou" : "Saitama"} Mode`}
          >
            <span className="mode-indicator" />
            {mode === "saitama" ? "SAITAMA" : "GAROU"}
            <span className="switch-track">
              <i />
            </span>
          </button>
          <button
            className={`lite-switch ${lite ? "enabled" : ""}`}
            aria-pressed={lite}
            onClick={() => setLite(v => !v)}
          >
            <Zap size={12} /> LITE<span>{lite ? "ON" : "OFF"}</span>
          </button>
          <button
            className="menu-toggle"
            onClick={() => setMenu(v => !v)}
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <BackgroundWorld frozen={frozen} onReady={setBackgroundWebgl} /><main id="main">
        <div className={frozen ? "fist-run fist-frozen" : "fist-run"}><section id="home" className="hero">
          <HeroGradientBackground mode={mode} frozen={frozen} />
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-coordinate left-coordinate">
            REGISTRY ID / SM–2028
            <br />
            DATA & AI DIVISION
          </div>
          <div className="hero-coordinate right-coordinate">
            SCENE 001 / ORBIT<br />
            ORIGINAL PROCEDURAL 3D
          </div>
          <div className="hero-content">
            <div className="availability">
              <span /> OPEN TO DATA & AI OPPORTUNITIES
            </div>
            <p className="hero-kicker">AI/LLM & DATA ENGINEER</p>
            <h1 className="hero-accessible-title">Sanjey Manian</h1>
            <div className="hero-subtitle">
              <span className="code-bracket">&gt;</span> {typed}
              <span className="typing-caret" aria-hidden="true" />
            </div>
            <p className="hero-tagline">
              I build AI systems and data pipelines that ship.
            </p>
            <div className="hero-actions">
              <a href="#projects" className="btn primary">
                View my work
                <ArrowUpRight size={19} />
              </a>
              {portfolioLinks.resume ? (
                <a
                  href={portfolioLinks.resume}
                  download
                  className="btn secondary"
                >
                  <Download size={16} /> Download résumé
                </a>
              ) : (
                <button
                  className="btn secondary"
                  onClick={() =>
                    setNotice(
                      "Résumé upload pending. In the meantime, explore the experience section or contact Sanjey directly."
                    )
                  }
                >
                  <Download size={16} /> Download résumé
                </button>
              )}
            </div>
            <div className="hero-meta">
              <span>
                <MapPin size={13} /> Plano, TX
              </span>
              <span className="meta-rule" />
              <a
                href={portfolioLinks.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                <Linkedin size={14} /> Connect on LinkedIn
                <ArrowUpRight size={12} />
              </a>
            </div>
            
          </div>
          <FistStage frozen={frozen} webgl={fistWebgl} onWebgl={setFistWebgl} />
        </section></div>
        <div className="quick-stats">
          {stats.slice(0, 4).map(s => (
            <Counter key={s.label} {...s} lite={lite} frozen={frozen} />
          ))}
        </div>
        <section
          id="about"
          className="section about-section"
          data-manga-chapter
        >
          <span className="manga-glyph-strip" aria-hidden="true">
            ドン · ゴゴ · 拳
          </span>
          <div
            className="section-index"
            data-manga-panel
            data-manga-onomatopoeia
          >
            01 / ABOUT 
            <span className="manga-page-number" aria-hidden="true">
              01
            </span>
          </div>
          <div className="about-layout">
            <div className="about-copy">
              <p className="eyebrow">
                <span className="accent-line" /> ABOUT SANJEY
              </p>
              <h2>
                Computer science.<br /><span>Applied AI.</span>
              </h2>
              <p className="lead">
                Building LLM systems and data pipelines.
              </p>
              <p>
                I'm a computer science undergraduate at{" "}
                <strong>The University of Texas at Dallas</strong> (B.S.,
                expected 2028). I build LLM-powered and machine learning systems
                in Python, including a RAG system on Supabase and an AI player
                for a real-time multiplayer game.
              </p>
              <p>
                I've stress-tested a multimodal generative AI model to log{" "}
                <strong>100+ failures</strong> and build enterprise data
                pipelines. I'm looking to ship scalable AI features in Data & AI
                internships and roles.
              </p>
              <p>
                Beyond code, I've edited video for YouTube creators since 2020
                and worked on an Amazon FBA e-commerce business since 2023.
                Audience, marketing, and business impact matter as much as the
                implementation.
              </p>
              <div className="coursework">
                <span className="eyebrow">RELEVANT COURSEWORK</span>
                <p>
                  Data Structures & Algorithms · Object-Oriented Programming ·
                  Databases (SQL) · Linux/Unix Systems
                </p>
              </div>
            </div>
            <div className="about-character-breakout" data-manga-panel>
              <CharacterArt
                character="saitama"
                pose="standing"
                className="character-art--about"
                label="Original manga-ink illustration of a caped hero standing beside the registry."
              />
            </div>
            <aside className="registry-card" data-manga-panel>
              <div className="registry-heading">
                <RegistryMark />
                <div>
                  SANJEY MANIAN<small>UT DALLAS / EXPECTED 2028</small>
                </div>
                <span>認定</span>
              </div>
              <div className="registry-profile">
                <div className="registry-avatar">
                  <CharacterArt
                    character="saitama"
                    pose="standing"
                    className="character-art--registry"
                    label="Original ink drawing of Sanjey’s standing hero."
                  />
                </div>
                <div>
                  <span className="eyebrow">CANDIDATE FILE</span>
                  <h3>
                    SANJEY
                    <br />
                    MANIAN
                  </h3>
                </div>
              </div>
              <dl>
                {[
                  ["Currently", "B.S. Computer Science, expected 2028"],
                  ["Focus", "LLMs, RAG, Data Pipelines"],
                  ["Location", "Plano, TX"],
                  ["School", "UT Dallas"],
                ].map(([a, b]) => (
                  <div key={a}>
                    <dt>{a}</dt>
                    <dd>{b}</dd>
                  </div>
                ))}
              </dl>
              <div className="registry-footer">
                <span>UT DALLAS · CLASS OF 2028</span>
                <span className="barcode">▥▥▥▥▥▥</span>
              </div>
            </aside>
          </div>
        </section>
        <div className="chapter-tape">
          <span>AI / DATA / SOFTWARE</span>
          <span>✳</span>
          <span>AI / DATA / SOFTWARE</span>
          <span>✳</span>
          <span>AI / DATA / SOFTWARE</span>
        </div>
        <section
          id="skills"
          className="section skills-section"
          data-manga-chapter
          data-manga-dark
        >
          <span className="manga-glyph-strip" aria-hidden="true">
            ズン · 狩 · ゴゴ
          </span>
          <div
            className="section-index"
            data-manga-panel
            data-manga-onomatopoeia
          >
            02 / SKILLS
            <span className="manga-page-number" aria-hidden="true">
              02
            </span>
          </div>
          <div className="section-heading" data-manga-panel>
            <div>
              <p className="eyebrow purple">
                <span className="accent-line" /> TECHNICAL SKILLS
              </p>
              <h2>
                Tools &amp;<br /><span className="purple-text">expertise.</span>
              </h2>
            </div>
            <p className="section-intro">
              AI evaluation, software engineering, and data infrastructure.
            </p>
          </div>
          <SkillConstellation lite={lite} motionFrozen={frozen} />
          <div className="certifications">
            <span className="eyebrow">CERTIFICATIONS / TRAINING</span>
            {certifications.map((c, i) => (
              <span className="cert" key={c}>
                <Check size={13} />
                {c}
                {i === 1 ? <i>IN PROGRESS</i> : null}
              </span>
            ))}
          </div>
          <div className="hunter-quote" data-manga-panel data-manga-dark>
            <span>100+</span>
            <div>
              <strong>
                Model evaluation
              </strong>
              <p>
                Multimodal visual-reasoning failures logged. Root causes traced.
                Training data written.
              </p>
            </div>
            <div className="hunter-scene" data-manga-panel>
              <button
                type="button"
                className="hunter-art-hitbox"
                onClick={() => impact("monster")}
                aria-label="Animate the martial arts illustration"
              >
                <CharacterArt
                  character="garou"
                  pose="fighting"
                  className="character-art--hunter"
                  label="Original silver-haired martial-arts hunter in a wide fighting stance. Interactive character illustration."
                />
              </button>
            </div>
            <span className="hunter-kanji" aria-hidden="true">
              狩
            </span>
          </div>
        </section>
        <section
          id="experience"
          className="section experience-section"
          data-manga-chapter
        >
          <span className="manga-glyph-strip" aria-hidden="true">
            ガッ · 一 · 拳
          </span>
          <div
            className="section-index"
            data-manga-panel
            data-manga-onomatopoeia
          >
            03 / EXPERIENCE
            <span className="manga-page-number" aria-hidden="true">
              03
            </span>
          </div>
          <div className="section-heading" data-manga-panel>
            <div>
              <p className="eyebrow">
                <span className="accent-line" /> RESEARCH & INDUSTRY
              </p>
              <h2>
                Experience.
              </h2>
            </div>
            <p className="section-intro">
              Data engineering, AI evaluation, research, and creative work.
            </p>
          </div>
          <ExperienceExplorer frozen={frozen} />
        </section>
        <section
          id="projects"
          className="section projects-section"
          data-manga-chapter
        >
          <span className="manga-glyph-strip" aria-hidden="true">
            ピカ · ドン · 切
          </span>
          <div
            className="section-index"
            data-manga-panel
            data-manga-onomatopoeia
          >
            04 / PROJECTS
            <span className="manga-page-number" aria-hidden="true">
              04
            </span>
          </div>
          <div className="section-heading" data-manga-panel>
            <div>
              <p className="eyebrow">
                <span className="accent-line" /> SELECTED WORK
              </p>
              <h2>
                Projects.
              </h2>
            </div>
            <div>
              <p className="section-intro">
                Real projects. Real constraints.
                <br />
                Open a file for the full story.
              </p>
              <span className="interaction-note">
                ↗ HOVER TO TILT · CLICK TO OPEN
              </span>
            </div>
          </div>
          <div className="projects-viewport projects-accessible-grid">
            <div className="projects-grid">
              {projects.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} lite={frozen} />
              ))}
            </div>
          </div>
        </section>
        <section
          className="section creative-section"
          id="creative"
          data-manga-chapter
        >
          <span className="manga-glyph-strip" aria-hidden="true">
            ドドン · 編集
          </span>
          <div className="creative-copy" data-manga-panel>
            <p className="eyebrow cyan">
              <span className="accent-line" /> CREATIVE WORK
            </p>
            <h2>
              Video editing.
            </h2>
            <p>
              Video editing for YouTube creators and campus events.
            </p>
            <span className="eyebrow">
              YOUTUBE CREATORS · EVENT RECAPS · SHORT-FORM
            </span>
          </div>
          {portfolioLinks.reel ? (
            <iframe
              className="reel-player"
              src={portfolioLinks.reel}
              title="Sanjey Manian video editing reel"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div className="reel-placeholder" data-manga-panel>
              <span className="reel-corner">SM / CREATIVE REEL</span>
              <div className="reel-timeline">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <span className="play-circle">
                <Play size={25} fill="currentColor" />
              </span>
              <strong>VIDEO REEL</strong>
              <span>EDIT REEL / LINK COMING SOON</span>
              <span className="reel-time">00:00:00:00</span>
            </div>
          )}
        </section>
        <div className="power-stats">
          <div className="power-label">
            <Zap size={18} />
            <span>
              SELECTED METRICS
              <br />
              <small>PROJECT & RESEARCH HIGHLIGHTS</small>
            </span>
          </div>
          {stats.slice(4).map(s => (
            <Counter key={s.label} {...s} lite={lite} frozen={frozen} />
          ))}
        </div>
        <section
          id="contact"
          className="section contact-section"
          data-manga-chapter
        >
          <span className="manga-glyph-strip" aria-hidden="true">
            ズン · 対 · 拳
          </span>
          <div
            className="section-index"
            data-manga-panel
            data-manga-onomatopoeia
          >
            05 / CONTACT
            <span className="manga-page-number" aria-hidden="true">
              05
            </span>
          </div>
          <div className="clash-banner" data-manga-panel>
            <span>THE HERO</span>
            <div className="clash-figures" data-manga-panel>
              <CharacterArt
                character="saitama"
                pose="punch"
                className="character-art--clash-saitama"
              />
              <b>VS</b>
              <CharacterArt
                character="garou"
                pose="fighting"
                className="character-art--clash-garou"
              />
            </div>
            <span>THE HUNTER</span>
            <button
              className="clash-trigger punch-button"
              onClick={() => {
                impact("boom");
                document.getElementById("contact-panel")?.scrollIntoView({
                  behavior: lite ? "instant" : "smooth",
                  block: "center",
                });
              }}
            >
              MAKE AN IMPACT <Zap size={14} />
            </button>
          </div>
          <div className="contact-layout" id="contact-panel" data-manga-panel>
            <div>
              <p className="eyebrow">
                <span className="accent-line" /> EXPLORE & CONNECT
              </p>
              <h2>
                Get to know my work.
              </h2>
              <p className="contact-description">
                Ask about my projects, research, and experience. Explore five topics, then reach out to talk about an opportunity.
              </p>
              <div className="email-row">
                <a href={`mailto:${portfolioLinks.email}`}>
                  {portfolioLinks.email}
                </a>
                <button onClick={copyEmail} aria-label="Copy email address">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <span className="copy-status" role="status">
                {copied ? "Email copied to clipboard." : ""}
              </span>
              <div className="contact-social">
                <a
                  href={portfolioLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Linkedin size={16} /> LinkedIn
                  <ArrowUpRight size={15} />
                </a>
                <span>
                  <MapPin size={15} /> Plano, TX
                </span>
              </div>
            </div>
            <PortfolioChat />
          </div>
        </section>
      </main>
      <div className="to-be-continued">
        <span></span>
        <i>▶</i>
      </div>
      <footer>
        <span className="fx-debug" role="status" aria-live="polite">
          FX: WebGL {fistWebgl || backgroundWebgl ? "ON" : "OFF"} | Background: {backgroundWebgl ? "3D" : "SVG"} | Name: {fistWebgl ? "3D" : "CSS"} | Fist: {fistWebgl ? "3D" : "SVG"} | Fire: {fistWebgl ? "Shader" : "CSS"} | Motion{" "}
          {motionActive ? "ON" : "OFF"}
        </span>
        <a className="footer-brand" href="#home">
          <RegistryMark /> SANJEY MANIAN<span>AI/LLM & DATA ENGINEER</span>
        </a>
        <p>© Sanjey Manian</p>
        <a className="back-top" href="#home">
          BACK TO TOP
          <ArrowUpRight size={14} />
        </a>
      </footer>
      <button
        className="sound-toggle"
        onClick={() => setSound(v => !v)}
        aria-label={sound ? "Mute sound" : "Enable optional impact sound"}
        aria-pressed={sound}
      >
        {sound ? <Volume2 size={15} /> : <VolumeX size={15} />}
        <span>SOUND {sound ? "ON" : "OFF"}</span>
      </button>
      {effect && (
        <div
          className={`impact-overlay effect-${effect} ${frozen ? "effect-lite" : ""}`}
          aria-live="polite"
        >
          <span>
            {effect === "serious"
              ? "DON!"
              : effect === "monster"
                ? "MONSTER FORM · ZUUN!"
                : effect === "punch"
                  ? "PUNCH!"
                  : effect === "boom"
                    ? "BOOM!"
                    : "DON!"}
          </span>
          {!frozen && (
            <>
              <i className="shockwave" />
              <div className="impact-lines" />
            </>
          )}
        </div>
      )}
      {notice && (
        <div
          className="notice-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notice-title"
          onClick={() => setNotice("")}
        >
          <div onClick={e => e.stopPropagation()}>
            <button aria-label="Close message" onClick={() => setNotice("")}>
              <X size={20} />
            </button>
            <span className="eyebrow">PORTFOLIO / NOTICE</span>
            <h3 id="notice-title">FILE NOT YET ATTACHED.</h3>
            <p>{notice}</p>
            <a
              className="btn primary"
              href="#experience"
              onClick={() => setNotice("")}
            >
              View experience
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}






