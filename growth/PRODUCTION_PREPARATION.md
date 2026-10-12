# Production preparation — October 12, 2026

The owner completed Neon CLI sign-in. Vercel's existing Neon integration provisioned a separate free resource named `visionarytalks-production`, project `rough-wave-60456912`, in AWS US East 1. Preview remains project `calm-meadow-38652801`; its credentials were not reused. A separate private Vercel Blob store named `visionarytalks-production` was connected only to the Production environment.

All five repository migrations passed first on the isolated `launch-rehearsal` branch and then on the new empty Production database. Migration connections were direct; the Production migration environment explicitly uses certificate verification. This is schema preparation, not evidence that content migration, restore rehearsal, admin bootstrap or launch has finished.

Production Google settings were backed up, saved and read back: domain Search Console property `sc-domain:visionarytalks.com`, GA4 property `530033839`, measurement ID `G-1YPKS2X7JE`, consent-based tracking enabled. Google reporting credentials are absent. The tracking integration does not require reporting credentials. Browser checks stubbed Google requests and confirmed consent behavior without generating test visits.

Fresh application and job secrets are held only in ignored private environment files. They still need to be installed in Vercel's Production environment, alongside explicit `APP_ENV=production`, `DEMO_MODE=false` and the publication URL. No secrets or credentials are committed in this document.

No research batch has been synchronized into Production, no domain or DNS settings have changed, and no full database clone has imported Preview users, private jobs or review records. Before cutover: finish the 32 editorial reviews, implement the approved publication transfer, verify all original routes and media on the production candidate, establish administrator access and backup/restore, install the remaining environment settings, and confirm the candidate deployment. Preserve Google verification TXT and email DNS records when switching hosting. Verify a real consented visit in GA4 Realtime after launch.
