import crypto from "crypto";

/**
 * Generate HMAC-SHA256 signature for website-to-n8n communication
 * Payload format: `${timestamp}.${rawBody}`
 */
export function generateHmacSignature(
  rawBody: string,
  secret: string,
  timestamp: number = Math.floor(Date.now() / 1000)
): { signature: string; timestamp: number } {
  const payload = `${timestamp}.${rawBody}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
    .toLowerCase();
  return { signature, timestamp };
}

/**
 * Verify HMAC-SHA256 signature in constant time
 */
export function verifyHmacSignature(
  rawBody: string,
  secret: string,
  timestamp: number,
  providedSignature: string,
  maxDriftSeconds: number = 300 // 5 minutes
): { valid: boolean; reason?: string } {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTimestamp - timestamp) > maxDriftSeconds) {
    return { valid: false, reason: "TIMESTAMP_DRIFT_EXCEEDED" };
  }

  const payload = `${timestamp}.${rawBody}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
    .toLowerCase();

  const providedBuffer = Buffer.from(providedSignature.toLowerCase(), "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (providedBuffer.length !== expectedBuffer.length) {
    return { valid: false, reason: "SIGNATURE_LENGTH_MISMATCH" };
  }

  const valid = crypto.timingSafeEqual(providedBuffer, expectedBuffer);
  return { valid, reason: valid ? undefined : "INVALID_SIGNATURE" };
}
