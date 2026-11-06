import React from "react";
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { readFileSync } from "node:fs";
import App from "./App";
import SkillConstellation from "./components/portfolio/SkillConstellation";
import {
  experiences,
  projects,
  stats,
  skillGroups,
  portfolioLinks,
} from "./data/portfolio";

describe("Portfolio content and static delivery", () => {
  it("retains all supplied entries without fabricating links", () => {
    expect(experiences).toHaveLength(8);
    expect(projects).toHaveLength(5);
    expect(stats).toHaveLength(7);
    expect(skillGroups.flatMap(g => g.skills)).toHaveLength(34);
    expect(
      experiences.find(e => e.org === "The Data Mine, Purdue University")
        ?.bullets
    ).toHaveLength(5);
    expect(
      experiences.find(e => e.role === "Account Manager")?.bullets
    ).toHaveLength(0);
    expect(experiences.at(-1)?.dates).toBe("Jan 2020 – Present");
    expect(
      projects
        .slice(0, 2)
        .every(p => p.github?.startsWith("https://github.com/"))
    ).toBe(true);
    expect(projects.every(p => p.demo === null)).toBe(true);
    expect(portfolioLinks.resume).toBe("/sanjey-resume-public.pdf");
  });
  it("prerenders every important recruiter-facing detail without WebGL", () => {
    const html = renderToString(<App />);
    for (const term of [
      "SANJEY",
      "NGAI",
      "The Data Mine",
      "Handshake AI",
      "Feng Cha",
      "aMuse-Us",
      "MEMEoTron",
      "Backpack Robot",
      "100+",
      "1,000+",
      "maniansanjey@gmail.com",
      'id="portfolio-question"',
      "Ask about Sanjey",
    ])
      expect(html).toContain(term);
    expect(html).not.toContain("<canvas");
    expect(html).toContain("DISCOVERY PROGRESS");
    expect(html).toContain("GitHub — coming soon");
  });
  it("retains all skills in Lite Mode and supports focusable constellation nodes", () => {
    const lite = renderToString(<SkillConstellation lite />);
    const full = renderToString(<SkillConstellation lite={false} />);
    expect((lite.match(/<li[ >]/g) || []).length).toBe(34);
    expect((full.match(/<li[ >]/g) || []).length).toBe(34);
    expect((full.match(/class="skill-node /g) || []).length).toBe(34);
    expect(lite).not.toContain('class="skill-node ');
  });
  it("includes public SEO metadata, zoom accessibility and no public phone field", () => {
    const shell = readFileSync("client/index.html", "utf8");
    const page = readFileSync("client/src/pages/Home.tsx", "utf8");
    expect(shell).toContain(
      "Sanjey Manian | AI/LLM &amp; Data Engineer".replace("&amp;", "&")
    );
    expect(shell).toContain("og:title");
    expect(shell).not.toContain("maximum-scale=1");
    expect(page).not.toContain("tel:");
    expect(page).toContain("navigator.clipboard.writeText");
  });
});

describe("printed-manga edition and camera motion", () => {
  it("keeps the actual Three.js orbit-to-surface dolly and an always-visible SVG Earth fallback", () => {
    const scene = readFileSync("client/src/components/portfolio/EarthScene.tsx", "utf8");
    const fallback = readFileSync("client/src/components/portfolio/EarthFallback.tsx", "utf8");
    const home = readFileSync("client/src/pages/Home.tsx", "utf8");
    expect(scene).toContain("camera.lookAt(cameraTargetX, cameraTargetY, 0)");
    expect(scene).toContain("6.5 - 3.65 * p");
    expect(scene).toContain("heroStart");
    expect(scene).toContain("new T.CanvasTexture(canvas)");
    expect(scene).toContain("modeRef.current === \"garou\"");
    expect(fallback).toContain("className=\"earth-warp-lines\"");
    expect(fallback).toContain("className=\"earth-clouds\"");
    expect(home).toContain("<BackgroundWorld");
    expect(home).toContain("<FistStage");
    const world = readFileSync("client/src/components/portfolio/BackgroundWorld.tsx", "utf8");
    expect(world).toContain("world-fallback");
    expect(world).toContain("EarthScene");
  });

  it("keeps chapter names, original character groups, the shared beat and desktop/mobile choreography", () => {
    const home = readFileSync("client/src/pages/Home.tsx", "utf8");
    const art = readFileSync("client/src/components/portfolio/CharacterArt.tsx", "utf8");
    const fx = readFileSync("client/src/components/portfolio/MangaScrollFX.tsx", "utf8");
    const theme = readFileSync("client/src/manga-theme.css", "utf8");
    for (const title of [
      "01 / ABOUT",
      "02 / SKILLS",
      "03 / EXPERIENCE",
      "04 / PROJECTS",
      "05 / CONTACT",
    ]) expect(home).toContain(title);
    expect(home).toContain('aria-hidden="true"');
    expect(home).toContain("setReadMode");
    expect(home).toContain("FX: WebGL");
    expect(home).toContain("motionActive ? \"ON\" : \"OFF\"");
    expect(home).toContain("motionFrozen={frozen}");
    expect(art).toContain("char-saitama-cape");
    expect(art).toContain("char-saitama-arms");
    expect(art).toContain("char-garou-hair");
    expect(art).toContain("char-garou-face");
    expect(art).toContain("char-garou-energy");
    expect(fx).toContain("60_000 / 90");
    expect(fx).toContain('"(max-width: 899px)"');
    expect(fx).toContain("containerAnimation: rail");
    expect(fx).toContain("data-manga-dark");
    expect(theme).toContain("#F5F1E6");
    expect(theme).toContain("@keyframes manga-ink-ripple");
    expect(theme).toContain("prefers-reduced-motion: reduce");
    expect(theme).toContain("manga-rough-edge");
  });
});
