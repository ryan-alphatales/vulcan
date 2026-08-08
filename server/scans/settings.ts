import { z } from "zod";

const thresholdSchema = z.coerce.number().int().min(0).max(100);

export function scanConfidenceThreshold(): number {
  const value = thresholdSchema.safeParse(process.env.SCAN_CONFIDENCE_THRESHOLD);
  if (!value.success) throw new Error("SCAN_CONFIDENCE_THRESHOLD must be configured as an integer from 0 to 100.");
  return value.data;
}

export function deepSeekModel(): string {
  const value = z.string().trim().min(1).safeParse(process.env.DEEPSEEK_MODEL);
  if (!value.success) throw new Error("DEEPSEEK_MODEL must be configured before scans can run.");
  return value.data;
}
