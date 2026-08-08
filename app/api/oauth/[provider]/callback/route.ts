import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { gitProviderSchema } from "@/lib/contracts";
import { authOptions } from "@/server/auth/options";
import { exchangeOAuthCode } from "@/server/integrations/oauth";
import { verifyOAuthState } from "@/server/integrations/oauth-state";
import { storeProviderCredential } from "@/server/integrations/provider-account-store";
import { getServerEnvironment } from "@/server/config";

export async function GET(request: Request, context: { params: Promise<{ provider: string }> }) {
  const url = new URL(request.url); const provider = gitProviderSchema.safeParse((await context.params).provider); const state = url.searchParams.get("state"); const code = url.searchParams.get("code");
  const environment = getServerEnvironment();
  const appUrl = environment.APP_URL ?? environment.NEXTAUTH_URL;
  const session = await getServerSession(authOptions);
  if (!provider.success || !state || !code || url.searchParams.has("error")) return NextResponse.redirect(new URL("/connect?error=authorization", appUrl));
  const verifiedState = verifyOAuthState(state);
  if (!verifiedState || verifiedState.provider !== provider.data || session?.user?.id !== verifiedState.accountId) return NextResponse.redirect(new URL("/login?error=authorization", appUrl));
  try {
    const credential = await exchangeOAuthCode(provider.data, code);
    await storeProviderCredential({ accountId: verifiedState.accountId, provider: provider.data, ...credential });
    return NextResponse.redirect(new URL(`/connect/repositories?provider=${provider.data}`, appUrl));
  } catch { return NextResponse.redirect(new URL("/connect?error=authorization", appUrl)); }
}
