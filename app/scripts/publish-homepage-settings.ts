import { getPayload } from "payload";
import config from "../src/payload.config";
import { mkdir, writeFile } from "node:fs/promises";
const production = process.argv.includes("--production");
const host = new URL(process.env.DATABASE_URL!).hostname;
if (
  process.env.APP_ENV !== "production" ||
  process.env.NEON_PROJECT_ID !== "rough-wave-60456912" ||
  host !==
    (production
      ? "ep-misty-grass-b79eo2x6.c-13.us-east-1.aws.neon.tech"
      : "ep-lively-scene-b7dmo6bp.c-13.us-east-1.aws.neon.tech")
)
  throw Error("Explicit rehearsal or authorized Production target required");
const payload = await getPayload({ config });
try {
  const user = (
    await payload.find({
      collection: "users",
      where: { role: { equals: "admin" } },
      limit: 1,
    })
  ).docs[0];
  const settings = await payload.findGlobal({
    slug: "site-settings",
    depth: 0,
  });
  const records = (
    await payload.find({
      collection: "stories",
      where: {
        and: [
          { path: { in: ["/ai-people-to-watch/", "/leaders/ali-ghodsi/"] } },
          { _status: { equals: "published" } },
        ],
      },
      depth: 0,
      pagination: false,
    })
  ).docs;
  const hero = records.find((s) => s.path === "/ai-people-to-watch/");
  const lead = records.find((s) => s.path === "/leaders/ali-ghodsi/");
  if (!user || !hero || !lead)
    throw Error("Existing owner and published story destinations required");
  console.log({
    mode: process.argv.includes("--apply") ? "apply" : "dry-run",
    production,
    hero: hero.path,
    headline: lead.path,
  });
  if (process.argv.includes("--apply")) {
    await mkdir("../private/live-rollout-2026-10-16", { recursive: true });
    await writeFile(
      `../private/live-rollout-2026-10-16/home-before-${host}-${Date.now()}.json`,
      JSON.stringify({ settings, lead }),
    );
    await payload.updateGlobal({
      slug: "site-settings",
      user,
      overrideAccess: false,
      data: { homepageHero: hero.id, homepageLead: null },
    });
    await payload.update({
      collection: "stories",
      id: lead.id,
      user,
      overrideAccess: false,
      data: {
        homepageHeadline:
          "The Berkeley professor behind Databricks' $7.6B fortune",
        modifiedAt: lead.modifiedAt,
      },
    });
    console.log("Homepage selection saved; article editorial dates preserved.");
  }
} finally {
  await payload.destroy();
}
process.exit(0);
