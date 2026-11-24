// Renders 1200x630 editorial covers (no likeness) from covers.json.
// Usage: node render.js  (writes app/public/reference/<slug>-cover.png)
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const covers = JSON.parse(fs.readFileSync(path.join(__dirname, "covers.json"), "utf8"));
const out = path.join(__dirname, "../../../../app/public/reference");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
function html(c) {
  const max = Math.max(...c.bars.map((b) => b.value));
  const bars = c.bars
    .map((b, i) => {
      const w = Math.max(6, Math.round((b.value / max) * 230));
      const shade = ["#9b9e97", "#7d837a", "#5f6a5f", "#4a5a4b", "#2f4232", "#1f3527"][
        Math.min(5, Math.round((i / Math.max(1, c.bars.length - 1)) * 5))
      ];
      return `<div class="row"><div class="lab"><b>${esc(b.label)}</b><span>${esc(b.sub || "")}</span></div>
      <div class="bar"><i style="width:${w}px;background:${shade}"></i><em>${esc(b.display)}</em></div></div>`;
    })
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{width:1200px;height:630px;background:#faf9f5;color:#1c1c1a;font-family:Helvetica,Arial,sans-serif;padding:40px 60px}
  .top{font-size:17px;letter-spacing:.06em;text-transform:uppercase;padding-bottom:22px;border-bottom:2px solid #1c1c1a}
  .wrap{display:flex;gap:48px;margin-top:30px}
  .left{width:470px}
  h1{font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:${c.name.length > 16 ? 56 : 66}px;line-height:1.04;letter-spacing:-.01em}
  .sub{font-family:Georgia,serif;font-style:italic;font-size:30px;line-height:1.25;margin-top:22px}
  .foot{font-size:15px;letter-spacing:.05em;text-transform:uppercase;color:#555;margin-top:34px}
  .panel{flex:1;background:#efeee9;padding:24px 26px}
  .pt{font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px}
  .pn{font-size:13px;color:#555;margin-bottom:14px}
  .row{display:flex;align-items:center;margin:9px 0}
  .lab{width:250px}.lab b{display:block;font-size:13.5px;letter-spacing:.06em;text-transform:uppercase}
  .lab span{font-size:12.5px;color:#555}
  .bar{display:flex;align-items:center;gap:10px}.bar i{display:block;height:20px}
  .bar em{font-style:normal;font-family:Georgia,serif;font-size:21px;white-space:nowrap}
  .cap{font-size:13px;color:#555;margin-top:12px}
  </style></head><body>
  <div class="top">Visionary Talks / ${esc(c.kicker || "Leaders")}</div>
  <div class="wrap"><div class="left"><h1>${c.headline ? c.headline.map(esc).join("<br>") : esc(c.name) + "<br>net worth"}</h1>
  <div class="sub">${c.subtitle.map(esc).join("<br>")}</div>
  <div class="foot">${esc(c.footer)}</div></div>
  <div><div class="panel"><div class="pt">${esc(c.panelTitle)}</div><div class="pn">${esc(c.panelNote || "")}</div>${bars}</div>
  <div class="cap">${esc(c.caption || "")}</div></div></div></body></html>`;
}
(async () => {
  const only = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  for (const c of covers.filter((c) => !only || c.slug === only)) {
    await p.setContent(html(c));
    await p.screenshot({ path: path.join(out, c.slug + "-cover.png") });
    console.log("wrote", c.slug);
  }
  await b.close();
})();
