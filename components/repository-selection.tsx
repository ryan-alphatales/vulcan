"use client";

import { useEffect, useMemo, useState } from "react";
import { RiSearchLine, RiFolderLine } from "react-icons/ri";

type Repository = { externalId: string; fullName: string; canManageWebhooks: boolean; archived: boolean; connected: boolean };

export function RepositorySelection({ provider }: { provider: "github" | "gitlab" }) {
  const [repositories, setRepositories] = useState<Repository[]>(); const [selected, setSelected] = useState(""); const [message, setMessage] = useState<string>(); const [query, setQuery] = useState(""); const [pending, setPending] = useState(false);
  useEffect(() => { fetch(`/api/repositories?provider=${provider}`).then(async (response) => { const data = await response.json() as { repositories?: Repository[]; message?: string }; if (!response.ok) setMessage(data.message); else setRepositories(data.repositories); }).catch(() => setMessage("The repository list is unavailable. Try again.")); }, [provider]);
  const visibleRepositories = useMemo(() => repositories?.filter((repository) => repository.fullName.toLowerCase().includes(query.trim().toLowerCase())) ?? [], [repositories, query]);
  async function connect(externalId: string) { setSelected(externalId); setPending(true); setMessage("Connecting repository…"); const response = await fetch("/api/repositories", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ provider, externalId }) }); const data = await response.json() as { repository?: { fullName: string }; message?: string }; setPending(false); if (response.ok) setRepositories((current) => current?.map((repository) => repository.externalId === externalId ? { ...repository, connected: true } : repository)); setMessage(response.ok ? `${data.repository?.fullName} is connected and ready for pull request scans.` : data.message); }
  if (message && !repositories) return <p className="form-message error">{message}</p>;
  if (!repositories) return <p>Loading accessible repositories…</p>;
  if (!repositories.length) return <p>No accessible repositories were found for this provider.</p>;
  return <div className="repository-picker"><label className="repository-search"><RiSearchLine aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your repositories…" aria-label="Search repositories" /></label><div className="repository-list">{visibleRepositories.map((repository) => <div className="repository-row" key={repository.externalId}><RiFolderLine aria-hidden="true" /><div><strong>{repository.fullName}</strong><span>{repository.connected ? "Connected and scanning" : repository.archived ? "Archived" : repository.canManageWebhooks ? "Webhook access available" : "Webhook permission required"}</span></div><button className="secondary-action" disabled={repository.connected || pending || !repository.canManageWebhooks || repository.archived} onClick={() => connect(repository.externalId)} type="button">{repository.connected ? "Connected" : pending && selected === repository.externalId ? "Connecting…" : "Connect"}</button></div>)}{!visibleRepositories.length ? <p className="empty-repositories">No matching repositories found.</p> : null}</div><p className="repository-note">Only repositories where you have admin access can receive a webhook.</p>{message && <p role="status" className="form-message">{message}</p>}</div>;
}
