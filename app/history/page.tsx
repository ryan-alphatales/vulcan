import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/server/auth/options";
import { AppNavigation } from "@/components/app-navigation";
import { ScanHistoryList } from "@/components/scan-history-list";
import { listScanHistory } from "@/server/findings/service";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions); if (!session?.user.id) redirect("/login");
  const scans = await listScanHistory(session.user.id);
  return <div className="app-frame"><AppNavigation active="history" name={session.user.name} /><main className="app-main"><div className="history-shell"><div className="page-heading"><div><p className="eyebrow">Scan history</p><h1>Every scan, ready for review.</h1></div><span className="count-pill">{scans.length} runs</span></div>{scans.length ? <ScanHistoryList scans={scans.map((scan) => ({ id: scan.id, repository: scan.repository.fullName, branch: scan.headBranch ?? "Unknown branch", status: scan.status.toLowerCase(), findings: scan._count.findings, createdAtLabel: scan.createdAt.toLocaleDateString() }))} /> : <section className="quiet-state"><h2>No scan history yet</h2><p>Connected repositories will appear here as soon as a pull request opens or updates.</p><Link className="primary-action button-link" href="/connect">Connect a repository</Link></section>}</div></main></div>;
}
