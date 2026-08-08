# Vulcan Project Structure

Vulcan is a Next.js modular monolith. This is the bootstrap-only structure: it establishes ownership boundaries without adding application code.

```text
Vulcan/
|-- .agents/
|   `-- rules/
|-- .alphatales/
|-- .codex/
|   |-- agents/
|   `-- prompts/
|-- app/
|-- components/
|-- docs/
|-- lib/
|-- prisma/
|-- server/
|-- tests/
`-- workers/
```

- `app/`: future Next.js routes, layouts, and route handlers.
- `components/`: future reusable, presentation-focused UI.
- `lib/`: future shared framework-neutral utilities and typed contracts.
- `server/`: future domain modules, integrations, auth, persistence adapters, and orchestration entrypoints.
- `workers/`: future BullMQ worker entrypoints and job processors.
- `prisma/`: future Prisma schema and migrations.
- `tests/`: future unit, integration, contract, and workflow tests.
- `docs/`: durable developer and operational documentation.

No feature files, source entrypoints, migrations, components, or API handlers are part of this bootstrap.
