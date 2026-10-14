const {chromium}=require('../../app/node_modules/@playwright/test');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch();
 const url=process.env.WATCHLIST_BASE_URL?`${process.env.WATCHLIST_BASE_URL}/ai-people-to-watch/`:pathToFileURL(path.join(__dirname,'preview.html')).href;
 const evidence=[];const out=path.join(__dirname,'../../private/growth/ai-people-2027');fs.mkdirSync(out,{recursive:true});
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(url);await page.locator('.watch-person').last().waitFor();
  if(process.env.WATCHLIST_BASE_URL&&response.status()!==200)throw new Error('Preview route failed');
  if(await page.locator('.watch-person').count()!==100)throw new Error('Missing entries');
  await page.locator('#watch-search').fill('Toner');if(await page.locator('[data-watch-id]:visible').count()!==1)throw new Error('Search');
  await page.locator('.watch-reset').click();await page.locator('#watch-chapter').selectOption('applied');if(await page.locator('[data-watch-id]:visible').count()!==22)throw new Error('Chapter filtering');
  await page.locator('[data-bottleneck="science"]').click();if(await page.locator('[data-watch-id]:visible').count()<5)throw new Error('Combined filtering');
  await page.locator('#watch-search').fill('not-a-person-xyz');if(!await page.locator('.watch-empty').isVisible())throw new Error('Empty state');
  await page.locator('.watch-reset').click();
  await page.locator('.watch-index-details > summary').click();
  await page.locator('[data-watch-id] a').filter({hasText:'Tri Dao'}).click();if(!page.url().endsWith('#tri-dao'))throw new Error('Stable anchor');
  await page.evaluate(async()=>{await Promise.all([...document.images].map(async(image)=>{image.loading='eager';await image.decode()}))});
  if(await page.locator('.watch-person .watch-role-labels').count()!==100)throw new Error('Missing role labels');
  if(await page.locator('.watch-person-portrait').count()!==100)throw new Error('Every entry needs its own portrait');
  if(await page.locator('.watch-test-card').count()!==200)throw new Error('Missing research panels');
  const form=page.locator('#suggest-person form');
  if(await form.getAttribute('action')!=='mailto:daniel@visionarytalks.com?subject=AI%20watchlist%20nomination')throw new Error('Nomination fallback');
  if(await form.evaluate(f=>f.checkValidity()))throw new Error('Empty nomination accepted');
  await form.locator('[name=person]').fill('A proposed researcher');
  await form.locator('[name=reason]').fill('Their documented contribution deserves further investigation.');
  await form.locator('[name=source]').fill('invalid-url');
  if(await form.evaluate(f=>f.checkValidity()))throw new Error('Invalid evidence URL accepted');
  await form.locator('[name=source]').fill('https://example.com/research');
  if(!await form.evaluate(f=>f.checkValidity()))throw new Error('Valid nomination rejected');
  await form.evaluate(f=>f.reset());
  const checks=await page.evaluate(()=>({
   overflow:document.documentElement.scrollWidth>innerWidth,
   anchors:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.getAttribute('href').slice(1))).length,
   brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src),
   resetBackground:getComputedStyle(document.querySelector('.watch-reset')).backgroundColor,
   resetColor:getComputedStyle(document.querySelector('.watch-reset')).color,
   dots:document.querySelectorAll('.watch-cover circle').length,
   h1:document.querySelectorAll('h1').length,
   robots:document.querySelector('meta[name="robots"]')?.content,
   sourceLinks:document.querySelectorAll('.watch-person a[href^="https:"]').length
  }));
  if(checks.overflow||checks.anchors||checks.brokenImages.length||checks.dots!==100||checks.h1!==1||errors.length)throw new Error(JSON.stringify({...checks,errors}));
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`full-hero-${width}.png`)});
  await page.locator('#tri-dao').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`full-entry-${width}.png`)});
  await page.locator('#tri-dao .watch-person-test').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`full-tests-${width}.png`)});
  await page.locator('#suggest-person').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`full-nomination-${width}.png`)});
  await page.locator('.editorial-chart').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`full-chart-${width}.png`)});
  evidence.push({width,...checks,interactions:'pass',scriptErrors:errors.length});await page.close();
 }
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}}),page=await context.newPage();await page.goto(url);
 if(await page.locator('.watch-person').count()!==100)throw new Error('No-JS article');await page.locator('.watch-index-details summary').click();if(await page.locator('[data-watch-id]:visible').count()!==100)throw new Error('No-JS directory');
 evidence.push({noJavaScript:'100 entries and directory available'});
 // Export the code-native social illustration at its intended dimensions.
 const art=await browser.newPage({viewport:{width:1200,height:630}});await art.goto(pathToFileURL(path.join(__dirname,'../../app/public/reference/ai-watchlist-2027-cover.svg')).href);await art.screenshot({path:path.join(__dirname,'../../app/public/reference/ai-watchlist-2027-cover.png')});
 fs.writeFileSync(path.join(out,'full-browser-check.json'),JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
