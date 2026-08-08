# Testing And Verification

## Scope

Defines completion evidence for the Vulcan scaffold and future Next.js, provider, database, and worker changes.

## Verification Levels

Use unit tests for domain decisions and parsers; integration tests for Prisma, provider adapters, queue handling, and route handlers; contract tests for webhook payloads and OpenAI structured outputs; and end-to-end checks for login, connection, scan, review, and recovery flows.

## Scaffold Checks

For bootstrap-only work, verify planned files, folder rules, generated planning mirror completeness, and absence of app code. The repository has no entrypoint yet, so do not claim a build passes.

## Feature Checks

Test every changed behavior at its nearest useful boundary. Webhook and retry changes need idempotency/failure coverage. Auth and repository changes need ownership and provider-permission coverage. Finding flows need confidence and triage-state persistence coverage.

## Regression Strategy

Start with targeted tests, then run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` when corresponding tooling and entrypoints exist.

## Manual Review

Review secrets exposure, provider callback UX, failure messages, and PR-feedback clarity. Avoid automated noise and ensure low-confidence findings are clearly distinguishable.

## Evidence Standard

Report the exact commands run, outcomes, and remaining gaps. Fresh evidence is required before completion claims.

## Blocked Verification

If dependencies or valid Next.js entrypoints are absent, say so explicitly rather than adding stubs to make checks pass.

## Do Not

Do not treat a typecheck or build as sufficient proof for webhook, permissions, worker, or security behavior.

