import { describe, expect, it } from "vitest";
import { answerPortfolio, portfolioSources } from "./portfolioChat";

describe("portfolio retrieval", () => {
  it("retrieves the defense pipeline with its documented metric and source link", () => {
    const answer = answerPortfolio("How does the defense intelligence pipeline work?");
    expect(answer.sources[0].id).toBe("defense-intelligence");
    expect(answer.sources[0].text).toContain("5 intelligence sources");
    expect(answer.sources[0].href).toBe("#project-defense-intelligence");
  });
  it("abstains on personal details absent from the portfolio", () => {
    const answer = answerPortfolio("What is Sanjey's salary?");
    expect(answer.sources).toEqual([]);
    expect(answer.topic).toBeUndefined();
  });
  it("grounds every response in the unmodified published sources", () => {
    const answer = answerPortfolio("What experience does Sanjey have with RAG?");
    expect(answer.sources.length).toBeGreaterThan(0);
    for (const source of answer.sources) {
      expect(portfolioSources.find(document => document.id === source.id)).toEqual(source);
    }
  });
  it("uses the previous source to resolve a short follow-up", () => {
    const answer = answerPortfolio("Tell me more about that", ["defense-intelligence"]);
    expect(answer.sources[0].id).toBe("defense-intelligence");
  });
});
