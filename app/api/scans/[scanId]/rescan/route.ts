import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/server/auth/options";
import { BullMqScanQueue } from "@/server/queue/scans";
import { RescanService } from "@/server/scans/rescan-service";

const messages = {
  not_found: "Scan not found.", already_running: "A scan is already queued or running for this pull request.", not_retryable: "Only failed or incomplete scans can be retried.", source_changed: "This pull request has changed since the failed scan, so its original source context cannot be retried.", source_unavailable: "This pull request is unavailable, closed, or its branch was removed.",
};

export async function POST(_request: Request, context: { params: Promise<{ scanId: string }> }) {
  const session = await getServerSession(authOptions); if (!session?.user.id) return NextResponse.json({ message: "Sign in to retry a scan." }, { status: 401 });
  try {
    const result = await new RescanService(new BullMqScanQueue()).retry(session.user.id, (await context.params).scanId);
    return result.kind === "queued" ? NextResponse.json({ message: "A new scan has been queued.", scanRunId: result.scanRunId }, { status: 202 }) : NextResponse.json({ message: messages[result.reason] }, { status: 409 });
  } catch { return NextResponse.json({ message: "Vulcan could not queue the retry. Please try again." }, { status: 503 }); }
}
