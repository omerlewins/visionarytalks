import fs from 'node:fs';
const d=JSON.parse(fs.readFileSync('app/src/data/leader-profiles.json','utf8'));
for(const p of d.leaders){for(const s of p.sections)for(const t of s.paragraphs)if(/not verified|not independently|unverified|brief|not reviewed|have not|unreviewed/i.test(t))console.log(p.name+': '+t);}
