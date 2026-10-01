import fs from "fs";
import path from "path";
import crypto from "crypto";

const CONTENT_DIR = path.join(process.cwd(), "src/content/generated");
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEETS_ID || "1Oh6nSGPoPT54wAPrvurTxGHt7gSzD8KK3L5v5XHtuKo";

async function fetchGoogleSheetCsv(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch sheet "${sheetName}": HTTP ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  if (text.startsWith("<!DOCTYPE html>")) {
    throw new Error(`Google returned HTML instead of CSV for sheet "${sheetName}". Check sharing permissions.`);
  }

  return text;
}

function parseCsv(csvText) {
  const rows = [];
  let currentRow = [];
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
    const obj = {};
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

  const projectsPath = path.join(CONTENT_DIR, "projects.json");
  const servicesPath = path.join(CONTENT_DIR, "services.json");
  const manifestPath = path.join(CONTENT_DIR, "manifest.json");

  let existingProjects = [];
  if (fs.existsSync(projectsPath)) {
    try {
      existingProjects = JSON.parse(fs.readFileSync(projectsPath, "utf8"));
    } catch {
      existingProjects = [];
    }
  }
  const existingProjectMap = new Map();
  for (const p of existingProjects) {
    existingProjectMap.set(p.id, p);
  }

  // 1. Projects
  try {
    const projectsCsv = await fetchGoogleSheetCsv("Projects");
    const rawProjects = parseCsv(projectsCsv);
    console.log(`[SyncContent] Found ${rawProjects.length} rows in 'Projects' tab.`);

    const syncedProjects = [];
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

      const projData = {
        id: row.ID.trim(),
        slug,
        title,
        projectType: row.ProjectType?.toUpperCase() === "CLIENT" ? "CLIENT" : "PERSONAL",
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

      syncedProjects.push(projData);
      console.log(`  + Project: [${projData.id}] ${projData.title} (Video: ${videoUrl ? "YES" : "NO"})`);
    }

    if (syncedProjects.length > 0) {
      syncedProjects.sort((a, b) => {
        const rankA = a.featuredRank ?? 999;
        const rankB = b.featuredRank ?? 999;
        if (rankA !== rankB) return rankA - rankB;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });

      fs.writeFileSync(projectsPath, JSON.stringify(syncedProjects, null, 2), "utf8");
      console.log(`[SyncContent] Updated ${syncedProjects.length} projects in ${projectsPath}`);
    } else {
      console.warn(`[SyncContent] Parsed 0 valid projects. Retaining existing cache.`);
    }
  } catch (err) {
    console.error(`[SyncContent] Projects sync warning:`, err.message);
  }

  // 2. Services
  let existingServices = [];
  if (fs.existsSync(servicesPath)) {
    try {
      existingServices = JSON.parse(fs.readFileSync(servicesPath, "utf8"));
    } catch {
      existingServices = [];
    }
  }
  const existingServiceMap = new Map();
  for (const s of existingServices) {
    existingServiceMap.set(s.serviceKey, s);
  }

  try {
    const servicesCsv = await fetchGoogleSheetCsv("Services");
    const rawServices = parseCsv(servicesCsv);
    console.log(`[SyncContent] Found ${rawServices.length} rows in 'Services' tab.`);

    const syncedServices = [];
    for (const row of rawServices) {
      if (!row.ID || !row.Title) continue;

      const key = row.ID.trim();
      const existing = existingServiceMap.get(key);
      const title = row.Title.trim();
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const capabilities = row.Details
        ? row.Details.split(",").map((s) => s.trim()).filter(Boolean)
        : existing?.capabilities || ["Architecture & Design", "Integration & Handover"];

      const svcData = {
        serviceKey: key,
        slug,
        title,
        summary: row.Description?.trim() || existing?.summary || title,
        capabilities: capabilities.length > 0 ? capabilities : ["Architecture & Design"],
        deliverables: existing?.deliverables || [
          "Production-Ready Architecture & Deployment",
          "API Integration & Documentation",
          "Operational Monitoring Handover",
        ],
        iconKey: (row.Icon?.trim() || existing?.iconKey || "bot").toLowerCase(),
        displayOrder: Number(row.Order) || existing?.displayOrder || 1,
        active: true,
        updatedAt: new Date().toISOString(),
      };

      syncedServices.push(svcData);
      console.log(`  + Service: [${key}] ${svcData.title}`);
    }

    if (syncedServices.length > 0) {
      syncedServices.sort((a, b) => a.displayOrder - b.displayOrder);
      fs.writeFileSync(servicesPath, JSON.stringify(syncedServices, null, 2), "utf8");
      console.log(`[SyncContent] Updated ${syncedServices.length} services in ${servicesPath}`);
    } else {
      console.warn(`[SyncContent] Parsed 0 valid services. Retaining existing cache.`);
    }
  } catch (err) {
    console.error(`[SyncContent] Services sync warning:`, err.message);
  }

  // 3. SiteConfig (sync contact info & metadata from Google Sheets 'SiteConfig' tab)
  const siteConfigPath = path.join(CONTENT_DIR, "site-config.json");
  let existingConfig = {};
  if (fs.existsSync(siteConfigPath)) {
    try {
      existingConfig = JSON.parse(fs.readFileSync(siteConfigPath, "utf8"));
    } catch {
      existingConfig = {};
    }
  }

  try {
    const configCsv = await fetchGoogleSheetCsv("SiteConfig");
    const rawConfigRows = parseCsv(configCsv);
    console.log(`[SyncContent] Found ${rawConfigRows.length} rows in 'SiteConfig' tab.`);

    let updated = false;
    for (const row of rawConfigRows) {
      const key = (row.Key || row.key || row.Field || row.Setting || "").trim().toLowerCase();
      const val = (row.Value || row.value || "").trim();
      if (!key || !val) continue;

      if (key === "contact_email" || key === "contactemail" || key === "contactemailpublic") {
        existingConfig.contactEmailPublic = val;
        updated = true;
        console.log(`  + Config contactEmailPublic: ${val}`);
      } else if (key === "zalo_url" || key === "zalourl" || key === "zalo") {
        existingConfig.zaloUrl = val;
        updated = true;
        console.log(`  + Config zaloUrl: ${val}`);
      } else if (key === "linkedin_url" || key === "linkedinurl" || key === "linkedin") {
        existingConfig.linkedinUrl = val;
        updated = true;
        console.log(`  + Config linkedinUrl: ${val}`);
      } else if (key === "github_url" || key === "githuburl" || key === "github") {
        existingConfig.githubUrl = val;
        updated = true;
        console.log(`  + Config githubUrl: ${val}`);
      } else if (key === "cv_url" || key === "cvurl" || key === "cv") {
        existingConfig.cvUrl = val;
        updated = true;
        console.log(`  + Config cvUrl: ${val}`);
      } else if (key === "site_name" || key === "sitename") {
        existingConfig.siteName = val;
        updated = true;
        console.log(`  + Config siteName: ${val}`);
      } else if (key === "headline") {
        existingConfig.headline = val;
        updated = true;
        console.log(`  + Config headline: ${val}`);
      } else if (key === "value_proposition" || key === "valueproposition") {
        existingConfig.valueProposition = val;
        updated = true;
        console.log(`  + Config valueProposition: ${val}`);
      } else if (key === "about_short" || key === "aboutshort") {
        existingConfig.aboutShort = val;
        updated = true;
        console.log(`  + Config aboutShort: ${val}`);
      } else if (key === "about_long" || key === "aboutlong") {
        existingConfig.aboutLong = val;
        updated = true;
        console.log(`  + Config aboutLong: (updated multi-line text)`);
      } else if (key === "contact_cta" || key === "contactcta") {
        existingConfig.contactCta = val;
        updated = true;
        console.log(`  + Config contactCta: ${val}`);
      } else if (key === "timezone") {
        existingConfig.timezone = val;
        updated = true;
        console.log(`  + Config timezone: ${val}`);
      }
    }

    // Fallback: If pasted as single cell or space-delimited text, extract contact URLs via regex
    const emailMatch = configCsv.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch && existingConfig.contactEmailPublic !== emailMatch[1]) {
      existingConfig.contactEmailPublic = emailMatch[1];
      updated = true;
      console.log(`  + Extracted contactEmailPublic via regex: ${emailMatch[1]}`);
    }

    const zaloMatch = configCsv.match(/(https?:\/\/(?:zalo\.me|zaloapp\.com)\/[^\s",]+)/);
    if (zaloMatch && existingConfig.zaloUrl !== zaloMatch[1]) {
      existingConfig.zaloUrl = zaloMatch[1];
      updated = true;
      console.log(`  + Extracted zaloUrl via regex: ${zaloMatch[1]}`);
    }

    const linkedinMatch = configCsv.match(/(https?:\/\/(?:www\.)?linkedin\.com\/in\/[^\s",]+)/);
    if (linkedinMatch && existingConfig.linkedinUrl !== linkedinMatch[1]) {
      existingConfig.linkedinUrl = linkedinMatch[1];
      updated = true;
      console.log(`  + Extracted linkedinUrl via regex: ${linkedinMatch[1]}`);
    }

    const githubMatch = configCsv.match(/(https?:\/\/(?:www\.)?github\.com\/[^\s",]+)/);
    if (githubMatch && existingConfig.githubUrl !== githubMatch[1]) {
      existingConfig.githubUrl = githubMatch[1];
      updated = true;
      console.log(`  + Extracted githubUrl via regex: ${githubMatch[1]}`);
    }

    const cvMatch = configCsv.match(/(https?:\/\/drive\.google\.com\/file\/d\/[^\s",]+)/);
    if (cvMatch && existingConfig.cvUrl !== cvMatch[1]) {
      existingConfig.cvUrl = cvMatch[1];
      updated = true;
      console.log(`  + Extracted cvUrl via regex: ${cvMatch[1]}`);
    }

    if (updated) {
      fs.writeFileSync(siteConfigPath, JSON.stringify(existingConfig, null, 2), "utf8");
      console.log(`[SyncContent] Updated site-config.json from Google Sheets 'SiteConfig' tab.`);
    }
  } catch (err) {
    console.warn(`[SyncContent] SiteConfig sync optional note:`, err.message);
  }

  // 4. Manifest
  if (fs.existsSync(projectsPath)) {
    const currentProjects = JSON.parse(fs.readFileSync(projectsPath, "utf8"));
    const currentServices = fs.existsSync(servicesPath) ? JSON.parse(fs.readFileSync(servicesPath, "utf8")) : [];

    const hash = crypto.createHash("sha256");
    hash.update(fs.readFileSync(projectsPath));
    const contentSha256 = hash.digest("hex");
    const snapshotVersion = `${new Date().toISOString().slice(0, 19).replace(/[:-]/g, "")}_${contentSha256.slice(0, 8)}`;

    const manifest = {
      schemaVersion: "1.0.0",
      snapshotVersion,
      generatedAt: new Date().toISOString(),
      projectCount: currentProjects.length,
      serviceCount: currentServices.length,
      contentSha256,
      source: "google-sheets-authoritative",
    };

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
    console.log(`[SyncContent] Generated manifest: ${snapshotVersion}`);
  }
}

syncContent()
  .then(() => {
    console.log("[SyncContent] Finished content sync.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("[SyncContent] Fatal error:", err);
    process.exit(0); // Exit 0 to never break the Next.js build
  });
