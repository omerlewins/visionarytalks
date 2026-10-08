import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { migrateMedia } from "../src/migration/media";
import { rewriteLegacyHTML } from "../src/migration/render";
import {
  inspectWXR,
  reconcileURLs,
  checksum,
  importDecision,
  targetStatus,
} from "../src/migration/wordpress";
const args = process.argv.slice(2),
  input = args.find((a) => a.endsWith(".xml")),
  apply = args.includes("--apply");
const reviewDrafts = args.includes("--review-drafts");
const uploadsIndex = args.indexOf("--uploads");
const uploads = uploadsIndex >= 0 ? args[uploadsIndex + 1] : undefined;
if (reviewDrafts && !uploads)
  throw new Error(
    "Review import requires --uploads with the verified uploads directory",
  );
if (!input)
  throw new Error(
    "Usage: npm run import:wordpress -- private/export.xml [--apply] [--urls private/urls.txt]",
  );
if (apply && process.env.APP_ENV === "production")
  throw new Error(
    "Import into isolated staging first; production delta requires the reviewed cutover procedure",
  );
const inventory = inspectWXR(await readFile(input, "utf8"));
const urlIndex = args.indexOf("--urls"),
  urls =
    urlIndex >= 0
      ? (await readFile(args[urlIndex + 1], "utf8"))
          .split(/\r?\n/)
          .filter(Boolean)
      : inventory.items.filter((i) => i.status === "publish").map((i) => i.url);
const report: any = {
  generatedAt: new Date().toISOString(),
  mode: apply ? "apply" : "dry-run",
  reviewDrafts,
  site: inventory.site,
  counts: inventory.counts,
  urls: reconcileURLs(urls, inventory.items),
  records: [],
  complete: false,
};
const privateDir = path.resolve(process.cwd(), "../private/migration");
await mkdir(privateDir, { recursive: true });
let payload: any;
if (apply) {
  const [{ getPayload }, { default: config }] = await Promise.all([
    import("payload"),
    import("../src/payload.config"),
  ]);
  payload = await getPayload({ config });
}
const reserved = /^\/(admin|api|preview|search|ai-companies|ai-salaries)(\/|$)/;
for (const item of inventory.items) {
  const result: any = {
    sourceID: item.id,
    type: item.type,
    status: item.status,
    oldURL: item.url,
    path: item.path,
    title: item.title,
    publishedAt: item.publishedAt,
    modifiedAt: item.modifiedAt,
    mediaCount: item.assets.length,
    seo: item.seo,
    outcome: "inventoried",
    issues: [...item.issues],
  };
  if (item.assets.length)
    result.issues.push(
      "Media binary copy and internal-asset URL reconciliation required",
    );
  if (reserved.test(item.path))
    result.issues.push("Application route collision requires review");
  if (item.comments.length)
    result.issues.push(
      "Comments preserved in private source archive; display policy unresolved",
    );
  if (!["post", "page"].includes(item.type))
    result.issues.push(
      "Preserved in private source archive; explicit target mapping required",
    );
  await writeFile(
    path.join(privateDir, `${checksum(item.key)}.json`),
    JSON.stringify(item, null, 2),
  );
  if (
    apply &&
    ((reviewDrafts && item.type === "post") ||
      (["post", "page"].includes(item.type) && !result.issues.length))
  ) {
    try {
      const mediaURLs = new Map<string, string>();
      const mediaIDs = new Map<string, number>();
      if (uploads) {
        for (const reference of item.assets) {
          const url = new URL(
            reference.replaceAll("&amp;", "&"),
            item.url || inventory.site,
          );
          if (url.origin !== new URL(inventory.site).origin)
            throw new Error(
              "External image origin requires a reviewed mapping",
            );
          const media = await migrateMedia(payload, uploads, url.href, {});
          if (!media.filename)
            throw new Error("Imported media has no stored filename");
          mediaURLs.set(
            url.href,
            `/api/media/file/${encodeURIComponent(media.filename)}`,
          );
          mediaIDs.set(url.href, media.id);
        }
        result.issues = result.issues.filter(
          (issue: string) =>
            issue !==
            "Media binary copy and internal-asset URL reconciliation required",
        );
      }
      const previous = (
        await payload.find({
          collection: "migration-records",
          where: { key: { equals: item.key } },
          limit: 1,
        })
      ).docs[0];
      const target = previous?.data?.targetID
        ? await payload.findByID({
            collection: "stories",
            id: previous.data.targetID,
          })
        : null;
      const fingerprint = (t: any) =>
        checksum(
          JSON.stringify([
            t.title,
            t.dek,
            t.legacyHTML,
            t.path,
            t._status,
            t.seo,
            typeof t.featuredImage === "object"
              ? t.featuredImage?.id
              : t.featuredImage,
          ]),
        );
      const effectiveChecksum = checksum(
        `${item.checksum}:${reviewDrafts ? "review-draft-v1" : "preserve-status-v1"}`,
      );
      if (reviewDrafts && target?._status === "published")
        throw new Error(
          "Review import will not unpublish an existing published target",
        );
      const decision = importDecision(
        effectiveChecksum,
        previous?.data?.sourceChecksum,
        target ? fingerprint(target) : undefined,
        previous?.data?.targetChecksum,
      );
      result.outcome = decision;
      if (decision === "create" || decision === "update") {
        const authorKey = `${inventory.site}#author:${item.author}`;
        let author = (
          await payload.find({
            collection: "authors",
            where: { legacyKey: { equals: authorKey } },
            limit: 1,
          })
        ).docs[0];
        if (!author) {
          const sourceAuthor = inventory.authors.find(
            (a) => String(a["wp:author_login"]) === item.author,
          );
          author = await payload.create({
            collection: "authors",
            data: {
              name: sourceAuthor?.["wp:author_display_name"] ?? item.author,
              legacyKey: authorKey,
            },
          });
        }
        const taxonomy = [];
        for (const term of item.taxonomy) {
          const key = `${inventory.site}#${term.kind}:${term.slug}`;
          const found =
            (
              await payload.find({
                collection: "taxonomy",
                where: { legacyKey: { equals: key } },
                limit: 1,
              })
            ).docs[0] ??
            (await payload.create({
              collection: "taxonomy",
              data: {
                name: term.name,
                path: `/${term.kind === "post_tag" ? "tag" : "category"}/${term.slug}/`,
                kind: term.kind === "post_tag" ? "tag" : "category",
                legacyKey: key,
              },
            }));
          taxonomy.push(found.id);
        }
        const data = {
          title: item.title,
          path: item.path,
          legacyKey: item.key,
          legacyStatus: item.status,
          kind: item.type === "page" ? "page" : "article",
          dek: item.excerpt || item.title,
          category:
            item.taxonomy.find((t) => t.kind === "category")?.name ??
            "Uncategorized",
          author: author.id,
          taxonomy,
          legacyHTML: rewriteLegacyHTML(
            item.cleanHTML,
            inventory.site,
            mediaURLs,
          ),
          featuredImage: (() => {
            const attachment = inventory.items.find(
              (source) =>
                source.id === item.meta._thumbnail_id &&
                source.type === "attachment",
            );
            return attachment
              ? mediaIDs.get(attachment.attachmentURL)
              : undefined;
          })(),
          importChecksum: item.checksum,
          seo: item.seo,
          publishedAt:
            item.publishedAt && !item.publishedAt.startsWith("0000")
              ? new Date(item.publishedAt.replace(" ", "T") + "Z").toISOString()
              : undefined,
          modifiedAt:
            item.modifiedAt && !item.modifiedAt.startsWith("0000")
              ? new Date(item.modifiedAt.replace(" ", "T") + "Z").toISOString()
              : undefined,
          _status: reviewDrafts ? "draft" : targetStatus(item.status),
        };
        const saved = target
          ? await payload.update({
              collection: "stories",
              id: target.id,
              data,
              context: { trustedImport: true, migrationReview: reviewDrafts },
            })
          : await payload.create({
              collection: "stories",
              data,
              context: { trustedImport: true, migrationReview: reviewDrafts },
            });
        result.targetID = saved.id;
        result.targetPath = saved.path;
        const audit = {
          name: item.title,
          key: item.key,
          state: reviewDrafts ? "needs-review" : "imported",
          data: {
            sourceChecksum: effectiveChecksum,
            targetChecksum: fingerprint(saved),
            targetID: saved.id,
            originalStatus: item.status,
            issues: result.issues,
            reviewOnly: reviewDrafts,
          },
        };
        if (previous)
          await payload.update({
            collection: "migration-records",
            id: previous.id,
            data: audit,
          });
        else
          await payload.create({
            collection: "migration-records",
            data: audit,
          });
      } else if (target) {
        result.targetID = target.id;
        result.targetPath = target.path;
      }
    } catch (error) {
      result.outcome = "failed";
      let cause: any = error;
      while (cause?.cause) cause = cause.cause;
      result.issues.push(String(cause?.message ?? error).slice(0, 500));
      result.errorCode = cause?.code;
      result.constraint = cause?.constraint;
    }
  } else if (result.issues.length) result.outcome = "needs-review";
  report.records.push(result);
}
for (const url of report.urls) {
  const record = report.records.find((r: any) => r.oldURL === url.url);
  if (
    record?.targetID &&
    ["create", "update", "unchanged"].includes(record.outcome)
  ) {
    url.disposition = reviewDrafts ? "draft-preview-only" : "same-path-page";
    url.targetID = record.targetID;
  }
}
report.summary = {
  total: report.records.length,
  unresolved: report.records.filter(
    (r: any) =>
      r.issues.length || ["failed", "editorial-conflict"].includes(r.outcome),
  ).length,
  unaccountedURLs: report.urls.filter(
    (u: any) => u.disposition === "unaccounted-public-url",
  ).length,
  pendingURLs: report.urls.filter(
    (u: any) => u.disposition === "pending-import",
  ).length,
};
await writeFile(
  path.join(privateDir, "reconciliation.json"),
  JSON.stringify(report, null, 2),
);
console.log(
  JSON.stringify(
    {
      report: path.join(privateDir, "reconciliation.json"),
      ...report.summary,
      complete: false,
    },
    null,
    2,
  ),
);
if (payload) await payload.destroy();
process.exit(0);
