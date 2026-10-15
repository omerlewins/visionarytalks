const fs = require("fs"),
  assert = require("node:assert/strict"),
  { chromium } = require("../../app/node_modules/@playwright/test");
const base = process.argv[2] || "http://127.0.0.1:3126";
if (
  !/^(?:http:\/\/127\.0\.0\.1:3126|https:\/\/visionarytalks-[a-z0-9]+-omer-webielcoms-projects\.vercel\.app)$/.test(
    base,
  )
)
  throw Error("Preview origin required");
const output = "private/home-consolidated";
fs.mkdirSync(output, { recursive: true });
const access = base.includes(".vercel.app")
  ? JSON.parse(fs.readFileSync("private/preview-access.json", "utf8"))
  : null;
async function connect(page) {
  if (access)
    await page.route(base + "/**", (route) =>
      route.continue({
        headers: {
          ...route.request().headers(),
          "x-vercel-protection-bypass": access.bypass,
        },
      }),
    );
}
(async () => {
  const browser = await chromium.launch(),
    results = [];
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({
        viewport: { width, height: 1000 },
        extraHTTPHeaders: { DNT: "1" },
      });
      await connect(page);
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.addInitScript(() => {
        window.__cls = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries())
            if (!e.hadRecentInput) window.__cls += e.value;
        }).observe({ type: "layout-shift", buffered: true });
      });
      assert.equal(
        (await page.goto(base + "/", { waitUntil: "networkidle" })).status(),
        200,
      );
      assert.ok(
        (
          await page
            .locator(".watchlist-hero img")
            .evaluateAll((imgs) => imgs.map((i) => i.loading))
        ).every((v) => v === "eager"),
      );
      await page.evaluate(async () =>
        Promise.all(
          [...document.images].map(async (img) => {
            img.loading = "eager";
            await img.decode().catch(() => {});
          }),
        ),
      );
      const before = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        cls: window.__cls,
        headings: [...document.querySelectorAll("main > section")].map(
          (s) => s.className,
        ),
        portraits: [
          ...document.querySelectorAll(
            ".watchlist-hero .home-watchlist-portraits a",
          ),
        ].map((a) => ({
          id: a.dataset.person,
          src: a.querySelector("img").currentSrc,
          loading: a.querySelector("img").loading,
          company: a.querySelector("small")?.textContent,
        })),
        latest: [...document.querySelectorAll(".latest-rail h3 a")].map((a) =>
          a.getAttribute("href"),
        ),
        lead: document
          .querySelector(".lead-display-headline a")
          ?.getAttribute("href"),
        leadHeadline: document.querySelector(".lead-display-headline")
          ?.textContent,
        figures: document.querySelectorAll(".figures-strip li").length,
        paths: document.querySelectorAll(".home-money-map svg a[data-state]")
          .length,
        billionaires: document.querySelectorAll(".money-billionaires li")
          .length,
        broken: [...document.images]
          .filter((i) => !i.complete || i.naturalWidth === 0)
          .map((i) => i.src),
        longDashes: /[\u2013\u2014]/.test(document.body.innerText),
        mobilePortraitScroll: (() => {
          const e = document.querySelector(
            ".watchlist-hero .home-watchlist-portraits",
          );
          return e.scrollWidth > e.clientWidth;
        })(),
      }));
      assert.equal(await page.locator("h1").count(), 1);
      assert.match(
        await page.locator("h1").innerText(),
        /100 AI people to watch/,
      );
      assert.equal(before.portraits.length, 10);
      assert.ok(before.portraits.every((p) => p.company));
      assert.ok(
        [
          "ying-sheng",
          "sharon-zhou",
          "emma-lundberg",
          "beth-barnes",
          "helen-toner",
        ].every((id) => before.portraits.some((p) => p.id === id)),
      );
      assert.equal(before.latest.length, 6);
      assert.ok(!before.latest.includes("/ai-people-to-watch/"));
      assert.ok(!before.latest.includes(before.lead));
      if (before.lead === "/leaders/ali-ghodsi/")
        assert.equal(
          before.leadHeadline,
          "The Berkeley professor behind Databricks' $7.6B fortune",
        );
      assert.equal(before.overflow, false);
      assert.equal(before.longDashes, false);
      assert.deepEqual(before.broken, []);
      assert.deepEqual(errors, []);
      assert.equal(before.paths, 51);
      assert.equal(await page.locator(".millionaire-bars li").count(), 10);
      assert.ok(before.billionaires > 0);
      assert.ok(before.figures >= 8 && before.figures <= 10);
      if (width === 390) assert.equal(before.mobilePortraitScroll, true);
      assert.match(before.headings[0], /watchlist-hero/);
      assert.match(before.headings[1], /newsroom-section/);
      assert.match(before.headings[2], /home-leaders/);
      assert.match(before.headings[3], /home-money/);
      assert.match(before.headings[4], /company-files/);
      await page.locator("#money").evaluate(e => e.scrollIntoView({block:"start",behavior:"instant"}));
      await page.locator(".home-map-explorer select").selectOption("MS");
      await page.waitForFunction(() => document.querySelector('.home-map-readout')?.innerText.includes('Mississippi'));
      assert.match(
        await page.locator(".home-map-readout").innerText(),
        /Mississippi.*\$2.9M/,
      );
      assert.equal(
        await page.locator(".home-money-map").getAttribute("data-selected"),
        "MS",
      );
      await page.locator('.home-money-map svg a[data-state="CA"]').focus();
      assert.match(
        await page.locator(".home-map-readout").innerText(),
        /California.*\$19.8M/,
      );
      await page.locator(".home-map-explorer select").focus();
      await page.locator(".home-money-table summary").click();
      assert.equal(
        await page.locator(".home-money-table tbody tr").count(),
        51,
      );
      await page.locator(".home-money-table summary").click();
      await page.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(
        await page
          .locator(".home-watchlist-portraits")
          .evaluate((e) => getComputedStyle(e).scrollBehavior),
        "auto",
      );
      // Reveal deferred sections only for a complete screenshot, never for Lighthouse.
      const captureStyle = await page.addStyleTag({content:".home-leaders,.home-money,.company-files,.home-ai-index,.careers-section,.home-map-overview{content-visibility:visible!important}"});
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `${output}/after-${width}.png` });
      await page.screenshot({
        path: `${output}/after-full-${width}.png`,
        fullPage: true,
      });
      await page
        .locator("#money")
        .evaluate((e) => e.scrollIntoView({ block: "start" }));
      await page.screenshot({ path: `${output}/after-money-${width}.png` });
      await captureStyle.evaluate(e => e.remove());
      results.push({ width, ...before });
      await page.close();
    }
    const touch = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      extraHTTPHeaders: { DNT: "1" },
    });
    await connect(touch);
    await touch.goto(base + "/");
    await touch.locator("#money").evaluate(e => e.scrollIntoView({block:"start",behavior:"instant"}));
    await touch.locator('.home-money-map svg a[data-state="NY"]').tap();
    assert.match(
      await touch.locator(".home-map-readout").innerText(),
      /New York/,
    );
    assert.equal(new URL(touch.url()).pathname, "/");
    await touch.close();
    const context = await browser.newContext({
        javaScriptEnabled: false,
        viewport: { width: 390, height: 1000 },
      }),
      page = await context.newPage();
    await connect(page);
    await page.goto(base + "/");
    await page.locator("#money").evaluate(e => e.scrollIntoView({block:"start",behavior:"instant"}));
    assert.equal(await page.locator(".home-money-map svg path").count(), 51);
    assert.equal(await page.locator(".watchlist-hero img").count(), 10);
    assert.equal(await page.locator(".latest-rail li").count(), 6);
    await page.locator(".home-money-table summary").click();
    assert.ok(
      await page.locator(".home-money-table tbody tr").first().isVisible(),
    );
    await page.locator(".home-map-explorer select").selectOption("MS");
    await page.locator(".home-map-explorer button").click();
    await page.waitForURL((u) => u.searchParams.get("state") === "MS");
    await page.locator("#money").evaluate(e => e.scrollIntoView({block:"start",behavior:"instant"}));
    await page.waitForFunction(() => document.querySelector('.home-map-readout')?.innerText.includes('Mississippi'));
    assert.match(
      await page.locator(".home-map-readout").innerText(),
      /Mississippi.*\$2.9M/,
    );
    await page.locator(".home-money-table summary").click();
    await page.locator('.home-money-table a[href$="#state-hi"]').click();
    await page.locator("#state-hi").waitFor({ state: "visible" });
    assert.equal(new URL(page.url()).hash, "#state-hi");
    results.push({
      noJavaScript: true,
      nativeStateForm: true,
      stateAnchorVisible: true,
    });
    fs.writeFileSync(
      output + "/checks.json",
      JSON.stringify({ base, at: new Date().toISOString(), results }, null, 2),
    );
    console.log(
      JSON.stringify(
        results.map(({ portraits, ...r }) => ({
          ...r,
          portraits: portraits?.length,
        })),
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
