import { NextResponse } from "next/server";
import { syncContentFromN8N } from "@/lib/content/sync";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleSync(request);
}

export async function POST(request: Request) {
  return handleSync(request);
}

async function handleSync(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const expectedSecret = process.env.SYNC_SECRET || process.env.INQUIRY_HMAC_SECRET;

  // In production, require secret token; in development, allow easy access
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev && expectedSecret && secret !== expectedSecret) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing sync secret." },
      { status: 401 }
    );
  }

  try {
    const result = await syncContentFromN8N();
    return NextResponse.json(
      {
        message: "Content synchronized successfully from Google Sheets via n8n.",
        ...result,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[API /api/sync] Sync error:", err);
    return NextResponse.json(
      {
        error: "Failed to synchronize content.",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
