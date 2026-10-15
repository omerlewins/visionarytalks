import fs from 'node:fs';
const d='app/src/components/LeadersDirectory.tsx';fs.writeFileSync(d,fs.readFileSync(d,'utf8').replaceAll('LeaderProfile','LeaderSummary'));
const h='app/src/app/(site)/leaders/page.tsx';fs.writeFileSync(h,fs.readFileSync(h,'utf8').replace('featuredLeaders, leaderProfiles, leaderPortrait','featuredLeaders, leaderProfiles, leaderPortrait, leaderSummary'));
