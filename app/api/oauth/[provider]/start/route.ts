import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { gitProviderSchema } from "@/lib/contracts";
import { authOptions } from "@/server/auth/options";
import { createAuthorizationUrl } from "@/server/integrations/oauth";
import { createOAuthState } from "@/server/integrations/oauth-state";

export async function GET(_request: Request, context: { params: Promise<{ provider: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.redirect(new URL("/login", process.env.APP_URL));
  const provider = gitProviderSchema.safeParse((await context.params).provider);
  if (!provider.success) return NextResponse.json({ message: "Unsupported provider." }, { status: 404 });
  return NextResponse.redirect(createAuthorizationUrl(provider.data, createOAuthState(session.user.id, provider.data)));
}
