"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type HistoryScan = { id: string; repository: string; branch: string; status: string; findings: number; createdAtLabel: string };

export function ScanHistoryList({ scans }: { scans: HistoryScan[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const visibleScans = useMemo(() => scans.filter((scan) => (status === "all" || scan.status === status) && `${scan.repository} ${scan.branch}`.toLowerCase().includes(query.trim().toLowerCase())), [query, scans, status]);

  return <><div className="history-filters"><label>Search scans<input aria-label="Search scans" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Repository or branch" /></label><label>Status<select aria-label="Filter scan status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All results</option><option value="completed">Completed</option><option value="failed">Failed</option><option value="queued">Queued</option><option value="running">Running</option><option value="skipped">Skipped</option></select></label><span>{visibleScans.length} shown</span></div><section className="history-table"><div className="history-table-head"><span>Repository</span><span>Branch</span><span>Result</span><span>Findings</span><span>Run</span></div>{visibleScans.map((scan) => <Link key={scan.id} className="history-row" href={`/scans/${scan.id}`}><strong>{scan.repository}</strong><span>{scan.branch}</span><span className={`status-dot ${scan.status}`}>{scan.status}</span><span>{scan.findings} findings</span><time>{scan.createdAtLabel}</time></Link>)}{!visibleScans.length ? <p className="history-no-results">No scans match those filters.</p> : null}</section></>;
}
