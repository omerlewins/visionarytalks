const fs = require('node:fs'), path = require('node:path');
const root=__dirname, read=file=>JSON.parse(fs.readFileSync(path.join(root,'../../app/src/data',file),'utf8'));
const p=read('michael-truell-profile.json').profile, history=read('leader-wealth-history.json'), sources={...read('michael-truell-profile.json').sources,...history.sources};
const inline=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>');
const table=(headers,rows)=>'<div class="table-wrap" tabindex="0"><table><thead><tr>'+headers.map(h=>'<th>'+inline(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(v=>'<td>'+inline(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
const section=(id,title,body)=>'<section id="'+id+'"><h2>'+inline(title)+'</h2>'+body+'</section>';
const facts=section('quick-facts',p.name+' at a glance',table(['Fact','Public record'],p.quickFacts.map(f=>[f.label,f.value+(f.sourceId?' ([source]('+sources[f.sourceId].url+'))':'')])));
const prose=p.sections.map((s,i)=>section(['school','halite','founding','editor','growth','company'][i],s.heading,s.paragraphs.map(t=>'<p>'+inline(t)+'</p>').join('')));
const capital=section('capital','Cursor funding and ownership history',table(['Date','Event','Amount','Company value'],p.capital.map(c=>['['+c.date+']('+sources[c.sourceId].url+')',c.event,c.amount,c.valuation])));
const observations=[...(history.profiles[p.slug]?.observations??[]),{...p.wealth,dateBasis:'Source observation'}];
let chart='';if(observations.length>=3){const max=Math.max(...observations.map(o=>o.value));chart='<figure class="data-chart editorial-chart"><figcaption><span class="eyebrow">BUSINESS IN NUMBERS</span><h3>Michael Truell net worth over time</h3><p>USD billions · Forbes estimates</p></figcaption><div class="chart-scroll"><div class="editorial-plot" style="min-width:400px">'+observations.map(o=>'<div class="plot-group"><div class="plot-columns"><div class="plot-column"><div class="plot-bar" style="height:'+(o.value/max*100)+'%"><span>'+o.display+'</span></div></div></div><b class="plot-label">'+o.date+'</b></div>').join('')+'</div></div><p class="chart-method">Equally spaced observations. Missing estimates are not interpolated. Sources are linked in the table above.</p></figure>';}
const wealth=section('wealth',p.name+' net worth over time','<p>'+inline(p.wealth.paragraph)+'</p>'+table(['Date','Estimate','Estimator / basis','Source'],observations.map(o=>[o.date+' · '+o.dateBasis,o.display,'Forbes · '+o.basis,'['+sources[o.sourceId].title+']('+sources[o.sourceId].url+')']))+chart+'<h3>Cursor: dated financial events</h3><ol>'+p.timeline.map(t=>'<li>['+t.date+']('+sources[t.sourceId].url+'): '+t.text+'</li>').map(inline).join('')+'</ol>');
const faq=section('faq','Questions about '+p.name,p.faq.map(f=>'<h3>'+f.question+'</h3><p>'+inline(f.answer)+'</p>').join(''));
const methodology=section('research','How I researched '+p.name,'<p>'+inline(p.methodology)+'</p>');
const sourceSection=section('sources','Sources and records','<ol>'+[...new Set([...p.sourceIds,...(history.profiles[p.slug]?.observations??[]).map(o=>o.sourceId)])].map(id=>'<li><a href="'+sources[id].url+'">'+sources[id].title+'</a> · '+sources[id].type+' · Accessed '+sources[id].accessed+'</li>').join('')+'</ol>');
let html=fs.readFileSync(path.join(root,'preview.html'),'utf8');
html=html.replace(/<section id="(?:quick-facts|person|school)">[\s\S]*?(?=<aside class="related">)/,facts+prose.slice(0,3).join('')+capital+prose.slice(3).join('')+wealth+faq+methodology+'\n');
html=html.replace(/<section id="sources">[\s\S]*?<\/section>/,sourceSection);
fs.writeFileSync(path.join(root,'preview.html'),html);
