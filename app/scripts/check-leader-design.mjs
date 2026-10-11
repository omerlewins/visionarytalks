import {chromium} from '@playwright/test';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1440,height:1000}});
const all=[...JSON.parse(fs.readFileSync('src/data/leader-profiles.json','utf8')).leaders,JSON.parse(fs.readFileSync('src/data/michael-truell-profile.json','utf8')).profile];
const history=JSON.parse(fs.readFileSync('src/data/leader-wealth-history.json','utf8'));
const checks=[];fs.mkdirSync('../private/growth/leaders-design',{recursive:true});
for(const p of all){
 const r=await page.goto('http://127.0.0.1:3110'+p.path,{waitUntil:'networkidle'});
 if(r.status()!==200)throw Error('Profile failed '+p.name);
 const charts=await page.locator('.editorial-chart').count();if(charts!==(p.wealth.value===null?0:1))throw Error('Unsupported chart '+p.name);
 if(await page.locator('#capital .article-table-scroll').count()!==1)throw Error('Capital table mismatch');
 if(charts){const expected=(history.profiles[p.slug]?.observations.length??0)+1; if(await page.locator('.editorial-chart .plot-bar').count()!==expected||await page.locator('#wealth > .article-table-scroll tbody tr').count()!==expected)throw Error('History points mismatch '+p.name); const styles=await page.locator('.editorial-chart').evaluate(el=>({title:getComputedStyle(el.querySelector('h3')).fontSize,subtitle:getComputedStyle(el.querySelector('figcaption p')).fontSize,method:getComputedStyle(el.querySelector('.chart-method')).fontSize}));if(styles.title!=='30px'||styles.subtitle!=='13px'||styles.method!=='11px')throw Error(JSON.stringify({name:p.name,styles}));if(await page.locator('#wealth > .article-table-scroll').count()!==1)throw Error('Missing source table');}
 checks.push({name:p.name,status:r.status(),charts});
}
for(const width of [1440,390]){
 await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:3110/leaders/aman-sanger/',{waitUntil:'networkidle'});
 await page.locator('#wealth').scrollIntoViewIfNeeded();await page.screenshot({path:`../private/growth/leaders-design/wealth-${width}.png`});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);if(overflow)throw Error('Page overflow '+width);
 if(width===390){const chart=await page.locator('.chart-scroll').evaluate(el=>({client:el.clientWidth,scroll:el.scrollWidth}));if(chart.scroll<=chart.client)throw Error('Mobile graph should scroll');}
 await page.locator('#capital').scrollIntoViewIfNeeded();await page.screenshot({path:`../private/growth/leaders-design/capital-${width}.png`});
}
await browser.close();console.log(JSON.stringify({profiles:checks.length,desktopAndMobile:'passed',checks}));
