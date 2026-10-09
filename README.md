# Visionary Talks

Production application foundation for the approved Visionary Talks editorial design.

- `design-reference/`: unchanged supplied archive contents, including the full handoff.
- `app/`: Next.js + TypeScript, Payload CMS, PostgreSQL, private Blob/S3 media,
  CMS templates, trackers, persistent content jobs, migration tools and tests.
- `IMPLEMENTATION_PLAN.md`: phased scope and acceptance gates.
- `app/docs/SETUP.md`: local setup and exact Vercel steps.
- `app/docs/ACCEPTANCE.md`: verified work, remaining implementation and external gates.

The supplied 107 articles have been imported into isolated staging. The live domain
remains on WordPress, and production launch still requires the acceptance gates.
Design fixtures cannot run with the production environment setting.

The protected [Vercel review deployment](https://visionarytalks-k3w6beotz-omer-webielcoms-projects.vercel.app)
is in the owner's Hobby workspace. Sign in to Vercel with the owning account to review.
It uses separate Preview credentials, Neon PostgreSQL and private Vercel Blob storage.

From `app/`: `npm ci`, configure `.env.local`, then `npm run dev`.
Open http://localhost:3000 for design review and `/admin` for Payload.
