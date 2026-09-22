import { z } from "zod";

const kebabCaseRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const ProjectMediaSchema = z.object({
  src: z.string().min(1),
  width: z.number().int().positive().default(1600),
  height: z.number().int().positive().default(900),
  alt: z.string().min(1).max(180),
  caption: z.string().max(250).nullable().optional(),
});

export const ProjectClientSchema = z.object({
  name: z.string().min(1).max(150),
  logoUrl: z.string().url().nullable().optional(),
});

export const ProjectLinksSchema = z.object({
  demo: z.string().url().nullable().optional(),
  repository: z.string().url().nullable().optional(),
  paper: z.string().url().nullable().optional(),
});

export const ProjectSchema = z.object({
  id: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(kebabCaseRegex, "Slug must be lowercase ASCII kebab-case"),
  title: z.string().min(3).max(100),
  projectType: z.enum(["PERSONAL", "CLIENT"]),
  client: ProjectClientSchema.nullable().optional().default(null),
  serviceKeys: z.array(z.string().min(1)).min(1, "At least one service key is required"),
  industry: z.string().min(1),
  technologies: z.array(z.string()).min(1).max(15),
  summary: z.string().min(30).max(300),
  problemMarkdown: z.string().min(30).max(3000),
  solutionMarkdown: z.string().min(30).max(5000),
  roleMarkdown: z.string().min(10).max(1500),
  implementationMarkdown: z.string().max(5000).nullable().optional(),
  resultsMarkdown: z.string().min(20),
  resultHighlight: z.string().max(100).nullable().optional(),
  cover: ProjectMediaSchema,
  gallery: z.array(ProjectMediaSchema).default([]),
  links: ProjectLinksSchema.default({}),
  featuredRank: z.number().int().min(1).max(99).nullable().optional(),
  publishedAt: z.string(),
  updatedAt: z.string(),
});

export const ServiceSchema = z.object({
  serviceKey: z.string().min(1),
  slug: z.string().min(1).regex(kebabCaseRegex),
  title: z.string().min(1).max(100),
  summary: z.string().min(10).max(300),
  capabilities: z.array(z.string()).min(1),
  deliverables: z.array(z.string()).min(1),
  iconKey: z.string().min(1),
  displayOrder: z.number().int().positive(),
  active: z.boolean().default(true),
  updatedAt: z.string(),
});

export const SiteConfigSchema = z.object({
  schemaVersion: z.string().default("1.0.0"),
  siteName: z.string().min(1),
  headline: z.string().min(1),
  valueProposition: z.string().min(1),
  aboutShort: z.string().min(1),
  aboutLong: z.string().min(1),
  contactCta: z.string().default("Discuss a Project"),
  defaultLocale: z.string().default("en"),
  timezone: z.string().default("Asia/Seoul"),
  contactEmailPublic: z.string().email().nullable().optional(),
  zaloUrl: z.string().url().nullable().optional(),
  linkedinUrl: z.string().url().nullable().optional(),
  githubUrl: z.string().url().nullable().optional(),
  cvUrl: z.string().url().nullable().optional(),
  analyticsProvider: z.enum(["none", "ga4", "plausible"]).default("none"),
  analyticsSiteId: z.string().nullable().optional(),
});

export const PublishManifestSchema = z.object({
  schemaVersion: z.string().min(1),
  snapshotVersion: z.string().min(1),
  generatedAt: z.string(),
  projectCount: z.number().int().nonnegative(),
  serviceCount: z.number().int().nonnegative(),
  contentSha256: z.string().min(1),
  source: z.string().min(1),
});
