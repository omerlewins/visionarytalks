import { getPayload } from "payload";
import config from "../src/payload.config";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { marked } from "marked";
import YAML from "yaml";
import { youngestBillionairesArticle as yb } from "../src/lib/youngest-billionaires-article";

// Loads the six October 2026 KD-under-10 articles into the isolated Preview CMS
// for owner review, or, with --production, into the live CMS after the owner's
// explicit approval (Oct 16 2026). Dry-run unless --apply.
const production = process.argv.includes("--production");
if (
  !process.argv.includes("--print") &&
  (production
    ? process.env.APP_ENV !== "production" ||
      process.env.VERCEL_ENV !== "production" ||
      process.env.NEON_PROJECT_ID !== "rough-wave-60456912"
    : process.env.APP_ENV !== "preview" ||
      process.env.VERCEL_ENV === "production" ||
      process.env.NEON_PROJECT_ID !== "calm-meadow-38652801")
)
  throw Error(
    "Expected the isolated Preview, or explicitly selected Production",
  );

type Source = {
  title: string;
  url: string;
  publisher: string;
  publishedAt?: string;
  evidence?: string;
};
type Input = {
  title: string;
  path: string;
  kind: "article" | "ownership" | "salary";
  category: string;
  dek: string;
  seo: { title: string; description: string };
  legacyHTML: string;
  sourceRecords: Source[];
};

// Only full dates are publication dates; "accessed ..." goes in the evidence.
const isoDate = (value?: string) => {
  const match = value?.match(/^\d{4}-\d{2}-\d{2}$|^\d{1,2} [A-Z][a-z]+ \d{4}$/);
  return match
    ? new Date(Date.parse(match[0] + " UTC")).toISOString()
    : undefined;
};
// "Title (Publisher, date)" names its publisher; otherwise use the host.
const publisherOf = (title: string, url: string) => {
  const named = title
    .match(/\(([^()]+)\)\s*$/)?.[1]
    .split(",")[0]
    .trim();
  return named && !/\d/.test(named)
    ? named
    : new URL(url).hostname.replace(/^www\./, "");
};

async function markdownArticle(
  file: string,
  kind: Input["kind"],
  category: string,
): Promise<Input> {
  const raw = await readFile(new URL("../../" + file, import.meta.url), "utf8");
  const [, front, body] = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)!;
  const meta = YAML.parse(front, { schema: "failsafe" });
  const text = body
    .replace(/^# .*\n+/m, "") // the template renders the title
    .replace(/^[*_]{1,2}By Daniel Mercer[^\n]*\n+/m, "") // and the byline
    .replace(/\n## Sources\n[\s\S]*$/, "\n"); // and the source list
  return {
    title: meta.title,
    path: meta.slug,
    kind,
    category,
    dek: meta.metaDescription,
    seo: { title: meta.title, description: meta.metaDescription },
    legacyHTML: (await marked.parse(text, { gfm: true })).trim(),
    sourceRecords: meta.sources.map(
      (s: { title: string; url: string; date?: unknown }) => {
        const date = s.date == null ? undefined : String(s.date);
        return {
          title: s.title,
          url: s.url,
          publisher: publisherOf(s.title, s.url),
          publishedAt: isoDate(date),
          evidence: date?.startsWith("accessed")
            ? `Accessed ${date.slice(9)}.`
            : undefined,
        };
      },
    ),
  };
}

// The interactive map and ranking are placed by marker elements that
// LegacyContent swaps for the shared components.
function youngestBillionaires(): Input {
  const inline = (text: string) =>
    marked.parseInline(text, { async: false }) as string;
  const html = yb.blocks
    .map((b) => {
      if (b.type === "p") return `<p>${inline(b.text)}</p>`;
      if (b.type === "h2") return `<h2 id="${b.id}">${b.text}</h2>`;
      if (b.type === "ol" || b.type === "ul")
        return `<${b.type}>${b.items.map((x) => `<li>${inline(x)}</li>`).join("")}</${b.type}>`;
      return `<div id="yb-${b.type}"></div>`;
    })
    .join("\n");
  return {
    title: yb.title,
    path: yb.path,
    kind: "article",
    category: "Money",
    dek: yb.dek,
    seo: { title: yb.seoTitle, description: yb.description },
    legacyHTML: html,
    sourceRecords: yb.sources.map((s) => ({
      title: s.title,
      url: s.url,
      publisher: s.publisher,
      publishedAt: isoDate(s.publishedAt.replace(/,.*$/, "")),
      evidence: `${s.evidence} Published ${s.publishedAt}.`,
    })),
  };
}

const kd10 = "growth/articles/2026-10-kd10/";
const inputs = [
  youngestBillionaires(),
  await markdownArticle(
    kd10 + "investment-banker-salary.md",
    "salary",
    "Money",
  ),
  await markdownArticle(kd10 + "who-owns-aldi.md", "ownership", "Ownership"),
  await markdownArticle(kd10 + "who-owns-temu.md", "ownership", "Ownership"),
  await markdownArticle(
    kd10 + "palmer-luckey-net-worth.md",
    "article",
    "Leaders",
  ),
  await markdownArticle(
    kd10 + "sundar-pichai-net-worth.md",
    "article",
    "Leaders",
  ),
];
// An earlier unpublished Aldi research draft already holds this path in
// Preview. Its content stays in the version history when it is replaced.
// Production never replaces an existing story.
const replaceable = new Set(production ? [] : ["/who-owns-aldi/"]);

if (process.argv.includes("--print")) {
  console.log(JSON.stringify(inputs, null, 2));
  process.exit(0);
}
const apply = process.argv.includes("--apply");
const payload = await getPayload({ config });
try {
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
  for (const input of inputs) {
    const { sourceRecords, ...article } = input;
    const jobKey = "preview-import:kd10-2026-10:" + article.path;
    const checksum = createHash("sha256")
      .update(JSON.stringify(input))
      .digest("hex");
    const existing = (
      await payload.find({
        collection: "stories",
        where: { path: { equals: article.path } },
        depth: 0,
        limit: 1,
        draft: true,
      })
    ).docs[0];
    const ours = existing?.sourceJobKey === jobKey;
    if (existing && !ours && !replaceable.has(article.path))
      throw Error(`${article.path} is held by another story; review it first`);
    const action = !existing
      ? "create"
      : ours && existing.importChecksum === checksum
        ? "unchanged"
        : "update";
    console.log(
      JSON.stringify({
        mode: apply ? "apply" : "dry-run",
        path: article.path,
        action,
        replacesId: existing && !ours ? existing.id : undefined,
        sources: sourceRecords.length,
        htmlLength: article.legacyHTML.length,
      }),
    );
    if (!apply || action === "unchanged") continue;
    const now = new Date().toISOString();
    const sourceIds: number[] = [];
    for (const record of sourceRecords) {
      const stored = (
        await payload.find({
          collection: "sources",
          // Reuse approved sources only; unreviewed drafts stay as they are.
          where: {
            url: { equals: record.url },
            _status: { equals: "published" },
          },
          depth: 0,
          limit: 1,
        })
      ).docs[0];
      const source =
        stored ??
        (await payload.create({
          collection: "sources",
          user,
          overrideAccess: false,
          data: { ...record, reviewedAt: now, _status: "published" },
        }));
      if (!sourceIds.includes(source.id)) sourceIds.push(source.id);
    }
    const data = {
      ...article,
      author: author.id,
      sources: sourceIds,
      excludeFromHomepage: false,
      _status: "published" as const,
      publishedAt: existing?.publishedAt ?? now,
      modifiedAt: now,
      importChecksum: checksum,
      sourceJobKey: jobKey,
      // Clear the replaced draft's structured fields so they do not render.
      shortAnswer: null,
      facts: [],
      timeline: [],
      relations: [],
      sections: [],
      publishedResearch: null,
    };
    const result = existing
      ? await payload.update({
          collection: "stories",
          id: existing.id,
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
    console.log(JSON.stringify({ stored: result.id, path: result.path }));
  }
} finally {
  await payload.destroy();
}
process.exit(0);
