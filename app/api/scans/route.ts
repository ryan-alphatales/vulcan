import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/server/auth/options";
import { BullMqScanQueue } from "@/server/queue/scans";
import { ManualScanService } from "@/server/scans/manual-scan-service";

const messages = { repository_not_found: "This repository is not available for scanning.", pull_request_unavailable: "That pull request is unavailable or already closed.", already_current: "A scan for the current pull request revision is already queued or running." };

export async function POST(request: Request) {
  const session = await getServerSession(authOptions); if (!session?.user.id) return NextResponse.json({ message: "Sign in to start a scan." }, { status: 401 });
  try {
    const result = await new ManualScanService(new BullMqScanQueue()).start(session.user.id, await request.json());
    return result.kind === "queued" ? NextResponse.json({ message: "Scan queued. Vulcan will post the result to the pull request.", scanRunId: result.scanRunId }, { status: 202 }) : NextResponse.json({ message: messages[result.reason] }, { status: 409 });
  } catch { return NextResponse.json({ message: "Vulcan could not queue the scan. Please try again." }, { status: 503 }); }
}
