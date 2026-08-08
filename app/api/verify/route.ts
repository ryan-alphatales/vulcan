import { NextResponse } from "next/server";
import { z } from "zod";

import { AccountError } from "@/server/accounts/service";
import { accountService } from "@/server/auth/options";
import { startAccountSession } from "@/server/auth/session-token";

const inputSchema = z.object({ token: z.string().min(1).max(512) });

export async function POST(request: Request) {
  try {
    const { token } = inputSchema.parse(await request.json());
    const account = await accountService.verifyAndActivate(token);
    const response = NextResponse.json({ message: "Your email is verified. Welcome to Vulcan." });
    await startAccountSession(response, account);
    return response;
  } catch (error) {
    const message = error instanceof AccountError && error.code === "invalid_verification"
      ? error.message
      : "This verification link could not be used.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
