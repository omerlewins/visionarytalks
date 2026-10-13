import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { AIWatchlist, WatchlistCover } from "../src/components/AIWatchlist";
import { aiWatchlist } from "../src/lib/ai-watchlist";
const root = fileURLToPath(new URL("../../", import.meta.url));
const folder = root + "growth/ai-people-2027/";
const body = renderToStaticMarkup(<AIWatchlist article={aiWatchlist} />)
  .replaceAll('src="/reference/', 'src="../../app/public/reference/')
  .replace(/href="\/(?!\/)/g, 'href="https://visionarytalks.com/');
const index = aiWatchlist.people.map((p) => ({
  id: p.id,
  text: `${p.name} ${p.organization} ${p.role} ${p.hook}`.toLowerCase(),
  bottleneck: p.bottleneck,
  chapter: p.chapter,
}));
const script = `const entries=${JSON.stringify(index)},input=document.querySelector('#watch-search'),chapter=document.querySelector('#watch-chapter'),buttons=[...document.querySelectorAll('[data-bottleneck]')],rows=[...document.querySelectorAll('[data-watch-id]')],details=document.querySelector('.watch-index-details');let active='';function update(){let n=0;const q=input.value.trim().toLowerCase();rows.forEach(row=>{const p=entries.find(p=>p.id===row.dataset.watchId);row.hidden=Boolean(!p.text.includes(q)||(active&&p.bottleneck!==active)||(chapter.value&&p.chapter!==chapter.value));if(!row.hidden)n++});document.querySelector('.watch-results').textContent=n+' of 100 people. Numbers follow chapter order, not rank.';details.querySelector('summary span').textContent=n+' entries';details.open=Boolean(q||active||chapter.value);buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bottleneck===active)));let empty=document.querySelector('.watch-empty');if(n===0&&!empty){empty=document.createElement('p');empty.className='watch-empty';empty.textContent='No people match. Reset to see the full watchlist.';details.after(empty)}if(empty)empty.hidden=n>0}input.addEventListener('input',update);chapter.addEventListener('change',update);buttons.forEach(b=>b.addEventListener('click',()=>{active=active===b.dataset.bottleneck?'':b.dataset.bottleneck;update()}));document.querySelector('.watch-reset').addEventListener('click',()=>{input.value='';chapter.value='';active='';update()});`;
writeFileSync(
  folder + "preview.html",
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${aiWatchlist.seo.title} · Editorial Preview</title><link rel="stylesheet" href="../../app/src/styles/reference.css"><link rel="stylesheet" href="../../app/src/styles/production.css"><link rel="stylesheet" href="../../app/src/styles/ai-watchlist.css"><style>body{background:#fcfbf8}.preview-mast{max-width:1120px;margin:30px auto;border-bottom:2px solid;padding-bottom:20px;display:flex;justify-content:space-between;font:12px Arial}.preview-wrap{padding:0 24px}.preview-mast span{font-size:10px;letter-spacing:1px}@media(max-width:650px){.preview-wrap{padding:0 16px}.preview-mast{gap:18px}.preview-mast span{max-width:130px}}</style></head><body><main class="preview-wrap"><header class="preview-mast"><b>VISIONARY TALKS</b><span>COMPANIES. MONEY. CAREERS.</span></header>${body}</main><script>${script}</script></body></html>`,
);
const graphic = renderToStaticMarkup(
  <WatchlistCover article={aiWatchlist} />,
).match(/<svg[\s\S]*?<\/svg>/)![0];
writeFileSync(
  root + "app/public/reference/ai-watchlist-2027-cover.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#fcfbf8"/><text x="60" y="60" font-family="Arial" font-size="18" fill="#151515">VISIONARY TALKS / THE 2027 WATCHLIST</text><path d="M60 84H1140" stroke="#151515" stroke-width="2"/><text x="60" y="180" font-family="Georgia" font-size="65" fill="#151515">100 AI people</text><text x="60" y="257" font-family="Georgia" font-size="65" fill="#151515">to watch.</text><text x="60" y="360" font-family="Georgia" font-style="italic" font-size="48" fill="#151515">The bets</text><text x="60" y="417" font-family="Georgia" font-style="italic" font-size="48" fill="#151515">behind them.</text><text x="60" y="530" font-family="Arial" font-size="16" fill="#555">DOCUMENTED WORK. TESTABLE JUDGMENTS.</text><svg x="558" y="120" width="590" height="403" viewBox="0 0 660 450">${graphic.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")}</svg><text x="560" y="559" font-family="Arial" font-size="14" fill="#555">One dot per selected person. Chapter order, not rank.</text></svg>`,
);
writeFileSync(
  folder + "article.md",
  `# ${aiWatchlist.title}\n\n${aiWatchlist.dek}\n\nResearch checked ${aiWatchlist.checked}. Editorial review pending.\n\n` +
    aiWatchlist.people
      .map(
        (p) =>
          `## ${p.number}. ${p.name}\n\n${p.organization} · ${p.role}\n\n### ${p.hook}\n\nAccording to [${aiWatchlist.sources[p.sourceId].title}](${aiWatchlist.sources[p.sourceId].url}), ${p.fact.replace(/^The /, "the ")}\n\n${p.analysis}\n\n${p.detail.join("\n\n")}\n\n**My 2027 test:** ${p.watch}\n\n**What would weaken the case:** ${p.risk}\n`,
      )
      .join("\n"),
);
console.log(
  "Rendered full 100-person preview and cover from the application’s shared feature component.",
);
