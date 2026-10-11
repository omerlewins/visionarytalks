require("./align-home-chart.cjs");
const fs=require("node:fs"), path=require("node:path"), root=__dirname;
const read=name=>fs.readFileSync(path.join(root,name),"utf8").replace(/^\uFEFF/,"");
const md=read("michael-truell.md"), wealth=JSON.parse(read("michael-truell-net-worth.json"));
const inline=text=>text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g,'<a href="$2">$1</a>').replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
function renderWealth(){
 const value=wealth.estimate.amountUSD, max=wealth.chart.maxUSD;
 if(!Number.isFinite(value)||value<0||max<=0||value>max)throw new Error("Invalid wealth chart scale");
 const amount=(value/1e9).toFixed(1);
 const timeline=wealth.timeline.map(event=>'<li><time datetime="'+event.date+'">'+inline(event.label)+'</time><span><a href="'+event.source+'">'+inline(event.text)+'</a></span></li>').join("");
 return '<section id="wealth"><h2>'+inline(wealth.heading)+'</h2><p>'+inline(wealth.paragraph)+'</p>'+
 '<figure class="data-chart editorial-chart wealth-snapshot" aria-labelledby="wealth-chart-title"><figcaption><span class="eyebrow">BUSINESS IN NUMBERS</span><h3 id="wealth-chart-title">Michael Truell: the wealth estimate.</h3><p>USD billions · Third-party estimate · October 9, 2026</p></figcaption>'+
 '<div class="chart-scroll" tabindex="0" role="region" aria-label="Michael Truell net worth: 2.8 billion US dollars, October 9, 2026. One estimated observation. Scale zero to three billion."><div class="editorial-plot" aria-hidden="true"><span class="zero-label">0</span><span class="wealth-scale-top">3.0</span><div class="plot-group"><div class="plot-columns"><div class="plot-column"><div class="plot-bar ink" style="height:'+(value/max*100)+'%" data-amount-usd="'+value+'"><span>$'+amount+'bn</span></div></div></div><b class="plot-label">Oct 9, 2026</b></div></div></div>'+
 '<div class="chart-source">The plotted value comes from <a href="'+wealth.estimate.source+'">Forbes’ dated personal-wealth estimate</a>.</div>'+
 '<p class="chart-method">Zero baseline; scale $0–$3bn. One wealth observation. Acquisition consideration is excluded; no historical values are interpolated.</p>'+
 '<details><summary>View chart data</summary><div class="table-wrap" tabindex="0" role="region" aria-label="Wealth estimate data"><table><thead><tr><th>Date</th><th>USD</th><th>Basis</th></tr></thead><tbody><tr><td>Oct 9, 2026</td><td>2,800,000,000</td><td>Forbes estimate</td></tr></tbody></table></div></details></figure>'+
 '<ol class="wealth-timeline" aria-label="Financial evidence timeline">'+timeline+'</ol>'+
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
