import { pullRequestEventSchema, type PullRequestEvent, type ScanStatus } from "@/lib/contracts";

export type ScanRun = {
  id: string;
  repositoryId: string;
  pullRequestExternalId: string;
  pullRequestNumber: number;
  headSha: string;
  headBranch: string;
  status: ScanStatus;
  supersededAt?: Date;
};

export interface ScanStore {
  findRepositories(provider: PullRequestEvent["provider"], externalId: string, providerWebhookId?: string): Promise<Array<{ id: string; accountId: string }>>;
  recordWebhookDelivery(provider: PullRequestEvent["provider"], deliveryId: string): Promise<boolean>;
  findActiveRun(repositoryId: string, pullRequestExternalId: string): Promise<ScanRun | null>;
  supersede(runId: string, now: Date): Promise<void>;
  createQueuedRun(input: Omit<ScanRun, "id" | "status"> & { accountId: string }): Promise<ScanRun>;
  updateStatus(runId: string, status: ScanStatus): Promise<void>;
}

export interface ScanQueue {
  enqueue(scanRunId: string): Promise<void>;
}

export type QueueResult =
  | { kind: "queued"; scanRunId: string }
  | { kind: "ignored"; reason: "duplicate_delivery" | "repository_not_connected" | "already_current" };

export class ScanOrchestrator {
  constructor(private readonly store: ScanStore, private readonly queue: ScanQueue) {}

  async queueForPullRequest(input: PullRequestEvent, providerWebhookId?: string): Promise<QueueResult> {
    const event = pullRequestEventSchema.parse(input);
    if (!(await this.store.recordWebhookDelivery(event.provider, event.deliveryId))) {
      return { kind: "ignored", reason: "duplicate_delivery" };
    }
    const repositories = await this.store.findRepositories(event.provider, event.repositoryExternalId, providerWebhookId);
    if (!repositories.length) return { kind: "ignored", reason: "repository_not_connected" };
    let firstRunId: string | undefined;
    for (const repository of repositories) {
      const activeRun = await this.store.findActiveRun(repository.id, event.pullRequestExternalId);
      if (activeRun?.headSha === event.headSha) continue;
      if (activeRun) await this.store.supersede(activeRun.id, new Date());
      const run = await this.store.createQueuedRun({ accountId: repository.accountId, repositoryId: repository.id, pullRequestExternalId: event.pullRequestExternalId, pullRequestNumber: event.pullRequestNumber, headSha: event.headSha, headBranch: event.headBranch });
      try { await this.queue.enqueue(run.id); } catch (error) { await this.store.updateStatus(run.id, "failed"); throw error; }
      firstRunId ??= run.id;
    }
    return firstRunId ? { kind: "queued", scanRunId: firstRunId } : { kind: "ignored", reason: "already_current" };
  }
}
