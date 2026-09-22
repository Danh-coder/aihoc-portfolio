import { describe, it, expect } from "vitest";
import { ProjectSchema, ServiceSchema } from "@/lib/validation/content.schema";
import { InquirySchema } from "@/lib/validation/inquiry.schema";

describe("Content Validation Schemas", () => {
  it("validates a valid project schema", () => {
    const validProject = {
      id: "PRJ-0001",
      slug: "valid-project-slug",
      title: "Valid Project Title",
      projectType: "PERSONAL",
      client: null,
      serviceKeys: ["AI_AGENT"],
      industry: "Healthcare",
      technologies: ["Python", "FastAPI"],
      summary: "This is a valid concise summary with more than thirty characters.",
      problemMarkdown: "Detailed problem description with sufficient length.",
      solutionMarkdown: "Implemented solution description with sufficient length.",
      roleMarkdown: "Lead developer and architect.",
      resultsMarkdown: "Reduced manual effort by 80%.",
      cover: {
        src: "/media/generated/PRJ-0001/cover.webp",
        width: 1600,
        height: 900,
        alt: "Valid cover alt text",
      },
      gallery: [],
      links: { demo: "https://example.com/demo" },
      featuredRank: 1,
      publishedAt: "2026-09-22T00:00:00Z",
      updatedAt: "2026-09-22T00:00:00Z",
    };

    const result = ProjectSchema.safeParse(validProject);
    expect(result.success).toBe(true);
  });

  it("rejects invalid slugs with uppercase or special characters", () => {
    const invalidProject = {
      id: "PRJ-0002",
      slug: "Invalid_Slug!",
      title: "Invalid Slug Project",
      projectType: "PERSONAL",
      serviceKeys: ["AI_AGENT"],
      industry: "Healthcare",
      technologies: ["Python"],
      summary: "This is a valid concise summary with more than thirty characters.",
      problemMarkdown: "Detailed problem description with sufficient length.",
      solutionMarkdown: "Implemented solution description with sufficient length.",
      roleMarkdown: "Lead developer and architect.",
      resultsMarkdown: "Reduced manual effort by 80%.",
      cover: {
        src: "/media/generated/PRJ-0002/cover.webp",
        width: 1600,
        height: 900,
        alt: "Valid cover alt text",
      },
      publishedAt: "2026-09-22T00:00:00Z",
      updatedAt: "2026-09-22T00:00:00Z",
    };

    const result = ProjectSchema.safeParse(invalidProject);
    expect(result.success).toBe(false);
  });

  it("validates an inquiry payload and rejects invalid emails", () => {
    const validInquiry = {
      fullName: "Nguyen Van A",
      email: "client@example.com",
      serviceKey: "AI_AGENT",
      requirement: "This is a project requirement with more than thirty characters for validation.",
      timeline: "1_3_MONTHS",
      preferredChannel: "EMAIL",
      consent: true,
    };

    const result = InquirySchema.safeParse(validInquiry);
    expect(result.success).toBe(true);

    const invalidEmailInquiry = { ...validInquiry, email: "not-an-email" };
    expect(InquirySchema.safeParse(invalidEmailInquiry).success).toBe(false);

    const missingConsentInquiry = { ...validInquiry, consent: false };
    expect(InquirySchema.safeParse(missingConsentInquiry).success).toBe(false);
  });
});
