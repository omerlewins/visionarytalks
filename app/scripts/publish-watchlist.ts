import { getPayload } from "payload";
import config from "../src/payload.config";
import { aiWatchlist } from "../src/lib/ai-watchlist";
import { watchlistReviewHash } from "../src/lib/watchlist-publication";
import { validatePublishedResearch } from "../src/lib/published-research";
import { mkdir, writeFile } from "node:fs/promises";

const host = new URL(process.env.DATABASE_URL!).hostname;
if (
  process.env.APP_ENV !== "production" ||
  process.env.NEON_PROJECT_ID !== "rough-wave-60456912" ||
  ![
    "ep-misty-grass-b79eo2x6.c-13.us-east-1.aws.neon.tech",
    "ep-lively-scene-b7dmo6bp.c-13.us-east-1.aws.neon.tech",
  ].includes(host)
)
  throw Error(
    "Expected isolated rehearsal or approved Production direct connection",
  );
const research = {
  type: "watchlist" as const,
  content: aiWatchlist,
  reviewHash: watchlistReviewHash,
};
validatePublishedResearch(research, aiWatchlist.path, "article");
const payload = await getPayload({ config });
try {
  const user = (
    await payload.find({
      collection: "users",
      where: { role: { equals: "admin" } },
      limit: 1,
      depth: 0,
    })
  ).docs[0];
  const author = (
    await payload.find({
      collection: "authors",
      where: { name: { equals: "Daniel Mercer" } },
      limit: 1,
      depth: 0,
    })
  ).docs[0];
  if (!user || !author)
    throw Error("Approved editor and responsible author required");
  const stories = (
    await payload.find({
      collection: "stories",
      pagination: false,
      depth: 0,
      draft: true,
    })
  ).docs;
  const sources = (
    await payload.find({ collection: "sources", pagination: false, depth: 0 })
  ).docs;
  const old = stories.find((s) => s.path === aiWatchlist.path);
  if (
    old &&
    (!old.publishedResearch ||
      (old.publishedResearch as { reviewHash: string }).reviewHash !==
        watchlistReviewHash)
  )
    throw Error("Existing article requires separate review");
  console.log(
    JSON.stringify({
      host,
      mode: process.argv.includes("--apply") ? "apply" : "dry-run",
      path: aiWatchlist.path,
      reviewHash: watchlistReviewHash,
      existingPublished: stories.filter((s) => s._status === "published")
        .length,
      alreadyPublished: Boolean(old),
      sourceRecords: Object.keys(aiWatchlist.sources).length,
    }),
  );
  if (process.argv.includes("--apply") && !old) {
    await mkdir("../private/growth/ai-people-2027", { recursive: true });
    await writeFile(
      `../private/growth/ai-people-2027/cms-before-${host}-${Date.now()}.json`,
      JSON.stringify({ host, stories, sources }, null, 2),
    );
    const ids: number[] = [];
    for (const s of Object.values(aiWatchlist.sources)) {
      let saved = sources.find(
        (x) => x.url === s.url && x._status === "published",
      );
      if (!saved) {
        saved = await payload.create({
          collection: "sources",
          user,
          overrideAccess: false,
          data: {
            title: s.title,
            url: s.url,
            publisher: s.publisher,
            reviewedAt: s.accessed + "T12:00:00Z",
            evidence: s.supports.join(" ") + " Limit: " + s.qualification,
            _status: "published",
          },
        });
        sources.push(saved);
      }
      ids.push(saved.id);
    }
    const now = new Date().toISOString();
    const saved = await payload.create({
      collection: "stories",
      user,
      overrideAccess: false,
      data: {
        title: aiWatchlist.title,
        path: aiWatchlist.path,
        kind: "article",
        category: "Leaders",
        dek: aiWatchlist.dek,
        shortAnswer: aiWatchlist.dek,
        author: author.id,
        publishedAt: now,
        modifiedAt: now,
        sources: [...new Set(ids)],
        seo: {
          ...aiWatchlist.seo,
          canonical: aiWatchlist.path,
          noindex: false,
        },
        publishedResearch: research,
        _status: "published",
      },
    });
    console.log(
      JSON.stringify({
        published: saved.path,
        id: saved.id,
        publishedAt: saved.publishedAt,
      }),
    );
  }
} finally {
  await payload.destroy();
}
process.exit(0);
