const fs=require("node:fs");
const data=JSON.parse(fs.readFileSync("app/src/data/publication-profile.json","utf8").replace(/^\uFEFF/,""));
fs.writeFileSync("growth/authors/daniel-mercer.json",JSON.stringify({name:data.name,path:"/about/#about-me",bio:data.bio},null,2)+"\n");
let update=fs.readFileSync("growth/leaders/update-author.cjs","utf8");
update=update.replace("+' is a pen name. Visionary Talks is responsible for the reporting and corrections.</p>",'+\' is a pen name. I still work in finance and keep my real name private. <a href="../authors/about-preview.html">About me and my research</a> · <a href="mailto:daniel@visionarytalks.com">Contact me</a>.</p>');
fs.writeFileSync("growth/leaders/update-author.cjs",update);
