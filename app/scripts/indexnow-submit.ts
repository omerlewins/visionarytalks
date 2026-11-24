// Manual IndexNow submission for URLs that changed outside a CMS publish
// (code-only pages, catch-up after an outage). Bing, Yandex, Seznam, Naver
// and other IndexNow engines only; Google is not part of IndexNow.
// Usage:
//   tsx scripts/indexnow-submit.ts /some-path/ https://visionarytalks.com/other/
//   tsx scripts/indexnow-submit.ts --since 2026-11-24   (live sitemap entries
//                                                       modified on/after date)
// Add --dry-run to print the URLs without submitting.
import { publicationURL } from "../src/lib/seo";
import { indexNowPayload, indexNowEndpoint } from "../src/lib/indexnow";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const sinceIndex = args.indexOf("--since");
const since = sinceIndex > -1 ? new Date(args[sinceIndex + 1]) : undefined;
const urls = new Set(
  args
    .filter((a, i) => !a.startsWith("--") && i !== sinceIndex + 1)
    .map((a) => new URL(a, publicationURL).href),
);
if (since) {
  if (Number.isNaN(since.getTime())) throw Error("--since needs a date");
  const xml = await (await fetch(publicationURL + "/sitemap.xml")).text();
  for (const [, block] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const mod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    if (loc && mod && new Date(mod) >= since) urls.add(loc.trim());
  }
}
const list = [...urls].filter((u) => u.startsWith(publicationURL + "/"));
if (!list.length) throw Error("No visionarytalks.com URLs to submit");
console.log(list.join("\n"));
if (dryRun) process.exit(0);
// IndexNow accepts up to 10,000 URLs per request.
for (let i = 0; i < list.length; i += 10000) {
  const response = await fetch(indexNowEndpoint, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(indexNowPayload(list.slice(i, i + 10000))),
  });
  console.log(`IndexNow ${response.status} ${await response.text()}`);
  if (!response.ok && response.status !== 202) process.exitCode = 1;
}
