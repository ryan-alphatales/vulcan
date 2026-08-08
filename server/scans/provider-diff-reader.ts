import { z } from "zod";

import { decryptToken } from "@/server/integrations/token-crypto";
import { getPrisma } from "@/server/persistence/prisma";
import type { PullRequestDiffReader } from "@/server/scans/execution";

const gitLabChangesSchema = z.object({ overflow: z.boolean().optional(), changes: z.array(z.object({ old_path: z.string(), new_path: z.string(), diff: z.string() })) });

export class ProviderPullRequestDiffReader implements PullRequestDiffReader {
  async fetchUnifiedDiff(input: { repositoryId: string; pullRequestExternalId: string; headSha: string }): Promise<string | null> {
    const repository = await getPrisma().repository.findUnique({ where: { id: input.repositoryId }, include: { providerAccount: true } });
    if (!repository || !repository.providerAccount) throw Object.assign(new Error("Repository connection is unavailable."), { name: "RepositoryAccessError" });
    const token = decryptToken(repository.providerAccount.accessTokenEncrypted);
    if (repository.provider === "GITHUB") {
      const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/pulls/${encodeURIComponent(input.pullRequestExternalId)}`, { headers: { accept: "application/vnd.github.v3.diff", authorization: `Bearer ${token}` }, cache: "no-store" });
      if (response.status === 404 || response.status === 403) throw Object.assign(new Error("The pull request is unavailable."), { name: "RepositoryAccessError" });
      if (!response.ok) throw Object.assign(new Error("GitHub could not provide the pull request diff."), { name: "ProviderError" });
      return response.text();
    }
    const response = await fetch(`https://gitlab.com/api/v4/projects/${encodeURIComponent(repository.externalId)}/merge_requests/${encodeURIComponent(input.pullRequestExternalId)}/changes`, { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
    if (response.status === 404 || response.status === 403) throw Object.assign(new Error("The merge request is unavailable."), { name: "RepositoryAccessError" });
    if (!response.ok) throw Object.assign(new Error("GitLab could not provide merge-request changes."), { name: "ProviderError" });
    const result = gitLabChangesSchema.parse(await response.json());
    if (result.overflow) throw Object.assign(new Error("GitLab reported an incomplete merge-request diff."), { name: "ProviderError" });
    return result.changes.map((change) => `diff --git a/${change.old_path} b/${change.new_path}\n--- a/${change.old_path}\n+++ b/${change.new_path}\n${change.diff}`).join("\n");
  }
}
