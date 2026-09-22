import fs from "fs";
import path from "path";

const projects = [
  { id: "PRJ-0001", title: "Agricultural Land & Crop System", color: "#16a34a" },
  { id: "PRJ-0002", title: "HR Document OCR Pipeline", color: "#2563eb" },
  { id: "PRJ-0003", title: "PAB Academic Portal Automation", color: "#7c3aed" },
  { id: "PRJ-0004", title: "Zalo Medical Consultation Bot", color: "#0891b2" },
  { id: "PRJ-0005", title: "Autonomous Research News Agent", color: "#d97706" },
  { id: "PRJ-0006", title: "Education Omnichannel Lead Routing", color: "#4f46e5" },
  { id: "PRJ-0007", title: "Medical Device Qualification Engine", color: "#059669" },
  { id: "PRJ-0008", title: "Low-Latency Speech Pipeline", color: "#dc2626" },
  { id: "PRJ-0009", title: "STEM Interactive Physics Lab", color: "#ea580c" },
  { id: "PRJ-0010", title: "Autonomous Edge RC Rover", color: "#475569" },
];

function generateSvgCard(id: string, title: string, color: string, subtitle: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color};stop-opacity:0.85" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1600" height="900" fill="url(#grad)" />
  <rect width="1600" height="900" fill="url(#grid)" />
  <circle cx="1400" cy="200" r="300" fill="${color}" opacity="0.15" />
  <circle cx="200" cy="700" r="250" fill="${color}" opacity="0.1" />
  
  <g transform="translate(140, 360)">
    <rect x="0" y="-80" width="140" height="36" rx="18" fill="rgba(255,255,255,0.15)" />
    <text x="70" y="-57" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">${id}</text>
    
    <text x="0" y="20" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="52" font-weight="800" fill="#ffffff">${title}</text>
    <text x="0" y="80" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="24" font-weight="500" fill="rgba(255,255,255,0.75)">${subtitle}</text>
    
    <line x1="0" y1="130" x2="300" y2="130" stroke="${color}" stroke-width="4" stroke-linecap="round" />
  </g>
  
  <text x="140" y="820" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="18" font-weight="600" fill="rgba(255,255,255,0.5)">AIHOC • Production Architecture &amp; Engineering</text>
</svg>`;
}

export function syncMedia() {
  const baseDir = path.join(process.cwd(), "public/media/generated");

  for (const prj of projects) {
    const prjDir = path.join(baseDir, prj.id);
    if (!fs.existsSync(prjDir)) {
      fs.mkdirSync(prjDir, { recursive: true });
    }

    // Cover SVG
    const coverSvg = generateSvgCard(prj.id, prj.title, prj.color, "Production System Architecture & Case Study");
    fs.writeFileSync(path.join(prjDir, "cover.webp"), coverSvg);

    // Gallery SVG
    const gallerySvg = generateSvgCard(prj.id, `${prj.title} - Workflow`, prj.color, "Operational Dashboard & Verification Interface");
    fs.writeFileSync(path.join(prjDir, "gallery-01.webp"), gallerySvg);
  }

  console.log(`[SyncMedia] Successfully generated cover and gallery media for ${projects.length} projects.`);
}

if (require.main === module || process.argv[1]?.includes("sync-media")) {
  syncMedia();
}
