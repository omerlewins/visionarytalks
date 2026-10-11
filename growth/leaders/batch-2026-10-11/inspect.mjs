import fs from 'node:fs';
const d=JSON.parse(fs.readFileSync('app/src/data/leader-profiles.json','utf8'));
for(const p of d.leaders)console.log(JSON.stringify({name:p.name,answer:p.answer,capital:p.capital,notes:p.notes}));
