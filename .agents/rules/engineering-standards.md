# Engineering Standards

## Scope

Applies to TypeScript, Next.js, Prisma, BullMQ, and test changes across Vulcan.

## Code Size And Structure

Prefer small, cohesive modules and explicit contracts. Avoid placeholder implementations and duplicate integration logic. Keep route handlers thin and background workers focused on job orchestration.

## Naming

Use TypeScript `camelCase` for values/functions, `PascalCase` for React components/types, kebab-case filenames where Next.js conventions do not dictate names, and SCREAMING_SNAKE_CASE for environment keys. Name provider and queue operations by their business action.

## Readability

Use strict TypeScript and Zod at trust boundaries. Explain non-obvious security, idempotency, and retry decisions in code or documentation.

## Dependency Discipline

Use the selected packages only when their role is clear. Keep framework/UI dependencies out of workers and direct SDK calls behind integration modules. Pin compatible package ranges and update the manifest deliberately.

## Configuration

Read configuration from environment variables; update `.env.example` with safe placeholders when adding a required key. Never commit `.env` files.

## Documentation

Update the relevant `.alphatales/`-adjacent documentation only when a planned feature explicitly requires it; never hand-edit the generated planning mirror. Update durable project docs and tests with behavior changes.

## Change Hygiene

Keep diffs narrow, delete dead code in the same ownership area, and inspect nearby conventions before editing. Do not mix unrelated refactors with feature work.

## Do Not

Do not hardcode credentials, database URLs, tokens, confidence thresholds, or provider assumptions. Do not silently suppress integration errors.

## Quality Gates

Run focused tests plus `npm run lint`, `npm run typecheck`, and relevant integration checks when entrypoints exist. Report checks that cannot run.

