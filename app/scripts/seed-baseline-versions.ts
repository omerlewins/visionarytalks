import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { getPayload } from "payload";
import config from "../src/payload.config";

const target = process.argv.find((arg) =>
  ["rehearsal", "production"].includes(arg),
);
const apply = process.argv.includes("--apply");
const host = new URL(process.env.DATABASE_URL ?? "").hostname;
if (
  !target ||
  process.env.APP_ENV !== "production" ||
  process.env.NEON_PROJECT_ID !== "rough-wave-60456912" ||
  host.includes("ep-lively-scene-b7dmo6bp") !== (target === "rehearsal")
)
  throw new Error("Wrong isolated Production branch");

const baseline = JSON.parse(
  await readFile("../private/growth/production-baseline.json", "utf8"),
);
const expected = baseline.tables.stories
  .map((s: { path: string }) => s.path)
  .sort();
const payload = await getPayload({ config });
const digest = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
try {
  const read = () =>
    payload.find({
      collection: "stories",
      draft: false,
      pagination: false,
      depth: 0,
      sort: "id",
      overrideAccess: true,
    });
  const before = await read();
  if (
    before.totalDocs !== 102 ||
    before.docs.some((s) => s._status !== "published" || !s.legacyKey) ||
    JSON.stringify(before.docs.map((s) => s.path).sort()) !==
      JSON.stringify(expected)
  )
    throw new Error("Destination is not the approved published baseline");
  const versions = await payload.findVersions({
    collection: "stories",
    pagination: false,
    depth: 0,
  });
  if (versions.totalDocs)
    throw new Error(
      "Versions already exist; refusing to replace editorial history",
    );
  console.log(
    JSON.stringify({
      target,
      mode: apply ? "apply" : "dry-run",
      publishedSnapshots: before.totalDocs,
    }),
  );
  if (apply) {
    await writeFile(
      `../private/growth/${target}-before-version-seed.json`,
      JSON.stringify(
        { stories: before.docs, versions: versions.docs },
        null,
        2,
      ),
    );
    // Use the installed Payload adapter's version writer. No story update hooks,
    // publication transitions or private Preview version history are imported.
    for (const doc of before.docs)
      await payload.db.createVersion({
        collectionSlug: "stories",
        parent: doc.id,
        versionData: { ...doc },
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        autosave: false,
      });
    const after = await read();
    if (digest(before.docs) !== digest(after.docs))
      throw new Error("Published content changed during version seeding");
    const drafts = await payload.find({
      collection: "stories",
      draft: true,
      pagination: false,
      depth: 0,
      sort: "id",
    });
    if (digest(before.docs) !== digest(drafts.docs))
      throw new Error("CMS draft view differs from published baseline");
    const report = {
      target,
      checkedAt: new Date().toISOString(),
      snapshots: drafts.totalDocs,
      publishedContentUnchanged: true,
      draftViewExactMatch: true,
      publishedContentHash: digest(before.docs),
    };
    await writeFile(
      `../private/growth/${target}-version-seed.json`,
      JSON.stringify(report, null, 2) + "\n",
    );
    console.log(JSON.stringify(report));
  }
} finally {
  await payload.destroy();
}
process.exit(0);
