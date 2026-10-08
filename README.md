# Visionary Talks

Production application foundation for the approved Visionary Talks editorial design.

- `design-reference/`: unchanged supplied archive contents, including the full handoff.
- `app/`: Next.js + TypeScript, Payload CMS, PostgreSQL, private S3-compatible media,
  CMS templates, trackers, persistent content jobs, migration tools and tests.
- `IMPLEMENTATION_PLAN.md`: phased scope and acceptance gates.
- `app/docs/SETUP.md`: local setup and exact Vercel steps.
- `app/docs/ACCEPTANCE.md`: verified work, remaining implementation and external gates.

This is not a migrated or launched WordPress replacement. The live domain remains on
WordPress. Design fixtures cannot run with the production environment setting.

From `app/`: `npm ci`, configure `.env.local`, then `npm run dev`.
Open http://localhost:3000 for design review and `/admin` for Payload.
