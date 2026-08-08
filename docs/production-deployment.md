# Production deployment

Vulcan has two runtime processes:

- the **web application**, deployed to Vercel for pages, APIs, OAuth callbacks,
  and provider webhooks;
- the **scan worker**, deployed as an always-on Node process because Vercel
  serverless functions cannot keep a BullMQ worker alive between requests.

## 1. Provision production services

Create production PostgreSQL and Redis instances that are reachable by both
the Vercel project and the worker host. Apply the migration once, against the
production database:

```bash
npx prisma migrate deploy
```

Use a separate production Resend API key, DeepSeek API key, OAuth app secrets,
webhook secret, Auth.js secret, and token-encryption key. Do not reuse local
values.

## 2. Deploy the web application to Vercel

Import this repository into Vercel and configure its build command as:

```bash
npm run vercel-build
```

Add the variables from `.env.example` in Vercel's **Production** environment.
For the custom domain, set both public URL settings to:

```env
APP_URL=https://parichay4.online
NEXTAUTH_URL=https://parichay4.online
```

Attach `parichay4.online` in Vercel, then create the DNS records Vercel shows.
Wait until Vercel reports the domain as valid and HTTPS is active.

## 3. Deploy the worker

Deploy the same repository to an always-on Node-capable host (for example,
Railway, Render, Fly.io, or a VPS). Install dependencies and use:

```bash
npm run worker
```

Give the worker the same production `DATABASE_URL`, `REDIS_URL`,
`TOKEN_ENCRYPTION_KEY`, `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`,
`SCAN_CONFIDENCE_THRESHOLD`, and `APP_URL` as the web application. The worker
does not need Resend, Auth.js, OAuth-client, or webhook-secret credentials.

## 4. Update provider configuration

In the GitHub OAuth App, set the authorization callback URL to:

```text
https://parichay4.online/api/oauth/github/callback
```

Set the equivalent GitLab redirect URI if GitLab is enabled. Re-authorize each
provider after changing OAuth scopes or callback URLs.

New repository connections automatically install webhooks at:

```text
https://parichay4.online/api/webhooks/github
https://parichay4.online/api/webhooks/gitlab
```

## 5. Production smoke test

Use a disposable repository and pull request to verify:

1. registration, verification, and login;
2. GitHub OAuth and repository connection;
3. webhook delivery and BullMQ processing;
4. DeepSeek scan completion; and
5. exactly one pull-request result comment.

Temporary `trycloudflare.com` addresses are for local development only. Do not
register them as production OAuth callback URLs.
