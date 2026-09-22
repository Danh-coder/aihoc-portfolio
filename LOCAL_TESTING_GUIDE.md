# Hướng Dẫn Kiểm Thử Hệ Thống Local (Local Testing Guide)
**Dự án:** Danh Phan / AIHOC Portfolio Website & CMS  
**Cập nhật lần cuối:** 22/09/2026  

---

## 1. Tổng quan Kiến Trúc Kiểm Thử Local

Hệ thống cho phép bạn chạy và kiểm thử toàn bộ tính năng của trang web ngay trên máy local (`http://localhost:3000`) mà vẫn có thể tích hợp trực tiếp với các dịch vụ đám mây:

```
[ Trình duyệt Local ] 
         │ (Truy cập localhost:3000)
         ▼
[ Next.js Dev Server ] (Chạy tại máy local)
         │ (Gửi POST request có chữ ký HMAC SHA-256)
         ▼
[ n8n Automation Engine ] (https://n8n.aihoc.ai.vn)
   ├── Google Sheets (Thêm dòng vào tab "Leads")
   └── Gmail API (Gửi email thông báo tới zally.aihoc@gmail.com)
```

---

## 2. Hai Chế Độ Hoạt Động (`INQUIRY_MODE`)

Trong file [`.env.local`](.env.local), bạn có thể chuyển đổi linh hoạt giữa 2 chế độ:

| Chế độ | Giá trị cấu hình | Mô tả | Khi nào nên dùng? |
|---|---|---|---|
| **Mock Mode** | `INQUIRY_MODE=mock` | Giả lập việc nhận lead, trả về mã `LEAD-YYYYMMDD-XXXXXX` ngay lập tức mà không gọi n8n hay gửi mail. | Khi muốn tập trung phát triển UI/UX, chỉnh sửa CSS, kiểm tra bố cục nhanh. |
| **Live Mode** *(Hiện tại)* | `INQUIRY_MODE=live` | Next.js ký chữ ký bảo mật HMAC SHA-256 và gửi sang webhook n8n thật. Lưu Google Sheet và gửi Gmail. | Khi muốn kiểm tra luồng tích hợp thực tế (End-to-End). |

---

## 3. Khởi Động Dev Server

Nếu server chưa chạy, mở terminal tại thư mục `portfolio-website`:

```bash
# Cài đặt thư viện (nếu chưa có)
pnpm install

# Khởi chạy Next.js dev server
pnpm run dev
```

Mở trình duyệt truy cập: **[http://localhost:3000](http://localhost:3000)**

---

## 4. Các Kịch Bản Kiểm Thử Chi Tiết (Test Scenarios)

### Kịch bản 1: Kiểm thử giao diện và danh mục dự án (UI / UX)
1. Truy cập **Trang chủ** ([http://localhost:3000/](http://localhost:3000/)):
   - Kiểm tra headline, slogan thương hiệu AIHOC Lab.
   - Thử chuyển đổi giao diện Dark Mode / Light Mode (nút toggle ở Header).
2. Truy cập **Dự án** ([http://localhost:3000/projects](http://localhost:3000/projects)):
   - Thử bấm lọc theo loại dự án: *All, Enterprise, Personal, Research*.
   - Thử lọc theo mảng công nghệ: *AI & Automation, Fullstack, Cloud & DevOps*.
3. Bấm vào một case study chi tiết, ví dụ:
   - [Enterprise Agentic RAG Platform](http://localhost:3000/projects/agentic-rag-enterprise)
   - Kiểm tra các phần: Vấn đề (Problem), Giải pháp (Solution), Vai trò (Role), Kết quả định lượng (Results).
4. Truy cập trang **Dịch vụ** ([http://localhost:3000/services](http://localhost:3000/services)) và **Giới thiệu** ([http://localhost:3000/about](http://localhost:3000/about)).

---

### Kịch bản 2: Kiểm thử gửi yêu cầu liên hệ thật (Live End-to-End Test)
1. Đảm bảo file `.env.local` đang có `INQUIRY_MODE=live`.
2. Mở trình duyệt đến trang **Liên hệ**: [http://localhost:3000/contact](http://localhost:3000/contact).
3. Nhập dữ liệu thử nghiệm:
   - **Họ và tên:** `Nguyễn Văn A`
   - **Email:** `email-cua-ban@gmail.com`
   - **Tổ chức/Doanh nghiệp:** `AIHOC Client Test`
   - **Số điện thoại:** `0912345678`
   - **Dịch vụ quan tâm:** Chọn `Tư vấn chiến lược AI (AI Consulting)`
   - **Ngân sách dự kiến:** Chọn `10.000.000đ - 30.000.000đ`
   - **Nội dung yêu cầu:** `Tôi muốn kiểm tra hệ thống n8n ghi nhận lead và gửi email thông báo.`
   - **Tích chọn đồng ý chính sách bảo mật.**
4. Bấm nút **Gửi yêu cầu hợp tác**.
5. **Kiểm tra kết quả:**
   - **Giao diện:** Xuất hiện màn hình thông báo gửi thành công kèm mã số yêu cầu (Ví dụ: `LEAD-141646`).
   - **Google Sheets:** Mở file Google Sheets [CMS AIHOC Portfolio](https://docs.google.com/spreadsheets/d/1Oh6nSGPoPT54wAPrvurTxGHt7gSzD8KK3L5v5XHtuKo), bấm vào tab **`Leads`** -> Thấy dòng mới được thêm vào với đầy đủ thông tin.
   - **Gmail:** Hộp thư `zally.aihoc@gmail.com` nhận được email định dạng HTML đẹp mắt với tiêu đề:
     `🔔 [Portfolio] New Inquiry – ai-consulting from Nguyễn Văn A`.

---

### Kịch bản 3: Kiểm thử Form Validation & Chống Spam

1. **Thử bỏ trống hoặc nhập email sai định dạng:**
   - Nhập email: `abcxyz` (không có `@domain.com`) -> Bấm gửi.
   - Giao diện sẽ hiển thị cảnh báo lỗi màu đỏ tại ô email, không cho gửi request.
2. **Kiểm thử Rate Limiting:**
   - Hệ thống giới hạn tối đa 5 yêu cầu/giờ trên cùng 1 địa chỉ IP (`CONTACT_RATE_LIMIT_MAX=5`).
   - Nếu cố tình gửi liên tục quá 5 lần, API sẽ trả về lỗi HTTP 429: *"Too many inquiries submitted from this address."*
3. **Kiểm thử Honeypot chống Bot:**
   - Trang web có sẵn một trường ẩn `website` (chỉ bot quét HTML mới điền).
   - Nếu trường này có dữ liệu, hệ thống tự động ghi nhận là spam, bỏ qua bước gửi mail và ghi nhận mã `LEAD-SPAM-...` nhằm tiết kiệm tài nguyên.

---

### Kịch bản 4: Quy trình Xuất bản & Đồng bộ nội dung từ Google Sheets (Publish & Sync)

Hệ thống AIHOC Portfolio được thiết kế theo kiến trúc **Headless CMS - Static Snapshot**:
- **Trình duyệt / Next.js:** Đọc dữ liệu từ file tĩnh JSON trong `src/content/generated/` (tốc độ tải trang siêu nhanh, tránh rate-limit Google Sheets API, an toàn tuyệt đối).
- **Google Sheets & n8n:** Là nơi biên tập và đóng gói nội dung thành một "bản snapshot".
- **Đồng bộ về local:** Khi có bài viết/dự án/dịch vụ mới, bạn chỉ cần chạy lệnh đồng bộ:

```bash
# Kéo snapshot mới nhất từ Google Sheets (thông qua n8n) về máy local:
pnpm run sync:content
```

**Quy trình 3 bước thực hiện:**
1. Mở file [CMS AIHOC Portfolio Google Sheet](https://docs.google.com/spreadsheets/d/1Oh6nSGPoPT54wAPrvurTxGHt7gSzD8KK3L5v5XHtuKo):
   - Thêm dòng dự án mới vào tab **`Projects`** (hoặc cập nhật tab **`Services`**).
2. Chạy lệnh đồng bộ:
   ```bash
   pnpm run sync:content
   ```
   Lệnh này sẽ tự động kích hoạt workflow `portfolio_publish_content` trên n8n, chuẩn hóa dữ liệu, ghi nhật ký xuất bản vào tab `PublishLog`, và lưu file snapshot vào `src/content/generated/`.
3. Mở lại trình duyệt [http://localhost:3000](http://localhost:3000) và nhấn F5:
   - Dự án mới và dịch vụ mới sẽ lập tức xuất hiện trên giao diện web!

---

### Kịch bản 5: Kiểm tra Endpoint Giám sát (Health Check)
Truy cập trực tiếp bằng trình duyệt hoặc terminal:
- URL: **[http://localhost:3000/api/health](http://localhost:3000/api/health)**
- Kết quả trả về định dạng JSON:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-09-22T...",
    "version": "1.0.0",
    "environment": "development",
    "content": {
      "snapshotVersion": "2026-09-22T08:00:00Z_init0001",
      "projectCount": 10,
      "serviceCount": 6,
      "contentSha256": "4b82512f..."
    }
  }
  ```

---

## 5. Lệnh CLI Test Nhanh (Dành Cho Developer)

Bạn có thể chạy thử nghiệm nhanh từ PowerShell/Terminal bằng Node.js:

```bash
# Test gửi 1 Lead qua API
node -e "
const http = require('http');
const payload = JSON.stringify({
  fullName: 'Tester CLI',
  email: 'tester@example.com',
  serviceKey: 'ai-consulting',
  requirement: 'Kiem tra he thong tu dong',
  timeline: '1_3_MONTHS',
  budgetRange: '10M_30M',
  consent: true
});
const req = http.request('http://localhost:3000/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, res => {
  let d = ''; res.on('data', c => d += c);
  res.on('end', () => console.log('Ket qua:', res.statusCode, d));
});
req.write(payload);
req.end();
"
```

---

## 6. Khắc Phục Lỗi Thường Gặp (Troubleshooting)

* **Lỗi `502 INQUIRY_UNAVAILABLE`:**
  * Kiểm tra workflow `portfolio_receive_inquiry` trên n8n có đang ở trạng thái **Active** (màu xanh) hay không.
  * Nếu n8n báo webhook chưa được đăng ký, chỉ cần gạt nút toggle Tắt -> Bật lại workflow trên n8n.
* **Lỗi `400 VALIDATION_FAILED`:**
  * Kiểm tra xem các trường form gửi lên có khớp schema Zod không (ví dụ: `budgetRange` phải thuộc: `NOT_SURE`, `UNDER_10M`, `10M_30M`, `30M_100M`, `OVER_100M`).
* **Lỗi `429 RATE_LIMIT_EXCEEDED`:**
  * Bạn đã gửi quá 5 lần trong 1 giờ từ cùng một IP. Khởi động lại dev server để làm mới bộ nhớ rate limiter:
    ```bash
    pnpm run dev
    ```
