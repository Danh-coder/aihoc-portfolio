/**
 * AIHOC CMS - Tự động tạo Folder Drive & Trigger Publish Website
 * Khớp chuẩn xác 100% với 11 cột thực tế của Sheet Projects:
 * [ID, Title, Category, Image, Description, Details, TechStack, LiveUrl, GithubUrl, Order, Featured]
 */

const PROJECTS_PARENT_FOLDER_ID = "14tInMIEw8POFBHObxT0HzsU9C6V5mxKM";
const N8N_PUBLISH_WEBHOOK_URL = "https://n8n.aihoc.ai.vn/webhook/portfolio/publish";

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🚀 AIHOC CMS")
    .addItem("📁 1. Tự động tạo Folder Drive cho các dự án", "createProjectFolders")
    .addItem("🌐 2. Xuất bản nội dung lên Website", "triggerPublishWebhook")
    .addSeparator()
    .addItem("✨ 3. Dọn sạch và nạp 10 dự án chuẩn (Khớp 11 cột)", "cleanAndSeed10Projects")
    .addToUi();
}

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

  SpreadsheetApp.getUi().alert("Đã kiểm tra xong! Tạo mới " + createdCount + " thư mục dự án trên Drive.");
}

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

  try {
    const response = UrlFetchApp.fetch(N8N_PUBLISH_WEBHOOK_URL, options);
    SpreadsheetApp.getUi().alert("✅ Đã kích hoạt xuất bản thành công! Website đang được n8n đồng bộ và cập nhật.");
  } catch (err) {
    SpreadsheetApp.getUi().alert("❌ Lỗi kích hoạt Webhook: " + err.message);
  }
}

function cleanAndSeed10Projects() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Projects");
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Không tìm thấy tab Projects!");
    return;
  }

  // 10 dự án chuẩn khớp 11 cột (từ cột A đến K)
  const rows = [["PRJ-0001","Agricultural Land & Crop Production Management System","CUSTOM_MANAGEMENT_SYSTEM","/media/generated/PRJ-0001/cover.webp","Integrated web platform replacing fragmented spreadsheets with real-time plot mapping, crop cycle tracking, and automated harvest reporting.","Designed and deployed a responsive management portal allowing field supervisors to log plot conditions, soil metrics, and treatments via mobile-friendly forms, while management receives real-time production analytics and automated weekly export summaries.","Next.js, FastAPI, PostgreSQL, n8n, Docker","","","2","TRUE"],["PRJ-0002","Automated HR Employment Document Processing Pipeline","DOCUMENT_AI_OCR","/media/generated/PRJ-0002/cover.webp","AI-assisted intake pipeline that extracts, validates, and archives candidate employment records and contracts with 98% accuracy.","Engineered an intelligent document intake pipeline with automated OCR preprocessing, LLM schema extraction, and human-in-the-loop review for low-confidence fields.","Python, PaddleOCR, LangChain, n8n, Google Workspace","","","3","TRUE"],["PRJ-0003","PAB University Academic Portal & Grade Audit Automation","WORKFLOW_AUTOMATION","/media/generated/PRJ-0003/cover.webp","Headless browser automation and verification engine synchronizing academic transcripts and cross-faculty grade submissions.","Developed an audited, idempotent RPA automation script running in isolated headless containers that extracts transcripts, reconciles discrepancies against faculty submission sheets, and generates audit reports.","Python, Playwright, n8n, PostgreSQL, FastAPI","","","4","TRUE"],["PRJ-0004","Zalo Medical Consultation & Appointment Booking Bot","ZALO_CUSTOMER_SERVICE","/media/generated/PRJ-0004/cover.webp","24/7 intelligent patient assistance bot on Zalo OA triaging clinic inquiries, scheduling doctor appointments, and sending appointment reminders.","Built an intelligent Zalo Official Account chatbot with natural language understanding to answer common treatment FAQs, verify doctor availability in real-time, and confirm bookings directly into clinic schedules.","Zalo OA API, n8n, OpenAI GPT-4o-mini, Google Calendar","","","5","FALSE"],["PRJ-0005","Autonomous Multilingual Research & News Digest Agent","AI_AGENT","/media/generated/PRJ-0005/cover.webp","Autonomous AI agent that crawls, synthesizes, and generates audio podcast digests from global technology publications every morning.","Created an end-to-end pipeline that crawls selected RSS and research portals, evaluates paper significance, writes concise bullet summaries in Vietnamese and English, and produces synthetic speech audio digests.","Python, LangGraph, FastAPI, Whisper, TTS","https://example.com/demo","https://github.com/danhphan/ai-newspaper-agent","6","FALSE"],["PRJ-0006","Vocational Center Omnichannel Lead Routing & Consultation Workflow","WORKFLOW_AUTOMATION","/media/generated/PRJ-0006/cover.webp","Unified lead capture workflow connecting Facebook Ads, website landing pages, and Zalo OA directly to admissions counselors.","Engineered a unified n8n automation pipeline that captures leads instantaneously from web forms, Facebook webhook events, and Zalo inquiries, deduplicating them and alerting the on-duty counselor on Telegram within 10 seconds.","n8n, Zalo OA, Google Sheets, Telegram Bot API","","","7","FALSE"],["PRJ-0007","B2B Medical Device Distribution Lead Qualification Engine","AI_AGENT","/media/generated/PRJ-0007/cover.webp","Intelligent qualification agent assessing clinic purchasing criteria, license verification, and equipment requirements for sales reps.","Implemented an AI qualification system that ingests inquiry emails and RFQ forms, checks business registration databases, classifies purchasing urgency and facility capabilities, and generates a pre-qualification briefing sheet for account managers.","Python, FastAPI, OpenAI, PostgreSQL, n8n","","","8","FALSE"],["PRJ-0008","Low-Latency Vietnamese Speech Recognition & Synthesis Pipeline","AI_AGENT","/media/generated/PRJ-0008/cover.webp","Self-hosted speech inference cluster optimized for real-time Vietnamese transcription and expressive neural voice generation.","Built an optimized on-premise inference pipeline utilizing Faster-Whisper with INT8 quantization for ASR and lightweight VITS models for Vietnamese speech synthesis, achieving sub-350ms streaming latency.","Faster-Whisper, VITS, FastAPI, Docker, ONNX Runtime","","https://github.com/danhphan/low-latency-speech-pipeline","9","FALSE"],["PRJ-0009","Interactive STEM Physics Simulation & Virtual Laboratory","CUSTOM_MANAGEMENT_SYSTEM","/media/generated/PRJ-0009/cover.webp","Web-based interactive physics experiments allowing high school students to visualize mechanics, electromagnetic fields, and wave phenomena.","Created an interactive browser simulation platform where students manipulate physical constants (gravity, friction, magnetic flux) in real time with continuous parameter graphs and dynamic hints.","Next.js, Canvas API, TypeScript, Tailwind CSS","https://example.com/stem-demo","https://github.com/danhphan/stem-simulation","10","FALSE"],["PRJ-0010","Autonomous RC Vehicle with Edge Computer Vision & Telemetry","AI_AGENT","/media/generated/PRJ-0010/cover.webp","Edge-computed autonomous 1/10th scale rover equipped with lane-following vision, obstacle avoidance, and real-time WebRTC video streaming.","Built a modular autonomous rover platform featuring Raspberry Pi edge inference, lightweight CNN models for lane tracking, ultrasonic depth arrays for failsafe stopping, and low-latency WebRTC teleoperation.","Raspberry Pi, OpenCV, PyTorch, WebRTC, MQTT","","https://github.com/danhphan/autonomous-rc-iot","11","FALSE"]];

  // Dọn các dòng dữ liệu cũ từ dòng 3 trở đi
  const lastRow = sheet.getLastRow();
  if (lastRow > 2) {
    sheet.getRange(3, 1, lastRow - 2, 11).clearContent();
  }

  // Ghi đúng 10 dự án vào từ dòng 3 (cột A đến K)
  sheet.getRange(3, 1, rows.length, 11).setValues(rows);

  // Tạo các folder trên Google Drive
  createProjectFolders();

  // Kích hoạt n8n đồng bộ dữ liệu lên website
  triggerPublishWebhook();
}
