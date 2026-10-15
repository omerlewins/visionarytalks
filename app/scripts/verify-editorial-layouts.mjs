import { chromium } from "@playwright/test";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const deployed = process.argv.includes("--deployed");
const access = deployed
  ? JSON.parse(await readFile("../private/preview-access.json", "utf8"))
  : { url: "http://localhost:3000" };
const auth = JSON.parse(
  await readFile(
    deployed ? "../private/preview-owner.json" : "../private/browser-auth.json",
    "utf8",
  ),
);
const browser = await chromium.launch();
const context = await browser.newContext();
const headers = deployed ? { "x-vercel-protection-bypass": access.bypass } : {};
await context.route("**/*", async (route) =>
  route.continue({
    headers: {
      ...route.request().headers(),
      ...(new URL(route.request().url()).origin === access.url ? headers : {}),
    },
  }),
);
assert.equal(
  (
    await context.request.post(access.url + "/api/users/login", {
      headers,
      data: auth,
    })
  ).status(),
  200,
);
const docs = (
  await (
    await context.request.get(access.url + "/api/stories?limit=200&depth=0", {
      headers,
    })
  ).json()
).docs;
const owns = docs.filter((doc) => doc.kind === "ownership" && doc.legacyKey);
assert.equal(owns.length, 61);
const route = (doc) =>
  access.url +
  (deployed && doc._status === "published" ? doc.path : `/preview/${doc.id}/`);
const page = await context.newPage();
await page.setViewportSize({ width: 390, height: 900 });
let checked = 0;
for (const doc of owns) {
  assert.equal((await page.goto(route(doc))).status(), 200);
  assert.equal(
    await page.locator(".ownership-story .ownership-cover").count(),
    1,
  );
  assert.equal(
    await page.locator(".ownership-short-answer").count(),
    /<p\b/i.test(doc.legacyHTML) ? 1 : 0,
    doc.path,
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
    doc.path,
  );
  const preserved = await page.evaluate((html) => {
    const normalize = (text) => text.replace(/\s+/g, " ").trim();
    const source = new DOMParser().parseFromString(html, "text/html").body
      .textContent;
    const rendered = document
      .querySelector(".legacy-content")
      .textContent.replace("THE SHORT ANSWER", "");
    return normalize(source) === normalize(rendered);
  }, doc.legacyHTML);
  assert.ok(preserved, `Rendered content preserved: ${doc.path}`);
  if (++checked % 20 === 0)
    console.log(`Verified ${checked}/61 ownership articles`);
}
const cursor = owns.find((doc) => doc.path === "/who-owns-cursor/");
const chartDoc = docs.find((doc) => doc.path === "/net-worth-by-age/");
const output = "../private/editorial-review" + (deployed ? "-deployed" : "");
await mkdir(output, { recursive: true });
for (const width of [360, 390, 430, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 1100 });
  for (const [name, doc] of [
    ["ownership", cursor],
    ["chart", chartDoc],
  ]) {
    await page.goto(route(doc));
    await page.evaluate(() => document.fonts.ready);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
      `${name} ${width}`,
    );
    if (name === "chart") {
      const chart = page.locator(".editorial-chart");
      await chart.scrollIntoViewIfNeeded();
      assert.equal(await chart.locator(".plot-bar").count(), 12);
      await chart.screenshot({ path: `${output}/${width}-chart.png` });
    } else await page.screenshot({ path: `${output}/${width}-ownership.png` });
  }
}
const result = {
  status: "passed",
  deployed,
  ownershipArticles: owns.length,
  renderedContentPreserved: true,
  chartValues: 12,
  widths: [360, 390, 430, 768, 1024, 1440],
};
await writeFile(`${output}/result.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
await browser.close();
