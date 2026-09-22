import fs from "fs";
import path from "path";
import {
  Project,
  Service,
  SiteConfig,
  PublishManifest,
} from "@/types/content";
import {
  ProjectSchema,
  ServiceSchema,
  SiteConfigSchema,
  PublishManifestSchema,
} from "@/lib/validation/content.schema";

const CONTENT_DIR = path.join(process.cwd(), "src/content/generated");

/**
 * Load and validate all published projects from local generated snapshot
 */
export function getProjects(): Project[] {
  try {
    const filePath = path.join(CONTENT_DIR, "projects.json");
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const rawData = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(rawData);
    if (!Array.isArray(json)) return [];

    const validProjects: Project[] = [];
    for (const item of json) {
      const parsed = ProjectSchema.safeParse(item);
      if (parsed.success) {
        validProjects.push(parsed.data as Project);
      } else {
        console.warn(`[ContentLoader] Skipping invalid project ${item?.id}:`, parsed.error.format());
      }
    }

    // Default sort: newest publishedAt first
    return validProjects.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch (err) {
    console.error("[ContentLoader] Error loading projects:", err);
    return [];
  }
}

/**
 * Get a single project by slug
 */
export function getProjectBySlug(slug: string): Project | null {
  const projects = getProjects();
  return projects.find((p) => p.slug.toLowerCase() === slug.toLowerCase()) || null;
}

/**
 * Load all active services sorted by displayOrder
 */
export function getServices(): Service[] {
  try {
    const filePath = path.join(CONTENT_DIR, "services.json");
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const rawData = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(rawData);
    if (!Array.isArray(json)) return [];

    const validServices: Service[] = [];
    for (const item of json) {
      const parsed = ServiceSchema.safeParse(item);
      if (parsed.success && parsed.data.active) {
        validServices.push(parsed.data as Service);
      }
    }

    return validServices.sort((a, b) => a.displayOrder - b.displayOrder);
  } catch (err) {
    console.error("[ContentLoader] Error loading services:", err);
    return [];
  }
}

/**
 * Load site configuration
 */
export function getSiteConfig(): SiteConfig {
  const defaultConfig: SiteConfig = {
    schemaVersion: "1.0.0",
    siteName: "Danh Phan",
    headline: "AI Engineer & AI Automation Developer",
    valueProposition: "I design and deliver practical AI agents, intelligent document systems, and workflow automation for real business operations.",
    aboutShort: "AI Engineer & Automation Developer.",
    aboutLong: "Pragmatic engineering for enterprise AI.",
    contactCta: "Discuss a Project",
    defaultLocale: "en",
    timezone: "Asia/Seoul",
    analyticsProvider: "none",
  };

  try {
    const filePath = path.join(CONTENT_DIR, "site-config.json");
    if (!fs.existsSync(filePath)) {
      return defaultConfig;
    }
    const rawData = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(rawData);
    const parsed = SiteConfigSchema.safeParse(json);
    if (parsed.success) {
      return parsed.data as SiteConfig;
    }
    return defaultConfig;
  } catch {
    return defaultConfig;
  }
}

/**
 * Load snapshot manifest
 */
export function getManifest(): PublishManifest | null {
  try {
    const filePath = path.join(CONTENT_DIR, "manifest.json");
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const rawData = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(rawData);
    const parsed = PublishManifestSchema.safeParse(json);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
