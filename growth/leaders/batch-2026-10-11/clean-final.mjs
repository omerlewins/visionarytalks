import fs from 'node:fs';
const file='growth/leaders/batch-2026-10-11/09-finalize.mjs';
let code=fs.readFileSync(file,'utf8');
code=code.replace('write();', `
get('Demis Hassabis').notes[1]='Dated reporting identifies his August 2026 move from DeepMind CEO to chair and Alphabet chief scientist. Company biographies may still carry older titles.';
const changes=[
['The brief proposed hypothetical 5%, 10% and 20% stakes at a rumored $40 billion valuation.','Hypothetical 5%, 10% and 20% stakes would require verified ownership and valuation inputs.'],
['The brief contrasted older language near 5% with current language near 3%.','Reconciling an earlier stake estimate with the current approximately 3% estimate requires the original dated methods.'],
['That differs from the brief’s $100 million shorthand.','The reported $110 million concerns the acquisition, rather than his personal proceeds.'],
['The filing’s treatment also corrects the brief’s simplified closing-date description.','The filing also supplies the closing date.'],
['the tracker claim in the brief','a tracker that includes only one share class'],
['Our calculation: we do not multiply an unreviewed aggregate holding by a current quote. That would risk double counting related entities or mixing observations from different dates.','Our calculation: the proxy’s 61,505,714-share beneficial-ownership total is about 11.63 times its 5,289,944 Class A component. This compares two fields in one dated filing. It does not reconcile a third-party wealth tracker or establish exclusive economic ownership.']
];
for(const p of leaders){for(const s of p.sections){s.paragraphs=s.paragraphs.map(t=>{for(const [from,to] of changes)t=t.replace(from,to);return t;});}}
write();`);
fs.writeFileSync(file,code);
