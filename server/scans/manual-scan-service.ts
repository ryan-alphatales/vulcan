import { ScanStatus } from "@prisma/client";

import { manualScanInputSchema } from "@/lib/contracts";
import { decryptToken } from "@/server/integrations/token-crypto";
import { getPrisma } from "@/server/persistence/prisma";
import type { ScanQueue } from "@/server/scans/orchestration";

type ManualScanResult =
  | { kind: "queued"; scanRunId: string }
  | { kind: "unavailable"; reason: "repository_not_found" | "pull_request_unavailable" | "already_current" };

type Source = { externalId: string; sha: string; branch: string };

export class ManualScanService {
  constructor(private readonly queue: ScanQueue) {}

  async start(accountId: string, input: unknown): Promise<ManualScanResult> {
    const request = manualScanInputSchema.parse(input);
    const database = getPrisma();
    const repository = await database.repository.findFirst({
      where: { id: request.repositoryId, accountId, connectionStatus: "ACTIVE", webhook: { is: { status: "ACTIVE" } } },
      include: { providerAccount: true },
    });
    if (!repository) return { kind: "unavailable", reason: "repository_not_found" };

    const source = await this.getOpenPullRequest(repository, request.pullRequestNumber);
    if (!source) return { kind: "unavailable", reason: "pull_request_unavailable" };
    const activeRun = await database.scanRun.findFirst({ where: { repositoryId: repository.id, providerPullRequestId: source.externalId, status: { in: ["QUEUED", "RUNNING"] } }, orderBy: { createdAt: "desc" } });
    if (activeRun?.headSha === source.sha) return { kind: "unavailable", reason: "already_current" };

    const run = await database.$transaction(async (transaction) => {
      if (activeRun) await transaction.scanRun.update({ where: { id: activeRun.id }, data: { status: ScanStatus.SKIPPED, supersededAt: new Date(), completedAt: new Date() } });
      const queued = await transaction.scanRun.create({ data: { accountId, repositoryId: repository.id, providerPullRequestId: source.externalId, pullRequestNumber: request.pullRequestNumber, headSha: source.sha, headBranch: source.branch, status: ScanStatus.QUEUED } });
      await transaction.auditEvent.create({ data: { accountId, category: "scan", action: "manual_scan_queued", metadata: { repositoryId: repository.id, pullRequestNumber: request.pullRequestNumber, scanRunId: queued.id } } });
      return queued;
    });
    try {
      await this.queue.enqueue(run.id);
    } catch (error) {
      await database.scanRun.update({ where: { id: run.id }, data: { status: ScanStatus.FAILED, failureReason: "INTERNAL", completedAt: new Date() } });
      throw error;
    }
    return { kind: "queued", scanRunId: run.id };
  }

  private async getOpenPullRequest(repository: { provider: "GITHUB" | "GITLAB"; externalId: string; owner: string; name: string; providerAccount: { accessTokenEncrypted: string } }, number: number): Promise<Source | null> {
    const token = decryptToken(repository.providerAccount.accessTokenEncrypted);
    const response = repository.provider === "GITHUB"
      ? await fetch(`https://api.github.com/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/pulls/${number}`, { headers: { accept: "application/vnd.github+json", authorization: `Bearer ${token}` }, cache: "no-store" })
      : await fetch(`https://gitlab.com/api/v4/projects/${encodeURIComponent(repository.externalId)}/merge_requests/${number}`, { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!response.ok) return null;
    const payload = await response.json() as unknown;
    if (repository.provider === "GITHUB") {
      const value = payload as { state?: unknown; head?: { sha?: unknown; ref?: unknown } };
      // GitHub's pull-diff endpoint identifies a pull request by its repository-local number.
      return value.state === "open" && typeof value.head?.sha === "string" && typeof value.head.ref === "string" ? { externalId: String(number), sha: value.head.sha, branch: value.head.ref } : null;
    }
    const value = payload as { id?: unknown; state?: unknown; sha?: unknown; source_branch?: unknown };
    return value.state === "opened" && (typeof value.id === "number" || typeof value.id === "string") && typeof value.sha === "string" && typeof value.source_branch === "string" ? { externalId: String(value.id), sha: value.sha, branch: value.source_branch } : null;
  }
}
