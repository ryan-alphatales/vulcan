import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/server/auth/options";
import { AppNavigation } from "@/components/app-navigation";
import { RiGithubFill, RiGitlabFill, RiShieldLine } from "react-icons/ri";

export default async function ConnectPage() {
  const session = await getServerSession(authOptions); if (!session?.user.id) redirect("/login");
  return <div className="app-frame"><AppNavigation active="repositories" name={session.user.name} /><main className="app-main"><div className="setup-shell"><p className="eyebrow">Repository setup</p><h1>Connect a provider to start scanning</h1><p className="intro">Vulcan requests only the repository permissions needed to install a webhook and scan pull requests you choose.</p><section className="provider-grid"><Link className="provider-card primary-provider" href="/api/oauth/github/start"><RiGithubFill aria-hidden="true" /><div><strong>GitHub</strong><span>Authorize repository access</span></div><b>Connect</b></Link><div className="provider-card provider-card-disabled" aria-label="GitLab integration coming soon"><RiGitlabFill aria-hidden="true" /><div><strong>GitLab</strong><span>Repository integration coming soon</span></div><b>Coming soon</b></div></section><p className="setup-note"><RiShieldLine aria-hidden="true" /> Vulcan only connects repositories that you explicitly select.</p></div></main></div>;
}
