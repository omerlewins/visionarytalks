# Setup and deployment

## Local design review

Use Node.js 22 or newer. Run `npm ci` in `app/`. Copy `.env.example` to `.env.local`.
For design-only review set `APP_ENV=development`, `DEMO_MODE=true` and run `npm run dev`.
The public fixture routes do not need a database. They are explicitly noindex and labeled.

For the CMS, start your PostgreSQL instance, or run `node scripts/local-postgres.mjs`.
The optional local test runtime binds to 127.0.0.1:54329 and writes randomly generated
development credentials into ignored files. It does not provision a cloud resource.
The script creates `.env.local` only if it does not already exist; configure an existing
file yourself. Keep `APP_ENV=development` for local schema push. Never use schema push
against production.

Bootstrap an empty CMS with `BOOTSTRAP_ADMIN_EMAIL` and a 20+ character
`BOOTSTRAP_ADMIN_PASSWORD` in the server environment, then:

```
node --env-file=.env.local --import tsx scripts/bootstrap-admin.ts
```

Remove those variables immediately afterwards. `/admin` uses Payload authentication.
Administrator/editor/contributor roles are enforced server-side; a contributor cannot
publish, modify an already-published record, approve media or change their own role.

## Vercel: what to do on the free plan

The current default `vercel.json` has **no scheduled cron**, so it does not request a
minute-level schedule unsupported by Hobby. You can continue local development for
free. Vercel's Hobby plan is restricted to personal, non-commercial use; a commercial
publication needs an eligible plan before hosted commercial operation. Do not assume
an external scheduler changes that restriction.

When ready for an eligible hosted staging environment:

1. Vercel → Add New → Project → import `omerlewins/visionarytalks`.
2. Select the implementation branch for review. Set **Root Directory: `app`**,
   framework **Next.js**, Node **22.x**, install `npm ci`, build `npm run build`.
3. Use the supplied Vercel hostname. Do **not** add `visionarytalks.com` or change DNS.
4. Create a staging PostgreSQL database/branch and a private S3-compatible bucket.
   Keep bucket public access blocked. Set the variables below in the project's private
   environment settings. Do not paste credentials into chat or GitHub.
5. Vercel calls its designated default-branch environment "Production", even before
   your domain is connected. For a review deployment, use a branch **Preview**:
   `APP_ENV=preview`, `DEMO_MODE=true`, isolated credentials. Production builds reject
   fixtures. Enable Vercel deployment protection where available.
6. Run `npm run migrate` from a trusted environment pointed at staging before deploying
   CMS code. Review schema migrations separately; the build does not auto-migrate.
7. Bootstrap the administrator, review `/admin` and the public preview. Switch
   `DEMO_MODE=false` only when reviewing actual CMS content.

For manual job testing from the trusted local environment:

```
node --env-file=.env.local --import tsx scripts/run-jobs.ts
```

On Pro/Enterprise, adopt the schedule in `vercel.pro.example.json` and set `CRON_SECRET`.
Alternatively, an owner-designated external scheduler can invoke
`GET /api/payload-jobs/run?limit=1` with `Authorization: Bearer <CRON_SECRET>`.
Nothing has been provisioned, subscribed to, or charged by this repository.
The API route allows 300 seconds, but generation uses bounded requests and persisted
background response IDs. Validate the selected project's duration limits and worker
cadence before calling the agents operational. Cron on Vercel is for production
deployments; use manual execution or a designated staging scheduler for previews.

Official references checked October 8, 2026:
- https://vercel.com/docs/plans/hobby
- https://vercel.com/docs/cron-jobs/usage-and-pricing
- https://vercel.com/docs/functions/configuring-functions/duration
- https://payloadcms.com/docs/getting-started/installation
- https://payloadcms.com/docs/upload/storage-adapters

## Environment variables

The owner's requested Hobby review project is `omer-webielcoms-projects/visionarytalks`,
linked to GitHub with root `app`. Its Preview environment has a separate free Neon
database and a private Vercel Blob store. Production credentials are intentionally
unset. Keep Vercel Authentication enabled. This is staging, not commercial launch
acceptance or a representation that Hobby has a commercial-use exception.

Private Blob is an alternative to S3: set `BLOB_STORE_ID` with Vercel OIDC, or
`BLOB_READ_WRITE_TOKEN` for trusted local migration. The Payload adapter streams
objects through protected collection file routes; it never makes the underlying
store public. Local migrations use the ignored `private/.env.vercel-preview` file.
Do not copy `.env.local` into a deployment or reuse preview credentials in production.

| Variable | Purpose |
| --- | --- |
| `APP_ENV` | `development`, `preview`, or `production`; hosted environments validate the Vercel scope |
| `DEMO_MODE` | Explicit design fixtures; forbidden in production |
| `NEXT_PUBLIC_SITE_URL` | Correct origin for canonical, sitemap and social URLs |
| `DATABASE_URL` | PostgreSQL URL; use different databases/branches and credentials for preview and production |
| `PAYLOAD_SECRET` | Random secret, 32+ characters; different for each environment |
| `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT` | Private durable object storage; separate bucket/credentials per environment |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Least-privilege bucket credentials, server-side only |
| `CRON_SECRET` | Authorizes the persistent job runner endpoint |
| `CONTENT_PROVIDER`, `IMAGE_PROVIDER` | Set either to `openai` for the built-in adapter; otherwise use the HTTPS bridge |
| `OPENAI_API_KEY` | Scoped server-side project key; set provider spend limits privately |
| `OPENAI_TEXT_MODEL` | Explicit approved model supporting Responses background mode and JSON output |
| `OPENAI_IMAGE_ORCHESTRATOR_MODEL`, `OPENAI_IMAGE_MODEL` | Explicit approved Responses/tool models; no automatic model substitution |
| `CONTENT_PROVIDER_URL`, `CONTENT_PROVIDER_TOKEN` | Optional alternate drafting bridge |
| `IMAGE_PROVIDER_URL`, `IMAGE_PROVIDER_TOKEN` | Optional alternate illustration bridge |

Private uploads and unpublished illustrations must not go into a public bucket.
The application supports Payload's S3 adapter or its custom private Vercel Blob
adapter with collection access checks and authenticated file routes.
Hosted environments refuse local filesystem storage fallback.

## Validation commands

```
npm run typecheck
npm test
npm run build
npx playwright install chromium webkit
npm run dev
npm run test:e2e
node --env-file=.env.local --import tsx scripts/verify-cms.ts
node --env-file=.env.local --import tsx scripts/verify-workflows.ts
```

Set `TEST_CMS=true` to include authenticated CMS browser checks after local fixture
setup. Test scripts are restricted to the development environment. Local browser
credentials, exports, logs, screenshots and test reports stay out of Git.

## Backup, release and rollback

Enable managed PostgreSQL point-in-time recovery and bucket versioning/retention.
Demonstrate a restore into a separate database/bucket before launch. Run migrations
once in an explicit release step, not concurrently from every Vercel build. Keep
application changes compatible with the previous schema for deployment rollback.
Do not execute generated down migrations against production without a reviewed
data-restoration plan. Keep WordPress and a secure full backup available throughout
staging and the final delta import. Domain cutover requires the owner's explicit
approval after content, media and URL reconciliation.
