const test=require('node:test');
const assert=require('node:assert/strict');
const data=require('../dist/data/ai-companies.json').companies;
const {selectCompanies}=require('../dist/ai-tracker-core.js');
test('combines vertical, metric and case-insensitive text filters',()=>{
 assert.deepEqual(selectCompanies(data,{vertical:'App builders',metric:'ARR'}).map(c=>c.id),['base44']);
 assert.deepEqual(selectCompanies(data,{query:'  BASE44  '}).map(c=>c.id),['base44']);
 assert.equal(selectCompanies(data,{vertical:'App builders'}).length,3);
 assert.equal(selectCompanies(data,{metric:'ARR'}).length,4);
 assert.equal(selectCompanies(data,{query:'no-matching-company'}).length,0);
});
test('sorts figures numerically and dates as observations without changing source data',()=>{
 const original=data.map(c=>c.id);
 assert.equal(selectCompanies(data,{sort:'desc'})[0].id,'openai');
 assert.equal(selectCompanies(data,{sort:'asc'})[0].id,'synthesia');
 assert.equal(selectCompanies(data,{sort:'recent'})[0].observations[0].asOf,'2026-09');
 assert.equal(selectCompanies(data,{sort:'name'})[0].id,'anthropic');
 assert.deepEqual(data.map(c=>c.id),original);
 const unknown={...data[0],id:'unknown',name:'Unknown',observations:[{amountUSD:null,asOf:'2026-10'}]};
 for(const sort of ['asc','desc']) assert.equal(selectCompanies([...data,unknown],{sort}).at(-1).id,'unknown');
});
