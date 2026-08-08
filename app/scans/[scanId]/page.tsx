import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { FindingTriageControls } from "@/components/finding-triage-controls";
import { authOptions } from "@/server/auth/options";
import { getScanForAccount } from "@/server/findings/service";
import { scanConfidenceThreshold } from "@/server/scans/settings";
import { RescanButton } from "@/components/rescan-button";
import { AppNavigation } from "@/components/app-navigation";

export default async function ScanDetailPage({ params }: { params: Promise<{ scanId: string }> }) {
  const session = await getServerSession(authOptions); if (!session?.user.id) redirect("/login");
  const scan = await getScanForAccount(session.user.id, (await params).scanId); if (!scan) notFound();
  const threshold = scanConfidenceThreshold();
  return <div className="app-frame"><AppNavigation active="findings" name={session.user.name} /><main className="app-main"><div className="findings-shell"><Link className="back-link" href="/history">Back to scan history</Link><div className="finding-heading"><div><p className="eyebrow">{scan.repository.fullName}</p><h1>Scan findings</h1><p className="intro">{scan.headBranch ?? "Unknown branch"} · {scan.status.toLowerCase()}</p></div><span className={`status-dot ${scan.status.toLowerCase()}`}>{scan.status.toLowerCase()}</span></div>{scan.status === "FAILED" || scan.status === "SKIPPED" ? <section className="scan-alert"><p>This scan did not complete. Retrying never blocks the pull request merge.</p><RescanButton scanId={scan.id} /></section> : null}{scan.findings.length ? scan.findings.map((finding) => <section key={finding.id} className="finding-card"><div className="finding-meta"><p className={`severity ${finding.severity.toLowerCase()}`}>{finding.severity}</p><strong>{finding.confidence}% confidence</strong></div><h2>{finding.title}</h2><p className="code-location">{finding.filePath ? `${finding.filePath}${finding.startLine ? `:${finding.startLine}` : ""}` : "Code location unavailable"}</p>{finding.confidence < threshold ? <p className="review-flag">Needs human review</p> : null}{finding.riskHighlights.length ? <ul className="risk-list">{finding.riskHighlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul> : null}<div className="finding-copy"><div><h3>Why this matters</h3><p>{finding.explanation || "Explanation unavailable."}</p></div><div><h3>Suggested fix</h3><p>{finding.suggestedFix || "Suggested fix unavailable."}</p></div></div><FindingTriageControls findingId={finding.id} initialState={finding.triageState.toLowerCase() as "open" | "fixed" | "false_positive"} /></section>) : <section className="quiet-state"><h2>{scan.status === "FAILED" || scan.status === "SKIPPED" ? "No findings are available" : "No findings detected"}</h2><p>{scan.status === "FAILED" || scan.status === "SKIPPED" ? "This scan did not complete." : "This pull request passed Vulcan’s current security checks."}</p></section>}</div></main></div>;
}
