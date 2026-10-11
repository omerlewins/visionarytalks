import {chromium} from '@playwright/test';
import fs from 'node:fs';
const base=process.env.CONTENT_REVIEW_ORIGIN??'http://127.0.0.1:3108';
const report=JSON.parse(fs.readFileSync('../private/growth/content-sync.json','utf8'));
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});
const failures=[],checks=[];page.on('pageerror',e=>failures.push(e.message));
let r=await page.goto(base+'/content-review/',{waitUntil:'networkidle'});
if(r.status()!==200||await page.locator('.leader-directory-grid article').count()!==21)failures.push('Review index');
for(const record of report.records){const path=record.path.startsWith('/who-owns-')?'/review-content/'+record.path.split('/')[1]+'/':record.path;
 r=await page.goto(base+path,{waitUntil:'networkidle'});const text=await page.locator('main').innerText();
 if(r.status()!==200||!text.includes('Daniel Mercer')||!text.includes('draft')&&!text.includes('DRAFT'))failures.push(path+' status/author/draft notice');
 if(/\]\(https:/.test(text))failures.push(path+' raw Markdown');
 checks.push({path,status:r.status(),sourceLinks:await page.locator('main a[href^="https://"]').count()});}
await page.setViewportSize({width:390,height:844});
for(const path of ['/content-review/','/michael-truell-net-worth/','/review-content/who-owns-costco/']){await page.goto(base+path,{waitUntil:'networkidle'});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))failures.push(path+' mobile overflow');}
await browser.close();const result={checks,failures};fs.writeFileSync('../private/growth/cms-content-checks.json',JSON.stringify(result,null,2));console.log(JSON.stringify({routes:checks.length,failures}));if(failures.length)process.exitCode=1;
