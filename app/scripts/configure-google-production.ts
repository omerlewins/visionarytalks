import { getPayload } from "payload";
import config from "../src/payload.config";
import { mkdir, writeFile } from "node:fs/promises";
if (
  process.env.APP_ENV !== "production" ||
  process.env.NEON_PROJECT_ID !== "rough-wave-60456912"
)
  throw Error("Separate Visionary Talks Production database only");
const payload = await getPayload({ config });
try {
  const existing = await payload.findGlobal({ slug: "integrations", depth: 0 });
  const data = {
    searchConsoleProperty: "sc-domain:visionarytalks.com",
    ga4PropertyId: "530033839",
    ga4MeasurementId: "G-1YPKS2X7JE",
    trackingEnabled: true,
  };
  console.log(
    JSON.stringify({
      ...data,
      mode: process.argv.includes("--apply") ? "apply" : "dry-run",
      reportingCredentialsConfigured: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    }),
  );
  if (process.argv.includes("--apply")) {
    await mkdir("../private/growth", { recursive: true });
    await writeFile(
      "../private/growth/production-integrations-backup-" +
        Date.now() +
        ".json",
      JSON.stringify(existing, null, 2),
    );
    await payload.updateGlobal({ slug: "integrations", data });
    const saved = await payload.findGlobal({ slug: "integrations", depth: 0 });
    if (
      saved.ga4MeasurementId !== data.ga4MeasurementId ||
      !saved.trackingEnabled
    )
      throw Error("Saved analytics settings did not match");
    console.log(
      "Production Google identifiers saved and read back. No research content or domain settings changed.",
    );
  }
} finally {
  await payload.destroy();
}
process.exit(0);
