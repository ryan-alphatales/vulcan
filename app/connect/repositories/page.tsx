import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { RepositorySelection } from "@/components/repository-selection";
import { authOptions } from "@/server/auth/options";
import { gitProviderSchema } from "@/lib/contracts";
import { AppNavigation } from "@/components/app-navigation";

export default async function RepositoriesPage({ searchParams }: { searchParams: Promise<{ provider?: string }> }) {
  const session = await getServerSession(authOptions); if (!session?.user.id) redirect("/login");
  const provider = gitProviderSchema.safeParse((await searchParams).provider);
  if (!provider.success) redirect("/connect");
  return <div className="app-frame"><AppNavigation active="repositories" name={session.user.name} /><main className="app-main"><div className="repository-shell"><a className="back-link" href="/workspace">← Back to workspace</a><ol className="connection-steps"><li className="complete">Authorize</li><li className="active">Select repository</li><li>Confirm</li></ol><p className="provider-chip">{provider.data === "github" ? "GitHub" : "GitLab"} authorized</p><h1>Select a repository to connect</h1><p className="intro">Vulcan requests repository access, installs a webhook on the repository you choose, and scans pull requests automatically from that point on — nothing else is touched.</p><RepositorySelection provider={provider.data} /></div></main></div>;
}
