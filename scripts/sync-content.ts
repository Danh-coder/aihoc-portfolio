import fs from "fs";
import path from "path";
import https from "https";
import crypto from "crypto";
import { Project, Service, ProjectType } from "../src/types/content";
import { ProjectSchema, ServiceSchema } from "../src/lib/validation/content.schema";

const CONTENT_DIR = path.join(process.cwd(), "src/content/generated");
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEETS_ID || "1Oh6nSGPoPT54wAPrvurTxGHt7gSzD8KK3L5v5XHtuKo";

function fetchGoogleSheetCsv(sheetName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          https
            .get(res.headers.location, (redirectRes) => {
              let data = "";
              redirectRes.on("data", (chunk) => (data += chunk));
              redirectRes.on("end", () => resolve(data));
            })
            .on("error", reject);
          return;
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

function parseCsv(csvText: string): Record<string, string>[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      currentRow.push(currentVal.trim());
      currentVal = "";
      if (currentRow.some((col) => col.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentVal += char;
    }
  }
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((col) => col.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) return [];
  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx] !== undefined ? row[idx] : "";
    });
    return obj;
  });
}

async function syncContent() {
  console.log(`[SyncContent] Synchronizing directly from Google Sheets (Sheet ID: ${GOOGLE_SHEET_ID})...`);

  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  // 1. Fetch & Parse Projects
  const projectsCsv = await fetchGoogleSheetCsv("Projects");
  const rawProjects = parseCsv(projectsCsv);
  console.log(`[SyncContent] Found ${rawProjects.length} projects in Google Sheets 'Projects' tab.`);

  const projectsPath = path.join(CONTENT_DIR, "projects.json");
  let existingProjects: Project[] = [];
  if (fs.existsSync(projectsPath)) {
    try {
      existingProjects = JSON.parse(fs.readFileSync(projectsPath, "utf8"));
    } catch {
      existingProjects = [];
    }
  }

  const existingProjectMap = new Map<string, Project>();
  for (const p of existingProjects) {
    existingProjectMap.set(p.id, p);
  }

  const syncedProjects: Project[] = [];
  for (const row of rawProjects) {
    if (!row.ID || !row.Title) continue;

    const existing = existingProjectMap.get(row.ID);
    const title = row.Title.trim();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const videoUrl = row.Video && row.Video.trim().length > 0 ? row.Video.trim() : null;
    const category = row.Category?.trim() || "OTHER";
    const techStack = row.TechStack
      ? row.TechStack.split(",").map((s) => s.trim()).filter(Boolean)
      : existing?.technologies || ["AI & Automation"];

    const summary = row.Description?.trim() || existing?.summary || title;
    const details = row.Details?.trim() || existing?.solutionMarkdown || summary;

    const projData: Project = {
      id: row.ID.trim(),
      slug,
      title,
      projectType: (row.ProjectType?.toUpperCase() === "CLIENT" ? "CLIENT" : "PERSONAL") as ProjectType,
      client: null,
      serviceKeys: [category],
      industry: category,
      technologies: techStack,
      summary,
      problemMarkdown: details,
      solutionMarkdown: details,
      roleMarkdown: existing?.roleMarkdown || "Lead AI Engineer",
      implementationMarkdown: existing?.implementationMarkdown || null,
      resultsMarkdown: summary,
      resultHighlight: existing?.resultHighlight || null,
      cover: {
        src: row.Image?.trim() || existing?.cover?.src || "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1600&h=900&fit=crop",
        width: 1600,
        height: 900,
        alt: title,
      },
      gallery: row.Image?.trim()
        ? [
            {
              src: row.Image.trim(),
              width: 1600,
              height: 900,
              alt: `${title} - Preview`,
              caption: title,
            },
          ]
        : existing?.gallery || [],
      links: {
        demo: row.LiveUrl && row.LiveUrl.trim() ? row.LiveUrl.trim() : null,
        repository: row.GithubUrl && row.GithubUrl.trim() ? row.GithubUrl.trim() : null,
        paper: null,
      },
      videoUrl,
      featuredRank: row.Featured?.toUpperCase() === "TRUE" ? Number(row.Order) || 1 : null,
      publishedAt: existing?.publishedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const parsed = ProjectSchema.safeParse(projData);
    if (parsed.success) {
      syncedProjects.push(parsed.data as Project);
      console.log(`  + Synced project: [${projData.id}] ${projData.title} (Video: ${videoUrl ? "YES" : "NO"})`);
    } else {
      console.warn(`  ! Project ${row.ID} failed validation:`, parsed.error.format());
    }
  }

  const mergedProjects = syncedProjects.sort((a, b) => {
    const rankA = a.featuredRank ?? 999;
    const rankB = b.featuredRank ?? 999;
    if (rankA !== rankB) return rankA - rankB;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  fs.writeFileSync(projectsPath, JSON.stringify(mergedProjects, null, 2), "utf8");
  console.log(`[SyncContent] Wrote ${mergedProjects.length} projects to ${projectsPath}`);

  // 2. Fetch & Parse Services
  const servicesCsv = await fetchGoogleSheetCsv("Services");
  const rawServices = parseCsv(servicesCsv);
  console.log(`[SyncContent] Found ${rawServices.length} services in Google Sheets 'Services' tab.`);

  const servicesPath = path.join(CONTENT_DIR, "services.json");
  let existingServices: Service[] = [];
  if (fs.existsSync(servicesPath)) {
    try {
      existingServices = JSON.parse(fs.readFileSync(servicesPath, "utf8"));
    } catch {
      existingServices = [];
    }
  }

  const existingServiceMap = new Map<string, Service>();
  for (const s of existingServices) {
    existingServiceMap.set(s.serviceKey, s);
  }

  const syncedServices: Service[] = [];
  for (const row of rawServices) {
    if (!row.ID || !row.Title) continue;

    const key = row.ID.trim();
    const existing = existingServiceMap.get(key);
    const title = row.Title.trim();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const capabilities = row.Details
      ? row.Details.split(",").map((s) => s.trim()).filter(Boolean)
      : existing?.capabilities || [
          "Requirements Clarification & Scope",
          "Architecture & API Design",
          "Production Integration & Verification",
          "Deployment & Observability Handover",
        ];

    const svcData: Service = {
      serviceKey: key,
      slug,
      title,
      summary: row.Description?.trim() || existing?.summary || title,
      capabilities: capabilities.length > 0 ? capabilities : ["Architecture & Design"],
      deliverables: existing?.deliverables || [
        "Production-Ready Architecture & Deployment",
        "API Integration & Documentation",
        "Operational Monitoring & Runbook Handover",
      ],
      iconKey: (row.Icon?.trim() || existing?.iconKey || "bot").toLowerCase(),
      displayOrder: Number(row.Order) || existing?.displayOrder || 1,
      active: true,
      updatedAt: new Date().toISOString(),
    };

    const parsed = ServiceSchema.safeParse(svcData);
    if (parsed.success) {
      syncedServices.push(parsed.data as Service);
      console.log(`  + Synced service: [${key}] ${svcData.title}`);
    } else {
      console.warn(`  ! Service ${key} failed validation:`, parsed.error.format());
    }
  }

  const mergedServices = syncedServices.sort((a, b) => a.displayOrder - b.displayOrder);
  fs.writeFileSync(servicesPath, JSON.stringify(mergedServices, null, 2), "utf8");
  console.log(`[SyncContent] Wrote ${mergedServices.length} services to ${servicesPath}`);

  // 3. Update manifest.json
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(projectsPath));
  const contentSha256 = hash.digest("hex");
  const snapshotVersion = `${new Date().toISOString().slice(0, 19).replace(/[:-]/g, "")}_${contentSha256.slice(0, 8)}`;

  const manifest = {
    schemaVersion: "1.0.0",
    snapshotVersion,
    generatedAt: new Date().toISOString(),
    projectCount: mergedProjects.length,
    serviceCount: mergedServices.length,
    contentSha256,
    source: "google-sheets-authoritative",
  };

  const manifestPath = path.join(CONTENT_DIR, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`[SyncContent] Updated snapshot manifest: ${snapshotVersion}`);
  console.log(`[SyncContent] Successfully synced all content directly from Google Sheets!`);
}

syncContent().catch((err) => {
  console.error("[SyncContent] Error:", err);
  process.exit(1);
});
