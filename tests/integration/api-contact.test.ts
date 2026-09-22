import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/contact/route";
import { NextRequest } from "next/server";

describe("Contact API Route Integration", () => {
  it("returns 400 when required fields are missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      body: JSON.stringify({
        fullName: "Test User",
        // missing email, serviceKey, requirement, consent
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.code).toBe("VALIDATION_FAILED");
  });

  it("handles valid submission in mock mode gracefully", async () => {
    const req = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      body: JSON.stringify({
        fullName: "Phan Cong Danh",
        email: "client@example.com",
        serviceKey: "AI_AGENT",
        requirement: "Detailed project requirements description exceeding thirty characters for testing.",
        timeline: "1_3_MONTHS",
        preferredChannel: "EMAIL",
        consent: true,
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.leadId).toMatch(/^LEAD-\d{8}-[A-Z0-9]{6}$/);
  });

  it("silently absorbs honeypot bot submissions without creating real leads", async () => {
    const req = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      body: JSON.stringify({
        fullName: "Spam Bot",
        email: "spambot@example.com",
        serviceKey: "AI_AGENT",
        requirement: "Spam requirement description exceeding thirty characters.",
        consent: true,
        website: "http://spam-link.com", // honeypot triggered
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.leadId).toContain("SPAM");
  });
});
