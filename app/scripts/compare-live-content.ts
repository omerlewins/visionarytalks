import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { inspectWXR } from "../src/migration/wordpress";
const source = inspectWXR(
  await readFile("../private/wordpress-2026-10-08.xml", "utf8"),
);
const audit = JSON.parse(
  await readFile("../private/ranking-audit/http-results.json", "utf8"),
);
console.log(
  "Source pages",
  JSON.stringify(
    source.items
      .filter((i) => i.type === "page")
      .map((i) => ({
        id: i.id,
        path: i.path,
        status: i.status,
        chars: i.cleanHTML.length,
      })),
  ),
);
const browser = await chromium.launch();
const page = await browser.newPage();
const results = [];
await page.evaluate("window.__name = (fn) => fn");
for (const row of audit.filter(
  (r: any) => r.live.status === 200 && r.live.htmlFile,
)) {
  const canonical = new URL(row.live.canonical ?? row.live.finalURL).pathname;
  const item = source.items.find(
    (i) => i.path === canonical && i.type === "post",
  );
  if (!item) continue;
  const html = await readFile(
    `../private/ranking-audit/live/${row.live.htmlFile}`,
    "utf8",
  );
  const comparison = await page.evaluate(
    ({ html, source }) => {
      const dom = new DOMParser().parseFromString(html, "text/html");
      const article = dom.querySelector(".fn__single_content");
      if (!article) return { match: false, reason: "No article selector" };
      const original = new DOMParser().parseFromString(source, "text/html");
      for (const d of [article, original.body])
        d.querySelectorAll("script,style").forEach((n) => n.remove());
      // WordPress wptexturize changes typography at render time, not the stored article.
      const normalize = (s: string) =>
        s
          .replace(/[‘’]/g, "'")
          .replace(/[“”]/g, '"')
          .replace(/–/g, "-")
          .replace(/…/g, "...")
          .replace(/\s+/g, " ")
          .trim();
      const a = normalize(article.textContent ?? ""),
        b = normalize(original.body.textContent ?? "");
      let index = 0;
      while (index < Math.min(a.length, b.length) && a[index] === b[index])
        index++;
      return {
        firstDifference: index,
        liveDifference: a.slice(Math.max(0, index - 60), index + 450),
        sourceDifference: b.slice(Math.max(0, index - 60), index + 450),
        match: a === b,
        sourceContained: a.includes(b),
        liveLength: a.length,
        sourceLength: b.length,
        liveStart: a.slice(0, 160),
        sourceStart: b.slice(0, 160),
      };
    },
    { html, source: item.cleanHTML },
  );
  results.push({ path: row.path, ...comparison });
}
await browser.close();
await writeFile(
  "../private/ranking-audit/live-content-comparison.json",
  JSON.stringify(results, null, 2),
);
console.log(
  JSON.stringify(
    {
      compared: results.length,
      typographyNormalizedMatches: results.filter((r) => r.match).length,
      contained: results.filter((r) => r.sourceContained).length,
      differences: results.filter((r) => !r.match),
    },
    null,
    2,
  ),
);
