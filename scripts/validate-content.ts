import fs from "fs";
import path from "path";
import {
  ProjectSchema,
  ServiceSchema,
  SiteConfigSchema,
  PublishManifestSchema,
} from "../src/lib/validation/content.schema";

function validateContent() {
  const contentDir = path.join(process.cwd(), "src/content/generated");
  console.log(`[ValidateContent] Checking directory: ${contentDir}`);

  let hasErrors = false;

  // 1. Projects
  const projectsPath = path.join(contentDir, "projects.json");
  if (!fs.existsSync(projectsPath)) {
    console.error("[ValidateContent] Missing projects.json");
    hasErrors = true;
  } else {
    const raw = JSON.parse(fs.readFileSync(projectsPath, "utf8"));
    const seenIds = new Set<string>();
    const seenSlugs = new Set<string>();

    for (const [idx, item] of raw.entries()) {
      const parsed = ProjectSchema.safeParse(item);
      if (!parsed.success) {
        console.error(`[ValidateContent] Project row ${idx} (${item?.id}) failed validation:`, parsed.error.format());
        hasErrors = true;
      }
      if (seenIds.has(item.id)) {
        console.error(`[ValidateContent] Duplicate project ID: ${item.id}`);
        hasErrors = true;
      }
      seenIds.add(item.id);

      if (seenSlugs.has(item.slug)) {
        console.error(`[ValidateContent] Duplicate project slug: ${item.slug}`);
        hasErrors = true;
      }
      seenSlugs.add(item.slug);
    }
    console.log(`[ValidateContent] Verified ${raw.length} projects.`);
  }

  // 2. Services
  const servicesPath = path.join(contentDir, "services.json");
  if (!fs.existsSync(servicesPath)) {
    console.error("[ValidateContent] Missing services.json");
    hasErrors = true;
  } else {
    const raw = JSON.parse(fs.readFileSync(servicesPath, "utf8"));
    for (const [idx, item] of raw.entries()) {
      const parsed = ServiceSchema.safeParse(item);
      if (!parsed.success) {
        console.error(`[ValidateContent] Service row ${idx} failed validation:`, parsed.error.format());
        hasErrors = true;
      }
    }
    console.log(`[ValidateContent] Verified ${raw.length} services.`);
  }

  // 3. SiteConfig
  const siteConfigPath = path.join(contentDir, "site-config.json");
  if (!fs.existsSync(siteConfigPath)) {
    console.error("[ValidateContent] Missing site-config.json");
    hasErrors = true;
  } else {
    const raw = JSON.parse(fs.readFileSync(siteConfigPath, "utf8"));
    const parsed = SiteConfigSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("[ValidateContent] SiteConfig failed validation:", parsed.error.format());
      hasErrors = true;
    } else {
      console.log("[ValidateContent] Verified site-config.");
    }
  }

  // 4. Manifest
  const manifestPath = path.join(contentDir, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error("[ValidateContent] Missing manifest.json");
    hasErrors = true;
  } else {
    const raw = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const parsed = PublishManifestSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("[ValidateContent] Manifest failed validation:", parsed.error.format());
      hasErrors = true;
    } else {
      console.log(`[ValidateContent] Verified manifest (version: ${parsed.data.snapshotVersion}).`);
    }
  }

  if (hasErrors) {
    console.error("[ValidateContent] Content validation failed!");
    process.exit(1);
  } else {
    console.log("[ValidateContent] All content snapshots are valid!");
  }
}

validateContent();
