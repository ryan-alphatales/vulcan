import { ScanFailureReason, ScanStatus, Severity } from "@prisma/client";

import type { ScanExecutionStore, PersistedFinding } from "@/server/scans/execution";
import type { ScanFailureReason as FailureReason } from "@/server/scans/failures";
import { getPrisma } from "@/server/persistence/prisma";

const statuses: Record<"running" | "completed" | "failed" | "skipped", ScanStatus> = { running: "RUNNING", completed: "COMPLETED", failed: "FAILED", skipped: "SKIPPED" };
const failures: Record<FailureReason, ScanFailureReason> = { repository_access: "REPOSITORY_ACCESS", provider: "PROVIDER", ai_service: "AI_SERVICE", timeout: "TIMEOUT", internal: "INTERNAL" };
const severities: Record<PersistedFinding["severity"], Severity> = { critical: "CRITICAL", high: "HIGH", medium: "MEDIUM", low: "LOW" };

export class PrismaScanExecutionStore implements ScanExecutionStore {
  async getRun(scanRunId: string) {
    const run = await getPrisma().scanRun.findUnique({ where: { id: scanRunId }, select: { id: true, status: true, repositoryId: true, providerPullRequestId: true, headSha: true } });
    if (!run) return null;
    return { id: run.id, status: run.status.toLowerCase() as "queued" | "running" | "completed" | "failed" | "skipped", repositoryId: run.repositoryId, pullRequestExternalId: run.providerPullRequestId, headSha: run.headSha };
  }

  async updateStatus(scanRunId: string, status: "running" | "completed" | "failed" | "skipped", failureReason?: FailureReason) {
    const now = new Date();
    await getPrisma().scanRun.update({ where: { id: scanRunId }, data: { status: statuses[status], ...(status === "running" ? { startedAt: now } : {}), ...(status === "completed" || status === "skipped" || status === "failed" ? { completedAt: now } : {}), ...(failureReason ? { failureReason: failures[failureReason] } : {}) } });
  }

  async saveFindings(scanRunId: string, findings: PersistedFinding[]) {
    await getPrisma().$transaction(async (transaction) => {
      await transaction.finding.deleteMany({ where: { scanRunId } });
      if (findings.length) await transaction.finding.createMany({ data: findings.map((finding) => ({ scanRunId, title: finding.title, severity: severities[finding.severity], confidence: finding.confidence, explanation: finding.explanation, suggestedFix: finding.suggestedFix, filePath: finding.filePath, startLine: finding.startLine, endLine: finding.endLine, riskHighlights: finding.riskHighlights })) });
    });
  }

  async failureNoticePosted(scanRunId: string) { return Boolean((await getPrisma().scanRun.findUnique({ where: { id: scanRunId }, select: { failureNoticePostedAt: true } }))?.failureNoticePostedAt); }
  async markFailureNoticePosted(scanRunId: string) { await getPrisma().scanRun.update({ where: { id: scanRunId }, data: { failureNoticePostedAt: new Date() } }); }
  async resultNoticePosted(scanRunId: string) { return Boolean((await getPrisma().scanRun.findUnique({ where: { id: scanRunId }, select: { resultNoticePostedAt: true } }))?.resultNoticePostedAt); }
  async markResultNoticePosted(scanRunId: string) { await getPrisma().scanRun.update({ where: { id: scanRunId }, data: { resultNoticePostedAt: new Date() } }); }
}
