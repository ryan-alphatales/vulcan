import { NextResponse } from "next/server";

import { parseGitHubPullRequestEvent, parseGitLabMergeRequestEvent } from "@/server/integrations/pull-request-events";
import { verifyGitHubSignature, verifyGitLabToken } from "@/server/integrations/webhook-auth";
import { BullMqScanQueue } from "@/server/queue/scans";
import { PrismaScanStore } from "@/server/scans/prisma-store";
import { ScanOrchestrator } from "@/server/scans/orchestration";

export async function POST(request: Request, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  const body = await request.text();
  let payload: unknown;
  try { payload = JSON.parse(body); } catch { return NextResponse.json({ message: "Invalid webhook payload." }, { status: 400 }); }

  const orchestrator = new ScanOrchestrator(new PrismaScanStore(), new BullMqScanQueue());
  if (provider === "github") {
    if (!verifyGitHubSignature(body, request.headers.get("x-hub-signature-256"), process.env.GITHUB_WEBHOOK_SECRET ?? "")) return NextResponse.json({ message: "Invalid signature." }, { status: 401 });
    const deliveryId = request.headers.get("x-github-delivery");
    if (!deliveryId || request.headers.get("x-github-event") !== "pull_request") return new NextResponse(null, { status: 202 });
    const event = parseGitHubPullRequestEvent(payload, deliveryId);
    if (!event) return new NextResponse(null, { status: 202 });
    await orchestrator.queueForPullRequest(event, request.headers.get("x-github-hook-id") ?? undefined);
    return new NextResponse(null, { status: 202 });
  }
  if (provider === "gitlab") {
    if (!verifyGitLabToken(request.headers.get("x-gitlab-token"), process.env.GITLAB_WEBHOOK_SECRET ?? "")) return NextResponse.json({ message: "Invalid signature." }, { status: 401 });
    const deliveryId = request.headers.get("x-gitlab-event-uuid");
    if (!deliveryId || request.headers.get("x-gitlab-event") !== "Merge Request Hook") return new NextResponse(null, { status: 202 });
    const event = parseGitLabMergeRequestEvent(payload, deliveryId);
    if (!event) return new NextResponse(null, { status: 202 });
    await orchestrator.queueForPullRequest(event);
    return new NextResponse(null, { status: 202 });
  }
  return NextResponse.json({ message: "Unsupported provider." }, { status: 404 });
}
