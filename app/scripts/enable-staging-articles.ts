import { getPayload } from "payload";
import config from "../src/payload.config";
import { readFile, writeFile } from "node:fs/promises";
if (
  process.env.APP_ENV !== "preview" ||
  process.env.VERCEL_ENV === "production" ||
  !process.env.NEON_PROJECT_ID
)
  throw new Error("Only the isolated Neon preview is supported");
const payload = await getPayload({ config });
const report = JSON.parse(
  await readFile("../private/cloud-migration/reconciliation.json", "utf8"),
);
const posts = report.records.filter((record: any) => record.type === "post");
if (
  posts.length !== 107 ||
  posts.some((record: any) => !record.targetID || record.outcome === "failed")
)
  throw new Error(
    "All 107 source posts must be imported before enabling staging",
  );
let published = 0;
const publishedPosts = posts.filter(
  (record: any) => record.status === "publish",
);
for (let offset = 0; offset < publishedPosts.length; offset += 4) {
  await Promise.all(
    publishedPosts.slice(offset, offset + 4).map(async (record: any) => {
      const doc = await payload.findByID({
        collection: "stories",
        id: record.targetID,
        depth: 0,
        draft: true,
      });
      if (doc.legacyStatus !== "publish" || doc.path !== record.path)
        throw new Error("Source status or path mismatch");
      if (doc._status === "published") {
        published++;
        return;
      }
      const filenames = [
        ...(doc.legacyHTML ?? "").matchAll(/\/api\/media\/file\/([^"\s,<>]+)/g),
      ].map((match) => decodeURIComponent(match[1]));
      if (filenames.length)
        await payload.update({
          collection: "media",
          where: { filename: { in: [...new Set(filenames)] } },
          data: { approved: true },
        });
      if (doc.featuredImage)
        await payload.update({
          collection: "media",
          id:
            typeof doc.featuredImage === "object"
              ? doc.featuredImage.id
              : doc.featuredImage,
          data: { approved: true },
        });
      await payload.update({
        collection: "stories",
        id: doc.id,
        data: { _status: "published", legacyStatus: "publish" },
        context: { trustedImport: true },
      });
      published++;
    }),
  );
  console.log(`Staging publication: ${published}/${publishedPosts.length}`);
}
const result = {
  publishedForProtectedPreview: published,
  originalDraftsKeptPrivate: 7,
  productionReady: false,
  note: "Original WordPress publication status restored in isolated protected staging; conversion issues remain in the source report.",
};
await writeFile(
  "../private/cloud-migration/staging-release.json",
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result));
await payload.destroy();
process.exit(0);
