import { z } from "zod";

import type { PullRequestEvent } from "@/lib/contracts";

const githubPayloadSchema = z.object({
  action: z.enum(["opened", "synchronize"]),
  repository: z.object({ id: z.number().or(z.string()) }),
  pull_request: z.object({ number: z.number().int().positive(), head: z.object({ sha: z.string().min(1), ref: z.string().min(1) }) }),
});
const gitLabPayloadSchema = z.object({
  object_kind: z.literal("merge_request"),
  project: z.object({ id: z.number().or(z.string()) }),
  object_attributes: z.object({ action: z.enum(["open", "update"]), iid: z.number().int().positive(), id: z.number().or(z.string()), last_commit: z.object({ id: z.string().min(1) }), source_branch: z.string().min(1) }),
});

export function parseGitHubPullRequestEvent(payload: unknown, deliveryId: string): PullRequestEvent | null {
  const parsed = githubPayloadSchema.safeParse(payload);
  if (!parsed.success) return null;
  const { action, repository, pull_request: pullRequest } = parsed.data;
  return { provider: "github", deliveryId, repositoryExternalId: String(repository.id), pullRequestExternalId: String(pullRequest.number), pullRequestNumber: pullRequest.number, headSha: pullRequest.head.sha, headBranch: pullRequest.head.ref, action };
}

export function parseGitLabMergeRequestEvent(payload: unknown, deliveryId: string): PullRequestEvent | null {
  const parsed = gitLabPayloadSchema.safeParse(payload);
  if (!parsed.success) return null;
  const { object_attributes: mergeRequest, project } = parsed.data;
  return { provider: "gitlab", deliveryId, repositoryExternalId: String(project.id), pullRequestExternalId: String(mergeRequest.id), pullRequestNumber: mergeRequest.iid, headSha: mergeRequest.last_commit.id, headBranch: mergeRequest.source_branch, action: mergeRequest.action === "open" ? "opened" : "synchronize" };
}
