import { NextResponse } from "next/server";
import { z } from "zod";

import { accountService } from "@/server/auth/options";

const inputSchema = z.object({ email: z.string().trim().email().max(320) });

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
  try {
    await accountService.resendVerification(parsed.data.email);
  } catch (error) {
    // Preserve a non-enumerating response while retaining safe operational evidence.
    console.error("Vulcan verification resend failed", { name: error instanceof Error ? error.name : "UnknownError" });
  }
  return NextResponse.json({ message: "If an unverified account exists for this email, a new verification link is on its way." });
}
