import fs from "fs";
import path from "path";
import https from "https";
import crypto from "crypto";
import { Project, Service } from "../src/types/content";
import { ProjectSchema, ServiceSchema } from "../src/lib/validation/content.schema";

const CONTENT_DIR = path.join(process.cwd(), "src/content/generated");
const PUBLISH_WEBHOOK_URL = process.env.N8N_PUBLISH_WEBHOOK_URL || "https://n8n.aihoc.ai.vn/webhook/portfolio/publish";

interface PublishResponse {
  success: boolean;
  count: number;
  serviceCount?: number;
  published: any[];
  services?: any[];
}

function fetchLatestSnapshot(): Promise<PublishResponse> {
  return new Promise((resolve, reject) => {
    const url = new URL(PUBLISH_WEBHOOK_URL);
    const req = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error(`Failed to parse response: ${data}`));
            }
          } else {
            reject(new Error(`Webhook failed with status ${res.statusCode}: ${data}`));
          }
        });
      }
    );

    req.on("error", reject);
    req.end();
  });
}

async function syncContent() {
  console.log(`[SyncContent] Triggering publish webhook: ${PUBLISH_WEBHOOK_URL}`);
  
  const response = await fetchLatestSnapshot();
  if (!response.success) {
    throw new Error("[SyncContent] Publish webhook returned unsuccessful response");
  }

  console.log(`[SyncContent] Received ${response.count} published projects and ${response.services?.length || 0} services from Google Sheets.`);

  // 1. Projects sync & merge
  const projectsPath = path.join(CONTENT_DIR, "projects.json");
  let existingProjects: Project[] = [];
  if (fs.existsSync(projectsPath)) {
    try {
      existingProjects = JSON.parse(fs.readFileSync(projectsPath, "utf8"));
    } catch {
      existingProjects = [];
    }
  }

  // Create a map by ID
  const projectMap = new Map<string, Project>();
  // First load existing
  for (const p of existingProjects) {
    projectMap.set(p.id, p);
  }

  // Upsert incoming from Google Sheets
  for (const rawProj of response.published || []) {
    const parsed = ProjectSchema.safeParse(rawProj);
    if (parsed.success) {
      projectMap.set(parsed.data.id, parsed.data as Project);
      console.log(`  + Synced project: [${parsed.data.id}] ${parsed.data.title}`);
    } else {
      console.warn(`  ! Project ${rawProj?.id} failed validation:`, parsed.error.format());
    }
  }

  const mergedProjects = Array.from(projectMap.values()).sort((a, b) => {
    // Featured first, then newest
    const rankA = a.featuredRank ?? 999;
    const rankB = b.featuredRank ?? 999;
    if (rankA !== rankB) return rankA - rankB;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  fs.writeFileSync(projectsPath, JSON.stringify(mergedProjects, null, 2), "utf8");
  console.log(`[SyncContent] Wrote ${mergedProjects.length} projects to ${projectsPath}`);

  // 2. Services sync & merge
  const servicesPath = path.join(CONTENT_DIR, "services.json");
  let existingServices: Service[] = [];
  if (fs.existsSync(servicesPath)) {
    try {
      existingServices = JSON.parse(fs.readFileSync(servicesPath, "utf8"));
    } catch {
      existingServices = [];
    }
  }

  const serviceMap = new Map<string, Service>();
  for (const s of existingServices) {
    serviceMap.set(s.serviceKey, s);
  }

  for (const rawSvc of response.services || []) {
    const key = rawSvc.serviceKey || rawSvc.id;
    const existing = serviceMap.get(key);

    const mergedSvc: Service = {
      serviceKey: key,
      slug: rawSvc.slug || (key.toLowerCase().replace(/_/g, "-")),
      title: rawSvc.title || existing?.title || key,
      summary: rawSvc.summary || rawSvc.description || existing?.summary || "",
      capabilities: Array.isArray(rawSvc.capabilities) && rawSvc.capabilities.length > 0
        ? rawSvc.capabilities
        : existing?.capabilities || [
            "Requirement Analysis",
            "System Architecture & API Design",
            "Production Integration",
            "Testing & Observability"
          ],
      deliverables: Array.isArray(rawSvc.deliverables) && rawSvc.deliverables.length > 0
        ? rawSvc.deliverables
        : existing?.deliverables || [
            "Functional Software Module",
            "API Documentation & Runbooks",
            "Monitoring & Alerts",
            "Deployment & Handover"
          ],
      iconKey: (rawSvc.iconKey || rawSvc.icon || existing?.iconKey || "bot").toLowerCase(),
      displayOrder: Number(rawSvc.displayOrder || rawSvc.order || existing?.displayOrder || 1),
      active: rawSvc.active !== undefined ? Boolean(rawSvc.active) : true,
      updatedAt: new Date().toISOString(),
    };

    const parsed = ServiceSchema.safeParse(mergedSvc);
    if (parsed.success) {
      serviceMap.set(key, parsed.data as Service);
      console.log(`  + Synced service: [${key}] ${mergedSvc.title}`);
    } else {
      console.warn(`  ! Service ${key} failed validation:`, parsed.error.format());
    }
  }

  const mergedServices = Array.from(serviceMap.values()).sort((a, b) => a.displayOrder - b.displayOrder);
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
    source: "google-sheets-n8n-sync",
  };

  const manifestPath = path.join(CONTENT_DIR, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`[SyncContent] Updated snapshot manifest: ${snapshotVersion}`);
  console.log(`[SyncContent] Sync complete!`);
}

syncContent().catch((err) => {
  console.error("[SyncContent] Error:", err);
  process.exit(1);
});
