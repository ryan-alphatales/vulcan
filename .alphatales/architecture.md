# Architecture & Technology Stack

Vulcan is a desktop-class web application for developers and security teams to activate accounts, connect Git repositories, receive pull-request webhook events, run AI-assisted code security scans, and post results back into pull-request workflows. The selected modular monolith keeps account, repository integration, scan orchestration, and result delivery in one deployable system while using background jobs for long-running and retryable work. This fits the current product scope, named GitHub and GitLab integrations, authenticated workspace access, email verification, and AI-based analysis without adding distributed-service overhead too early.

## Architecture Style

**Modular Monolith**

Vulcan has one primary end-to-end workflow: authenticate, connect a repository, receive webhook events, run AI-assisted scans, and return results to the pull request context. Keeping these capabilities in one deployable application reduces operational complexity while still allowing clear module boundaries for auth, repository integrations, scan orchestration, and reporting. Background jobs handle scan execution and retries without forcing a service split before scale or team structure requires it.

## Required Applications

- Desktop web workspace for account activation, repository connection, and scan status
- Admin or operator back-office surface for internal support and moderation needs
- Webhook ingestion endpoints for repository provider events
- Pull request feedback surface through provider comments or checks

## Core Stack

- **Next.js**
  - Desktop web workspace for account activation, repository connection, onboarding, and scan state views
  - The product requires a first-party desktop web surface for developers to register, activate accounts, connect repositories, and review scanning outcomes.
- **Next.js**
  - Application server for auth flows, provider callbacks, workspace APIs, webhook handling, and scan orchestration entrypoints
  - The main runtime must support user workflows, provider integrations, and internal orchestration in one deployable application layer.
- **PostgreSQL**
  - Persistent system of record for accounts, sessions, repositories, webhooks, scans, findings, and audit state
  - The product has relational state with strong ownership, permission, and lifecycle tracking needs across accounts, repositories, and scan runs.
- **Vercel**
  - Primary deployment platform for the web application and API runtime
  - The product needs a production web delivery platform that supports rapid iteration for a web-first launch.
- **Auth.js**
  - User authentication, session management, and provider OAuth session binding
  - The product requires authenticated account access, activation-scoped sessions, and protected workspace actions tied to the account holder.
- **OpenAI**
  - LLM-powered code security analysis and plain-language risk explanations
  - The product purpose explicitly depends on AI language models to analyze source code and explain security and data leak risks.
- **GitHub API**
  - Repository listing, OAuth-linked access checks, webhook registration, pull request context, PR comments, and optional checks updates
  - GitHub is a named product-critical source-control integration that shapes repository connection, scan triggering, failure notices, and result delivery workflows.
- **GitLab API**
  - Repository listing, OAuth-linked access checks, and webhook registration for supported GitLab repositories
  - GitLab is a named supported provider in the repository connection flow and must be represented explicitly.
- **Resend**
  - Transactional email for verification and account lifecycle messaging
  - Account verification and activation depend on email-based transactional communication.
- **BullMQ**
  - Async scan execution, retry handling, webhook follow-up, and failure-notice delivery
  - Webhook-driven scans, rescan requests, and failure notifications require durable background processing outside the request cycle.
- **Sentry**
  - Application error tracking for webhook handling, provider callbacks, and scan orchestration
  - The product depends on external integrations and async workflows where failures must be traceable in production.

## Supporting Tools

- **TypeScript**
  - Type-safe UI and shared contracts
  - Supports one typed codebase across the desktop web surface and server logic.
- **Tailwind CSS**
  - Fast UI composition for workspace and onboarding screens
  - Speeds delivery of the desktop web workspace without adding a separate design-system platform.
- **React Hook Form**
  - Form state and validation for registration and repository setup
  - Improves UX on the product's form-heavy onboarding paths.
- **Route Handlers**
  - HTTP endpoints for callbacks, webhooks, and internal APIs
  - Fits the selected application framework without adding a separate backend platform.
- **Zod**
  - Runtime validation for webhook payloads and integration inputs
  - Protects the application boundary for external callbacks and structured internal commands.
- **Prisma**
  - Typed database access for accounts, repositories, scans, and webhook state
  - Provides the necessary persistence pairing for PostgreSQL in a TypeScript application.
- **Prisma Migrate**
  - Schema evolution and safe database migrations
  - Required to manage relational lifecycle changes across account, repository, and scan entities.
- **PgBouncer**
  - Connection pooling for PostgreSQL
  - Helps the web runtime and workers share database access efficiently in production.
- **PostgreSQL Full Text Search**
  - Search and filtering over first-party scan records
  - Covers likely record lookup needs without adding a separate search service.
- **Vercel Postgres**
  - Managed PostgreSQL paired with the deployment platform
  - Keeps the first production stack operationally simple for a web-first launch.
- **Vercel Cron**
  - Scheduled triggers for cleanup and recovery jobs
  - Supports lightweight scheduled maintenance without separate infrastructure early on.
- **Edge Config**
  - Runtime configuration for feature controls
  - Supports controlled rollout of provider and scan workflow behavior.
- **OAuth 2.0**
  - Provider authorization flow for GitHub and GitLab connections
  - Repository connection requires provider authorization and callback handling.
- **Secure Cookies**
  - Session transport for authenticated workspace access
  - The product requires account-bound sessions for protected actions.
- **Repository Permission Checks**
  - Provider-side permission verification before webhook installation
  - Webhook registration must validate repository admin or webhook-management rights.
- **OpenAI Responses API**
  - Model inference for security finding explanation
  - Supports the core AI analysis and explanation workflow.
- **Prompt Versioning**
  - Controlled evolution of scan instructions and explanation formats
  - Helps keep findings consistent as the product improves its analysis behavior.
- **Structured Outputs**
  - Machine-readable finding payloads for downstream workflow handling
  - Supports reliable storage and presentation of AI-derived findings.
- **GitHub Webhooks**
  - Pull request event delivery into Vulcan
  - Repository-triggered scans depend on provider event delivery.
- **GitHub PR Review Comments API**
  - Failure notice and feedback posting in pull-request threads
  - A named accepted feature requires posting failure notices in GitHub pull requests.
- **GitHub Checks API**
  - Optional status updates alongside PR feedback
  - Supports richer pull-request status reporting where used.
- **GitLab OAuth**
  - Provider authorization for GitLab repository access
  - GitLab is a supported repository connection option.
- **GitLab Webhooks**
  - Repository event delivery for GitLab-connected projects
  - GitLab repository-triggered scans require provider event delivery.
- **GitLab Repositories API**
  - Repository listing and access checks
  - The repository connection flow must list repositories and validate access.
- **SMTP Delivery**
  - Email transport fallback through the selected provider
  - Ensures transactional email delivery remains straightforward to operate.
- **Email Templates**
  - Verification and lifecycle message formatting
  - Account activation requires consistent transactional messaging.
- **Delivery Status Tracking**
  - Operational visibility into verification email outcomes
  - Verification failures affect onboarding completion and support handling.
- **Redis**
  - Queue backing store for durable job processing
  - BullMQ requires a reliable queue data store for scan and retry workflows.
- **Worker Process**
  - Execution runtime for scans and retryable tasks
  - Long-running scan work should run outside the user request cycle.
- **Retry Policies**
  - Controlled retry behavior for webhook follow-up and failure notices
  - The product includes retry-sensitive workflows and one-click rescan handling.
- **Structured Logs**
  - Traceable operational records across callbacks, jobs, and provider interactions
  - Helps diagnose integration and background processing failures.
- **Webhook Audit Trails**
  - Event receipt and processing history for provider deliveries
  - Webhook installation and processing require production troubleshooting visibility.
- **Job Metrics**
  - Visibility into queue depth, failures, and processing latency
  - Async scan execution needs operational monitoring.

## Implementation Decisions

### Data Layer

Use a relational core data model centered on account ownership, provider-linked repository connections, webhook lifecycle, and scan run history.

- **Primary persistence:** PostgreSQL as the transactional system of record
  - Accounts, sessions, repositories, webhooks, scans, and findings are relational and need reliable lifecycle tracking.
- **Data access:** Prisma for typed persistence and migrations
  - Keeps application and worker data access consistent while supporting rapid schema evolution early on.
- **Search approach:** Use PostgreSQL full-text search for first-party records
  - Current scope suggests filtering and lookup over Vulcan-owned scan records, not a separate search platform.

### Cloud & Delivery

Deploy the modular monolith as a web-first application with separate worker execution for background jobs and lightweight scheduled maintenance.

- **Primary deployment:** Vercel for the main web application runtime
  - Matches the desktop-class web product and reduces infrastructure overhead for early releases.
- **Async execution:** BullMQ workers backed by Redis for scans and retries
  - Webhook-triggered scans and failure-notice delivery are async and should not depend on request lifetimes.
- **Scheduled operations:** Use Vercel Cron for cleanup and recovery tasks
  - Supports lightweight scheduled jobs without adding another scheduler early on.

### Security & Access

Bind all protected actions to authenticated user sessions and re-check provider-side repository permissions before sensitive integration steps.

- **User authentication:** Auth.js sessions scoped to the activated account holder
  - The source requires that only the account owner may activate and access protected workspace features through a valid session.
- **Provider authorization:** OAuth-based GitHub and GitLab connection flows
  - Repository listing, access verification, and webhook registration depend on provider-linked authorization.
- **Permission enforcement:** Verify repository admin or webhook-management rights before webhook registration
  - Accepted permissions explicitly require provider-side permission checks before installing webhooks.

### Supporting Capabilities

Add focused supporting services for AI analysis, transactional email, observability, and internal operational access.

- **AI analysis:** OpenAI for code risk analysis and plain-language explanations
  - The product purpose explicitly depends on AI language models to identify security and data leak risks.
- **Notifications:** Resend for verification and lifecycle email
  - Account activation depends on verification completing successfully.
- **Observability:** Sentry plus structured logs and job metrics
  - Webhook, callback, and background processing failures must be diagnosable in production.
- **Internal operations:** Provide an internal admin surface within the main application boundary
  - The coverage contract requires admin support, and a bounded internal surface fits the modular monolith without adding another product.

