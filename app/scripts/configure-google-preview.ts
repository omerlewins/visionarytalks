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
    ga4MeasurementId: "G-1YPKS2X7JE",
    trackingEnabled: true,
  };
  console.log(
    JSON.stringify({
      searchConsoleProperty: proposed.searchConsoleProperty,
      ga4PropertyId: proposed.ga4PropertyId,
      measurementIdConfigured: !!proposed.ga4MeasurementId,
      trackingEnabled: proposed.trackingEnabled,
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
        ga4MeasurementId: proposed.ga4MeasurementId,
        trackingEnabled: proposed.trackingEnabled,
      },
    });
    console.log(
      "Supplied Google identifiers saved. Analytics is enabled for Production only; Preview remains untracked.",
    );
  }
} finally {
  await payload.destroy();
}
process.exit(0);
