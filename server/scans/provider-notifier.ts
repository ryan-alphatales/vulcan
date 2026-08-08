import { getPrisma } from "@/server/persistence/prisma";
import { decryptToken } from "@/server/integrations/token-crypto";
import type { PullRequestNotifier } from "@/server/scans/execution";
import type { ScanFailureReason } from "@/server/scans/failures";
import { formatScanFailureNotice } from "@/server/scans/failures";
import type { PersistedFinding } from "@/server/scans/execution";

export class ProviderPullRequestNotifier implements PullRequestNotifier {
  async postFailure(scanRunId: string, reason: ScanFailureReason): Promise<void> {
    const run = await getPrisma().scanRun.findUnique({ where: { id: scanRunId }, include: { repository: { include: { providerAccount: true } } } });
    if (!run?.repository.providerAccount) throw Object.assign(new Error("Repository connection is unavailable."), { name: "RepositoryAccessError" });
    const repository = run.repository; const token = decryptToken(repository.providerAccount.accessTokenEncrypted); const body = formatScanFailureNotice(reason);
    const response = repository.provider === "GITHUB"
      ? await fetch(`https://api.github.com/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/issues/${run.pullRequestNumber}/comments`, { method: "POST", headers: { accept: "application/vnd.github+json", authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ body }), cache: "no-store" })
      : await fetch(`https://gitlab.com/api/v4/projects/${encodeURIComponent(repository.externalId)}/merge_requests/${run.pullRequestNumber}/notes`, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ body }), cache: "no-store" });
    if (!response.ok) throw Object.assign(new Error("The failure notice could not be posted."), { name: "ProviderError" });
  }

  async postResults(scanRunId: string, findings: PersistedFinding[]): Promise<void> {
    const run = await getPrisma().scanRun.findUnique({ where: { id: scanRunId }, include: { repository: { include: { providerAccount: true } } } });
    if (!run?.repository.providerAccount) throw Object.assign(new Error("Repository connection is unavailable."), { name: "RepositoryAccessError" });
    const summary = findings.length
      ? findings.map((finding) => `- **${finding.severity.toUpperCase()}** — ${finding.title} (${finding.confidence}% confidence)${finding.filePath ? ` · ${finding.filePath}${finding.startLine ? `:${finding.startLine}` : ""}` : ""}\n  ${finding.explanation}`).join("\n")
      : "No findings met Vulcan's configured confidence threshold.";
    const appUrl = process.env.APP_URL;
    if (!appUrl) throw Object.assign(new Error("APP_URL is not configured."), { name: "ProviderError" });
    const body = `## Vulcan security scan complete\n\n${summary}\n\n[View authenticated finding details](${new URL(`/scans/${run.id}`, appUrl)})`;
    const repository = run.repository; const token = decryptToken(repository.providerAccount.accessTokenEncrypted);
    const response = repository.provider === "GITHUB"
      ? await fetch(`https://api.github.com/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/issues/${run.pullRequestNumber}/comments`, { method: "POST", headers: { accept: "application/vnd.github+json", authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ body }), cache: "no-store" })
      : await fetch(`https://gitlab.com/api/v4/projects/${encodeURIComponent(repository.externalId)}/merge_requests/${run.pullRequestNumber}/notes`, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ body }), cache: "no-store" });
    if (!response.ok) throw Object.assign(new Error("The scan result could not be posted."), { name: "ProviderError" });
  }
}
