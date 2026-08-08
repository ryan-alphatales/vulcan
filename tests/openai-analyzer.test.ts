import { describe, expect, it } from "vitest";

import { scanConfidenceThreshold } from "../server/scans/settings";

describe("scan settings", () => {
  it("requires an explicit confidence threshold rather than silently choosing one", () => {
    const original = process.env.SCAN_CONFIDENCE_THRESHOLD;
    delete process.env.SCAN_CONFIDENCE_THRESHOLD;
    expect(scanConfidenceThreshold).toThrow("SCAN_CONFIDENCE_THRESHOLD");
    process.env.SCAN_CONFIDENCE_THRESHOLD = "80";
    expect(scanConfidenceThreshold()).toBe(80);
    if (original === undefined) delete process.env.SCAN_CONFIDENCE_THRESHOLD; else process.env.SCAN_CONFIDENCE_THRESHOLD = original;
  });
});
