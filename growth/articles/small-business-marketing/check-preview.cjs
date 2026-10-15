const fs = require('node:fs');
const assert = require('node:assert/strict');
const { chromium } = require('../../../app/node_modules/@playwright/test');
const protect = require('../../ai-people-2027/preview-check-access.cjs');
const article = require('./article.json');
const base = process.argv[2] || 'http://127.0.0.1:3126';
if (!/^(http:\/\/127\.0\.0\.1:3126|https:\/\/visionarytalks-[a-z0-9]+-omer-webielcoms-projects\.vercel\.app)$/.test(base)) throw Error('Preview origin required');
(async () => {
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const width of [1440, 390]) for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled });
      const page = await context.newPage();
      await protect(page, base);
      const response = await page.goto(base + article.path, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      assert.equal(await page.locator('h1').innerText(), article.title);
      for (const heading of article.sourceDocument.headings) {
        assert.equal(await page.locator('.article-body h2').filter({ hasText: heading }).count(), 1);
      }
      assert.ok((await page.locator('.article-body').innerText()).includes('create better opportunities for long-term growth.'));
      for (const url of ['https://antdisplay.com/', 'https://rtdisplay.com/']) {
        assert.equal(await page.locator('.article-body p a').evaluateAll((nodes, url) => nodes.filter(a => a.href === url).length, url), 1);
      }
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), article.seo.canonical);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(/[\u2013\u2014]/.test(await page.locator('article').innerText()), false);
      if (javaScriptEnabled) await page.screenshot({ path: `private/article-imports/article-${width}.png`, fullPage: true });
      await page.goto(base + '/', { waitUntil: 'networkidle' });
      assert.equal(await page.locator(`a[href="${article.path}"]`).count(), 0);
      results.push({ width, javaScriptEnabled, complete: true, homepageExcluded: true });
      await context.close();
    }
    fs.writeFileSync('private/article-imports/checks.json', JSON.stringify({ base, results }, null, 2));
    console.log(JSON.stringify({ base, results }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
