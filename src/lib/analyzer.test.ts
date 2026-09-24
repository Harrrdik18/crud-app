import { describe, it, expect } from "vitest";
import { analyzeJob, skillMatches } from "@/lib/analyzer";

describe("analyzeJob", () => {
  it("extracts required skills near 'must have' markers", () => {
    const result = analyzeJob({
      jobTitle: "Frontend Engineer",
      company: "Acme",
      description:
        "Requirements: You must have React, TypeScript, and Tailwind CSS. " +
        "We are looking for someone to build and ship product features.",
    });
    expect(result.requiredSkills).toContain("react");
    expect(result.requiredSkills).toContain("typescript");
    expect(result.requiredSkills).toContain("tailwind");
    expect(result.method).toBe("heuristic");
  });

  it("marks skills near 'preferred' as preferred skills", () => {
    const result = analyzeJob({
      description:
        "Preferred: experience with Next.js and PostgreSQL. Nice to have Docker.",
    });
    expect(result.preferredSkills).toContain("next.js");
    expect(result.preferredSkills).toContain("postgresql");
  });

  it("extracts experience requirements", () => {
    const result = analyzeJob({
      description: "We require 5+ years of experience in web development.",
    });
    expect(result.experience).toBe("5+ years");
  });

  it("extracts responsibilities from verb-led sentences", () => {
    const result = analyzeJob({
      description: "Build scalable systems. Lead the frontend team. Ship features.",
    });
    expect(result.responsibilities.length).toBeGreaterThan(0);
  });

  it("handles empty/garbage descriptions without throwing", () => {
    const result = analyzeJob({ description: "" });
    expect(result.error).toBeNull();
    expect(result.requiredSkills).toEqual([]);
  });
});

describe("skillMatches", () => {
  it("splits candidate skills into matching and gaps", () => {
    const { matchingSkills, gapSkills } = skillMatches(
      ["React", "TypeScript", "Node.js"],
      ["react", "postgresql", "typescript"],
    );
    expect(matchingSkills).toContain("react");
    expect(matchingSkills).toContain("typescript");
    expect(gapSkills).toEqual(["postgresql"]);
  });

  it("matches with case-insensitive substring coverage", () => {
    const { matchingSkills } = skillMatches(["DevOps"], ["AWS DevOps"]);
    expect(matchingSkills).toEqual(["aws devops"]);
  });

  it("treats empty candidate skills as all gaps", () => {
    const { matchingSkills, gapSkills } = skillMatches([], ["react", "go"]);
    expect(matchingSkills).toEqual([]);
    expect(gapSkills).toEqual(["react", "go"]);
  });
});