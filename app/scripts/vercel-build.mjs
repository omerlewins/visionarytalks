// Vercel build entry. Only a Preview build for a branch that sets
// PREVIEW_CMS_SYNC=1 (a branch-scoped Preview variable) touches the isolated
// Preview database before building: pending migrations, then the reviewed
// Preview content import. A Production build imports the approved articles
// only when PRODUCTION_CMS_IMPORT names this batch, and only after the build
// succeeds. Every other build only builds.
import { execSync } from "node:child_process";
const run = (command, env = {}) =>
  execSync(command, { stdio: "inherit", env: { ...process.env, ...env } });
if (
  process.env.PREVIEW_CMS_SYNC === "1" &&
  process.env.VERCEL_ENV === "preview" &&
  process.env.APP_ENV === "preview" &&
  process.env.NEON_PROJECT_ID === "calm-meadow-38652801"
) {
  // Migrations use the direct connection, as the earlier Preview runs did.
  run("npx payload migrate", {
    DATABASE_URL: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
  });
  run("npx tsx scripts/import-kd10-preview.ts --apply");
}
run("npm run build");
if (
  process.env.PRODUCTION_CMS_IMPORT === "kd10-2026-10" &&
  process.env.VERCEL_ENV === "production" &&
  process.env.APP_ENV === "production" &&
  process.env.NEON_PROJECT_ID === "rough-wave-60456912"
)
  run("npx tsx scripts/import-kd10-preview.ts --production --apply");
