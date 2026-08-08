import { z } from "zod";

import type { GitProvider } from "@/lib/contracts";

const tokenResponseSchema = z.object({ access_token: z.string().min(1), token_type: z.string().optional(), scope: z.string().optional(), expires_in: z.number().optional() });
const githubIdentitySchema = z.object({ id: z.number().or(z.string()) });
const gitLabIdentitySchema = z.object({ id: z.number().or(z.string()) });

type OAuthConfiguration = { clientId: string; clientSecret: string; authorizationUrl: string; tokenUrl: string; scopes: string[] };

function config(provider: GitProvider): OAuthConfiguration {
  // GitHub OAuth Apps require repository scope to create webhook-backed PR
  // comments. `repo:status` alone cannot publish the scan result or failure
  // notice, even when webhook administration is granted.
  if (provider === "github") return { clientId: required("GITHUB_CLIENT_ID"), clientSecret: required("GITHUB_CLIENT_SECRET"), authorizationUrl: "https://github.com/login/oauth/authorize", tokenUrl: "https://github.com/login/oauth/access_token", scopes: ["read:user", "repo", "admin:repo_hook"] };
  return { clientId: required("GITLAB_CLIENT_ID"), clientSecret: required("GITLAB_CLIENT_SECRET"), authorizationUrl: "https://gitlab.com/oauth/authorize", tokenUrl: "https://gitlab.com/oauth/token", scopes: ["read_user", "read_api", "read_repository", "api"] };
}
function required(key: string): string { const value = process.env[key]; if (!value) throw new Error(`${key} must be configured.`); return value; }

export function createAuthorizationUrl(provider: GitProvider, state: string): URL {
  const settings = config(provider);
  const url = new URL(settings.authorizationUrl);
  url.searchParams.set("client_id", settings.clientId);
  url.searchParams.set("redirect_uri", new URL(`/api/oauth/${provider}/callback`, required("APP_URL")).toString());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", settings.scopes.join(" "));
  url.searchParams.set("state", state);
  return url;
}

export async function exchangeOAuthCode(provider: GitProvider, code: string): Promise<{ token: string; scopes: string[]; expiresAt?: Date; providerAccountId: string }> {
  const settings = config(provider);
  const response = await fetch(settings.tokenUrl, { method: "POST", headers: { accept: "application/json", "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: settings.clientId, client_secret: settings.clientSecret, code, redirect_uri: new URL(`/api/oauth/${provider}/callback`, required("APP_URL")).toString(), grant_type: "authorization_code" }), cache: "no-store" });
  if (!response.ok) throw new Error("The provider did not accept the authorization response.");
  const tokenResult = tokenResponseSchema.parse(await response.json());
  const identityResponse = await fetch(provider === "github" ? "https://api.github.com/user" : "https://gitlab.com/api/v4/user", { headers: provider === "github" ? { accept: "application/vnd.github+json", authorization: `Bearer ${tokenResult.access_token}` } : { authorization: `Bearer ${tokenResult.access_token}` }, cache: "no-store" });
  if (!identityResponse.ok) throw new Error("The provider identity could not be verified.");
  const identity = provider === "github" ? githubIdentitySchema.parse(await identityResponse.json()) : gitLabIdentitySchema.parse(await identityResponse.json());
  return { token: tokenResult.access_token, scopes: tokenResult.scope?.split(/[ ,]+/).filter(Boolean) ?? settings.scopes, expiresAt: tokenResult.expires_in ? new Date(Date.now() + tokenResult.expires_in * 1000) : undefined, providerAccountId: String(identity.id) };
}
