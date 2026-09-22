import { NextRequest, NextResponse } from "next/server";
import { InquirySchema } from "@/lib/validation/inquiry.schema";
import { generateHmacSignature } from "@/lib/security/hmac";
import { randomUUID } from "crypto";

// In-memory sliding window rate limiter
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

function checkRateLimit(ip: string): boolean {
  const maxRequests = parseInt(process.env.CONTACT_RATE_LIMIT_MAX || "5", 10);
  const windowMs = parseInt(process.env.CONTACT_RATE_LIMIT_WINDOW_SECONDS || "3600", 10) * 1000;
  const now = Date.now();

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  const correlationId = randomUUID();
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  // 1. Rate Limit check
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      {
        ok: false,
        code: "RATE_LIMIT_EXCEEDED",
        correlationId,
        message: "Too many inquiries submitted from this address. Please wait an hour before submitting again.",
      },
      { status: 429 }
    );
  }

  try {
    const rawBody = await req.text();

    // Check size limit: max 32 KB
    if (Buffer.byteLength(rawBody, "utf8") > 32 * 1024) {
      return NextResponse.json(
        {
          ok: false,
          code: "PAYLOAD_TOO_LARGE",
          correlationId,
          message: "The request body exceeds maximum allowed size (32KB).",
        },
        { status: 413 }
      );
    }

    const json = JSON.parse(rawBody);

    // 2. Honeypot check: If bot filled 'website', absorb silently
    if (json.website && json.website.trim().length > 0) {
      return NextResponse.json({
        ok: true,
        leadId: `LEAD-SPAM-${Date.now().toString().slice(-6)}`,
        correlationId,
        message: "Your request has been received.",
      });
    }

    // 3. Server-side Zod validation
    const parsed = InquirySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          code: "VALIDATION_FAILED",
          correlationId,
          errors: parsed.error.flatten(),
          message: "Please review the form fields and correct validation errors.",
        },
        { status: 400 }
      );
    }

    const payload = parsed.data;

    // 4. n8n Integration or Mock Mode
    const inquiryMode = process.env.INQUIRY_MODE || "mock";
    const webhookUrl = process.env.N8N_INQUIRY_WEBHOOK_URL;
    const hmacSecret = process.env.N8N_INQUIRY_HMAC_SECRET;
    const timeoutMs = parseInt(process.env.N8N_REQUEST_TIMEOUT_MS || "10000", 10);

    if (inquiryMode === "mock" || !webhookUrl || !hmacSecret) {
      // Mock mode returns valid deterministic lead format: LEAD-YYYYMMDD-XXXXXX
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const mockLeadId = `LEAD-${dateStr}-${randomSuffix}`;

      return NextResponse.json({
        ok: true,
        leadId: mockLeadId,
        correlationId,
        message: "Your request has been received.",
      });
    }

    // Forward signed request to n8n webhook
    const timestamp = Math.floor(Date.now() / 1000);
    const serializedPayload = JSON.stringify(payload);
    const { signature } = generateHmacSignature(serializedPayload, hmacSecret, timestamp);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const n8nResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Portfolio-Timestamp": String(timestamp),
          "X-Portfolio-Signature": signature,
          "X-Correlation-ID": correlationId,
        },
        body: serializedPayload,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (n8nResponse.ok) {
        const n8nData = await n8nResponse.json().catch(() => ({}));
        return NextResponse.json({
          ok: true,
          leadId: n8nData.leadId || `LEAD-${Date.now().toString().slice(-6)}`,
          correlationId,
          message: "Your request has been received.",
        });
      } else {
        console.error(`[InquiryAPI] n8n returned status ${n8nResponse.status}`);
        return NextResponse.json(
          {
            ok: false,
            code: "INQUIRY_UNAVAILABLE",
            correlationId,
            message: "Our inquiry notification service is temporarily busy. Please try submitting again in a moment.",
          },
          { status: 502 }
        );
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("[InquiryAPI] Failed to contact n8n webhook:", err?.message);
      return NextResponse.json(
        {
          ok: false,
          code: "INQUIRY_UNAVAILABLE",
          correlationId,
          message: "Could not reach the processing server. Please try submitting again in a moment.",
        },
        { status: 503 }
      );
    }
  } catch (err) {
    console.error("[InquiryAPI] Unhandled error:", err);
    return NextResponse.json(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        correlationId,
        message: "An internal server error occurred while processing your inquiry.",
      },
      { status: 500 }
    );
  }
}
