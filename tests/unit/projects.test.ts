import { describe, it, expect } from "vitest";
import { filterProjects, getRelatedProjects, paginateProjects } from "@/lib/content/projects";
import { Project } from "@/types/content";

const mockProjects: Project[] = [
  {
    id: "PRJ-0001",
    slug: "p1",
    title: "AI Document Classifier",
    projectType: "CLIENT",
    client: null,
    serviceKeys: ["DOCUMENT_AI_OCR", "WORKFLOW_AUTOMATION"],
    industry: "Human Resources",
    technologies: ["Python", "PaddleOCR"],
    summary: "Document processing summary for testing.",
    problemMarkdown: "Problem",
    solutionMarkdown: "Solution",
    roleMarkdown: "Role",
    resultsMarkdown: "Results",
    cover: { src: "/test.jpg", width: 800, height: 600, alt: "alt" },
    gallery: [],
    links: {},
    publishedAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "PRJ-0002",
    slug: "p2",
    title: "Autonomous Zalo Bot",
    projectType: "PERSONAL",
    client: null,
    serviceKeys: ["ZALO_CUSTOMER_SERVICE"],
    industry: "Healthcare",
    technologies: ["Node.js", "n8n"],
    summary: "Zalo bot summary for testing.",
    problemMarkdown: "Problem",
    solutionMarkdown: "Solution",
    roleMarkdown: "Role",
    resultsMarkdown: "Results",
    cover: { src: "/test2.jpg", width: 800, height: 600, alt: "alt" },
    gallery: [],
    links: {},
    publishedAt: "2026-09-05T00:00:00Z",
    updatedAt: "2026-09-05T00:00:00Z",
  },
];

describe("Project Filtering and Relations", () => {
  it("filters by projectType", () => {
    const personal = filterProjects(mockProjects, { projectTypes: ["PERSONAL"] });
    expect(personal.length).toBe(1);
    expect(personal[0].id).toBe("PRJ-0002");
  });

  it("filters by search keyword in title", () => {
    const searchResult = filterProjects(mockProjects, { search: "classifier" });
    expect(searchResult.length).toBe(1);
    expect(searchResult[0].id).toBe("PRJ-0001");
  });

  it("paginates correctly", () => {
    const paged = paginateProjects(mockProjects, 1, 1);
    expect(paged.items.length).toBe(1);
    expect(paged.totalPages).toBe(2);
    expect(paged.hasNextPage).toBe(true);
  });

  it("finds related projects by shared service or tech", () => {
    const candidateProject: Project = {
      ...mockProjects[0],
      id: "PRJ-0003",
      slug: "p3",
      title: "Another Document Tool",
    };
    const related = getRelatedProjects(candidateProject, mockProjects, 1);
    expect(related.length).toBe(1);
    expect(related[0].id).toBe("PRJ-0001");
  });
});
