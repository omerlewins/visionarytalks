const fs = require("fs"),
  path = require("path"),
  { chromium } = require("../../../app/node_modules/playwright");
const base = process.env.IPO_CHECK_URL || "http://127.0.0.1:3128";
const out = path.resolve(
  "private/growth/2026-10-26/anthropic-ipo",
  base.includes("visionarytalks.com") ? "live-qa" : "rehearsal-qa",
);
fs.mkdirSync(out, { recursive: true });
const check = (ok, message) => {
  if (!ok) throw Error(message);
};
let browser;
(async () => {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    }),
    page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const response = await page.goto(base + "/anthropic-ipo/", {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  check(response.status() === 200, "Article not public");
  check((await page.locator("h1").count()) === 1, "Duplicate H1");
  check(
    (await page.locator("h1").innerText()).includes("Who Bears the Risk"),
    "Wrong headline",
  );
  check(
    (await page.locator(".legacy-content table").count()) === 6,
    "Six analytical tables missing",
  );
  check(
    (await page.locator(".editorial-chart").count()) === 1,
    "Shared revenue chart missing",
  );
  check(
    (await page.locator("#sources li").count()) === 3,
    "Primary source records missing",
  );
  check(
    (await page.locator('link[rel="canonical"]').getAttribute("href")) ===
      "https://visionarytalks.com/anthropic-ipo/",
    "Wrong canonical",
  );
  check(
    !(
      (await page.locator('meta[name="robots"]').getAttribute("content")) || ""
    ).includes("noindex"),
    "Public article noindexed",
  );
  const body = await page.locator(".article-body").innerText();
  for (const fact of [
    "85.4%",
    "$72.388 billion",
    "$161.2B",
    "$23.7 billion",
    "900%",
    "5% to 7%",
  ])
    check(body.includes(fact), "Missing " + fact);
  const broken = await page
    .locator('nav[aria-label="Table of contents"] a')
    .evaluateAll((as) =>
      as
        .filter(
          (a) => !document.getElementById(decodeURIComponent(a.hash.slice(1))),
        )
        .map((a) => a.hash),
    );
  check(!broken.length, "Broken TOC anchors " + broken);
  await page.screenshot({ path: path.join(out, "desktop.png") });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    check(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "Document overflows " + width,
    );
    await page.screenshot({ path: path.join(out, "mobile-" + width + ".png") });
  }
  const nojs = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 900 },
    }),
    plain = await nojs.newPage();
  await plain.goto(base + "/anthropic-ipo/", { waitUntil: "load" });
  check(
    (await plain.locator(".legacy-content table").count()) === 6,
    "No-JS tables missing",
  );
  check(
    (await plain.locator("#sources li").count()) === 3,
    "No-JS source records missing",
  );
  check(
    (await plain.locator(".article-body").innerText()).includes("conditional"),
    "No-JS analysis missing",
  );
  check(
    await plain.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "No-JS overflow",
  );
  await page.goto(base + "/", { waitUntil: "networkidle" });
  check(
    (await page.locator('a[href="/anthropic-ipo/"]').count()) > 0,
    "Homepage discovery missing",
  );
  const sitemap = await (await page.request.get(base + "/sitemap.xml")).text();
  check(
    sitemap.split("https://visionarytalks.com/anthropic-ipo/").length === 2,
    "Sitemap discovery missing or duplicated",
  );
  check(!errors.length, "Browser errors " + errors.join("; "));
  fs.writeFileSync(
    path.join(out, "results.json"),
    JSON.stringify(
      {
        base,
        checkedAt: new Date().toISOString(),
        passed: true,
        tables: 6,
        sources: 3,
        chartPoints: 6,
        checks: [
          "canonical and indexability",
          "single H1",
          "primary source ledger",
          "key financial figures",
          "TOC anchors",
          "desktop",
          "390px and 320px",
          "no JavaScript",
          "homepage",
          "sitemap",
          "no browser errors",
        ],
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({
      base,
      passed: true,
      tables: 6,
      sources: 3,
      mobileWidths: [390, 320],
      noJavaScript: true,
    }),
  );
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await browser?.close();
  });
