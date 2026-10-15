import { getPayload } from "payload";
import config from "../src/payload.config";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { editorialKind } from "../src/lib/editorial-taxonomy";
import { inspectWXR } from "../src/migration/wordpress";
import { migrateMedia } from "../src/migration/media";
if (
  process.env.APP_ENV !== "preview" ||
  process.env.VERCEL_ENV === "production" ||
  !process.env.NEON_PROJECT_ID
)
  throw new Error("Only isolated preview is allowed");
const payload = await getPayload({ config });
const source = inspectWXR(
  await readFile("../private/wordpress-2026-10-08.xml", "utf8"),
);
const audit = JSON.parse(
  await readFile("../private/ranking-audit/http-results.json", "utf8"),
);
const docs = (
  await payload.find({ collection: "stories", pagination: false, depth: 0 })
).docs;
const stable = (doc: any) => {
  const { kind, updatedAt, _status, ...rest } = doc;
  return createHash("sha256").update(JSON.stringify(rest)).digest("hex");
};
const results = [];
for (const doc of docs) {
  const kind = editorialKind(doc);
  const item = source.items.find((i) => i.key === doc.legacyKey);
  const restorePage =
    ["/contact-page/", "/privacy-policy/"].includes(doc.path) &&
    item?.status === "publish" &&
    audit.some((r: any) => r.path === doc.path && r.live.status === 200);
  if (kind !== doc.kind || (restorePage && doc._status !== "published")) {
    await writeFile(
      `../private/ranking-audit/before-${doc.id}.json`,
      JSON.stringify(doc),
    );
    await payload.update({
      collection: "stories",
      id: doc.id,
      data: {
        kind,
        _status: restorePage ? "published" : doc._status,
        legacyStatus: doc.legacyStatus,
      },
      context: {
        trustedImport: true,
        migrationReview: doc._status === "draft" && !restorePage,
      },
    });
  }
  const after = await payload.findByID({
    collection: "stories",
    id: doc.id,
    depth: 0,
  });
  if (stable(doc) !== stable(after))
    throw new Error(`Content changed: ${doc.path}`);
  results.push({
    path: doc.path,
    kind,
    status: after._status,
    preserved: true,
  });
}
// WXR also contains a navigation record with this path. The published page is authoritative.
const privacy = source.items.find(
  (i) =>
    i.type === "page" &&
    i.path === "/privacy-policy/" &&
    i.status === "publish",
);
if (privacy && !docs.some((d) => d.path === privacy.path)) {
  const author = (
    await payload.find({
      collection: "authors",
      where: {
        legacyKey: { equals: `${source.site}#author:${privacy.author}` },
      },
      limit: 1,
    })
  ).docs[0];
  await payload.create({
    collection: "stories",
    data: {
      title: privacy.title,
      path: privacy.path,
      legacyKey: privacy.key,
      legacyStatus: privacy.status,
      kind: "page",
      dek: privacy.title,
      category: "Publication",
      author: author?.id,
      legacyHTML: privacy.cleanHTML,
      importChecksum: privacy.checksum,
      seo: privacy.seo,
      publishedAt: privacy.publishedAt,
      modifiedAt: privacy.modifiedAt,
      _status: "published",
    },
    context: { trustedImport: true },
  });
}
for (const author of (
  await payload.find({ collection: "authors", pagination: false })
).docs) {
  const original = source.authors.find(
    (a) => `${source.site}#author:${a["wp:author_login"]}` === author.legacyKey,
  );
  if (original && /^[\w-]+$/.test(String(original["wp:author_login"])))
    await payload.update({
      collection: "authors",
      id: author.id,
      data: { path: `/author/${original["wp:author_login"]}/` },
    });
}
const media: Record<string, string> = {};
for (const row of audit.filter(
  (r: any) =>
    r.path.startsWith("/wp-content/uploads/") && r.live.status === 200,
)) {
  const doc = await migrateMedia(
    payload,
    "../private/uploads-2026-10-08/uploads",
    row.url,
    {},
    true,
  );
  if (!doc.approved)
    await payload.update({
      collection: "media",
      id: doc.id,
      data: { approved: true },
    });
  media[row.path] = doc.checksum;
}
await writeFile(
  "src/data/legacy-media.json",
  JSON.stringify(media, null, 2) + "\n",
);
await writeFile(
  "../private/ranking-audit/classification.json",
  JSON.stringify(results, null, 2),
);
console.log(
  JSON.stringify({
    classified: results.length,
    publishedKinds: results
      .filter((r) => r.status === "published")
      .reduce((a: any, r) => ((a[r.kind] = (a[r.kind] ?? 0) + 1), a), {}),
    mediaPaths: Object.keys(media).length,
  }),
);
await payload.destroy();
process.exit(0);

