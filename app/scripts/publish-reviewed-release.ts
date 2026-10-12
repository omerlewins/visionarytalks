import "./validate-editorial-release";
import { getPayload } from "payload";
import config from "../src/payload.config";
import { leaderProfiles, leaderSources } from "../src/lib/leaders";
import { ownershipFiles, ownershipSources } from "../src/lib/ownership-files";
import { ownershipPath } from "../src/lib/ownership-contract";
import {
  validatePublishedResearch,
  type PublishedResearch,
} from "../src/lib/published-research";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

if (
  process.exitCode ||
  process.env.APP_ENV !== "production" ||
  process.env.NEON_PROJECT_ID !== "rough-wave-60456912"
)
  throw Error("Approved Production release required");
const target = new URL(process.env.DATABASE_URL!);
if (
  ![
    "ep-misty-grass-b79eo2x6.c-13.us-east-1.aws.neon.tech",
    "ep-lively-scene-b7dmo6bp.c-13.us-east-1.aws.neon.tech",
  ].includes(target.hostname)
)
  throw Error("Unexpected release branch");
if (target.hostname.includes("pooler"))
  throw Error("Release requires a direct connection");
const apply = process.argv.includes("--apply");
const reviewHash = createHash("sha256")
  .update(await readFile("../growth/EDITORIAL_RELEASE_REVIEW.json"))
  .digest("hex");
const records = [
  ...leaderProfiles.map((p) => ({
    path: p.path,
    title: p.seo.title,
    dek: p.dek,
    answer: p.answer,
    kind: "leader" as const,
    category: "Leaders",
    date: p.checked,
    seo: p.seo,
    sources: p.sourceIds,
    research: { type: "leader", content: p, reviewHash } as PublishedResearch,
  })),
  ...ownershipFiles.map((p) => ({
    path: ownershipPath(p),
    title: p.title,
    dek: p.dek,
    answer: p.answer,
    kind: "ownership" as const,
    category: "Ownership",
    date: p.updated,
    seo: p.seo,
    sources: p.sourceIds,
    research: {
      type: "ownership",
      content: p,
      reviewHash,
    } as PublishedResearch,
  })),
];
const payload = await getPayload({ config });
try {
  const user = (
    await payload.find({
      collection: "users",
      where: { role: { equals: "admin" } },
      depth: 0,
      limit: 1,
    })
  ).docs[0];
  if (!user) throw Error("Approved Production administrator missing");
  const author = (
    await payload.find({
      collection: "authors",
      where: { name: { equals: "Daniel Mercer" } },
      limit: 1,
      depth: 0,
    })
  ).docs[0];
  if (!author) throw Error("Responsible author missing");
  const existing = (
    await payload.find({
      collection: "stories",
      pagination: false,
      depth: 0,
      draft: true,
    })
  ).docs;
  const oldSources = (
    await payload.find({ collection: "sources", pagination: false, depth: 0 })
  ).docs;
  for (const r of records) {
    validatePublishedResearch(r.research, r.path, r.kind);
    const old = existing.find((s) => s.path === r.path);
    if (
      old &&
      !old.publishedResearch &&
      r.path !== "/leopold-aschenbrenner-net-worth/"
    )
      throw Error("Unexpected existing article: " + r.path);
    if (
      old?.publishedResearch &&
      (old.publishedResearch as PublishedResearch).reviewHash !== reviewHash
    )
      throw Error("Article changed since this release: " + r.path);
  }
  const pending = records.filter(
    (r) => !existing.find((s) => s.path === r.path)?.publishedResearch,
  );
  console.log(
    JSON.stringify({
      mode: apply ? "apply" : "dry-run",
      host: target.hostname,
      reviewHash,
      approved: records.length,
      pending: pending.map((r) => r.path),
      existingPublished: existing.filter((s) => s._status === "published")
        .length,
    }),
  );
  if (!apply) process.exitCode = 0;
  else {
    await mkdir("../private/growth", { recursive: true });
    const backup = "../private/growth/release-before-" + Date.now() + ".json";
    await writeFile(
      backup,
      JSON.stringify(
        {
          host: target.hostname,
          reviewHash,
          stories: existing,
          sources: oldSources,
        },
        null,
        2,
      ),
    );
    const sourceIds = new Map<string, number>();
    for (const r of pending) {
      const registry = r.kind === "leader" ? leaderSources : ownershipSources;
      for (const id of r.sources) {
        const key = r.kind + ":" + id;
        if (sourceIds.has(key)) continue;
        const s = registry[id];
        if (!s) throw Error("Missing source " + id);
        let saved = oldSources.find((doc) => doc.url === s.url);
        const data = {
          title: s.title,
          url: s.url,
          publisher:
            "publisher" in s ? String(s.publisher) : new URL(s.url).hostname,
          reviewedAt: s.accessed + "T12:00:00Z",
          evidence:
            "evidence" in s
              ? String(s.evidence)
              : "Source opened and assessed in the dated editorial release ledger; limitations retained in the article.",
          _status: "published" as const,
        };
        if (!saved) {
          saved = await payload.create({
            collection: "sources",
            user,
            overrideAccess: false,
            data,
          });
          oldSources.push(saved);
        } else if (saved._status !== "published")
          saved = await payload.update({
            collection: "sources",
            id: saved.id,
            user,
            overrideAccess: false,
            data,
          });
        sourceIds.set(key, saved.id);
      }
    }
    const publishedAt = new Date().toISOString();
    const result = [];
    for (const r of pending) {
      const old = existing.find((s) => s.path === r.path);
      const data = {
        title: r.title,
        path: r.path,
        kind: r.kind,
        category: r.category,
        dek: r.dek,
        shortAnswer: r.answer,
        author: author.id,
        publishedAt: old?.publishedAt ?? publishedAt,
        modifiedAt: r.date + "T12:00:00Z",
        sources: [
          ...new Set(r.sources.map((id) => sourceIds.get(r.kind + ":" + id)!)),
        ],
        seo: { ...r.seo, canonical: r.path, noindex: false },
        publishedResearch: r.research,
        _status: "published" as const,
      };
      const doc = old
        ? await payload.update({
            collection: "stories",
            id: old.id,
            user,
            overrideAccess: false,
            data,
          })
        : await payload.create({
            collection: "stories",
            user,
            overrideAccess: false,
            data,
          });
      result.push({ id: doc.id, path: doc.path, publishedAt: doc.publishedAt });
    }
    // Connect existing public tracker companies only where a published file exists.
    const publicStories = (
      await payload.find({
        collection: "stories",
        where: { _status: { equals: "published" } },
        pagination: false,
        depth: 0,
      })
    ).docs;
    const companies = (
      await payload.find({
        collection: "companies",
        pagination: false,
        depth: 0,
      })
    ).docs;
    const companyPaths: Record<string, string> = {
      Cursor: "/who-owns-cursor/",
      Anthropic: "/who-owns-anthropic-claude/",
      OpenAI: "/who-owns-chatgpt-openai/",
      Perplexity: "/who-owns-perplexity/",
      Glean: "/who-owns-glean/",
    };
    for (const company of companies) {
      const article = publicStories.find(
        (s) => s.path === companyPaths[company.name],
      );
      if (article && !company.profile)
        await payload.update({
          collection: "companies",
          id: company.id,
          user,
          overrideAccess: false,
          data: { profile: article.id },
        });
    }
    await writeFile(
      "../private/growth/release-result-" + Date.now() + ".json",
      JSON.stringify(
        {
          reviewHash,
          host: target.hostname,
          backup,
          articles: result,
          publishedCount: publicStories.length,
        },
        null,
        2,
      ),
    );
    console.log(
      JSON.stringify({
        published: result.length,
        total: publicStories.length,
        privateBackup: true,
      }),
    );
  }
} finally {
  await payload.destroy();
}
