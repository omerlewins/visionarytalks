require("./align-home-chart.cjs");
const fs=require("node:fs"), path=require("node:path"), root=__dirname;
const read=name=>fs.readFileSync(path.join(root,name),"utf8").replace(/^\uFEFF/,"");
const md=read("michael-truell.md"), wealth=JSON.parse(read("michael-truell-net-worth.json"));
const inline=text=>text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g,'<a href="$2">$1</a>').replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
function renderWealth(){
 const observations=wealth.observations;
 if(!observations?.length||observations.some(o=>!Number.isFinite(o.value)||o.value<0))throw new Error("Invalid historical wealth observations");
 const max=Math.max(1,...observations.map(o=>o.value));
 const label=date=>new Date(date+"T12:00:00Z").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"});
 const rows=observations.map(o=>'<tr><td>'+label(o.date)+'<small>'+inline(o.dateBasis)+'</small></td><td>'+inline(o.display)+'</td><td>'+inline(o.basis)+'<small>'+inline(o.note)+'</small></td><td><a href="'+o.source+'">Forbes estimate</a></td></tr>').join("");
 const bars=observations.map((o,i)=>'<div class="plot-group"><div class="plot-columns"><div class="plot-column"><div class="plot-bar '+(i===observations.length-1?'ink':'')+'" style="height:'+(o.value/max*100)+'%"><span>'+inline(o.display)+'</span></div></div></div><b class="plot-label">'+label(o.date)+'</b></div>').join("");
 const timeline=wealth.timeline.map(event=>'<li><time datetime="'+event.date+'">'+inline(event.label)+'</time><span><a href="'+event.source+'">'+inline(event.text)+'</a></span></li>').join("");
 return '<section id="wealth"><h2>'+inline(wealth.heading)+'</h2><p>'+inline(wealth.paragraph)+'</p>'+
 '<div class="table-wrap" tabindex="0" role="region" aria-label="Net worth estimates over time"><table><thead><tr><th>Date</th><th>Personal estimate</th><th>Basis</th><th>Source</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
 '<figure class="data-chart editorial-chart wealth-snapshot"><figcaption><span class="eyebrow">BUSINESS IN NUMBERS</span><h3>Michael Truell net worth estimates over time</h3><p>USD billions · Separate dated personal estimates</p></figcaption>'+
 '<div class="chart-scroll" tabindex="0" role="region" aria-label="Historical net worth chart"><div class="editorial-plot" style="min-width:400px" aria-hidden="true"><span class="zero-label">0</span>'+bars+'</div></div>'+
 '<div class="chart-source">Sources: '+observations.map(o=>'<a href="'+o.source+'">Forbes: '+label(o.date)+'</a>').join('; ')+'</div>'+
 '<p class="chart-method">Zero baseline. Equally spaced observations; missing dates are not interpolated. Dates and estimate definitions are labeled in the source table above. Company funding and transaction consideration are excluded.</p></figure>'+
 '<h3>Company and financial milestones</h3><ol class="wealth-timeline">'+timeline+'</ol>'+
 '<div class="wealth-method"><h3>Our research methodology</h3><p class="note">'+inline(wealth.methodology)+'</p></div></section>';
}

const ids=["school","halite","founding","editor","growth","company","wealth","research"];
const body=md.split(/^## /m).slice(1).filter(x=>!x.startsWith("Private release")&&!x.startsWith("Follow the company")).map((part,index)=>{
 if(ids[index]==="wealth")return renderWealth();
 const [title,...lines]=part.trim().split("\n");
 const html=lines.join("\n").trim().split(/\n\s*\n/).map(block=>{
  if(!block.startsWith("|"))return "<p>"+inline(block.replace(/\n/g," "))+"</p>";
  const rows=block.split("\n").filter(x=>!x.includes("| ---")).map(x=>x.split("|").slice(1,-1).map(x=>inline(x.trim())));
  return '<div class="table-wrap" tabindex="0" role="region" aria-label="'+inline(title)+'"><table><thead><tr>'+rows[0].map(x=>"<th>"+x+"</th>").join("")+"</tr></thead><tbody>"+rows.slice(1).map(row=>"<tr>"+row.map(x=>"<td>"+x+"</td>").join("")+"</tr>").join("")+"</tbody></table></div>";
 }).join("\n");
 return '<section id="'+ids[index]+'"><h2>'+inline(title)+"</h2>"+html+"</section>";
}).join("\n");
let preview=read("preview.html");
preview=preview.replace(/<section id="(?:person|school)">[\s\S]*?(?=<aside class="related">)/,()=>body+"\n");
preview=preview.replace(/<section id="sources">[\s\S]*?<\/section>/,'<section id="sources"><h2>Sources &amp; methodology</h2><p class="note">Visionary Talks conducts independent research into public records. For this profile, we reviewed school archives, project credits, contemporary founder comments and company announcements; checked dates and financial definitions; and independently calculated the four-round funding total. Investor accounts are identified as interested sources. Personal wealth remains a dated Forbes estimate. Our contribution is the documentary investigation and analysis; the reviewed sources do not disclose a complete private balance sheet. Research checked October 9, 2026.</p></section>');
preview=preview.replace(/<link rel="stylesheet" href="homepage-chart.css">\s*/g,"").replace("</head>",'<link rel="stylesheet" href="homepage-chart.css"></head>');
fs.writeFileSync(path.join(root,"preview.html"),preview);
const packet=JSON.parse(read("michael-truell-packet.json"));
packet.urls=[...new Set([...packet.urls.map(x=>x.url),...Array.from(md.matchAll(/\]\((https:\/\/[^)]+)\)/g),x=>x[1])])].map(url=>({url}));
fs.writeFileSync(path.join(root,"michael-truell-packet.json"),JSON.stringify(packet,null,2)+"\n");


require("./update-author.cjs");
