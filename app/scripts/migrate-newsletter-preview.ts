import { getPayload } from "payload";
import { mkdir, writeFile } from "node:fs/promises";
if (
  process.env.APP_ENV !== "preview" ||
  process.env.VERCEL_ENV !== "preview" ||
  process.env.NEON_PROJECT_ID !== "calm-meadow-38652801"
)
  throw Error("Isolated Preview only");
const connection = new URL(process.env.DATABASE_URL!);
connection.hostname = connection.hostname.replace("-pooler", "");
process.env.DATABASE_URL = connection.href;
const config = (await import("../src/payload.config")).default;
const payload = await getPayload({ config });
try {
  await mkdir("../private/growth", { recursive: true });
  const migrations = await payload.find({
    collection: "payload-migrations",
    pagination: false,
    depth: 0,
  });
  const stories = await payload.find({
    collection: "stories",
    pagination: false,
    depth: 0,
  });
  await writeFile(
    "../private/growth/newsletter-pre-migration.json",
    JSON.stringify(
      {
        migrationRecords: migrations.docs,
        storyPaths: stories.docs.map((s) => ({
          id: s.id,
          path: s.path,
          status: s._status,
        })),
      },
      null,
      2,
    ),
  );
  await payload.db.migrate();
  console.log(
    "Preview migrations applied; content inventory backup saved privately.",
  );
} finally {
  await payload.destroy();
}
process.exit(0);
