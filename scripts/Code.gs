/**
 * AIHOC CMS - Tự động tạo Folder Drive, Copy Video, Đồng bộ Ảnh & Kích hoạt Xuất bản Website
 * Khớp chuẩn xác 100% với 12 cột thực tế của Sheet Projects:
 * [ID, Title, Category, Image, Description, Details, TechStack, LiveUrl, GithubUrl, Order, Featured, Video]
 */

const PROJECTS_PARENT_FOLDER_ID = "14tInMIEw8POFBHObxT0HzsU9C6V5mxKM";
const SOURCE_VIDEOS_FOLDER_ID = "1vPlE_BUUBRpYikzojz2ePFs0FGdnwK0P";
const N8N_PUBLISH_WEBHOOK_URL = "https://n8n.aihoc.ai.vn/webhook/portfolio/publish";
const VERCEL_DEPLOY_HOOK_URL = "https://api.vercel.com/v1/integrations/deploy/prj_1Wp6YoheiZIN4ClVv9m9qwuK1DLu/9vOAJAjy49?ref=main&buildCache=false";

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🚀 AIHOC CMS")
    .addItem("📁 1. Tự động tạo Folder Drive cho các dự án", "createProjectFolders")
    .addItem("🎬 2. Sao chép Video từ Thư mục nguồn vào từng Dự án (Ghi Cột Video)", "copyVideosToProjectFolders")
    .addItem("🖼️ 3. Đồng bộ & Nạp Ảnh thật vào từng Folder Drive (Ghi Cột Image)", "syncImagesToDriveFolders")
    .addItem("🌐 4. Xuất bản nội dung lên Website", "triggerPublishWebhook")
    .addSeparator()
    .addItem("✨ 5. Nạp cấu trúc chuẩn 12 Cột (Có Cột Video & Ảnh HD)", "cleanAndSeed10Projects")
    .addItem("⚙️ 6. Thiết lập & Nạp cấu hình mẫu cho tab SiteConfig", "setupAndSeedSiteConfig")
    .addToUi();
}

/**
 * Tạo folder riêng cho từng dự án trong folder cha PROJECTS_PARENT_FOLDER_ID
 */
function createProjectFolders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Projects");
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  const parentFolder = DriveApp.getFolderById(PROJECTS_PARENT_FOLDER_ID);
  let createdCount = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const projectId = row[0]; // Cột A: ID
    const title = row[1];     // Cột B: Title
    if (!projectId || !title) continue;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const folderName = projectId + '-' + slug;

    const existingFolders = parentFolder.getFoldersByName(folderName);
    if (!existingFolders.hasNext()) {
      parentFolder.createFolder(folderName);
      createdCount++;
    }
  }

  SpreadsheetApp.getUi().alert("✅ Đã kiểm tra xong! Tạo mới " + createdCount + " thư mục dự án trên Drive.");
}

/**
 * Tự động sao chép video từ Thư mục nguồn (SOURCE_VIDEOS_FOLDER_ID) vào đúng folder dự án tương ứng,
 * đồng thời cập nhật link Google Drive vào Cột L (Video) trên Google Sheet.
 */
function copyVideosToProjectFolders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Projects");
  if (!sheet) return;

  const parentFolder = DriveApp.getFolderById(PROJECTS_PARENT_FOLDER_ID);
  const sourceFolder = DriveApp.getFolderById(SOURCE_VIDEOS_FOLDER_ID);

  // Bản đồ khớp video nguồn với tiền tố ID dự án
  const videoRules = [
    { sourceNamePattern: "Phòng Đào Tạo", projectPrefix: "PRJ-0003" },
    { sourceNamePattern: "Zalo Agent Q", projectPrefix: "PRJ-0004" },
    { sourceNamePattern: "Newspaper_Bot", projectPrefix: "PRJ-0005" },
    { sourceNamePattern: "System Quản Lý TTGD", projectPrefix: "PRJ-0006" },
    { sourceNamePattern: "Zalo Sales Agent", projectPrefix: "PRJ-0007" },
    { sourceNamePattern: "OCR Local Đơn Thuốc", projectPrefix: "PRJ-0002" },
    { sourceNamePattern: "Content SEO n8n", projectPrefix: "PRJ-AGENT-01" },
    { sourceNamePattern: "Naver Posts Tracking", projectPrefix: "PRJ-0001" },
  ];

  // Lấy danh sách tất cả các thư mục con trong PROJECTS_PARENT_FOLDER_ID
  const projectFolders = [];
  const folderIter = parentFolder.getFolders();
  while (folderIter.hasNext()) {
    projectFolders.push(folderIter.next());
  }

  const data = sheet.getDataRange().getValues();
  let copiedCount = 0;
  const filesIter = sourceFolder.getFiles();

  while (filesIter.hasNext()) {
    const file = filesIter.next();
    const fileName = file.getName();

    // Tìm quy tắc tương ứng
    const rule = videoRules.find(r => fileName.indexOf(r.sourceNamePattern) !== -1);
    if (!rule) continue;

    // Tìm thư mục dự án tương ứng
    let targetFolder = projectFolders.find(f => f.getName().startsWith(rule.projectPrefix));
    if (!targetFolder) {
      targetFolder = parentFolder.createFolder(rule.projectPrefix + "-project");
      projectFolders.push(targetFolder);
    }

    // Kiểm tra xem file đã có trong thư mục đích chưa để tránh nhân đôi
    let targetFile;
    const existingInTarget = targetFolder.getFilesByName(fileName);
    if (!existingInTarget.hasNext()) {
      targetFile = file.makeCopy(fileName, targetFolder);
      copiedCount++;
      Logger.log("Copied " + fileName + " -> " + targetFolder.getName());
    } else {
      targetFile = existingInTarget.next();
    }

    if (targetFile) {
      targetFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      const previewUrl = "https://drive.google.com/file/d/" + targetFile.getId() + "/preview";

      // Ghi link video vào Cột L (Cột 12) của dòng dự án tương ứng
      for (let r = 1; r < data.length; r++) {
        if (data[r][0] === rule.projectPrefix) {
          sheet.getRange(r + 1, 12).setValue(previewUrl);
          break;
        }
      }
    }
  }

  SpreadsheetApp.getUi().alert("✅ Đã sao chép video vào các thư mục Google Drive và cập nhật link vào Cột Video (Cột L) trên Sheet!");
}

/**
 * Tải hình ảnh HD chuẩn và nạp vào đúng Folder Drive của từng dự án,
 * sau đó cập nhật link Google Drive thật vào cột Image (Cột D) trên Google Sheet.
 */
function syncImagesToDriveFolders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Projects");
  if (!sheet) return;

  const parentFolder = DriveApp.getFolderById(PROJECTS_PARENT_FOLDER_ID);
  const data = sheet.getDataRange().getValues();

  // Bản đồ ảnh HD cho các dự án nếu chưa có file
  const defaultImages = {
    "PRJ-AGENT-01": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1600&h=900&fit=crop",
    "PRJ-0001": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&h=900&fit=crop",
    "PRJ-0002": "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1600&h=900&fit=crop",
    "PRJ-0003": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&h=900&fit=crop",
    "PRJ-0004": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&h=900&fit=crop",
    "PRJ-0005": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&h=900&fit=crop",
    "PRJ-0006": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&h=900&fit=crop",
    "PRJ-0007": "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1600&h=900&fit=crop",
    "PRJ-0008": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1600&h=900&fit=crop",
    "PRJ-0009": "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=1600&h=900&fit=crop",
    "PRJ-0010": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1600&h=900&fit=crop"
  };

  const projectFolders = [];
  const folderIter = parentFolder.getFolders();
  while (folderIter.hasNext()) {
    projectFolders.push(folderIter.next());
  }

  let updatedCount = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const projectId = row[0]; // Cột A: ID
    const currentImg = row[3]; // Cột D: Image
    if (!projectId) continue;

    // Tìm folder của dự án
    let targetFolder = projectFolders.find(f => f.getName().startsWith(projectId));
    if (!targetFolder) continue;

    // Kiểm tra xem trong folder đã có file cover.jpg chưa
    let coverFile;
    const existingCovers = targetFolder.getFilesByName("cover.jpg");
    if (existingCovers.hasNext()) {
      coverFile = existingCovers.next();
    } else {
      // Nếu chưa có, tải ảnh về và tạo cover.jpg trên Drive
      const imgSource = (currentImg && currentImg.startsWith("http")) ? currentImg : (defaultImages[projectId] || defaultImages["PRJ-0001"]);
      try {
        const resp = UrlFetchApp.fetch(imgSource);
        const blob = resp.getBlob().setName("cover.jpg");
        coverFile = targetFolder.createFile(blob);
      } catch (e) {
        Logger.log("Error fetching image for " + projectId + ": " + e.message);
        continue;
      }
    }

    if (coverFile) {
      coverFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      const driveUrl = "https://drive.google.com/file/d/" + coverFile.getId() + "/view?usp=sharing";
      
      // Cập nhật vào Google Sheet dòng i+1, cột D (cột 4)
      sheet.getRange(i + 1, 4).setValue(driveUrl);
      updatedCount++;
    }
  }

  SpreadsheetApp.getUi().alert("✅ Đã đồng bộ xong " + updatedCount + " hình ảnh thật vào các thư mục Google Drive và cập nhật link Drive lên Sheet!");
}

/**
 * Kích hoạt xuất bản website: Đồng thời gọi n8n workflow và kích hoạt trực tiếp Vercel Deploy Hook
 */
function triggerPublishWebhook() {
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      mode: "FULL",
      requestedBy: "GoogleSheets_AppsScript",
      timestamp: new Date().toISOString()
    }),
    muteHttpExceptions: true
  };

  let n8nSuccess = false;
  let vercelSuccess = false;

  // 1. Kích hoạt n8n workflow (để n8n ghi nhận và xử lý nếu cần)
  try {
    const response = UrlFetchApp.fetch(N8N_PUBLISH_WEBHOOK_URL, options);
    n8nSuccess = (response.getResponseCode() >= 200 && response.getResponseCode() < 300);
  } catch (err) {
    Logger.log("Lỗi gọi n8n: " + err.message);
  }

  // 2. Kích hoạt trực tiếp Vercel Deploy Hook (đảm bảo website build ngay trong 35-45s, không bị nghẽn nhánh rẽ của n8n)
  try {
    const vRes = UrlFetchApp.fetch(VERCEL_DEPLOY_HOOK_URL, {
      method: "post",
      muteHttpExceptions: true
    });
    vercelSuccess = (vRes.getResponseCode() >= 200 && vRes.getResponseCode() < 300);
  } catch (vErr) {
    Logger.log("Lỗi gọi Vercel Deploy Hook: " + vErr.message);
  }

  if (vercelSuccess || n8nSuccess) {
    SpreadsheetApp.getUi().alert("✅ Đã kích hoạt xuất bản thành công! Vercel đang tự động kéo dữ liệu mới nhất từ Google Sheet và biên dịch lại website (mất khoảng 35-45 giây).");
  } else {
    SpreadsheetApp.getUi().alert("❌ Lỗi khi kích hoạt xuất bản. Vui lòng kiểm tra kết nối mạng.");
  }
}

/**
 * Nạp cấu trúc chuẩn 12 cột (thêm cột Video ở Cột L)
 */
function cleanAndSeed10Projects() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Projects");
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Không tìm thấy tab Projects!");
    return;
  }

  // Tiêu đề 12 cột chuẩn khớp
  const headers = [
    ["ID", "Title", "Category", "Image", "Description", "Details", "TechStack", "LiveUrl", "GithubUrl", "Order", "Featured", "Video"]
  ];
  sheet.getRange(1, 1, 1, 12).setValues(headers);

  // Dòng 2: PRJ-AGENT-01
  const rowAgent01 = [
    "PRJ-AGENT-01",
    "Enterprise Agentic RAG Platform",
    "AI_AGENT",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1600&h=900&fit=crop",
    "Hệ thống AI Agent tự động hóa tra cứu dữ liệu quy chế và phân tích báo cáo tài chính cho doanh nghiệp.",
    "Xây dựng trên nền tảng LangGraph kết hợp Hybrid Search (pgvector + BM25). Tối ưu hóa thời gian xử lý hồ sơ từ 3 ngày xuống dưới 4 phút với độ chính xác trích xuất đạt 96.8%.",
    "LangGraph, FastAPI, pgvector, Next.js, Docker",
    "https://portfolio.aihoc.ai.vn",
    "https://github.com/danhphan",
    "1",
    "TRUE",
    "https://drive.google.com/file/d/1J22aVAFLuu1G53QiySD092hT3nRxXXpn/preview"
  ];
  sheet.getRange(2, 1, 1, 12).setValues([rowAgent01]);

  // 10 dự án chuẩn khớp 12 cột (từ dòng 3 đến 12)
  const rows = [
    [
      "PRJ-0001",
      "Agricultural Land & Crop Production Management System",
      "CUSTOM_MANAGEMENT_SYSTEM",
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&h=900&fit=crop",
      "Integrated web platform replacing fragmented spreadsheets with real-time plot mapping, crop cycle tracking, and automated harvest reporting.",
      "Designed and deployed a responsive management portal allowing field supervisors to log plot conditions, soil metrics, and treatments via mobile-friendly forms, while management receives real-time production analytics and automated weekly export summaries.",
      "Next.js, FastAPI, PostgreSQL, n8n, Docker",
      "",
      "",
      "2",
      "TRUE",
      "https://drive.google.com/file/d/1HvfyIiiXKTT_kEftMiLHmnlzEVMziPaQ/preview"
    ],
    [
      "PRJ-0002",
      "Automated HR Employment Document Processing Pipeline",
      "DOCUMENT_AI_OCR",
      "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1600&h=900&fit=crop",
      "AI-assisted intake pipeline that extracts, validates, and archives candidate employment records and contracts with 98% accuracy.",
      "Engineered an intelligent document intake pipeline with automated OCR preprocessing, LLM schema extraction, and human-in-the-loop review for low-confidence fields.",
      "Python, PaddleOCR, LangChain, n8n, Google Workspace",
      "",
      "",
      "3",
      "TRUE",
      "https://drive.google.com/file/d/1qHUP50QZ3uni4nLUQdCkS6h68aFS9Trs/preview"
    ],
    [
      "PRJ-0003",
      "PAB University Academic Portal & Grade Audit Automation",
      "WORKFLOW_AUTOMATION",
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&h=900&fit=crop",
      "Headless browser automation and verification engine synchronizing academic transcripts and cross-faculty grade submissions.",
      "Developed an audited, idempotent RPA automation script running in isolated headless containers that extracts transcripts, reconciles discrepancies against faculty submission sheets, and generates audit reports.",
      "Python, Playwright, n8n, PostgreSQL, FastAPI",
      "",
      "",
      "4",
      "TRUE",
      "https://drive.google.com/file/d/1Q603JVwjkz-J38jRatoM4Uj1eGgDJXZZ/preview"
    ],
    [
      "PRJ-0004",
      "Zalo Medical Consultation & Appointment Booking Bot",
      "ZALO_CUSTOMER_SERVICE",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&h=900&fit=crop",
      "24/7 intelligent patient assistance bot on Zalo OA triaging clinic inquiries, scheduling doctor appointments, and sending appointment reminders.",
      "Built an intelligent Zalo Official Account chatbot with natural language understanding to answer common treatment FAQs, verify doctor availability in real-time, and confirm bookings directly into clinic schedules.",
      "Zalo OA API, n8n, OpenAI GPT-4o-mini, Google Calendar",
      "",
      "",
      "5",
      "FALSE",
      "https://drive.google.com/file/d/1IbmBV9ne7pYUFcRnin3QZoA2cv2rnoHt/preview"
    ],
    [
      "PRJ-0005",
      "Autonomous Multilingual Research & News Digest Agent",
      "AI_AGENT",
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&h=900&fit=crop",
      "Autonomous AI agent that crawls, synthesizes, and generates audio podcast digests from global technology publications every morning.",
      "Created an end-to-end pipeline that crawls selected RSS and research portals, evaluates paper significance, writes concise bullet summaries in Vietnamese and English, and produces synthetic speech audio digests.",
      "Python, LangGraph, FastAPI, Whisper, TTS",
      "https://example.com/demo",
      "https://github.com/danhphan/ai-newspaper-agent",
      "6",
      "FALSE",
      "https://drive.google.com/file/d/13I-S7gqkAeB8pA5M5yynI5tWdiKkX-Qw/preview"
    ],
    [
      "PRJ-0006",
      "Vocational Center Omnichannel Lead Routing & Consultation Workflow",
      "WORKFLOW_AUTOMATION",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&h=900&fit=crop",
      "Unified lead capture workflow connecting Facebook Ads, website landing pages, and Zalo OA directly to admissions counselors.",
      "Engineered a unified n8n automation pipeline that captures leads instantaneously from web forms, Facebook webhook events, and Zalo inquiries, deduplicating them and alerting the on-duty counselor on Telegram within 10 seconds.",
      "n8n, Zalo OA, Google Sheets, Telegram Bot API",
      "",
      "",
      "7",
      "FALSE",
      "https://drive.google.com/file/d/1Oco0H_f5ZQ96IsGto_FMqPHR_TGlhMjY/preview"
    ],
    [
      "PRJ-0007",
      "B2B Medical Device Distribution Lead Qualification Engine",
      "AI_AGENT",
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1600&h=900&fit=crop",
      "Intelligent qualification agent assessing clinic purchasing criteria, license verification, and equipment requirements for sales reps.",
      "Implemented an AI qualification system that ingests inquiry emails and RFQ forms, checks business registration databases, classifies purchasing urgency and facility capabilities, and generates a pre-qualification briefing sheet for account managers.",
      "Python, FastAPI, OpenAI, PostgreSQL, n8n",
      "",
      "",
      "8",
      "FALSE",
      "https://drive.google.com/file/d/1kqqEvPPnRhWpPpGfY8JvIYcIxaYf2PPe/preview"
    ],
    [
      "PRJ-0008",
      "Low-Latency Vietnamese Speech Recognition & Synthesis Pipeline",
      "AI_AGENT",
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1600&h=900&fit=crop",
      "Self-hosted speech inference cluster optimized for real-time Vietnamese transcription and expressive neural voice generation.",
      "Built an optimized on-premise inference pipeline utilizing Faster-Whisper with INT8 quantization for ASR and lightweight VITS models for Vietnamese speech synthesis, achieving sub-350ms streaming latency.",
      "Faster-Whisper, VITS, FastAPI, Docker, ONNX Runtime",
      "",
      "https://github.com/danhphan/low-latency-speech-pipeline",
      "9",
      "FALSE",
      ""
    ],
    [
      "PRJ-0009",
      "Interactive STEM Physics Simulation & Virtual Laboratory",
      "CUSTOM_MANAGEMENT_SYSTEM",
      "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=1600&h=900&fit=crop",
      "Web-based interactive physics experiments allowing high school students to visualize mechanics, electromagnetic fields, and wave phenomena.",
      "Created an interactive browser simulation platform where students manipulate physical constants (gravity, friction, magnetic flux) in real time with continuous parameter graphs and dynamic hints.",
      "Next.js, Canvas API, TypeScript, Tailwind CSS",
      "https://example.com/stem-demo",
      "https://github.com/danhphan/stem-simulation",
      "10",
      "FALSE",
      ""
    ],
    [
      "PRJ-0010",
      "Autonomous RC Vehicle with Edge Computer Vision & Telemetry",
      "AI_AGENT",
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1600&h=900&fit=crop",
      "Edge-computed autonomous 1/10th scale rover equipped with lane-following vision, obstacle avoidance, and real-time WebRTC video streaming.",
      "Built a modular autonomous rover platform featuring Raspberry Pi edge inference, lightweight CNN models for lane tracking, ultrasonic depth arrays for failsafe stopping, and low-latency WebRTC teleoperation.",
      "Raspberry Pi, OpenCV, PyTorch, WebRTC, MQTT",
      "",
      "https://github.com/danhphan/autonomous-rc-iot",
      "11",
      "FALSE",
      ""
    ]
  ];

  // Dọn các dòng dữ liệu cũ từ dòng 3 trở đi
  const lastRow = sheet.getLastRow();
  if (lastRow > 2) {
    sheet.getRange(3, 1, lastRow - 2, 12).clearContent();
  }

  // Ghi đúng 10 dự án vào từ dòng 3 (cột A đến L)
  sheet.getRange(3, 1, rows.length, 12).setValues(rows);

  // Tạo các folder trên Google Drive
  createProjectFolders();

  // Sao chép video vào các folder dự án và ghi link vào Cột Video
  copyVideosToProjectFolders();

  // Đồng bộ và tải ảnh vào từng folder dự án trên Drive và ghi link vào Cột Image
  syncImagesToDriveFolders();

  // Kích hoạt n8n đồng bộ dữ liệu lên website
  triggerPublishWebhook();
}

/**
 * Thiết lập và nạp đầy đủ cấu hình chuẩn cho tab SiteConfig trên Google Sheet
 */
function setupAndSeedSiteConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("SiteConfig");
  if (!sheet) {
    sheet = ss.insertSheet("SiteConfig");
  } else {
    sheet.clear();
  }

  // 1. Tiêu đề
  const headers = [["Key", "Value", "Description"]];
  sheet.getRange(1, 1, 1, 3).setValues(headers);

  // 2. Toàn bộ cấu hình chuẩn cho Website & Direct Contact
  const configRows = [
    ["contact_email", "danh@aihoc.ai.vn", "Email liên hệ chính thức hiển thị tại trang Contact & Footer"],
    ["zalo_url", "https://zalo.me/0900000000", "Link nhắn tin trực tiếp qua Zalo (ví dụ: https://zalo.me/09xxxxxxxx)"],
    ["linkedin_url", "https://www.linkedin.com/in/danhphan", "Link trang cá nhân LinkedIn ở Footer"],
    ["github_url", "https://github.com/danhphan", "Link tài khoản GitHub ở Footer"],
    ["cv_url", "", "Link Google Drive hoặc file PDF xem CV / Resume trực tuyến"],
    ["site_name", "Danh Phan", "Tên hiển thị thương hiệu ở Header và Footer"],
    ["headline", "AI Engineer & AI Automation Developer", "Tiêu đề chuyên môn ngắn gọn dưới tên"],
    ["value_proposition", "I design and deliver practical AI agents, intelligent document systems, and workflow automation for real business operations.", "Câu định vị giá trị ở trang chủ"],
    ["about_short", "AI Engineer and Automation Developer specializing in LLM applications, autonomous n8n workflows, Computer Vision/OCR, and tailored management systems.", "Mô tả ngắn gọn về bản thân"],
    ["about_long", "With a strong engineering background and hands-on experience delivering enterprise automation, I bridge the gap between cutting-edge AI models and everyday business operations.\\n\\nMy philosophy focuses on pragmatic engineering: choosing the simplest architecture that reliably solves the problem, putting human verification on high-risk AI decisions, ensuring data sovereignty, and providing comprehensive documentation and handover.", "Bài giới thiệu chi tiết tại trang About"],
    ["contact_cta", "Discuss a Project", "Nút kêu gọi hành động (Call To Action) trên thanh điều hướng"],
    ["timezone", "Asia/Seoul", "Múi giờ làm việc"],
    ["maintenance_mode", "FALSE", "Bật/Tắt chế độ bảo trì toàn bộ website (TRUE / FALSE)"]
  ];

  sheet.getRange(2, 1, configRows.length, 3).setValues(configRows);

  // Định dạng thẩm mỹ: Header in đậm, nền xám xanh nhạt
  sheet.getRange(1, 1, 1, 3)
    .setFontWeight("bold")
    .setBackground("#E8F0FE")
    .setFontColor("#1A73E8");

  sheet.setColumnWidth(1, 200); // Key
  sheet.setColumnWidth(2, 400); // Value
  sheet.setColumnWidth(3, 450); // Description

  SpreadsheetApp.getUi().alert("✅ Đã khởi tạo thành công tab SiteConfig với đầy đủ các trường cấu hình trực tiếp (Email, Zalo, LinkedIn, GitHub, Headline, Bio,...)!");
}
