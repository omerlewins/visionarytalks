import { chromium, request } from "@playwright/test";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
const access = JSON.parse(
  await readFile("../private/preview-access.json", "utf8"),
);
const base = process.env.REVIEW_URL || access.url;
const headers =
  base === access.url ? { "x-vercel-protection-bypass": access.bypass } : {};
const api = await request.newContext({
  baseURL: base,
  extraHTTPHeaders: headers,
  timeout: 60000,
});
const audit = JSON.parse(
  await readFile("../private/ranking-audit/http-results.json", "utf8"),
);
const dir = "../private/ranking-release";
await mkdir(dir, { recursive: true });
const results = [];
for (let i = 0; i < audit.length; i += 4) {
  await Promise.all(
    audit.slice(i, i + 4).map(async (row) => {
      let response = await api.get(row.path, { maxRedirects: 0 });
      const initialStatus = response.status();
      const location = response.headers().location;
      if ([301, 308].includes(initialStatus)) {
        const destination = new URL(location, base);
        assert.equal(destination.origin, base);
        response = await api.get(destination.href, { maxRedirects: 0 });
      }
      const result = {
        path: row.path,
        liveStatus: row.live.status,
        initialStatus,
        status: response.status(),
        location,
        clicks: row.clicks,
      };
      if (row.path.startsWith("/wp-content/uploads/") && response.ok())
        result.binaryMatchesLive =
          createHash("sha256")
            .update(await response.body())
            .digest("hex") === row.live.sha256;
      results.push(result);
    }),
  );
  await writeFile(`${dir}/urls.json`, JSON.stringify(results, null, 2));
  console.log(`Verified ${results.length}/${audit.length} paths`);
}
const failures = results.filter(
  (r) => r.liveStatus === 200 && r.status !== 200,
);
assert.deepEqual(failures, [], "Every currently live ranking URL must resolve");
assert.equal(
  results.find((r) => r.path === "/aya-new-york-and-valuebase-head-to-court/")
    .status,
  404,
);
const docs = (await (await api.get("/api/stories?limit=300&depth=1")).json())
  .docs;
assert.equal(docs.filter((d) => d.kind !== "page").length, 100);
assert.equal(docs.filter((d) => d.kind === "ownership").length, 58);
assert.equal(docs.filter((d) => d.kind === "salary").length, 13);
assert.equal(docs.filter((d) => d.kind === "leader").length, 10);
const browser = await chromium.launch();
const context = await browser.newContext();
await context.route("**/*", async (route) => {
  if (new URL(route.request().url()).origin === base)
    await route.continue({
      headers: { ...route.request().headers(), ...headers },
    });
  else await route.continue();
});
const page = await context.newPage();
const layouts = [];
for (const width of [360, 390, 430, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const path of [
    "/category/ownership/",
    "/category/careers/",
    "/category/people/",
    "/category/money/page/9/",
    "/hot-posts/page/10/",
    "/who-owned-saab/",
    "/john-ternus-net-worth/",
    "/openai-salary/",
    "/privacy-policy/",
  ]) {
    const response = await page.goto(base + path, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200, path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    );
    assert.equal(overflow, false, `${width} ${path} overflow`);
    if (path.startsWith("/category/") || path.startsWith("/hot-posts/"))
      assert.ok(
        await page.locator(".archive-grid a").count(),
        `${path} populated`,
      );
    await page.screenshot({
      path: `${dir}/${path.replaceAll("/", "_")}-${width}.png`,
      fullPage: true,
    });
    layouts.push({ width, path, overflow: false });
  }
}
await page.goto(base + "/category/ownership/");
assert.match(await page.locator("main").innerText(), /58 stories/);
await page.getByRole("link", { name: "Next →", exact: true }).click();
await page.waitForURL(/\/category\/ownership\/page\/2\//);
assert.match(page.url(), /\/category\/ownership\/page\/2\//);
await page.goto(base + "/who-owns-fiji-water/");
assert.equal(
  await page.locator("link[rel=canonical]").getAttribute("href"),
  "https://visionarytalks.com/who-owns-fiji-water/",
);
const owner = JSON.parse(
  await readFile("../private/preview-owner.json", "utf8"),
);
assert.equal(
  (await api.post("/api/users/login", { data: owner })).status(),
  200,
);
const all = (await (await api.get("/api/stories?limit=300&depth=0")).json())
  .docs;
const anonymous = await request.newContext({
  baseURL: base,
  extraHTTPHeaders: headers,
});
await writeFile(`${dir}/layouts.json`, JSON.stringify(layouts, null, 2));
const privateDocs = all.filter((d) => d._status === "draft" && d.legacyStatus !== 'publish');
for (const doc of privateDocs)
  assert.equal(
    (await anonymous.get(doc.path)).status(),
    404,
    `Draft private ${doc.path}`,
  );
await writeFile(`${dir}/layouts.json`, JSON.stringify(layouts, null, 2));
console.log(
  JSON.stringify({
    url: base,
    paths: results.length,
    liveURLs: results.filter((r) => r.liveStatus === 200).length,
    liveURLFailures: failures.length,
    layouts: layouts.length,
    publicArticles: 100,
    ownership: 58,
    salary: 13,
    leader: 10,
    mediaExact: results.filter((r) => r.binaryMatchesLive === true).length,
    mediaDifferences: results
      .filter((r) => r.binaryMatchesLive === false)
      .map((r) => r.path),
    draftsPrivate: privateDocs.length,
  }),
);
await browser.close();
await api.dispose();
await anonymous.dispose();
