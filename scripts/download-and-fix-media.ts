import fs from "fs";
import path from "path";
import https from "https";

interface ProjectMediaConfig {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  videoUrl?: string | null;
  videoDriveId?: string | null;
  videoFileName?: string | null;
}

export const PROJECT_MEDIA_CONFIGS: ProjectMediaConfig[] = [
  {
    id: "PRJ-AGENT-01",
    slug: "enterprise-agentic-rag-platform",
    title: "Enterprise Agentic RAG Platform",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1600&h=900&fit=crop",
    videoUrl: "https://drive.google.com/file/d/1J22aVAFLuu1G53QiySD092hT3nRxXXpn/preview",
    videoDriveId: "1J22aVAFLuu1G53QiySD092hT3nRxXXpn",
    videoFileName: "Content SEO n8n.mp4",
  },
  {
    id: "PRJ-0001",
    slug: "agricultural-land-production-management",
    title: "Agricultural Land & Crop Production Management System",
    imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&h=900&fit=crop",
    videoUrl: "https://drive.google.com/file/d/1HvfyIiiXKTT_kEftMiLHmnlzEVMziPaQ/preview",
    videoDriveId: "1HvfyIiiXKTT_kEftMiLHmnlzEVMziPaQ",
    videoFileName: "Naver Posts Tracking.mp4",
  },
  {
    id: "PRJ-0002",
    slug: "hr-employment-document-automation",
    title: "Automated HR Employment Document Processing Pipeline",
    imageUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1600&h=900&fit=crop",
    videoUrl: "https://drive.google.com/file/d/1qHUP50QZ3uni4nLUQdCkS6h68aFS9Trs/preview",
    videoDriveId: "1qHUP50QZ3uni4nLUQdCkS6h68aFS9Trs",
    videoFileName: "OCR Local Đơn Thuốc.mp4",
  },
  {
    id: "PRJ-0003",
    slug: "pab-university-portal-grade-automation",
    title: "PAB University Academic Portal & Grade Audit Automation",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&h=900&fit=crop",
    videoUrl: "https://drive.google.com/file/d/1Q603JVwjkz-J38jRatoM4Uj1eGgDJXZZ/preview",
    videoDriveId: "1Q603JVwjkz-J38jRatoM4Uj1eGgDJXZZ",
    videoFileName: "Automation Phòng Đào Tạo - Censored.mp4",
  },
  {
    id: "PRJ-0004",
    slug: "zalo-medical-appointment-bot",
    title: "Zalo Medical Consultation & Appointment Booking Bot",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&h=900&fit=crop",
    videoUrl: "https://drive.google.com/file/d/1IbmBV9ne7pYUFcRnin3QZoA2cv2rnoHt/preview",
    videoDriveId: "1IbmBV9ne7pYUFcRnin3QZoA2cv2rnoHt",
    videoFileName: "Zalo Agent Q&A Đơn Thuốc.mp4",
  },
  {
    id: "PRJ-0005",
    slug: "autonomous-research-news-agent",
    title: "Autonomous Multilingual Research & News Digest Agent",
    imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&h=900&fit=crop",
    videoUrl: "https://drive.google.com/file/d/13I-S7gqkAeB8pA5M5yynI5tWdiKkX-Qw/preview",
    videoDriveId: "13I-S7gqkAeB8pA5M5yynI5tWdiKkX-Qw",
    videoFileName: "Newspaper_Bot.mp4",
  },
  {
    id: "PRJ-0006",
    slug: "vocational-center-lead-routing-workflow",
    title: "Vocational Center Omnichannel Lead Routing & Consultation Workflow",
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&h=900&fit=crop",
    videoUrl: "https://drive.google.com/file/d/1Oco0H_f5ZQ96IsGto_FMqPHR_TGlhMjY/preview",
    videoDriveId: "1Oco0H_f5ZQ96IsGto_FMqPHR_TGlhMjY",
    videoFileName: "System Quản Lý TTGD.mp4",
  },
  {
    id: "PRJ-0007",
    slug: "b2b-medical-device-qualification-engine",
    title: "B2B Medical Device Distribution Lead Qualification Engine",
    imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1600&h=900&fit=crop",
    videoUrl: "https://drive.google.com/file/d/1kqqEvPPnRhWpPpGfY8JvIYcIxaYf2PPe/preview",
    videoDriveId: "1kqqEvPPnRhWpPpGfY8JvIYcIxaYf2PPe",
    videoFileName: "Zalo Sales Agent.mp4",
  },
  {
    id: "PRJ-0008",
    slug: "low-latency-vietnamese-speech-pipeline",
    title: "Low-Latency Vietnamese Speech Recognition & Synthesis Pipeline",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1600&h=900&fit=crop",
    videoUrl: null,
  },
  {
    id: "PRJ-0009",
    slug: "stem-physics-interactive-laboratory",
    title: "Interactive STEM Physics Simulation & Virtual Laboratory",
    imageUrl: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=1600&h=900&fit=crop",
    videoUrl: null,
  },
  {
    id: "PRJ-0010",
    slug: "autonomous-edge-rc-rover",
    title: "Autonomous RC Vehicle with Edge Computer Vision & Telemetry",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1600&h=900&fit=crop",
    videoUrl: null,
  },
];

function downloadImage(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Follow redirect if 301/302
      if (res.statusCode === 301 || res.statusCode === 302) {
        if (res.headers.location) {
          return downloadImage(res.headers.location, destPath).then(resolve).catch(reject);
        }
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close();
        resolve();
      });
      fileStream.on("error", reject);
    }).on("error", reject);
  });
}

async function main() {
  const mediaBaseDir = path.join(process.cwd(), "public/media/generated");
  const projectsJsonPath = path.join(process.cwd(), "src/content/generated/projects.json");

  console.log("1. Downloading high-res binary images for all projects...");
  for (const prj of PROJECT_MEDIA_CONFIGS) {
    const dir = path.join(mediaBaseDir, prj.id);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const coverWebp = path.join(dir, "cover.webp");
    const galleryWebp = path.join(dir, "gallery-01.webp");

    console.log(`  Downloading image for ${prj.id}...`);
    try {
      await downloadImage(prj.imageUrl, coverWebp);
      fs.copyFileSync(coverWebp, galleryWebp);
      console.log(`  ✓ Saved ${prj.id} cover.webp & gallery-01.webp (${fs.statSync(coverWebp).size} bytes)`);
    } catch (err: any) {
      console.error(`  ✗ Error downloading ${prj.id}:`, err.message);
    }
  }

  console.log("\n2. Updating src/content/generated/projects.json with valid image and video URLs...");
  const rawProjects = JSON.parse(fs.readFileSync(projectsJsonPath, "utf8"));
  
  for (const p of rawProjects) {
    const cfg = PROJECT_MEDIA_CONFIGS.find((c) => c.id === p.id);
    if (cfg) {
      p.cover = {
        src: cfg.imageUrl,
        width: 1600,
        height: 900,
        alt: p.title,
      };
      p.gallery = [
        {
          src: cfg.imageUrl,
          width: 1600,
          height: 900,
          alt: `${p.title} - Showcase`,
          caption: `${p.title} Architecture & System Interface`,
        },
      ];
      p.videoUrl = cfg.videoUrl || null;
    }
  }

  fs.writeFileSync(projectsJsonPath, JSON.stringify(rawProjects, null, 2), "utf8");
  console.log("  ✓ Updated projects.json successfully with full images and videos!");
}

main().catch(console.error);
