import { GitProvider } from "@prisma/client";

import type { GitProvider as Provider } from "@/lib/contracts";
import { encryptToken } from "@/server/integrations/token-crypto";
import { getPrisma } from "@/server/persistence/prisma";

const providers: Record<Provider, GitProvider> = { github: "GITHUB", gitlab: "GITLAB" };

export async function storeProviderCredential(input: { accountId: string; provider: Provider; providerAccountId: string; token: string; scopes: string[]; expiresAt?: Date }) {
  return getPrisma().providerAccount.upsert({
    where: { accountId_provider_providerAccountId: { accountId: input.accountId, provider: providers[input.provider], providerAccountId: input.providerAccountId } },
    create: { accountId: input.accountId, provider: providers[input.provider], providerAccountId: input.providerAccountId, accessTokenEncrypted: encryptToken(input.token), scopes: input.scopes, expiresAt: input.expiresAt },
    update: { accessTokenEncrypted: encryptToken(input.token), scopes: input.scopes, expiresAt: input.expiresAt },
  });
}
