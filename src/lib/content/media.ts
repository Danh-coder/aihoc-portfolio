/**
 * Media Resolver Utility
 * Chuyển đổi linh hoạt mọi định dạng URL hình ảnh/video từ Google Drive, CDN bên ngoài hoặc local assets.
 */

export function resolveMediaUrl(src?: string | null): string {
  if (!src) return "";

  // 1. Google Drive view link: https://drive.google.com/file/d/{FILE_ID}/view...
  const driveFileMatch = src.match(/\/file\/d\/([a-zA-Z0-9_\-]+)/);
  if (driveFileMatch) {
    return `https://drive.google.com/thumbnail?id=${driveFileMatch[1]}&sz=w1600`;
  }

  // 2. Google Drive open/uc link: https://drive.google.com/open?id={FILE_ID} hoặc ?id={FILE_ID}
  const driveIdMatch = src.match(/[?&]id=([a-zA-Z0-9_\-]+)/);
  if (driveIdMatch) {
    return `https://drive.google.com/thumbnail?id=${driveIdMatch[1]}&sz=w1600`;
  }

  // 3. Raw Drive ID (chuỗi 28-44 ký tự chữ số và dấu gạch)
  if (/^[a-zA-Z0-9_\-]{28,44}$/.test(src.trim())) {
    return `https://drive.google.com/thumbnail?id=${src.trim()}&sz=w1600`;
  }

  // 4. URL thông thường (Unsplash, Cloudinary, AWS S3) hoặc local path (/media/...)
  return src;
}

export function resolveVideoUrl(url?: string | null): string | null {
  if (!url) return null;

  // Nếu là Google Drive link, chuyển sang /preview để nhúng iframe trực tiếp
  const driveFileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_\-]+)/);
  if (driveFileMatch) {
    return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
  }

  const driveIdMatch = url.match(/[?&]id=([a-zA-Z0-9_\-]+)/);
  if (driveIdMatch) {
    return `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`;
  }

  return url;
}
