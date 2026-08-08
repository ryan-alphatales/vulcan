import { describe, expect, it } from "vitest";

import { ScanExecutor, type PersistedFinding, type ScanExecutionStore } from "../server/scans/execution";

function storeFor(status: "queued" | "running" | "completed" | "failed" | "skipped" = "queued"): ScanExecutionStore & { statuses: string[]; notices: number; findings: PersistedFinding[] } {
  const statuses: string[] = []; let notices = 0; const findings: PersistedFinding[] = [];
  return { statuses, get notices() { return notices; }, findings,
    async getRun() { return { id: "scan_1", status, repositoryId: "repo", pullRequestExternalId: "1", headSha: "abc" }; },
    async updateStatus(_id, next) { statuses.push(next); }, async saveFindings(_id, next) { findings.push(...next); },
    async failureNoticePosted() { return false; }, async markFailureNoticePosted() { notices += 1; }, async resultNoticePosted() { return false; }, async markResultNoticePosted() {},
  };
}

describe("scan execution", () => {
  it("scans only extracted changed code and persists completed findings", async () => {
    const store = storeFor(); let received = "";
    const executor = new ScanExecutor(store, { fetchUnifiedDiff: async () => "diff --git a/a.ts b/a.ts\n--- a/a.ts\n+++ b/a.ts\n@@ -0,0 +1 @@\n+const key = process.env.KEY;" }, { analyze: async (blocks) => { received = blocks[0].content; return [{ title: "Example", severity: "low", confidence: 98, explanation: "Plain language.", suggestedFix: "Use a safe value.", riskHighlights: [] }]; } }, { postFailure: async () => undefined, postResults: async () => undefined });
    await executor.execute("scan_1");
    expect(received).toBe("const key = process.env.KEY;"); expect(store.statuses).toEqual(["running", "completed"]); expect(store.findings).toHaveLength(1);
  });

  it("marks failures and posts one recoverable notice", async () => {
    const store = storeFor();
    const executor = new ScanExecutor(store, { fetchUnifiedDiff: async () => { throw Object.assign(new Error("down"), { name: "TimeoutError" }); } }, { analyze: async () => [] }, { postFailure: async () => undefined, postResults: async () => undefined });
    await expect(executor.execute("scan_1")).rejects.toThrow("down");
    expect(store.statuses).toEqual(["running", "failed"]); expect(store.notices).toBe(1);
  });
});
