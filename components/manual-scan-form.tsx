"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function ManualScanForm({ repositories }: { repositories: Array<{ id: string; fullName: string }> }) {
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage(undefined);
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/scans", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ repositoryId: data.get("repositoryId"), pullRequestNumber: data.get("pullRequestNumber") }) });
      const result = await response.json() as { message?: string; scanRunId?: string };
      setMessage(result.message ?? "Vulcan could not queue the scan.");
      if (response.ok && result.scanRunId) window.setTimeout(() => router.push(`/scans/${result.scanRunId}`), 700);
    } catch { setMessage("Vulcan could not queue the scan. Please check your connection and try again."); }
    finally { setPending(false); }
  }

  return <form className="manual-scan-form" onSubmit={submit}><div><label htmlFor="repositoryId">Repository</label><select id="repositoryId" name="repositoryId" defaultValue={repositories[0]?.id} required>{repositories.map((repository) => <option key={repository.id} value={repository.id}>{repository.fullName}</option>)}</select></div><div><label htmlFor="pullRequestNumber">Pull request #</label><input id="pullRequestNumber" name="pullRequestNumber" type="number" inputMode="numeric" min="1" placeholder="e.g. 12" required /></div><button className="primary-action" disabled={pending} type="submit">{pending ? "Queueing scan…" : "Scan pull request"}</button>{message ? <p role="status">{message}</p> : null}</form>;
}
