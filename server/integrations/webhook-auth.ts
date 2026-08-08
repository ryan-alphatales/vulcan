import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyGitHubSignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature?.startsWith("sha256=")) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;
  const received = Buffer.from(signature);
  const calculated = Buffer.from(expected);
  return received.length === calculated.length && timingSafeEqual(received, calculated);
}

export function verifyGitLabToken(token: string | null, secret: string): boolean {
  if (!token) return false;
  const received = Buffer.from(token);
  const expected = Buffer.from(secret);
  return received.length === expected.length && timingSafeEqual(received, expected);
}
