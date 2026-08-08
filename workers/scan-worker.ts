import "dotenv/config";
import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { z } from "zod";

import { DeepSeekSecurityAnalyzer } from "@/server/scans/deepseek-analyzer";
import { ProviderPullRequestDiffReader } from "@/server/scans/provider-diff-reader";
import { PrismaScanExecutionStore } from "@/server/scans/prisma-execution-store";
import { ProviderPullRequestNotifier } from "@/server/scans/provider-notifier";
import { ScanExecutor } from "@/server/scans/execution";
import { SCAN_QUEUE_NAME, type ScanJobData } from "@/server/queue/scans";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) throw new Error("REDIS_URL must be configured before starting the scan worker.");
const dispatchSecret = process.env.WORKER_DISPATCH_SECRET;
if (!dispatchSecret) throw new Error("WORKER_DISPATCH_SECRET must be configured before starting the scan worker.");

const executor = new ScanExecutor(new PrismaScanExecutionStore(), new ProviderPullRequestDiffReader(), new DeepSeekSecurityAnalyzer(), new ProviderPullRequestNotifier());
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
const worker = new Worker<ScanJobData>(SCAN_QUEUE_NAME, async (job) => executor.execute(job.data.scanRunId), { connection, concurrency: 4 });
const queue = new Queue<ScanJobData>(SCAN_QUEUE_NAME, { connection: new IORedis(redisUrl, { maxRetriesPerRequest: null }) });
const dispatchInput = z.object({ scanRunId: z.string().cuid() });

function isAuthorized(value: string | undefined) {
  const expected = Buffer.from(`Bearer ${dispatchSecret}`);
  const received = Buffer.from(value ?? "");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

const server = createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/health") return void response.writeHead(200).end("ok");
  if (request.method !== "POST" || request.url !== "/internal/scan-jobs" || !isAuthorized(request.headers.authorization)) return void response.writeHead(404).end();
  let body = "";
  for await (const chunk of request) { body += chunk; if (body.length > 10_000) return void response.writeHead(413).end(); }
  let payload: unknown;
  try { payload = JSON.parse(body); } catch { return void response.writeHead(400).end(); }
  const input = dispatchInput.safeParse(payload);
  if (!input.success) return void response.writeHead(400).end();
  await queue.add("scan", input.data, { jobId: input.data.scanRunId, attempts: 3, backoff: { type: "exponential", delay: 1_000 }, removeOnComplete: 500, removeOnFail: 2_000 });
  response.writeHead(202).end();
});

server.on("error", (error) => { console.error("Vulcan worker HTTP server error", { name: error.name }); });
server.listen(Number(process.env.PORT ?? 3000), "0.0.0.0", () => { console.info("Vulcan scan worker ready"); });

worker.on("error", (error) => { console.error("Vulcan scan worker error", { name: error.name }); });
worker.on("failed", (job, error) => { console.error("Vulcan scan job failed", { scanRunId: job?.data.scanRunId, name: error.name }); });
