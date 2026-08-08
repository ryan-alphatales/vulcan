import { ConnectionStatus, GitProvider } from "@prisma/client";

import type { GitProvider as Provider } from "@/lib/contracts";
import { decryptToken } from "@/server/integrations/token-crypto";
import { findProviderWebhook, installProviderWebhook, listAccessibleRepositories, removeProviderWebhook } from "@/server/integrations/repositories";
import { getPrisma } from "@/server/persistence/prisma";

const providers: Record<Provider, GitProvider> = { github: "GITHUB", gitlab: "GITLAB" };

async function credential(accountId: string, provider: Provider) {
  const record = await getPrisma().providerAccount.findFirst({ where: { accountId, provider: providers[provider] }, orderBy: { updatedAt: "desc" } });
  if (!record) throw new Error("Connect this provider before selecting a repository.");
  return record;
}

export class RepositoryConnectionService {
  async list(accountId: string, provider: Provider) {
    const connection = await credential(accountId, provider);
    const [repositories, connected] = await Promise.all([
      listAccessibleRepositories(provider, decryptToken(connection.accessTokenEncrypted)),
      getPrisma().repository.findMany({
        where: { accountId, provider: providers[provider], connectionStatus: ConnectionStatus.ACTIVE, webhook: { is: { status: ConnectionStatus.ACTIVE } } },
        select: { externalId: true },
      }),
    ]);
    const connectedIds = new Set(connected.map((repository) => repository.externalId));
    return repositories.map((repository) => ({ ...repository, connected: connectedIds.has(repository.externalId) }));
  }

  async connect(accountId: string, provider: Provider, externalId: string) {
    const connection = await credential(accountId, provider);
    const database = getPrisma();
    const existing = await database.repository.findUnique({
      where: { accountId_provider_externalId: { accountId, provider: providers[provider], externalId } },
      include: { webhook: true },
    });
    if (existing?.connectionStatus === ConnectionStatus.ACTIVE && existing.webhook?.status === ConnectionStatus.ACTIVE) {
      return { fullName: existing.fullName };
    }
    const repositories = await listAccessibleRepositories(provider, decryptToken(connection.accessTokenEncrypted));
    const repository = repositories.find((candidate) => candidate.externalId === externalId);
    if (!repository) throw new Error("The selected repository is unavailable.");
    const callbackUrl = new URL(`/api/webhooks/${provider}`, required("APP_URL")).toString();
    const secret = required(provider === "github" ? "GITHUB_WEBHOOK_SECRET" : "GITLAB_WEBHOOK_SECRET");
    const token = decryptToken(connection.accessTokenEncrypted);
    const providerWebhookId = await findProviderWebhook({ provider, token, repository, callbackUrl }) ?? await installProviderWebhook({ provider, token, repository, callbackUrl, secret });
    try {
      const stored = existing
        ? await database.repository.update({
        where: { id: existing.id },
        data: { providerAccountId: connection.id, owner: repository.owner, name: repository.name, fullName: repository.fullName, connectionStatus: ConnectionStatus.ACTIVE, connectedAt: new Date(), webhook: { upsert: { create: { providerWebhookId, status: ConnectionStatus.ACTIVE, installedAt: new Date() }, update: { providerWebhookId, status: ConnectionStatus.ACTIVE, installedAt: new Date(), failureReason: null } } } },
        select: { fullName: true },
      })
        : await database.repository.create({
        data: { accountId, providerAccountId: connection.id, provider: providers[provider], externalId, owner: repository.owner, name: repository.name, fullName: repository.fullName, connectionStatus: ConnectionStatus.ACTIVE, connectedAt: new Date(), webhook: { create: { providerWebhookId, status: ConnectionStatus.ACTIVE, installedAt: new Date() } } },
        select: { fullName: true },
      });
      return stored;
    } catch (error) {
      try { await removeProviderWebhook({ provider, token, repository, providerWebhookId }); } catch { /* Preserve the original persistence failure for observability. */ }
      throw error;
    }
  }
}

function required(name: string) { const value = process.env[name]; if (!value) throw new Error(`${name} must be configured.`); return value; }
