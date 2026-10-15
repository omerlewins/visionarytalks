const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),file=path.join(root,'app/src/data/ai-watchlist.json');
const a=JSON.parse(fs.readFileSync(file,'utf8'));
a.introduction[1]="I start with records: university biographies, papers, company statements and funding announcements. I distinguish what each source establishes from what it suggests. Company valuations are separate from personal wealth, fundraising discussions from closed rounds, and historical research credits from current jobs. Education gaps remain explicit rather than being filled from promotional biographies.";
a.patterns[0].text="Periodic Labs connects research careers with a documented $300 million founding round in September 2025. Factory's September 2026 announcement records $200 million raised at a $5 billion company valuation. These are company events; neither discloses a founder's private stake or personal wealth.";
a.faq[0].answer="This editorial selection includes Alexander Wei's mathematics-reasoning work, Jerry Tworek's move from OpenAI to Core Automation, Jason Wei's chain-of-thought research, Neel Nanda's interpretability work and Luo Fuli's MiMo contributions. Entries 1–21 cover the frontier section; the list is not a universal ranking.".replace('1–21','1 to 21');
a.faq[1].answer="The infrastructure section includes Woosuk Kwon's vLLM work, Ying Sheng's SGLang work, Georgi Gerganov's llama.cpp, Tri Dao's FlashAttention and David Soria Parra's MCP maintenance. Each has a specific code or research contribution to examine. See entries 22 to 41.";
a.faq[2].answer="I do not rank growth across incompatible measures. The entries include dated financing and operating records for businesses such as Lovable, ElevenLabs, Modal and Fireworks. ARR, annualized revenue, gross billings and company valuations measure different things.";
a.faq[5].answer="No. A financing price, employee tender or acquisition consideration is a company or transaction measure. This watchlist does not estimate the individuals' personal wealth or undisclosed ownership stakes.";
a.faq[6].answer="I reviewed public research artifacts, university and company biographies, funding statements and attributed reporting. Unsupported details were removed or left unknown. The methodology below explains the scope; I did not conduct interviews or audit company accounts.";
a.people[55].role="Researcher and founder, September 2026 report";a.people[55].organization="Instinct / Reflexion research";
a.people[19].role="AI researcher";
a.people[98].role="Co-founder and host";
a.people[70].role="Co-founder and CEO; CMU researcher";a.people[70].organization="Skild AI / Carnegie Mellon";
a.people[92].role="Founder and General Partner";
a.people[28].profile.education="His [own biography](https://erikbern.com/about) records a physics MSc from KTH, an IOI gold medal and two ACM-ICPC world-final appearances; it does not state the degree award year.";
a.people[28].profile.career=a.people[28].profile.career.replace('leading a roughly 300-person tech team','leading a roughly 300-person tech team, according to his biography');
a.people[64].profile.education="[Johns Hopkins' faculty record](https://publichealth.jhu.edu/faculty/2783/suchi-saria) lists Stanford MSc and PhD degrees in 2011. The dated education record is distinct from the page's older faculty title.";
a.people[37].profile.career="Etched's [August 18, 2026 statement](https://www.etched.com/progress/from-zero-to-one) says it shipped its first rack to Jane Street and raised $700 million at a $21 billion valuation, led by Jane Street after testing the hardware. Its team page identifies Uberti as co-founder and CEO. I treat the shipment and customer quotation as company-reported progress, not an independent benchmark showing a universal GPU-replacement ratio.";
a.people[17].profile.hook="Sherry Yang's [academic homepage](https://sherryy.github.io/) records an ICLR 2024 Outstanding Paper Award for UniSim, Learning Interactive Real-World Simulators. Her work links world models with robot policies and AI for science.";
a.people[65].profile.outlook="I am watching whether designed molecules advance through reproducible laboratory validation and the development steps needed for medicines. Index's [investment account](https://www.indexventures.com/perspectives/transforming-biology-from-science-to-engineering-our-investment-in-chai-discovery/) explains the thesis, but investment conviction does not establish clinical effectiveness. Binding a target in a laboratory is an earlier milestone than showing that a candidate is safe and useful in patients.";
a.people[73].profile.hook="Max Junestrand's [Legora event materials](https://legora.com/iltacon) identify him as co-founder and CEO. Its [company overview](https://legora.com/about) describes a legal-AI workspace for research, review and drafting; the buying question is whether it reduces the lawyer's complete workload.";
for(const p of a.people){
 const fields=['hook','education','career','outlook','read'];
 const urls=[...new Set(fields.flatMap(k=>[...p.profile[k].matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m=>m[1])))];
 p.profile.sources=urls.map(url=>p.profile.sources.find(s=>s.url===url)||{title:new URL(url).hostname.replace(/^www\./,''),url});
}
a.editorialReview.limitations=[
 "Public-record review of the retained claims and explicitly labelled editorial analysis; no interviews or audited company accounts.",
 "Education dates and current jobs that could not be established remain unknown or explicitly attributed to dated records.",
 "Company operating metrics are attributed claims. Private stakes and personal wealth are not estimated; pending transactions are not closed rounds.",
 "This editorial selection is not a demographic survey, influence ranking or investment recommendation."
];
fs.writeFileSync(file,JSON.stringify(a,null,2)+'\n');
console.log('Finalized article-wide copy; publication approval remains pending final evidence checks.');
