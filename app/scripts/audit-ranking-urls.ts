import { readFile, writeFile, mkdir } from "node:fs/promises";
import { inspectWXR } from "../src/migration/wordpress";
import sanitize from "sanitize-html";
import { decodeHTML } from "entities";
import { request } from "@playwright/test";
const root = "../private/ranking-audit";
await mkdir(root, { recursive: true });
const rows = JSON.parse(
  await readFile("../private/search-console-pages.json", "utf8"),
);
const source = inspectWXR(
  await readFile("../private/wordpress-2026-10-08.xml", "utf8"),
);
const access = JSON.parse(
  await readFile("../private/preview-access.json", "utf8"),
);
const owner = JSON.parse(
  await readFile("../private/preview-owner.json", "utf8"),
);
const api = await request.newContext({
  baseURL: access.url,
  extraHTTPHeaders: { "x-vercel-protection-bypass": access.bypass },
  timeout: 30000,
});
if (!(await api.post("/api/users/login", { data: owner })).ok())
  throw new Error("CMS login failed");
const docs = (await (await api.get("/api/stories?limit=300&depth=0")).json())
  .docs;
const text = (html: string) =>
  decodeHTML(sanitize(html, { allowedTags: [], allowedAttributes: {} }))
    .replace(/\s+/g, " ")
    .trim();
const result = rows.map((row: any) => {
  const url = new URL(row["Top pages"]);
  if (!["visionarytalks.com", "www.visionarytalks.com"].includes(url.hostname))
    throw new Error("Unexpected source host");
  const path = url.pathname + url.search;
  const item =
    source.items.find((item) => item.path === path && item.type === "post") ??
    source.items.find((item) => item.path === path && item.type === "page") ??
    source.items.find((item) => item.path === path);
  const doc = docs.find((doc: any) => doc.path === path);
  return {
    url: url.href,
    path,
    clicks: Number(row.Clicks),
    impressions: Number(row.Impressions),
    sourceID: item?.id,
    sourceType: item?.type,
    sourceStatus: item?.status,
    targetID: doc?.id,
    targetStatus: doc?._status,
    checksumMatches:
      item && doc ? item.checksum === doc.importChecksum : undefined,
    textMatches:
      item && doc
        ? text(item.cleanHTML) === text(doc.legacyHTML ?? "")
        : undefined,
    kind: doc?.kind,
    issue: doc
      ? ""
      : item
        ? "Source record not public in CMS"
        : path.startsWith("/wp-content/uploads/")
          ? "Media URL"
          : /^\/(category|tag|author|hot-posts)\//.test(path)
            ? "Archive URL"
            : path === "/"
              ? "Homepage"
              : "Not in supplied WordPress export",
  };
});
await writeFile(
  `${root}/source-comparison.json`,
  JSON.stringify(result, null, 2),
);
console.log(
  JSON.stringify(
    {
      rankingURLs: result.length,
      sourceMatches: result.filter((r: any) => r.sourceID).length,
      articleMatches: result.filter((r: any) => r.targetID).length,
      contentMismatches: result.filter(
        (r: any) => r.targetID && (!r.checksumMatches || !r.textMatches),
      ),
      missing: result
        .filter((r: any) => !r.targetID)
        .map((r: any) => ({
          path: r.path,
          clicks: r.clicks,
          impressions: r.impressions,
          issue: r.issue,
        })),
    },
    null,
    2,
  ),
);
await api.dispose();
