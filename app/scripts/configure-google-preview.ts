import { getPayload } from "payload";
import config from "../src/payload.config";
import { writeFile, mkdir } from "node:fs/promises";
if (
  process.env.APP_ENV !== "preview" ||
  process.env.NEON_PROJECT_ID !== "calm-meadow-38652801"
)
  throw Error("Isolated Preview only");
const payload = await getPayload({ config });
try {
  const existing = await payload.findGlobal({ slug: "integrations", depth: 0 });
  const proposed = {
    ...existing,
    searchConsoleProperty: "sc-domain:visionarytalks.com",
    ga4PropertyId: "530033839",
  };
  console.log(
    JSON.stringify({
      searchConsoleProperty: proposed.searchConsoleProperty,
      ga4PropertyId: proposed.ga4PropertyId,
      measurementIdConfigured: !!existing.ga4MeasurementId,
      trackingEnabled: !!existing.trackingEnabled,
      reportingCredentialsConfigured: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
      mode: process.argv.includes("--apply") ? "apply" : "dry-run",
    }),
  );
  if (process.argv.includes("--apply")) {
    await mkdir("../private/growth", { recursive: true });
    await writeFile(
      "../private/growth/google-integrations-backup-" + Date.now() + ".json",
      JSON.stringify(existing, null, 2),
    );
    await payload.updateGlobal({
      slug: "integrations",
      data: {
        searchConsoleProperty: proposed.searchConsoleProperty,
        ga4PropertyId: proposed.ga4PropertyId,
      },
    });
    console.log(
      "Supplied property identifiers saved; existing consent and tracking settings preserved.",
    );
  }
} finally {
  await payload.destroy();
}
process.exit(0);
