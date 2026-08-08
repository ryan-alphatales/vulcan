# Integrations And Data

## Scope

Applies to PostgreSQL/Prisma, Redis/BullMQ, GitHub, GitLab, OpenAI, Resend, Vercel, and Sentry integrations.

## Owned Data

PostgreSQL owns account, repository, webhook, scan, finding, triage, and audit state. Prisma migrations must be explicit, reviewed, and backwards-aware.

## Redis And Cache Boundaries

Redis supports BullMQ queues and short-lived operational state. Every new key or cache requires an owner, prefix, TTL/invalidation plan, and safe behavior on cache loss.

## External Integrations

GitHub/GitLab manage repository and PR context; verify permissions before webhook registration. OpenAI generates structured, versioned analysis outputs. Resend delivers verification email. Sentry receives redacted operational errors.

## Retries And Idempotency

Webhook delivery, scan jobs, retry links, provider comments, and email follow-up need idempotency keys or durable status checks. Define bounded retries and distinguish transient failures from access or validation failures.

## Failure Modes

Classify repository access, provider, OpenAI, queue, database, and timeout failures. Notify users through safe actionable PR feedback and keep PR merges non-blocking per the product workflow.

## Observability

Record redacted structured events, queue latency/failures, webhook delivery status, and correlation IDs. Never use observability as a route to exfiltrate code or tokens.

## Do Not

Do not treat Redis as source of truth, retry non-idempotent side effects blindly, or hide provider failure causes.

## Review Checklist

- Is durable state in PostgreSQL and transient queue state in Redis?
- Are side effects idempotent with bounded retries?
- Are provider/OpenAI failures classified and observable?
- Are audit and logs safe to retain?

