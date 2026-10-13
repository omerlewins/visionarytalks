const { chromium } = require('../../app/node_modules/@playwright/test');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch();
  const results = [];
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(pathToFileURL(path.join(__dirname, 'preview.html')).href);
    if (await page.locator('.watch-person').count() !== 100) throw new Error('Missing full entries');
    await page.locator('[data-bottleneck="infrastructure"]').click();
    if (await page.locator('[data-watch-id]:visible').count() < 10) throw new Error('Category filter failed');
    await page.locator('.watch-reset').click();
    await page.locator('#watch-search').fill('Toner');
    if (await page.locator('[data-watch-id]:visible').count() !== 1) throw new Error('Search failed');
    await page.locator('#watch-search').fill('no-such-person');
    if (!await page.locator('.watch-empty').isVisible()) throw new Error('Empty state failed');
    await page.locator('.watch-reset').click();
    await page.locator('#watch-chapter').selectOption('applied');
    if (await page.locator('[data-watch-id]:visible').count() !== 22) throw new Error('Chapter filter failed');
    await page.locator('.watch-reset').click();
    const metrics = await page.evaluate(() => ({
      viewport: window.innerWidth,
      pageWidth: document.documentElement.scrollWidth,
      bars: [...document.querySelectorAll('.plot-bar')].map(el => ({height: el.getBoundingClientRect().height, label: el.textContent})),
      chartBackground: getComputedStyle(document.querySelector('.editorial-chart')).backgroundColor
    }));
    if (metrics.pageWidth > metrics.viewport) throw new Error('Page has horizontal overflow');
    if (metrics.bars.length !== 3 || metrics.bars.some(b => b.height < 20)) throw new Error('Shared chart not drawn');
    if (errors.length) throw new Error(errors.join('\n'));
    const out = path.join(__dirname, '../../private/growth/ai-people-2027');
    fs.mkdirSync(out, {recursive:true});
    await page.screenshot({path:path.join(out,`preview-${width}.png`),fullPage:false});
    await page.locator('#capital-ledger').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(out,`ledger-${width}.png`),fullPage:false});
    results.push({width, ...metrics, scriptErrors:errors.length, filters:'pass'});
    await page.close();
  }
  const context = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});
  const page = await context.newPage();
  await page.goto(pathToFileURL(path.join(__dirname, 'preview.html')).href);
  if (await page.locator('.watch-person:visible').count() !== 100) throw new Error('No-JavaScript content missing');
  await page.locator('.watch-index-details > summary').click();
  if(await page.locator('[data-watch-id]:visible').count()!==100)throw new Error('No-JavaScript index missing');
  results.push({noJavaScript:'all 100 entries and native people index readable'});
  await browser.close();
  console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
