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
      "Automated Defense Intelligence Pipeline",
      'aria-label="Project index"',
      "maniansanjey@gmail.com",
      'id="portfolio-question"',
      "Ask about Sanjey",
    ])
      expect(html).toContain(term);
    expect(html).toContain("sanjey-portrait-color.svg");
    expect(html).toContain('aria-label="Portfolio topics explored"');
    expect(html).toContain("View on GitHub");
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
