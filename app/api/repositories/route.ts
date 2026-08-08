import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { gitProviderSchema } from "@/lib/contracts";
import { authOptions } from "@/server/auth/options";
import { RepositoryConnectionService } from "@/server/repository-connection/service";

const service = new RepositoryConnectionService();
const connectInputSchema = z.object({ provider: gitProviderSchema, externalId: z.string().trim().min(1).max(255) });

export async function GET(request: Request) {
  const session = await getServerSession(authOptions); if (!session?.user.id) return NextResponse.json({ message: "Sign in to view repositories." }, { status: 401 });
  const provider = gitProviderSchema.safeParse(new URL(request.url).searchParams.get("provider")); if (!provider.success) return NextResponse.json({ message: "Choose GitHub or GitLab." }, { status: 400 });
  try { return NextResponse.json({ repositories: await service.list(session.user.id, provider.data) }); } catch { return NextResponse.json({ message: "The repository list is unavailable. Reconnect your provider and try again." }, { status: 503 }); }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions); if (!session?.user.id) return NextResponse.json({ message: "Sign in to connect a repository." }, { status: 401 });
  const input = connectInputSchema.safeParse(await request.json());
  if (!input.success) return NextResponse.json({ message: "Choose one repository to connect." }, { status: 400 });
  try { const repository = await service.connect(session.user.id, input.data.provider, input.data.externalId); return NextResponse.json({ repository }); } catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : "Vulcan could not connect that repository. Check webhook permission and try again." }, { status: 422 }); }
}
