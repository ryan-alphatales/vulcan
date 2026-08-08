import { ScanStatus } from "@prisma/client";

import { decryptToken } from "@/server/integrations/token-crypto";
import { getPrisma } from "@/server/persistence/prisma";
import type { ScanQueue } from "@/server/scans/orchestration";

export type RescanResult =
  | { kind: "queued"; scanRunId: string }
  | { kind: "unavailable"; reason: "not_found" | "already_running" | "not_retryable" | "source_changed" | "source_unavailable" };

export class RescanService {
  constructor(private readonly queue: ScanQueue) {}

  async retry(accountId: string, scanRunId: string): Promise<RescanResult> {
    const database = getPrisma();
    const scan = await database.scanRun.findFirst({ where: { id: scanRunId, accountId }, include: { repository: { include: { providerAccount: true } } } });
    if (!scan) return { kind: "unavailable", reason: "not_found" };
    if (scan.status === "QUEUED" || scan.status === "RUNNING") return { kind: "unavailable", reason: "already_running" };
    if (scan.status !== "FAILED" && scan.status !== "SKIPPED") return { kind: "unavailable", reason: "not_retryable" };
    const source = await this.originalSourceIsAvailable(scan);
    if (!source) return { kind: "unavailable", reason: "source_unavailable" };
    if (source.sha !== scan.headSha || source.branch !== (scan.headBranch ?? "")) return { kind: "unavailable", reason: "source_changed" };
    const next = await database.$transaction(async (transaction) => {
      await transaction.scanRun.update({ where: { id: scan.id }, data: { supersededAt: new Date() } });
      return transaction.scanRun.create({ data: { accountId, repositoryId: scan.repositoryId, providerPullRequestId: scan.providerPullRequestId, pullRequestNumber: scan.pullRequestNumber, headSha: scan.headSha, headBranch: scan.headBranch, status: ScanStatus.QUEUED } });
    });
    try { await this.queue.enqueue(next.id); } catch (error) { await database.scanRun.update({ where: { id: next.id }, data: { status: ScanStatus.FAILED, failureReason: "INTERNAL", completedAt: new Date() } }); throw error; }
    return { kind: "queued", scanRunId: next.id };
  }

  private async originalSourceIsAvailable(scan: { repository: { provider: "GITHUB" | "GITLAB"; owner: string; name: string; externalId: string; providerAccount: { accessTokenEncrypted: string } }; pullRequestNumber: number }): Promise<{ sha: string; branch: string } | null> {
    const repository = scan.repository; const token = decryptToken(repository.providerAccount.accessTokenEncrypted);
    const response = repository.provider === "GITHUB"
      ? await fetch(`https://api.github.com/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/pulls/${scan.pullRequestNumber}`, { headers: { accept: "application/vnd.github+json", authorization: `Bearer ${token}` }, cache: "no-store" })
      : await fetch(`https://gitlab.com/api/v4/projects/${encodeURIComponent(repository.externalId)}/merge_requests/${scan.pullRequestNumber}`, { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!response.ok) return null;
    const payload = await response.json() as unknown;
    if (repository.provider === "GITHUB") {
      const value = payload as { state?: unknown; head?: { sha?: unknown; ref?: unknown } };
      return value.state === "open" && typeof value.head?.sha === "string" && typeof value.head.ref === "string" ? { sha: value.head.sha, branch: value.head.ref } : null;
    }
    const value = payload as { state?: unknown; sha?: unknown; source_branch?: unknown };
    return value.state === "opened" && typeof value.sha === "string" && typeof value.source_branch === "string" ? { sha: value.sha, branch: value.source_branch } : null;
  }
}
