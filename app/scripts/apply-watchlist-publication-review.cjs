const fs = require('node:fs'), path = require('node:path'), crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const file=path.join(root,'app/src/data/ai-watchlist.json');
const before=JSON.parse(fs.readFileSync(file,'utf8'));
const edits=require(path.join(root,'growth/ai-people-2027/rebuild-2026-10-14/publication-corrections.cjs'));
const article=structuredClone(before), ledger=[];
for(const person of article.people){
 const edit=edits[person.number]||{};
 for(const [key,value] of Object.entries(edit)){
  if(['role','organization'].includes(key))person[key]=value;
  else person.profile[key]=value;
 }
 const fields=['hook','education','career','outlook','read'];
 const links=[...new Set(fields.flatMap(k=>[...person.profile[k].matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m=>m[1])))];
 person.profile.sources=links.map(url=>person.profile.sources.find(s=>s.url===url)||{title:new URL(url).hostname.replace(/^www\./,''),url});
 if(!person.profile.sources.length)throw Error('No citation for '+person.number);
 person.checked='2026-10-14';
 person.reviewState='pending';
 ledger.push({number:person.number,name:person.name,status:'revised-awaiting-final-evidence-check',fieldsChanged:Object.keys(edit),retainedFields:fields.filter(k=>!Object.hasOwn(edit,k)),evidence:links,educationLimit:person.profile.education,contentHash:crypto.createHash('sha256').update(JSON.stringify(person.profile)).digest('hex')});
}
article.editionChecked='2026-10-14';
const report={date:'2026-10-14',status:'revised-awaiting-final-evidence-check',people:ledger};
if(process.argv.includes('--apply')){
 const backup=path.join(root,'private/growth/ai-people-2027/rebuild-2026-10-14');fs.mkdirSync(backup,{recursive:true});
 fs.writeFileSync(path.join(backup,'before-publication-review-'+Date.now()+'.json'),JSON.stringify(before,null,2));
 fs.writeFileSync(file,JSON.stringify(article,null,2)+'\n');
 fs.writeFileSync(path.join(root,'growth/ai-people-2027/rebuild-2026-10-14/publication-claim-review.json'),JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify({apply:process.argv.includes('--apply'),people:100,editedPeople:Object.keys(edits).length,words:article.people.map(p=>({number:p.number,words:fieldsCount(p.profile)})).filter(p=>p.words<150||p.words>220)},null,2));
function fieldsCount(p){return ['hook','education','career','outlook','read'].map(k=>p[k].replace(/\[([^\]]+)\]\([^)]*\)/g,'$1')).join(' ').match(/\S+/g).length}
