import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { findingTriageInputSchema } from "@/lib/contracts";
import { authOptions } from "@/server/auth/options";
import { updateFindingTriage } from "@/server/findings/service";

export async function PATCH(request: Request, context: { params: Promise<{ findingId: string }> }) {
  const session = await getServerSession(authOptions); if (!session?.user.id) return NextResponse.json({ message: "Sign in to update a finding." }, { status: 401 });
  const parsed = findingTriageInputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "Choose a valid triage state." }, { status: 400 });
  if (parsed.data.state === "false_positive" && !parsed.data.confirmation) return NextResponse.json({ message: "Confirm before marking a finding as a false positive." }, { status: 400 });
  const finding = await updateFindingTriage(session.user.id, (await context.params).findingId, parsed.data.state);
  if (!finding) return NextResponse.json({ message: "Finding not found." }, { status: 404 });
  return NextResponse.json({ finding: { id: finding.id, triageState: finding.triageState } });
}
