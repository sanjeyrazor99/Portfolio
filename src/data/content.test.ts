import { describe, expect, it } from "vitest";
import { content, source } from "./content";

describe("approved portfolio content", () => {
  it("includes the required chapters", () => {
    for (const name of ["About", "Skills", "Experience", "Projects", "Stats", "Creative Reel", "Contact", "Education"]) {
      expect(content.chapters.find(({ title }) => title.startsWith(name))?.lines.length).toBeGreaterThan(0);
    }
  });
  it("excludes phone numbers", () => {
    expect(source).not.toMatch(/(?:\+1[ .-]?)?(?:\(\d{3}\)|\b\d{3})[ .-]\d{3}[ .-]\d{4}\b/);
  });
});
