import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { marked } from "marked";

// One owner-authorized article. Dry-run by default; isolated rehearsal first.
const root = new URL(
  "../../growth/articles/2026-10-anthropic-ipo/",
  import.meta.url,
);
const raw = await readFile(new URL("ARTICLE.md", root), "utf8");
const metadata = await readFile(new URL("article.json", root), "utf8");
const article = JSON.parse(metadata);
const review = JSON.parse(await readFile(new URL("REVIEW.json", root), "utf8"));
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
if (
  review.articleHash !== hash(raw) ||
  review.metadataHash !== hash(metadata) ||
  review.decision !== "document-review-complete"
)
  throw Error("Exact article and metadata require a recorded document review");
if (
  article.path !== "/anthropic-ipo/" ||
  article.sources.length !== 3 ||
  article.quarterlyRevenueMillions.length !== 6
)
  throw Error("Unexpected article inventory");
const html = (
  await marked.parse(raw.replace(/^#[^\r\n]*(?:\r?\n)+/, ""), { gfm: true })
).trim();
if (
  (html.match(/<table>/g) ?? []).length !== 6 ||
  /<h1\b|<script\b/i.test(html)
)
  throw Error("Unexpected article structure");
const checksum = hash(raw + metadata);
if (process.argv.includes("--print")) {
  console.log(
    JSON.stringify({
      path: article.path,
      title: article.title,
      checksum,
      words: raw.split(/\s+/).length,
      tables: 6,
      sources: 3,
      chartPoints: 6,
    }),
  );
  process.exit(0);
}
const production = process.argv.includes("--production");
const apply = process.argv.includes("--apply");
const expected = production
  ? "ep-misty-grass-b79eo2x6.c-13.us-east-1.aws.neon.tech"
  : "ep-lively-scene-b7dmo6bp.c-13.us-east-1.aws.neon.tech";
if (
  process.env.APP_ENV !== "production" ||
  process.env.VERCEL_ENV !== "production" ||
  process.env.NEON_PROJECT_ID !== "rough-wave-60456912" ||
  new URL(process.env.DATABASE_URL!).hostname !== expected
)
  throw Error(
    "Explicit known Production or isolated rehearsal target required",
  );
const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");
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
    throw Error("Existing administrator and responsible author required");
  const existing = (
    await payload.find({
      collection: "stories",
      where: { path: { equals: article.path } },
      limit: 1,
      depth: 0,
      draft: true,
    })
  ).docs[0];
  const key = "owner-release:anthropic-s1-2026-10-26";
  if (
    existing &&
    (existing.sourceJobKey !== key ||
      existing.importChecksum !== checksum ||
      existing.legacyHTML !== html)
  )
    throw Error(
      "Existing article differs; preserve it and review before replacement",
    );
  console.log(
    JSON.stringify({
      mode: apply ? "apply" : "dry-run",
      target: production ? "production" : "rehearsal",
      path: article.path,
      action: existing ? "unchanged" : "create",
      checksum,
    }),
  );
  if (!apply || existing) {
    /* Dry run and repeated runs have no mutations. */
  } else {
    const dir = new URL(
      "../../private/growth/2026-10-26/anthropic-ipo/",
      import.meta.url,
    );
    await mkdir(dir, { recursive: true });
    const existingSources = (
      await payload.find({
        collection: "sources",
        where: {
          url: { in: article.sources.map((s: { url: string }) => s.url) },
        },
        depth: 0,
        pagination: false,
      })
    ).docs;
    await writeFile(
      new URL(
        `before-${production ? "production" : "rehearsal"}-${Date.now()}.json`,
        dir,
      ),
      JSON.stringify(
        {
          path: article.path,
          existing: existing ?? null,
          existingSources,
          checksum,
        },
        null,
        2,
      ),
    );
    const now = new Date().toISOString();
    const ids: number[] = [];
    for (const source of article.sources) {
      const old = existingSources.find(
        (s) => s.url === source.url && s._status === "published",
      );
      const { key: _key, ...record } = source;
      const stored =
        old ??
        (await payload.create({
          collection: "sources",
          user,
          overrideAccess: false,
          data: { ...record, reviewedAt: now, _status: "published" },
        }));
      ids.push(stored.id);
    }
    const related = (
      await payload.find({
        collection: "stories",
        where: {
          path: {
            in: ["/who-owns-anthropic-claude/", "/anthropic-valuation/"],
          },
          _status: { equals: "published" },
        },
        limit: 2,
        depth: 0,
      })
    ).docs;
    const saved = await payload.create({
      collection: "stories",
      user,
      overrideAccess: false,
      data: {
        title: article.title,
        path: article.path,
        kind: "article",
        category: "Money",
        dek: article.dek,
        homepageHeadline: article.homepageHeadline,
        excludeFromHomepage: false,
        author: author.id,
        sources: ids,
        legacyHTML: html,
        seo: article.seo,
        faqs: article.faqs,
        publishedAt: now,
        modifiedAt: now,
        _status: "published",
        importChecksum: checksum,
        sourceJobKey: key,
        relatedStories: related.map((s) => s.id),
        chartMetrics: article.quarterlyRevenueMillions.map(
          (p: { period: string; value: number }) => ({
            label: p.period,
            period: p.period,
            value: p.value,
            currency: "USD",
            unit: "millions",
            definition: "Quarterly revenue, unaudited",
            basis: "reported",
            sourceIds: [String(ids[0])],
          }),
        ),
      },
    });
    await writeFile(
      new URL(`published-${production ? "production" : "rehearsal"}.json`, dir),
      JSON.stringify(
        {
          id: saved.id,
          path: saved.path,
          checksum,
          sourceIds: ids,
          publishedAt: saved.publishedAt,
        },
        null,
        2,
      ),
    );
    console.log(
      JSON.stringify({
        stored: saved.id,
        path: saved.path,
        sources: ids.length,
        chartPoints: 6,
      }),
    );
  }
} finally {
  await payload.destroy();
}
process.exit(0);
