# AlphaTales implementation audit

This audit records current code evidence for the first-version AlphaTales
features. PostgreSQL migration status, Redis, BullMQ, worker startup, DeepSeek
authentication, and the GitHub PR workflow have been checked locally. GitLab
is intentionally presented as coming soon and is not enabled for new
connections.

| Feature | Code evidence | Current verification |
| --- | --- | --- |
| Account activation and session start | `server/accounts/service.ts`, `server/auth/session-token.ts`, `/verify`, `/workspace` | Verified in the live tunnel with account activation and workspace access. |
| Webhook installation | `server/repository-connection/service.ts`, `server/integrations/repositories.ts` | Verified on the GitHub test repository. |
| Connection success | `components/repository-selection.tsx`, workspace repository list | Verified for GitHub in the live tunnel. |
| Git provider selection | `/connect`, OAuth start routes | GitHub verified; GitLab is explicitly unavailable in the product UI pending live provider verification. |
| Account registration | `/api/register`, `components/register-form.tsx` | Unit coverage for duplicate and validation behavior. |
| One-click rescan | `server/scans/rescan-service.ts`, `/api/scans/[scanId]/rescan` | Verified against GitHub PR #1 after OAuth token refresh. |
| Scan failure notice | `server/scans/provider-notifier.ts`, `server/scans/failures.ts` | Unit execution failure coverage; needs provider comment test. |
| Provider OAuth authorization | OAuth routes, signed state, encrypted token storage | OAuth callback and token refresh verified for GitHub; GitLab still needs live verification. |
| Workspace resumption | `server/workspace/read-model.ts`, `/workspace` | Verified through an authenticated live session. |
| Plain-language explanation | `server/scans/deepseek-analyzer.ts`, scan detail route | DeepSeek structured-output contract verified live with persisted findings on GitHub PRs #2–#4. |
| On-demand PR scan | `components/manual-scan-form.tsx`, `/api/scans`, `ManualScanService` | Browser-triggered scan of an open GitHub PR verified through queue, worker, DeepSeek analysis, and completion. |
| Scan history | `server/findings/service.ts`, `components/scan-history-list.tsx`, `/history` | Authenticated browser flow verified, including repository/branch search and status filtering. |
| Automatic PR scan | webhook route, `ScanOrchestrator`, BullMQ worker | GitHub PRs #1–#4 completed through webhook/rescan, queue, diff extraction, DeepSeek analysis, and result delivery. |
| Secure account login | Auth.js credential provider, login form, sign out | Verified in the live tunnel after session-ID propagation fix. |
| Past finding review | `getScanForAccount`, `/scans/[scanId]` | Account-scoped finding detail and triage controls verified in authenticated browser QA. |
| Credential error guidance | Generic credentials failure in Auth.js login flow | Enumeration-safe behavior implemented; needs browser/error timing review. |
| Repository selection | repository list API and selection component | Verified for the connected GitHub repository. |
| Changed-code extraction | `server/scans/diff-extraction.ts` | Unit coverage for additions, empty, invalid, unavailable diffs. |
| Email verification | verification API/page and resend API/form | Verified in the live tunnel, including activation and session creation. |
| Connection failure recovery | `lib/repository-connection.ts`, `/connect/recovery` | Unit coverage for recognized and unknown failure states. |

## Code-level evidence

The following checks have passed locally:

```bash
npx prisma validate
npx prisma migrate status
npm run lint
npm run typecheck
npm test
npm run build
```

Redis `PING`, BullMQ queue initialization, and a five-second `npm run worker`
startup window also passed. The production build's public routes returned 200,
protected routes redirected to login, and invalid registration input returned
400.

## Live verification still required

- Complete live GitLab OAuth, repository, webhook, and worker verification
  before replacing its “Coming soon” status.
- Deploy to a stable public domain and update the provider OAuth callback URL;
  temporary Cloudflare Quick Tunnel URLs are suitable only for development.
