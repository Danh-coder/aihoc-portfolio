export type ProjectType = "PERSONAL" | "CLIENT";
export type ClientVisibility = "PRIVATE" | "ANONYMIZED" | "PUBLIC";
export type ProjectStatus =
  | "DRAFT"
  | "READY_TO_PUBLISH"
  | "VALIDATING"
  | "PUBLISHING"
  | "PUBLISHED"
  | "PUBLISH_FAILED"
  | "ARCHIVED";

export interface ProjectClient {
  name: string;
  logoUrl?: string | null;
}

export interface ProjectMedia {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string | null;
}

export interface ProjectLinks {
  demo?: string | null;
  repository?: string | null;
  paper?: string | null;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  projectType: ProjectType;
  client: ProjectClient | null;
  serviceKeys: string[];
  industry: string;
  technologies: string[];
  summary: string;
  problemMarkdown: string;
  solutionMarkdown: string;
  roleMarkdown: string;
  implementationMarkdown?: string | null;
  resultsMarkdown: string;
  resultHighlight?: string | null;
  cover: ProjectMedia;
  gallery: ProjectMedia[];
  links: ProjectLinks;
  featuredRank?: number | null;
  publishedAt: string;
  updatedAt: string;
}

export interface Service {
  serviceKey: string;
  slug: string;
  title: string;
  summary: string;
  capabilities: string[];
  deliverables: string[];
  iconKey: string;
  displayOrder: number;
  active: boolean;
  updatedAt: string;
}

export interface SiteConfig {
  schemaVersion: string;
  siteName: string;
  headline: string;
  valueProposition: string;
  aboutShort: string;
  aboutLong: string;
  contactCta: string;
  defaultLocale: string;
  timezone: string;
  contactEmailPublic?: string | null;
  zaloUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  cvUrl?: string | null;
  analyticsProvider: "none" | "ga4" | "plausible";
  analyticsSiteId?: string | null;
}

export interface PublishManifest {
  schemaVersion: string;
  snapshotVersion: string;
  generatedAt: string;
  projectCount: number;
  serviceCount: number;
  contentSha256: string;
  source: string;
}

export type InquiryTimeline = "ASAP" | "1_3_MONTHS" | "3_6_MONTHS" | "FLEXIBLE" | "UNKNOWN";
export type InquiryBudgetRange = "NOT_SURE" | "UNDER_10M" | "10M_30M" | "30M_100M" | "OVER_100M";
export type InquiryPreferredChannel = "EMAIL" | "PHONE" | "ZALO" | "ONLINE_MEETING";

export interface InquiryPayload {
  fullName: string;
  email: string;
  organization?: string;
  phone?: string;
  serviceKey: string;
  requirement: string;
  timeline: InquiryTimeline;
  budgetRange?: InquiryBudgetRange;
  preferredChannel: InquiryPreferredChannel;
  sourcePath?: string;
  sourceProjectId?: string;
  consent: boolean;
  website?: string; // honeypot
}

export interface InquiryResponse {
  ok: boolean;
  leadId?: string;
  correlationId: string;
  message: string;
  code?: string;
}
