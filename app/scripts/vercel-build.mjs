// Vercel build entry. Only a Preview build for a branch that sets
// PREVIEW_CMS_SYNC=1 (a branch-scoped Preview variable) touches the isolated
// Preview database before building: pending migrations, then the reviewed
// Preview content import (PREVIEW_CMS_BATCH, default kd10-2026-10). A
// Production build imports approved articles only when PRODUCTION_CMS_IMPORT
// names a known batch, and only after the build succeeds;
// PRODUCTION_LEADER_REFRESH=<slug> likewise rewrites one approved leader
// profile story. Every other build only builds.
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
  run(
    "npx tsx scripts/import-kd10-preview.ts --apply --batch " +
      (process.env.PREVIEW_CMS_BATCH || "kd10-2026-10"),
  );
  if (process.env.PREVIEW_LEADER_REFRESH)
    run(
      "npx tsx scripts/refresh-leader-story.ts --apply --slug " +
        process.env.PREVIEW_LEADER_REFRESH,
    );
}
run("npm run build");
const productionBatch = process.env.PRODUCTION_CMS_IMPORT;
if (
  ["kd10-2026-10", "nuuly-2026-10", "refresh-2026-10", "plan-2026-11"].includes(productionBatch) &&
  process.env.VERCEL_ENV === "production" &&
  process.env.APP_ENV === "production" &&
  process.env.NEON_PROJECT_ID === "rough-wave-60456912"
)
  run(
    "npx tsx scripts/import-kd10-preview.ts --production --apply --batch " +
      productionBatch,
  );
if (
  ["leopold-aschenbrenner"].includes(process.env.PRODUCTION_LEADER_REFRESH) &&
  process.env.VERCEL_ENV === "production" &&
  process.env.APP_ENV === "production" &&
  process.env.NEON_PROJECT_ID === "rough-wave-60456912"
)
  run(
    "npx tsx scripts/refresh-leader-story.ts --apply --slug " +
      process.env.PRODUCTION_LEADER_REFRESH,
  );
