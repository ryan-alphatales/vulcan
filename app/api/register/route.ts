import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AccountError } from "@/server/accounts/service";
import { accountService } from "@/server/auth/options";

export async function POST(request: Request) {
  let account: Awaited<ReturnType<typeof accountService.register>> | undefined;
  try {
    const input: unknown = await request.json();
    account = await accountService.register(input);
    await accountService.issueVerification(account);
    return NextResponse.json({ message: "Check your inbox for a verification link." }, { status: 201 });
  } catch (error) {
    if (account) await accountService.discardUnverified(account.id);
    if (error instanceof AccountError && error.code === "duplicate_email") {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ message: "Enter a valid email and a password of at least 12 characters." }, { status: 400 });
    }
    return NextResponse.json({ message: "We could not create your account. Please try again." }, { status: 503 });
  }
}
