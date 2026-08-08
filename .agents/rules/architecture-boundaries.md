# Architecture Boundaries

## Scope

Applies to Vulcan's Next.js modular monolith and the `app/`, `components/`, `lib/`, `server/`, `workers/`, `prisma/`, and `tests/` areas.

## Architecture Style

Vulcan is one deployable Next.js application with separate asynchronous worker execution. The core journey is authenticated repository connection, webhook receipt, durable scan execution, and provider feedback. Keep it modular; do not split services without demonstrated operational or ownership pressure.

## Module Ownership

`app/` owns routing and HTTP boundaries. `components/` owns reusable UI. `server/` owns domain behavior, Auth.js integration, provider adapters, orchestration, and persistence coordination. `workers/` owns BullMQ job execution. `prisma/` owns schema and migrations. `lib/` holds framework-neutral shared contracts and utilities.

## Dependency Direction

UI and route handlers may depend on server-facing contracts, never on worker internals. Workers may use server domain/integration abstractions but must not import UI. Prisma is accessed through server-owned persistence boundaries; provider APIs, OpenAI, Resend, Redis, and Sentry stay behind server or worker adapters.

## Data And Integration Boundaries

PostgreSQL is the durable source of truth for accounts, repositories, webhook state, scans, findings, and audit history. Redis is queue/state infrastructure, not a replacement for durable records. Provider callbacks and webhooks are untrusted boundaries; validate, authenticate, and record idempotency before work is queued.

## Folder Responsibilities

Follow `PROJECT_STRUCTURE.md` and the nearest folder `AGENTS.md`. Preserve the distinction between synchronous web flow and retryable background scan flow.

## Change Rules

Make extraction-ready module boundaries, but do not pre-emptively create services. Any new provider, queue, or persistence integration needs explicit data ownership, retry, failure, and observability decisions.

## Do Not

Do not invent product behavior not supported by `.alphatales/`. Do not bypass session ownership, provider permission checks, or domain boundaries.

## Review Checklist

- Is ownership clear and dependency direction respected?
- Are request lifetimes separate from long-running scans?
- Are PostgreSQL, Redis, and external integrations used in their defined roles?
- Does the change preserve GitHub/GitLab, Auth.js, OpenAI, and worker boundaries?

