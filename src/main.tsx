import React, { lazy, Suspense, useState } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/bangers";
import "@fontsource/inter";
import { content } from "./data/content";
import "./index.css";

const Scene = lazy(() => import("./Scene"));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const gl = Boolean(document.createElement("canvas").getContext("webgl2"));
const slug = (title: string) => title.split(" ")[0].toLowerCase();

function App() {
  const [lite, setLite] = useState(reduced || !gl);
  const [read, setRead] = useState(false);
  const [hunter, setHunter] = useState(false);
  const [hit, setHit] = useState(0);
  const [bubble, setBubble] = useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setBubble(true), 3000);
    return () => clearTimeout(timer);
  }, []);
  return <div className={hunter ? "hunter" : ""}>
    <a className="skip" href="#about">Skip to portfolio</a>
    <header><a className="brand" href="#top">SM<span> / </span>ONE PUNCH</a>
      <nav aria-label="Chapters"><a href="#experience">Experience</a><a href="#projects">Projects</a><a href="#contact">Contact</a></nav>
      <div className="controls"><button onClick={() => setHunter(!hunter)} aria-pressed={hunter}>Garou</button><button disabled={!gl} onClick={() => setLite(!lite)} aria-pressed={lite}>Lite</button><button onClick={() => setRead(!read)} aria-pressed={read}>Read</button></div>
    </header>
    <main id="top">
      <section className="hero" aria-labelledby="title">
        <div className={(!gl && !reduced && !read ? "poster animated-poster" : "poster")} aria-hidden="true"><i/><b/><em/></div>
        {!lite && !read && <Suspense fallback={null}><Scene hit={hit} hunter={hunter} punch={() => setHit((n) => n + 1)} /></Suspense>}
        <div className="hero-copy"><div className="eyebrow">ISSUE 01 / ONE PUNCH PORTFOLIO</div><h1 id="title">SANJEY<br/><span>MANIAN</span></h1><p className="role">AI/LLM Engineer • Data Engineer • UT Dallas ’28</p><p>I build AI systems that work the first time.</p>
        <div className="actions"><a className="primary" href="#projects">View my work ↘</a><a href={content.linkedin}>Connect on LinkedIn ↗</a></div></div>
        <p className="bubble">{bubble ? "I just build things that work." : "...Ok."}</p>
        <button className="punch" onClick={() => setHit(hit + 1)}>PUNCH!</button>
        {hit > 0 && !read && !reduced && (!lite || !gl) && <div className="impact" key={hit} aria-hidden="true">DON!</div>}
        <a href="#about" className="scroll-note">01 / SCROLL TO TURN THE PAGE ↓</a>
      </section>
      <div className="paper">
        {content.chapters.filter(({title}) => title !== "Identity").map(({title, lines}, index) => <section className="chapter" id={slug(title)} key={title} aria-labelledby={slug(title)+"-title"}>
          <div className="eyebrow">{index < 4 ? "CHAPTER 0" + (index + 1) : "ONE PUNCH PORTFOLIO"}</div>
          <h2 id={slug(title)+"-title"}>{title.replace(/ \(.*/, "")}</h2>
          <div className="panel">{lines.map((line) => <p key={line}>{line.replace(/^\s*-\s+/, "")}</p>)}
          {title.startsWith("Contact") && <div className="actions"><a href={"mailto:" + content.email}>{content.email}</a><a href={content.linkedin}>LinkedIn ↗</a></div>}</div>
        </section>)}
      </div>
    </main><footer>TO BE CONTINUED...</footer>
  </div>;
}

createRoot(document.getElementById("root")!).render(<App />);

