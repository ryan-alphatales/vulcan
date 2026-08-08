# Vulcan Agent Instructions

## Project overview

Vulcan is a Next.js modular monolith for developer-focused, AI-assisted pull-request security scanning. Its core loop is account activation, repository connection, webhook-driven scans, and clear findings returned to GitHub or GitLab pull requests.

## Read first

- `.alphatales/architecture.md` and the relevant `.alphatales/application-workflow/` document.
- `PROJECT_STRUCTURE.md` for ownership boundaries.
- The matching folder `AGENTS.md` and relevant `.agents/rules/` files before edits.

## Architecture and stack

Use Next.js and TypeScript for the web and server runtime; PostgreSQL/Prisma for durable data; Redis/BullMQ for asynchronous scan and retry work; Auth.js for session-bound access; OpenAI for structured analysis; Resend for verification email; Sentry for production failures. Keep auth, repository integrations, scan orchestration, findings, and delivery as clearly separated modules within one deployable system.

## Commands

The bootstrap intentionally contains no Next.js entrypoints or feature code, so it is not buildable yet. After a feature adds valid entrypoints and dependencies are installed, use `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` as applicable.

## Quality and safety

- Keep changes scoped to an approved feature; do not infer product behavior beyond `.alphatales/`.
- Validate external input with Zod and keep provider callbacks/webhooks idempotent.
- Enforce authenticated ownership and provider-side permissions before repository or finding actions.
- Never commit credentials, OAuth tokens, webhook secrets, source-code payloads, or sensitive findings.
- Do not casually modify `.alphatales/`; it is a generated planning mirror.
- Do not add application code, pages, components, APIs, models, or migrations during bootstrap-only work.

Long-form standards live in `.agents/rules/`; folder-local contracts refine these instructions.


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
