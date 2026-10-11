import fs from 'node:fs';
const s=fs.readFileSync('growth/leaders/batch-2026-10-11/supplied-brief.md','utf8');
console.log(s.split('\n').filter(l=>/PAA|Primary|source:|Sources:|Origin|origin|Original|S-1|Court|trial/.test(l)).map(l=>l.slice(0,850)).join('\n'));
