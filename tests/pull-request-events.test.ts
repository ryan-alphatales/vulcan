import { createHmac } from "node:crypto";

import { describe, expect, it } from "vitest";

import { parseGitHubPullRequestEvent, parseGitLabMergeRequestEvent } from "../server/integrations/pull-request-events";
import { verifyGitHubSignature, verifyGitLabToken } from "../server/integrations/webhook-auth";

describe("provider webhook boundaries", () => {
  it("accepts only a signed GitHub pull request event with known actions", () => {
    const body = JSON.stringify({ action: "opened", repository: { id: 10 }, pull_request: { number: 2, head: { sha: "abc", ref: "feature/auth" } } });
    const signature = `sha256=${createHmac("sha256", "secret").update(body).digest("hex")}`;
    expect(verifyGitHubSignature(body, signature, "secret")).toBe(true);
    expect(verifyGitHubSignature(body, signature, "wrong")).toBe(false);
    expect(parseGitHubPullRequestEvent(JSON.parse(body), "delivery-1")).toMatchObject({ provider: "github", pullRequestNumber: 2, headSha: "abc" });
  });

  it("parses GitLab merge request updates without accepting unrelated payloads", () => {
    const event = parseGitLabMergeRequestEvent({ object_kind: "merge_request", project: { id: 11 }, object_attributes: { action: "update", iid: 4, id: 100, last_commit: { id: "def" }, source_branch: "feature/scan" } }, "delivery-2");
    expect(event).toMatchObject({ provider: "gitlab", action: "synchronize", pullRequestExternalId: "100" });
    expect(parseGitLabMergeRequestEvent({ object_kind: "push" }, "delivery-3")).toBeNull();
    expect(verifyGitLabToken("secret", "secret")).toBe(true);
    expect(verifyGitLabToken("other", "secret")).toBe(false);
  });
});
