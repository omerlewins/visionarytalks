const fs=require("node:fs"), path=require("node:path");
const root=__dirname, app=path.resolve(root,"../../app");
const siteCss=fs.readFileSync(path.join(app,"src/styles/production.css"),"utf8");
const start=siteCss.indexOf(".editorial-chart {"), end=siteCss.indexOf("@media (max-width: 1130px)",start);
if(start<0||end<start)throw new Error("Homepage chart styles not found");
const reference=fs.readFileSync(path.join(app,"src/styles/reference.css"),"utf8");
const tokens=reference.slice(0,reference.indexOf("}")+1);
fs.writeFileSync(path.join(root,"homepage-chart.css"),"/* Generated from the homepage chart design. */\n"+tokens+"\n"+siteCss.slice(start,end)+"\n"+".wealth-snapshot figcaption{text-align:left}.wealth-snapshot .editorial-plot{min-width:0}.wealth-scale-top{position:absolute;left:0;top:0;transform:translateY(-100%);font:10px var(--sans);color:var(--muted)}.wealth-snapshot .chart-method{font:11px/1.65 var(--sans)}.wealth-method h3{font:normal 21px/1.3 var(--serif);margin:24px 0 8px}.wealth-method .note{margin-top:0}@media(max-width:760px){.editorial-chart{padding:22px 16px}}");
