# Vulcan

Vulcan is an AI-assisted pull-request security scanner. Developers create and
verify an account, connect a GitHub repository, and receive
security findings and safe failure notices in pull-request review. GitLab is
currently marked **Coming soon** in the product UI.

## Tech stack

- **frontend**: Next.js
- **backend**: Next.js
- **database**: PostgreSQL
- **hosting**: Vercel
- **auth**: Auth.js
- **ai_service**: DeepSeek
- **external_service**: GitHub API (GitLab is marked coming soon)
- **notifications**: Resend
- **background_jobs**: BullMQ
- **observability**: Sentry

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`. Generate a `TOKEN_ENCRYPTION_KEY` with
   `openssl rand -base64 32`; do not reuse production secrets locally.
3. Start PostgreSQL and Redis, then apply the durable schema:

   ```bash
   npx prisma migrate deploy
   ```

4. Verify the sender address configured by `EMAIL_FROM` in Resend before
   registering accounts. The default sender is `onboarding@parichay4.online`.

5. Start the web app and worker in separate terminals:

   ```bash
   npm run dev
   npm run worker
   ```

5. Open `http://localhost:3000`. Registration delivers a verification link;
   provider OAuth and real pull-request scans require the corresponding GitHub,
   GitLab, DeepSeek, Resend, Redis, and PostgreSQL configuration.

## How scanning works

1. A connected GitHub repository sends a pull-request webhook to Vulcan.
2. Vulcan records the event idempotently and queues a scan.
3. The always-on worker fetches the changed diff, requests structured DeepSeek analysis, stores high-confidence findings, and posts a PR result.

Multiple Vulcan accounts may independently connect the same GitHub repository. Vulcan reuses its existing GitHub webhook and fans each event out to account-scoped connections, so scan records and findings remain isolated.

## Verification

```bash
npx prisma validate
npm run lint
npm run typecheck
npm test
npm run build
```

The repository has unit and contract coverage for account activation, provider
webhook boundaries, diff extraction, scan orchestration, execution, and scan
settings. Live provider, email, database, queue, and model behavior must be
verified in a controlled environment with non-production credentials.

## Production deployment

Vulcan's web runtime runs on Vercel, while its BullMQ worker runs as a separate always-on Node process. The included `railway.toml` starts that worker with `npm run worker`. For the Vercel/Railway split, configure `WORKER_DISPATCH_URL` and `WORKER_DISPATCH_SECRET` in both environments; the web app sends authenticated jobs over HTTPS and the worker keeps Redis private.

See [the production deployment guide](./docs/production-deployment.md) for the
`parichay4.online` setup, provider callbacks, and worker deployment.

## Security notes

- Access tokens are encrypted before persistence and are never returned to the browser.
- Webhook payloads are signature-checked and delivery IDs are stored for idempotency.
- Pull-request code is fetched only in the worker and is not persisted with findings.
- Sentry is disabled unless `SENTRY_DSN` is set, and default PII collection is off.

## Planning context

Full architecture, PRD, application workflows, and per-feature specs
live under [`.alphatales/`](./.alphatales/). That folder is mirrored
from AlphaTales and refreshed on every bootstrap — treat it as the
source of truth, not as user-editable docs.
