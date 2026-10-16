// Vercel build entry. Only a Preview build for a branch that sets
// PREVIEW_CMS_SYNC=1 (a branch-scoped Preview variable) touches the isolated
// Preview database before building: pending migrations, then the reviewed
// Preview content import. Every other build, Production included, only builds.
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
