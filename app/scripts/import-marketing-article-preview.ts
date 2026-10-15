import { getPayload } from "payload";
import config from "../src/payload.config";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";

// The accepted homepage work and this import share an isolated review snapshot.
// This is deliberately not a Production publication script.
if (
  process.env.APP_ENV !== "preview" ||
  process.env.VERCEL_ENV !== "preview" ||
  new URL(process.env.DATABASE_URL!).hostname !==
    "ep-lively-scene-b7dmo6bp.c-13.us-east-1.aws.neon.tech"
) {
  throw Error("Only the isolated editorial Preview snapshot is allowed");
}
const input = JSON.parse(
  await readFile(
    "../growth/articles/small-business-marketing/article.json",
    "utf8",
  ),
);
const { sourceDocument, sourceRecords, ...article } = input;
const checksum = createHash("sha256")
  .update(JSON.stringify(article))
  .digest("hex");
const payload = await getPayload({ config });
try {
  const existing = (
    await payload.find({
      collection: "stories",
      where: { path: { equals: article.path } },
      depth: 0,
      limit: 1,
    })
  ).docs[0];
  if (existing && existing.importChecksum !== checksum)
    throw Error(
      "Existing article differs. Review and back it up before replacing it.",
    );
  const user = (
    await payload.find({
      collection: "users",
      where: { role: { equals: "admin" } },
      limit: 1,
    })
  ).docs[0];
  const author = (
    await payload.find({
      collection: "authors",
      where: { name: { equals: "Daniel Mercer" } },
      limit: 1,
    })
  ).docs[0];
  if (!user || !author)
    throw Error("Existing owner and Daniel Mercer author must be present");
  console.log({
    mode: process.argv.includes("--apply") ? "apply" : "dry-run",
    path: article.path,
    exists: Boolean(existing),
    excludeFromHomepage: article.excludeFromHomepage,
    headings: sourceDocument.headings.length,
  });
  if (process.argv.includes("--apply") && !existing) {
    await mkdir("../private/article-imports", { recursive: true });
    await writeFile(
      `../private/article-imports/marketing-before-${Date.now()}.json`,
      JSON.stringify({ existing: existing ?? null, input }),
    );
    const now = new Date().toISOString();
    const sourceIds: number[] = [];
    for (const record of sourceRecords) {
      const stored = (
        await payload.find({
          collection: "sources",
          where: { url: { equals: record.url } },
          depth: 0,
          limit: 1,
        })
      ).docs[0];
      if (stored && stored._status !== "published")
        throw Error("Existing source requires review");
      const source =
        stored ??
        (await payload.create({
          collection: "sources",
          user,
          overrideAccess: false,
          data: { ...record, reviewedAt: now, _status: "published" },
        }));
      sourceIds.push(source.id);
    }
    const result = await payload.create({
      collection: "stories",
      user,
      overrideAccess: false,
      data: {
        ...article,
        author: author.id,
        sources: sourceIds,
        _status: "published",
        publishedAt: now,
        modifiedAt: now,
        importChecksum: checksum,
      },
    });
    console.log({
      imported: result.id,
      path: result.path,
      homepageExcluded: result.excludeFromHomepage,
    });
  }
} finally {
  await payload.destroy();
}
process.exit(0);
