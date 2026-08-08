import { describe, expect, it } from "vitest";

import { ScanOrchestrator, type ScanRun, type ScanStore } from "../server/scans/orchestration";

function createStore(): ScanStore & { deliveries: Set<string>; runs: ScanRun[]; superseded: string[] } {
  const deliveries = new Set<string>();
  const runs: ScanRun[] = [];
  const superseded: string[] = [];
  return {
    deliveries, runs, superseded,
    async findRepositories() { return [{ id: "repo_1", accountId: "account_1" }]; },
    async recordWebhookDelivery(_provider, deliveryId) { if (deliveries.has(deliveryId)) return false; deliveries.add(deliveryId); return true; },
    async findActiveRun(repositoryId, pullRequestExternalId) { return runs.find((run) => run.repositoryId === repositoryId && run.pullRequestExternalId === pullRequestExternalId && ["queued", "running"].includes(run.status)) ?? null; },
    async supersede(id) { superseded.push(id); const run = runs.find((item) => item.id === id); if (run) run.status = "skipped"; },
    async createQueuedRun(input) { const run = { id: `scan_${runs.length + 1}`, ...input, status: "queued" as const }; runs.push(run); return run; },
    async updateStatus(id, status) { const run = runs.find((item) => item.id === id); if (run) run.status = status; },
  };
}

const event = { provider: "github" as const, deliveryId: "delivery_1", repositoryExternalId: "42", pullRequestExternalId: "99", pullRequestNumber: 99, headSha: "abc", headBranch: "feature", action: "opened" as const };

describe("scan orchestration", () => {
  it("records delivery idempotency before queueing a scan", async () => {
    const store = createStore(); const queued: string[] = [];
    const service = new ScanOrchestrator(store, { enqueue: async (id) => { queued.push(id); } });
    await expect(service.queueForPullRequest(event)).resolves.toEqual({ kind: "queued", scanRunId: "scan_1" });
    await expect(service.queueForPullRequest(event)).resolves.toEqual({ kind: "ignored", reason: "duplicate_delivery" });
    expect(queued).toEqual(["scan_1"]);
  });

  it("supersedes an active run before queuing a newer commit", async () => {
    const store = createStore();
    store.runs.push({ id: "old", repositoryId: "repo_1", pullRequestExternalId: "99", pullRequestNumber: 99, headSha: "old", headBranch: "feature", status: "running" });
    const service = new ScanOrchestrator(store, { enqueue: async () => undefined });
    await service.queueForPullRequest({ ...event, deliveryId: "delivery_2", headSha: "new", action: "synchronize" });
    expect(store.superseded).toEqual(["old"]);
  });
});
