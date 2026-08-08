# app/

## Purpose

Next.js routes, layouts, and HTTP boundaries.

## Allowed Content

Add only files that belong to this ownership boundary. Follow `PROJECT_STRUCTURE.md`, root `AGENTS.md`, and the relevant `.agents/rules/` standards.

## Boundaries

Do not place unrelated feature code here. Inspect nearby patterns before editing. Keep Next.js UI and route code out of workers; keep secrets, raw tokens, and sensitive code payloads out of commits and logs.

## Verification

Add focused tests appropriate to changed behavior and run the applicable project checks once valid entrypoints exist.

## Do Not

Do not bypass authenticated ownership, provider permission checks, webhook validation, idempotency, or the durable-data boundary.
