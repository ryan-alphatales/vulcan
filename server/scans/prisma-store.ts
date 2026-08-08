import { GitProvider, ScanStatus } from "@prisma/client";

import type { PullRequestEvent } from "@/lib/contracts";
import { getPrisma } from "@/server/persistence/prisma";
import type { ScanRun, ScanStore } from "@/server/scans/orchestration";

const providers: Record<PullRequestEvent["provider"], GitProvider> = { github: "GITHUB", gitlab: "GITLAB" };
const statuses: Record<ScanRun["status"], ScanStatus> = { queued: "QUEUED", running: "RUNNING", completed: "COMPLETED", failed: "FAILED", skipped: "SKIPPED" };
const reverseStatuses: Record<ScanStatus, ScanRun["status"]> = { QUEUED: "queued", RUNNING: "running", COMPLETED: "completed", FAILED: "failed", SKIPPED: "skipped" };

const mapRun = (run: { id: string; repositoryId: string; providerPullRequestId: string; pullRequestNumber: number; headSha: string; headBranch: string | null; status: ScanStatus; supersededAt: Date | null }): ScanRun => ({ id: run.id, repositoryId: run.repositoryId, pullRequestExternalId: run.providerPullRequestId, pullRequestNumber: run.pullRequestNumber, headSha: run.headSha, headBranch: run.headBranch ?? "", status: reverseStatuses[run.status], supersededAt: run.supersededAt ?? undefined });

export class PrismaScanStore implements ScanStore {
  async findRepositories(provider: PullRequestEvent["provider"], externalId: string, providerWebhookId?: string) {
    return getPrisma().repository.findMany({
      where: { provider: providers[provider], externalId, connectionStatus: "ACTIVE", webhook: { is: { status: "ACTIVE", ...(providerWebhookId ? { providerWebhookId } : {}) } } },
      select: { id: true, accountId: true },
    });
  }

  async recordWebhookDelivery(provider: PullRequestEvent["provider"], deliveryId: string) {
    try {
      await getPrisma().webhookDelivery.create({ data: { provider: providers[provider], deliveryId, eventType: "pull_request" } });
      return true;
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return false;
      throw error;
    }
  }

  async findActiveRun(repositoryId: string, pullRequestExternalId: string) {
    const run = await getPrisma().scanRun.findFirst({ where: { repositoryId, providerPullRequestId: pullRequestExternalId, status: { in: ["QUEUED", "RUNNING"] } }, orderBy: { createdAt: "desc" } });
    return run ? mapRun(run) : null;
  }

  async supersede(runId: string, now: Date) {
    await getPrisma().scanRun.update({ where: { id: runId }, data: { status: "SKIPPED", supersededAt: now } });
  }

  async createQueuedRun(input: Omit<ScanRun, "id" | "status"> & { accountId: string }) {
    const run = await getPrisma().scanRun.create({ data: { accountId: input.accountId, repositoryId: input.repositoryId, providerPullRequestId: input.pullRequestExternalId, pullRequestNumber: input.pullRequestNumber, headSha: input.headSha, headBranch: input.headBranch, status: "QUEUED" } });
    return mapRun(run);
  }

  async updateStatus(runId: string, status: ScanRun["status"]) {
    await getPrisma().scanRun.update({ where: { id: runId }, data: { status: statuses[status] } });
  }
}
