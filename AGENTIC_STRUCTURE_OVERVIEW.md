# Vulcan Agentic Structure

## What We Built

A bootstrap-only engineering foundation for Vulcan: a Next.js modular monolith for AI-assisted pull-request security scanning. It contains planning context, high-level ownership boundaries, configuration, and agent guidance—no product implementation.

## Main Building Blocks

- Next.js/TypeScript web and server runtime.
- PostgreSQL/Prisma for durable account, repository, scan, finding, and audit state.
- Redis/BullMQ for asynchronous scans, retries, and failure follow-up.
- Auth.js, GitHub/GitLab, DeepSeek, Resend, and Sentry integrations.

## Rules And Folder Guidance

Start with `AGENTS.md`, then the nearest folder `AGENTS.md`. Long-form standards are in `.agents/rules/`: architecture boundaries, engineering standards, testing, security/privacy, and integrations/data. `PROJECT_STRUCTURE.md` defines folder ownership.

## Project Workflow

The planned product flow is activate account, connect GitHub/GitLab repository, receive a PR webhook, queue a scan, produce structured findings, post PR feedback, and support finding triage and recovery.

## Project Areas

`app/`, `components/`, `lib/`, `server/`, `workers/`, `prisma/`, `tests/`, and `docs/` are deliberately empty of application code at bootstrap.

## Skills

No skills were installed during bootstrap: the generated 42-query skills registry sweep requires verified per-query registry selection and is deferred rather than fabricating skills. Future skills must be installed only under `.agents/skills/`.

## Specialist Roles Or Subagents

Codex-native, read-only reviewers are available in `.codex/agents/`: architecture reviewer, test reviewer, final verifier, NestJS/TypeScript reviewer, and Redis integration reviewer. Their matching prompts are under `.codex/prompts/`.

## Receipts And Completion Evidence

The local planning mirror has 29 server-generated AlphaTales files. Configuration and instructions are intentionally separate from future product source. Bootstrap verification records confirm no source files, pages, components, handlers, models, or migrations were created.

## Checks

Once feature work supplies entrypoints and dependencies are installed, run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` as applicable.

## Current Inventory

See `PROJECT_STRUCTURE.md` for the filesystem tree and `.alphatales/` for architecture, workflows, PRD, and feature planning.

## Current Factory Health

Ready for the first AlphaTales feature task. Not buildable by design: no source entrypoints have been created.

## Standard Agent Flow

Read planning and local rules; retrieve a feature through AlphaTales; make the smallest owned change; run focused verification; report commands, evidence, and remaining risks.

## Completion Standard

A change is complete only when it meets its planned acceptance checks, respects the boundaries above, has appropriate fresh verification evidence, and reports any blocked checks or residual risk.
