// Plain URL is deliberately checked first, without a cache-busting query.
const {chromium}=require('../../app/node_modules/@playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.WATCHLIST_BASE_URL||'https://visionarytalks.com';
(async()=>{
 const browser=await chromium.launch(),report=[];
 for(const javaScriptEnabled of [true,false]) for(const suffix of ['', '?v=reviewed-20261014']) {
  const context=await browser.newContext({javaScriptEnabled,viewport:{width:390,height:900}}),page=await context.newPage();
  const response=await page.goto(base+'/ai-people-to-watch/'+suffix);
  assert.equal(response.status(),200);
  const result=await page.evaluate(()=>{
   const article=document.querySelector('.watch-profiles'),entries=[...article.querySelectorAll('.watch-person')],faq=article.querySelector('#watch-faq'),method=article.querySelector('#watch-methodology');
   return {numbers:entries.map(e=>Number(e.querySelector('h3').textContent.split('.')[0])),fields:entries.map(e=>({id:e.id,labels:[...e.querySelectorAll('.watch-profile-label')].map(x=>x.textContent.trim()),sources:e.querySelectorAll('.watch-profile-sources a').length,portraits:e.querySelectorAll('.watch-person-portrait').length,captions:e.querySelectorAll('figcaption').length})),faq:faq.querySelectorAll('h3').length,closingOrder:!!(entries.at(-1).compareDocumentPosition(faq)&4)&&!!(faq.compareDocumentPosition(method)&4),drafting:/\bsupplied\b|opened (?:biography|record)|before print|Suggested URL|My 2027 test|What would weaken the case|[\u2013\u2014]/i.test(article.textContent),indexSeparator:[...document.querySelectorAll('[data-watch-id] td')].some(td=>td.textContent.includes('OpenAI · Research scientist')),fundingTable:!!article.querySelector('#capital-ledger'),overflow:document.documentElement.scrollWidth>innerWidth,updated:article.textContent.includes('2026-10-15')};
  });
  assert.deepEqual(result.numbers,Array.from({length:100},(_,i)=>i+1));
  for(const row of result.fields){assert.deepEqual(row.labels,['Education:','The path:',"Why I'm watching in 2027:",'My read:']);assert.ok(row.sources);assert.equal(row.portraits,1);assert.equal(row.captions,1);}
  assert.equal(result.faq,7);assert.ok(result.closingOrder);assert.ok(result.indexSeparator);assert.ok(result.updated);assert.equal(result.fundingTable,false);assert.equal(result.drafting,false);assert.equal(result.overflow,false);
  report.push({url:page.url(),javaScriptEnabled,entries:100,allFields:true,faq:7,methodologyAfterFAQ:true,indexSeparator:true,noDrafting:true,oldFundingTableRemoved:true,updated:true,headers:response.headers()});
  await context.close();
 }
 await browser.close();fs.mkdirSync('private/growth/ai-people-2027',{recursive:true});fs.writeFileSync('private/growth/ai-people-2027/completeness-after.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report.map(({headers,...r})=>r),null,2));
})().catch(e=>{console.error(e);process.exit(1)});
