import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
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
  if (apply && ["post", "page"].includes(item.type) && !result.issues.length) {
    try {
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
          ]),
        );
      const decision = importDecision(
        item.checksum,
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
          legacyHTML: item.cleanHTML,
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
          _status: targetStatus(item.status),
        };
        const saved = target
          ? await payload.update({
              collection: "stories",
              id: target.id,
              data,
              context: { trustedImport: true },
            })
          : await payload.create({
              collection: "stories",
              data,
              context: { trustedImport: true },
            });
        result.targetID = saved.id;
        result.targetPath = saved.path;
        const audit = {
          name: item.title,
          key: item.key,
          state: "imported",
          data: {
            sourceChecksum: item.checksum,
            targetChecksum: fingerprint(saved),
            targetID: saved.id,
            originalStatus: item.status,
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
      result.issues.push(
        error instanceof Error ? error.message : String(error),
      );
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
    url.disposition = "same-path-page";
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
    (u: any) => u.disposition !== "same-path-page",
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
