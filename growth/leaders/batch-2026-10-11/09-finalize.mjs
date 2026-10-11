import {leaders,write} from './build-data.mjs';
const get=n=>leaders.find(p=>p.name===n);
const asif=get('Sualeh Asif');asif.sections[0].paragraphs[1]='The official tables distinguish participating from receiving an award. In 2016 and 2018, Asif’s award field is blank. In 2017, it records bronze. This is the reproducible correction behind the biography. It does not explain his later company ownership or imply a relationship between an Olympiad score and founder wealth.';
const greg=get('Greg Brockman');greg.sections.forEach(s=>s.paragraphs=s.paragraphs.map(t=>t.startsWith('The brief proposes comparing Forbes')?'The AP court report provides an additional dated observation about one OpenAI holding. The original transcript and its valuation assumptions still need review. Testimony about a security is not automatically a statement of total personal net worth. The comparison below keeps the two scopes and dates visible.':t));
const intrator=get('Michael Intrator');intrator.sections.forEach(s=>s.paragraphs=s.paragraphs.map(t=>t.startsWith('The brief proposes a later proxy')?'The April 2026 proxy provides a later ownership snapshot, including indirect holdings. We have reviewed its table and footnote, but have not completed the subsequent Form 4 reconciliation. It supplies a historical starting point, rather than an October 2026 share balance.':t));
get('Amjad Masad').notes[1]='The March 2026 statement includes a $1B year-end run-rate revenue target. It is verified as a forecast, not an actual result. Earlier financing requires original records.';
for(const p of leaders){p.seo.title=p.name+' Net Worth: The Ownership File';p.seo.description=p.name+' net worth, career and ownership, investigated through dated wealth estimates, company records and transparent methodology.';p.sourceIds=[...new Set(p.sourceIds)];}

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
write();
