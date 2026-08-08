import { encode } from "next-auth/jwt";
import { NextResponse } from "next/server";

import type { AccountRecord } from "@/server/accounts/service";

const sessionMaxAgeSeconds = 30 * 24 * 60 * 60;

function authSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET must be configured before a session can be created.");
  return secret;
}

export async function startAccountSession(response: NextResponse, account: AccountRecord): Promise<void> {
  const secure = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
  const token = await encode({
    secret: authSecret(),
    maxAge: sessionMaxAgeSeconds,
    token: { sub: account.id, email: account.email, name: account.displayName ?? account.email },
  });
  response.cookies.set({
    name: secure ? "__Secure-next-auth.session-token" : "next-auth.session-token",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: sessionMaxAgeSeconds,
  });
}
