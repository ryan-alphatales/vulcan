import type { ChangedCodeBlock } from "@/server/scans/diff-extraction";
import { extractChangedCode } from "@/server/scans/diff-extraction";
import type { ScanFailureReason } from "@/server/scans/failures";

export type PersistedFinding = {
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  confidence: number;
  explanation: string;
  suggestedFix: string;
  filePath?: string;
  startLine?: number;
  endLine?: number;
  riskHighlights: string[];
};

export interface ScanExecutionStore {
  getRun(scanRunId: string): Promise<{ id: string; status: "queued" | "running" | "completed" | "failed" | "skipped"; repositoryId: string; pullRequestExternalId: string; headSha: string } | null>;
  updateStatus(scanRunId: string, status: "running" | "completed" | "failed" | "skipped", failureReason?: ScanFailureReason): Promise<void>;
  saveFindings(scanRunId: string, findings: PersistedFinding[]): Promise<void>;
  failureNoticePosted(scanRunId: string): Promise<boolean>;
  markFailureNoticePosted(scanRunId: string): Promise<void>;
  resultNoticePosted(scanRunId: string): Promise<boolean>;
  markResultNoticePosted(scanRunId: string): Promise<void>;
}

export interface PullRequestDiffReader {
  fetchUnifiedDiff(input: { repositoryId: string; pullRequestExternalId: string; headSha: string }): Promise<string | null>;
}

export interface SecurityAnalyzer {
  analyze(blocks: ChangedCodeBlock[]): Promise<PersistedFinding[]>;
}

export interface PullRequestNotifier {
  postFailure(scanRunId: string, reason: ScanFailureReason): Promise<void>;
  postResults(scanRunId: string, findings: PersistedFinding[]): Promise<void>;
}

function classifyFailure(error: unknown): ScanFailureReason {
  if (error instanceof Error && error.name === "TimeoutError") return "timeout";
  if (error instanceof Error && error.name === "RepositoryAccessError") return "repository_access";
  if (error instanceof Error && error.name === "ProviderError") return "provider";
  if (error instanceof Error && error.name === "AiServiceError") return "ai_service";
  return "internal";
}

export class ScanExecutor {
  constructor(private readonly store: ScanExecutionStore, private readonly diffReader: PullRequestDiffReader, private readonly analyzer: SecurityAnalyzer, private readonly notifier: PullRequestNotifier) {}

  async execute(scanRunId: string): Promise<void> {
    const run = await this.store.getRun(scanRunId);
    if (!run || run.status !== "queued") return;
    try {
      await this.store.updateStatus(run.id, "running");
      const extraction = extractChangedCode(await this.diffReader.fetchUnifiedDiff(run));
      if (extraction.kind === "failure") throw Object.assign(new Error("The pull request diff is unavailable."), { name: extraction.reason === "unavailable" ? "RepositoryAccessError" : "ProviderError" });
      if (extraction.kind === "empty") { await this.store.updateStatus(run.id, "skipped"); return; }
      const findings = await this.analyzer.analyze(extraction.blocks);
      await this.store.saveFindings(run.id, findings);
      if (!(await this.store.resultNoticePosted(run.id))) {
        await this.notifier.postResults(run.id, findings);
        await this.store.markResultNoticePosted(run.id);
      }
      await this.store.updateStatus(run.id, "completed");
    } catch (error) {
      const reason = classifyFailure(error);
      await this.store.updateStatus(run.id, "failed", reason);
      if (!(await this.store.failureNoticePosted(run.id))) {
        await this.notifier.postFailure(run.id, reason);
        await this.store.markFailureNoticePosted(run.id);
      }
      throw error;
    }
  }
}
