import fs from "fs";
import path from "path";
import crypto from "crypto";

function buildContent() {
  const contentDir = path.join(process.cwd(), "src/content/generated");
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  const projectsFile = path.join(contentDir, "projects.json");
  const servicesFile = path.join(contentDir, "services.json");

  let projectsCount = 0;
  let servicesCount = 0;

  if (fs.existsSync(projectsFile)) {
    const prjs = JSON.parse(fs.readFileSync(projectsFile, "utf8"));
    projectsCount = prjs.length;
  }
  if (fs.existsSync(servicesFile)) {
    const svcs = JSON.parse(fs.readFileSync(servicesFile, "utf8"));
    servicesCount = svcs.length;
  }

  // Calculate SHA256 of projects.json
  const hash = crypto.createHash("sha256");
  if (fs.existsSync(projectsFile)) {
    hash.update(fs.readFileSync(projectsFile));
  }
  const contentSha256 = hash.digest("hex");

  const snapshotVersion = `${new Date().toISOString().slice(0, 19).replace(/[:-]/g, "")}_${contentSha256.slice(0, 8)}`;

  const manifest = {
    schemaVersion: "1.0.0",
    snapshotVersion,
    generatedAt: new Date().toISOString(),
    projectCount: projectsCount,
    serviceCount: servicesCount,
    contentSha256,
    source: "google-sheets-drive",
  };

  fs.writeFileSync(path.join(contentDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`[BuildContent] Successfully created snapshot manifest: ${snapshotVersion}`);
}

buildContent();
