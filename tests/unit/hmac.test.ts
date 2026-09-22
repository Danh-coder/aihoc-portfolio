import { describe, it, expect } from "vitest";
import { generateHmacSignature, verifyHmacSignature } from "@/lib/security/hmac";

describe("HMAC Security Module", () => {
  const secret = "test-secret-key-at-least-32-characters-long";
  const body = JSON.stringify({ message: "Hello world" });

  it("generates a valid signature and verifies correctly", () => {
    const { signature, timestamp } = generateHmacSignature(body, secret);
    const verification = verifyHmacSignature(body, secret, timestamp, signature);

    expect(verification.valid).toBe(true);
  });

  it("fails verification if body is altered", () => {
    const { signature, timestamp } = generateHmacSignature(body, secret);
    const tamperedBody = JSON.stringify({ message: "Tampered content" });
    const verification = verifyHmacSignature(tamperedBody, secret, timestamp, signature);

    expect(verification.valid).toBe(false);
    expect(verification.reason).toBe("INVALID_SIGNATURE");
  });

  it("fails verification if timestamp drift exceeds 300 seconds", () => {
    const oldTimestamp = Math.floor(Date.now() / 1000) - 400; // 400s ago
    const { signature } = generateHmacSignature(body, secret, oldTimestamp);
    const verification = verifyHmacSignature(body, secret, oldTimestamp, signature, 300);

    expect(verification.valid).toBe(false);
    expect(verification.reason).toBe("TIMESTAMP_DRIFT_EXCEEDED");
  });
});
