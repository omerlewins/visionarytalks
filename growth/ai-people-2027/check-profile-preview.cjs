const {chromium}=require('../../app/node_modules/@playwright/test');
const {pathToFileURL}=require('node:url');
const path=require('node:path'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch();
 const url=process.env.WATCHLIST_BASE_URL?`${process.env.WATCHLIST_BASE_URL}/ai-people-to-watch/`:pathToFileURL(path.join(__dirname,'preview.html')).href;
 const out=path.join(__dirname,'../../private/growth/ai-people-2027/rebuild-2026-10-14');fs.mkdirSync(out,{recursive:true});const evidence=[];
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
  if(await page.locator('.watch-person').count()!==100)throw new Error('100 entries required');
  if(await page.locator('.watch-profile-label').count()!==400)throw new Error('Four labeled fields per entry required');
  if(await page.locator('.watch-role-labels').count()<100)throw new Error('Missing role badges');
  if(await page.locator('.watch-person-portrait').count()!==100)throw new Error('Every profile needs its own portrait');
  if(await page.locator('.watch-test-card').count())throw new Error('Old research panels');
  if(process.env.WATCHLIST_BASE_URL){
   const schema=await page.locator('script[type="application/ld+json"]').evaluateAll(nodes=>nodes.flatMap(n=>{const value=JSON.parse(n.textContent);return value['@graph']||[value]}));
   const faq=schema.find(item=>item['@type']==='FAQPage'),list=schema.find(item=>item['@type']==='ItemList');
   if(faq?.mainEntity.length!==7||list?.itemListElement.length!==100)throw new Error('Expanded structured data must match the visible article');
  }
  await page.locator('#watch-search').fill('Toner');if(await page.locator('[data-watch-id]:visible').count()!==1)throw new Error('Search');
  await page.locator('.watch-reset').click();await page.locator('#watch-chapter').selectOption('applied');if(await page.locator('[data-watch-id]:visible').count()!==22)throw new Error('Section filtering');
  await page.locator('#watch-search').fill('not-a-person-xyz');if(!await page.locator('.watch-empty').isVisible())throw new Error('Empty state');await page.locator('.watch-reset').click();
  await page.locator('.watch-index-details > summary').click();await page.locator('[data-watch-id] a').filter({hasText:'Tri Dao'}).click();if(!page.url().endsWith('#tri-dao'))throw new Error('Anchor');
  await page.evaluate(async()=>{await Promise.all([...document.images].map(async i=>{i.loading='eager';await i.decode()}))});
  const result=await page.evaluate(()=>({width:innerWidth,h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth>innerWidth,brokenImages:[...document.images].filter(i=>i.naturalWidth===0).length,missingAnchors:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.hash.slice(1))).length,headings:[...document.querySelectorAll('.watch-article h2')].map(h=>h.textContent),oldLabels:/My 2027 test|What would weaken the case/.test(document.querySelector('.watch-article').textContent),longDashes:/[\u2013\u2014]/.test(document.querySelector('.watch-article').textContent),captions:document.querySelectorAll('.watch-person-portrait figcaption').length}));
  if(result.h1!==1||result.overflow||result.brokenImages||result.missingAnchors||result.oldLabels||result.longDashes||errors.length)throw new Error(JSON.stringify({...result,errors}));
  const form=page.locator('#suggest-person form');if(await form.evaluate(f=>f.checkValidity()))throw new Error('Empty nomination accepted');
  await form.locator('[name=person]').fill('A proposed researcher');await form.locator('[name=reason]').fill('A documented contribution to investigate.');await form.locator('[name=source]').fill('https://example.com/research');if(!await form.evaluate(f=>f.checkValidity()))throw new Error('Valid nomination rejected');await form.evaluate(f=>f.reset());
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`hero-${width}.png`)});await page.locator('#tri-dao').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`entry-${width}.png`)});evidence.push({...result,interactions:'pass'});await page.close();
 }
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}}),page=await context.newPage();await page.goto(url);if(await page.locator('.watch-person').count()!==100)throw new Error('No-JS entries');await page.locator('.watch-index-details summary').click();if(await page.locator('[data-watch-id]:visible').count()!==100)throw new Error('No-JS index');evidence.push({noJavaScript:'100 profiles and complete native index available'});
 fs.writeFileSync(path.join(out,'browser-check.json'),JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
