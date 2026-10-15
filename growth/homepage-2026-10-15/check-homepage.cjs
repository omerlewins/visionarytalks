const fs = require("fs"),
  { chromium } = require("../../app/node_modules/@playwright/test"),
  assert = require("node:assert/strict");
const base = process.argv[2] || "http://127.0.0.1:3125";
if (
  !/^(?:http:\/\/127\.0\.0\.1:3125|https:\/\/visionarytalks\.com|https:\/\/visionarytalks-[a-z0-9]+-omer-webielcoms-projects\.vercel\.app)$/.test(
    base,
  )
)
  throw Error("Unexpected verification origin");
(async () => {
  const browser = await chromium.launch(),
    report = [];
  const candidate = base.includes(".vercel.app");
  const access = candidate
    ? JSON.parse(fs.readFileSync("private/preview-access.json", "utf8"))
    : null;
  for (const width of [1440, 390]) {
    const page = await browser.newPage({
        viewport: { width, height: 1000 },
        extraHTTPHeaders: { DNT: "1" },
      }),
      errors = [];
    if (candidate)
      await page.route(base + "/**", (route) =>
        route.continue({
          headers: {
            ...route.request().headers(),
            "x-vercel-protection-bypass": access.bypass,
          },
        }),
      );
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript(() => {
      window.__homeCLS = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries())
          if (!e.hadRecentInput) window.__homeCLS += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    const response = await page.goto(base + "/", { waitUntil: "networkidle" });
    assert.equal(response.status(), 200);
    const optOut = page.getByRole("button", {
      name: "Opt out of analytics",
      exact: true,
    });
    if (await optOut.isVisible()) await optOut.click();
    await page.evaluate(async () => {
      await Promise.all(
        [...document.images].map(async (img) => {
          img.loading = "eager";
          await img.decode().catch(() => {});
        }),
      );
    });
    const result = await page.evaluate(() => {
      const main = document.querySelector("main"),
        hero = main.querySelector(".lead-edition");
      return {
        width: innerWidth,
        overflow: document.documentElement.scrollWidth > innerWidth,
        h1: main.querySelectorAll("h1").length,
        sectionOrder: [...main.children].map((e) => e.className),
        latest: document.querySelectorAll(".latest-rail li").length,
        lead: document.querySelector(".lead-story h1 a")?.getAttribute("href"),
        leadImage: document
          .querySelector(".lead-illustration img")
          ?.getAttribute("src"),
        figures: document.querySelectorAll(".figures-strip li").length,
        figuresFit: [...document.querySelectorAll(".figures-strip li")].every(
          (e) =>
            innerWidth > 600 || e.getBoundingClientRect().right <= innerWidth,
        ),
        ownershipUpdates:
          document.querySelectorAll(".ownership-week li").length,
        mostRead: document.querySelectorAll(".most-read li").length,
        leaderNames: [
          ...document.querySelectorAll(".home-leaders .leader-file h3"),
        ].map((e) => e.textContent),
        portraits: document.querySelectorAll(".home-watchlist-portraits img")
          .length,
        circles: [
          ...document.querySelectorAll(".home-watchlist-portraits img"),
        ].every((e) => getComputedStyle(e).borderRadius === "50%"),
        stampsMissing: [
          ...document.querySelectorAll("main .story,main .leader-file"),
        ].filter((e) => !e.querySelector("time.updated-stamp")).length,
        socials: [
          ...document.querySelectorAll(".footer-social .social-links a"),
        ].map((a) => ({ url: a.href, target: a.target, rel: a.rel })),
        topSocials: document.querySelectorAll(".utility .social-links a")
          .length,
        edition: document.querySelector(".edition-date")?.textContent,
        longDashes: /[\u2013\u2014]/.test(document.body.innerText),
        oldCopy:
          /The bets behind them|Email delivery hasn.t started yet|One documented contribution/.test(
            document.body.innerText,
          ),
        broken: [...document.images]
          .filter((i) => !i.naturalWidth)
          .map((i) => i.src),
        cls: window.__homeCLS,
        schemas: [
          ...document.querySelectorAll('script[type="application/ld+json"]'),
        ].map((e) => JSON.parse(e.textContent)),
      };
    });
    fs.writeFileSync(
      `private/home-redesign/debug-${width}.json`,
      JSON.stringify(result, null, 2),
    );
    assert.equal(result.h1, 1);
    assert.equal(result.latest, 6);
    assert.notEqual(result.lead, "/ai-people-to-watch/");
    assert.ok(result.figures >= 8 && result.figures <= 10);
    assert.ok(result.figuresFit);
    assert.equal(result.ownershipUpdates, 3);
    assert.equal(result.mostRead, 5);
    assert.equal(result.portraits, 6);
    assert.ok(result.circles);
    assert.deepEqual(result.leaderNames, [
      "Demis Hassabis",
      "Lucy Guo",
      "Mira Murati",
      "Aman Sanger",
    ]);
    assert.equal(result.stampsMissing, 0);
    assert.equal(result.overflow, false, "overflow");
    assert.equal(result.longDashes, false, "long dashes");
    assert.equal(result.oldCopy, false, "stale copy");
    assert.deepEqual(result.broken, []);
    assert.deepEqual(errors, []);
    assert.equal(result.topSocials, 3);
    assert.ok(
      result.socials.every(
        (s) => s.target === "_blank" && s.rel.includes("noopener"),
      ),
    );
    assert.equal(result.socials.length, 3);
    assert.ok(result.edition.includes(" ET"));
    assert.ok(
      result.schemas.some(
        (s) => s["@type"] === "Organization" && s.sameAs?.length === 3,
      ),
    );
    assert.match(result.sectionOrder[1], /home-leaders/);
    assert.match(result.sectionOrder[2], /company-files/);
    assert.match(result.sectionOrder[3], /home-ai-index/);
    assert.match(result.sectionOrder[4], /careers-section/);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `private/home-redesign/after-${width}.png` });
    await page.screenshot({
      path: `private/home-redesign/after-full-${width}.png`,
      fullPage: true,
    });
    await page.locator("#people").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `private/home-redesign/after-leaders-${width}.png`,
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await page
        .locator(".figures-strip")
        .evaluate((e) => getComputedStyle(e).animationName),
      "none",
    );
    report.push({ ...result, schemas: undefined });
    await page.close();
  }
  const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 1000 },
    }),
    page = await context.newPage();
  if (candidate)
    await page.route(base + "/**", (route) =>
      route.continue({
        headers: {
          ...route.request().headers(),
          "x-vercel-protection-bypass": access.bypass,
        },
      }),
    );
  await page.goto(base + "/");
  assert.equal(await page.locator(".latest-rail li").count(), 6);
  assert.ok((await page.locator(".figures-strip li").count()) >= 8);
  assert.equal(await page.locator(".ownership-week li").count(), 3);
  assert.equal(await page.locator(".most-read li").count(), 5);
  const native = page.locator(".home-ai-index details").first();
  await native.locator("summary").click();
  assert.ok(await native.evaluate((e) => e.open));
  report.push({ noJavaScript: "all new elements present in server HTML" });
  await browser.close();
  fs.writeFileSync(
    "private/home-redesign/after-check.json",
    JSON.stringify(
      { base, checkedAt: new Date().toISOString(), report },
      null,
      2,
    ),
  );
  console.log(JSON.stringify(report, null, 2));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
