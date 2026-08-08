import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { gitProviderSchema, type GitProvider } from "@/lib/contracts";

type OAuthState = { accountId: string; provider: GitProvider; issuedAt: number; nonce: string };

const stateLifetimeMs = 10 * 60 * 1000;

function secret() {
  const value = process.env.NEXTAUTH_SECRET;
  if (!value) throw new Error("NEXTAUTH_SECRET must be configured before OAuth authorization.");
  return value;
}
function sign(encoded: string) { return createHmac("sha256", secret()).update(encoded).digest("base64url"); }

export function createOAuthState(accountId: string, provider: GitProvider, now = Date.now()): string {
  const body = Buffer.from(JSON.stringify({ accountId, provider, issuedAt: now, nonce: randomBytes(16).toString("base64url") } satisfies OAuthState)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyOAuthState(value: string, now = Date.now()): OAuthState | null {
  const [encoded, suppliedSignature] = value.split(".");
  if (!encoded || !suppliedSignature) return null;
  const expectedSignature = sign(encoded);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  try {
    const raw: unknown = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    const parsed = (raw as { accountId?: unknown; provider?: unknown; issuedAt?: unknown; nonce?: unknown });
    if (typeof parsed.accountId !== "string" || typeof parsed.issuedAt !== "number" || typeof parsed.nonce !== "string") return null;
    const provider = gitProviderSchema.safeParse(parsed.provider);
    if (!provider.success || now - parsed.issuedAt > stateLifetimeMs || parsed.issuedAt > now + 30_000) return null;
    return { accountId: parsed.accountId, provider: provider.data, issuedAt: parsed.issuedAt, nonce: parsed.nonce };
  } catch { return null; }
}
