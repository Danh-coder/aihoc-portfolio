import { NextResponse } from "next/server";
import { getManifest } from "@/lib/content/loader";

export const dynamic = "force-dynamic";

export async function GET() {
  const manifest = getManifest();

  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      content: {
        snapshotVersion: manifest?.snapshotVersion || "local-seed",
        projectCount: manifest?.projectCount || 0,
        serviceCount: manifest?.serviceCount || 0,
        contentSha256: manifest?.contentSha256 ? manifest.contentSha256.substring(0, 8) + "..." : null,
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
