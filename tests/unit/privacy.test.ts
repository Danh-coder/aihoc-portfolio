import { describe, it, expect } from "vitest";
import { applyPrivacyTransform } from "@/lib/content/privacy";

describe("Privacy Transformation", () => {
  it("strips client name when visibility is PRIVATE", () => {
    const result = applyPrivacyTransform("PRIVATE", "Confidential Corp");
    expect(result).toBeNull();
  });

  it("strips client name when visibility is ANONYMIZED", () => {
    const result = applyPrivacyTransform("ANONYMIZED", "Confidential Corp");
    expect(result).toBeNull();
  });

  it("retains client name only when visibility is explicitly PUBLIC", () => {
    const result = applyPrivacyTransform("PUBLIC", "Acme Corporation");
    expect(result).toEqual({ name: "Acme Corporation" });
  });

  it("handles undefined or empty client name gracefully", () => {
    const result = applyPrivacyTransform("PUBLIC", "   ");
    expect(result).toBeNull();
  });
});
