import { Queue } from "bullmq";
import IORedis from "ioredis";

import type { ScanQueue } from "@/server/scans/orchestration";

export type ScanJobData = { scanRunId: string };

// BullMQ reserves colons for its internal Redis keys, so this must remain a
// plain queue name. Keep the producer and worker on this shared identifier.
export const SCAN_QUEUE_NAME = "vulcan-scan";

function getConnection() {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL must be configured before queue access.");
  return new IORedis(url, { maxRetriesPerRequest: null });
}

export function createScanQueue(): Queue<ScanJobData> {
  return new Queue<ScanJobData>(SCAN_QUEUE_NAME, { connection: getConnection() });
}

export class BullMqScanQueue implements ScanQueue {
  async enqueue(scanRunId: string) {
    const dispatchUrl = process.env.WORKER_DISPATCH_URL;
    const dispatchSecret = process.env.WORKER_DISPATCH_SECRET;
    if (dispatchUrl || dispatchSecret) {
      if (!dispatchUrl || !dispatchSecret) throw new Error("WORKER_DISPATCH_URL and WORKER_DISPATCH_SECRET must be configured together.");
      const response = await fetch(new URL("/internal/scan-jobs", dispatchUrl), {
        method: "POST",
        headers: { authorization: `Bearer ${dispatchSecret}`, "content-type": "application/json" },
        body: JSON.stringify({ scanRunId }),
      });
      if (!response.ok) throw new Error(`Remote scan dispatch failed with status ${response.status}.`);
      return;
    }
    const queue = createScanQueue();
    try {
      await queue.add("scan", { scanRunId }, { jobId: scanRunId, attempts: 3, backoff: { type: "exponential", delay: 1_000 }, removeOnComplete: 500, removeOnFail: 2_000 });
    } finally {
      await queue.close();
    }
  }
}
