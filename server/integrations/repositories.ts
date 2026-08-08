import { z } from "zod";

import type { GitProvider } from "@/lib/contracts";

export type AccessibleRepository = { externalId: string; owner: string; name: string; fullName: string; canManageWebhooks: boolean; archived: boolean };

const githubRepositories = z.array(z.object({ id: z.number().or(z.string()), name: z.string(), full_name: z.string(), archived: z.boolean(), owner: z.object({ login: z.string() }), permissions: z.object({ admin: z.boolean() }).optional() }));
const gitlabRepositories = z.array(z.object({ id: z.number().or(z.string()), name: z.string(), path_with_namespace: z.string(), archived: z.boolean(), namespace: z.object({ full_path: z.string() }), permissions: z.object({ project_access: z.object({ access_level: z.number() }).nullable().optional(), group_access: z.object({ access_level: z.number() }).nullable().optional() }).optional() }));
const githubHooks = z.array(z.object({ id: z.number().or(z.string()), config: z.object({ url: z.string().optional() }) }));

export async function listAccessibleRepositories(provider: GitProvider, token: string): Promise<AccessibleRepository[]> {
  const response = await fetch(provider === "github" ? "https://api.github.com/user/repos?affiliation=owner,collaborator,organization_member&per_page=100&sort=full_name" : "https://gitlab.com/api/v4/projects?membership=true&simple=true&per_page=100&order_by=path_with_namespace", { headers: provider === "github" ? { accept: "application/vnd.github+json", authorization: `Bearer ${token}` } : { authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) throw new Error("The provider repository list is unavailable.");
  if (provider === "github") return githubRepositories.parse(await response.json()).map((repository) => ({ externalId: String(repository.id), owner: repository.owner.login, name: repository.name, fullName: repository.full_name, canManageWebhooks: repository.permissions?.admin === true, archived: repository.archived }));
  return gitlabRepositories.parse(await response.json()).map((repository) => ({ externalId: String(repository.id), owner: repository.namespace.full_path, name: repository.name, fullName: repository.path_with_namespace, canManageWebhooks: Math.max(repository.permissions?.project_access?.access_level ?? 0, repository.permissions?.group_access?.access_level ?? 0) >= 40, archived: repository.archived }));
}

export async function installProviderWebhook(input: { provider: GitProvider; token: string; repository: AccessibleRepository; callbackUrl: string; secret: string }): Promise<string> {
  if (!input.repository.canManageWebhooks || input.repository.archived) throw new Error("You need repository webhook-management permission to connect this repository.");
  const url = input.provider === "github" ? `https://api.github.com/repos/${encodeURIComponent(input.repository.owner)}/${encodeURIComponent(input.repository.name)}/hooks` : `https://gitlab.com/api/v4/projects/${encodeURIComponent(input.repository.externalId)}/hooks`;
  const body = input.provider === "github" ? { name: "web", active: true, events: ["pull_request"], config: { url: input.callbackUrl, content_type: "json", secret: input.secret } } : { url: input.callbackUrl, token: input.secret, merge_requests_events: true };
  const response = await fetch(url, { method: "POST", headers: input.provider === "github" ? { accept: "application/vnd.github+json", authorization: `Bearer ${input.token}`, "content-type": "application/json" } : { authorization: `Bearer ${input.token}`, "content-type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
  if (!response.ok) throw new Error(`The provider rejected the webhook installation (HTTP ${response.status}). Re-authorize GitHub and confirm you have repository admin access.`);
  const result = z.object({ id: z.number().or(z.string()) }).parse(await response.json());
  return String(result.id);
}

export async function findProviderWebhook(input: { provider: GitProvider; token: string; repository: AccessibleRepository; callbackUrl: string }): Promise<string | null> {
  if (input.provider !== "github") return null;
  const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(input.repository.owner)}/${encodeURIComponent(input.repository.name)}/hooks`, { headers: { accept: "application/vnd.github+json", authorization: `Bearer ${input.token}` }, cache: "no-store" });
  if (!response.ok) throw new Error(`GitHub could not inspect repository webhooks (HTTP ${response.status}).`);
  const hook = githubHooks.parse(await response.json()).find((candidate) => candidate.config.url === input.callbackUrl);
  return hook ? String(hook.id) : null;
}

export async function removeProviderWebhook(input: { provider: GitProvider; token: string; repository: AccessibleRepository; providerWebhookId: string }): Promise<void> {
  const url = input.provider === "github"
    ? `https://api.github.com/repos/${encodeURIComponent(input.repository.owner)}/${encodeURIComponent(input.repository.name)}/hooks/${encodeURIComponent(input.providerWebhookId)}`
    : `https://gitlab.com/api/v4/projects/${encodeURIComponent(input.repository.externalId)}/hooks/${encodeURIComponent(input.providerWebhookId)}`;
  const response = await fetch(url, { method: "DELETE", headers: input.provider === "github" ? { accept: "application/vnd.github+json", authorization: `Bearer ${input.token}` } : { authorization: `Bearer ${input.token}` }, cache: "no-store" });
  if (!response.ok && response.status !== 404) throw new Error("The provider webhook cleanup failed.");
}
