# Security And Privacy

## Scope

Applies to account/session data, repository access, PR diffs, scan findings, OAuth, webhooks, email, logs, and all external services.

## Secrets

Keep `OPENAI_API_KEY`, provider OAuth secrets/tokens, webhook secrets, `NEXTAUTH_SECRET`, `DATABASE_URL`, `REDIS_URL`, Resend credentials, and Sentry credentials in environment configuration only. `.env.example` may contain placeholders only.

## Authentication And Authorization

Protected actions require an Auth.js session tied to the account owner. Before repository connection or webhook installation, re-check provider-side permissions. Treat OAuth state and callback parameters as untrusted.

## Sensitive Data

Repository code, PR diffs, findings, and connection tokens are sensitive. Minimize what is sent to OpenAI, stored, displayed, or retained. Scope every finding/history action to the authorized account and repository.

## Logging

Use structured, redacted logs. Never log raw tokens, secrets, full source payloads, complete PR diffs, or sensitive finding content. Capture safe identifiers and failure categories in Sentry.

## External Services

Verify webhook signatures, validate payloads with Zod, use least-privilege provider scopes, and preserve audit trails without exposing confidential data.

## Local Development

Use local placeholder configuration. Never place real credentials in tests, fixtures, screenshots, or commits.

## Incident-Safe Behavior

Fail closed for unauthorized actions, report safe actionable failure reasons, and preserve enough redacted telemetry to investigate.

## Do Not

Do not expose secrets in client bundles, PR comments, share links, or exception messages.

## Review Checklist

- Are secrets and code payloads protected?
- Is access session- and ownership-scoped?
- Are webhooks verified and external inputs validated?
- Are logs and alerts redacted?

