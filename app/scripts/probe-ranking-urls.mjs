import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const rows=JSON.parse(await readFile('../private/search-console-pages.json','utf8'));
const access=JSON.parse(await readFile('../private/preview-access.json','utf8'));
const directory='../private/ranking-audit/live';await mkdir(directory,{recursive:true});
async function probe(url,preview=false){
 const hops=[]; let current=url;
 for(let i=0;i<6;i++){
  const host=new URL(current).hostname;
  if(preview?new URL(current).origin!==access.url:!['visionarytalks.com','www.visionarytalks.com'].includes(host))return {hops,externalDestination:current};
  try{
   const response=await fetch(current,{redirect:'manual',signal:AbortSignal.timeout(25000),headers:preview?{'x-vercel-protection-bypass':access.bypass}:{'User-Agent':'VisionaryTalks-Migration-Review/1.0'}});
   const type=response.headers.get('content-type')??'';
   hops.push({url:current,status:response.status,location:response.headers.get('location')});
   if([301,302,303,307,308].includes(response.status)&&response.headers.get('location')){current=new URL(response.headers.get('location'),current).href;await response.body?.cancel();continue;}
   if(type.includes('text/html')){
    const html=await response.text();
    const file=createHash('sha256').update(url).digest('hex')+'.html';
    if(!preview)await writeFile(`${directory}/${file}`,html);
    return {hops,status:response.status,finalURL:current,type,htmlFile:preview?undefined:file,title:html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1],canonical:html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1]};
   }
   const binary=Buffer.from(await response.arrayBuffer());
   return {hops,status:response.status,finalURL:current,type,bytes:binary.length,sha256:createHash('sha256').update(binary).digest('hex')};
  }catch(error){return {hops,error:error.message};}
 }
 return {hops,error:'Too many redirects'};
}
const retry=process.argv.includes('--retry');
const results=retry?JSON.parse(await readFile('../private/ranking-audit/http-results.json','utf8')):[];
const pending=retry?rows.filter(row=>results.find(r=>r.url===row['Top pages'])?.live.error):rows;
for(let offset=0;offset<pending.length;offset+=4){
 await Promise.all(pending.slice(offset,offset+4).map(async row=>{
  const url=row['Top pages'];const parsed=new URL(url);
  const live=await probe(url);const staging=await probe(access.url+parsed.pathname+parsed.search,true);
  const prior=results.findIndex(r=>r.url===url);if(prior>=0)results.splice(prior,1);
  results.push({url,path:parsed.pathname+parsed.search,clicks:Number(row.Clicks),impressions:Number(row.Impressions),live,staging});
 }));
 await writeFile('../private/ranking-audit/http-results.json',JSON.stringify(results,null,2));
 console.log(`Checked ${results.length}/${rows.length} ranking URLs on live and staging`);
}
console.log(JSON.stringify({total:results.length,live200:results.filter(r=>r.live.status===200).length,live404:results.filter(r=>r.live.status===404).length,staging200:results.filter(r=>r.staging.status===200).length,liveErrors:results.filter(r=>r.live.error).length}));

