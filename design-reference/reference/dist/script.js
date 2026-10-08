const dialog = document.getElementById('search-dialog');
const search = document.getElementById('site-search');
const results = document.getElementById('search-results');
const titles = [...document.querySelectorAll('.story[data-title]')].map(el => el.dataset.title);
function updateResults() {
  const query = search.value.trim().toLowerCase();
  results.replaceChildren(...titles.filter(title => !query || title.toLowerCase().includes(query)).slice(0, 7).map(title => {const item = document.createElement('li'); item.textContent = title; return item;}));
}
document.querySelector('.search-trigger').addEventListener('click', () => {search.value=''; updateResults(); dialog.showModal(); search.focus()});
search.addEventListener('input', updateResults);
document.getElementById('brief-form').addEventListener('submit', event => {event.preventDefault(); document.getElementById('form-message').textContent = 'This is a design preview. Newsletter signup is not active.';});
const salaryData = {
  research: {name:'Computer & information research scientists',soc:'15-1221',p10:82200,median:140300,p90:230630,source:'https://www.bls.gov/ooh/computer-and-information-technology/computer-and-information-research-scientists.htm'},
  software: {name:'Software developers',soc:'15-1252',p10:82460,median:135980,p90:214670,source:'https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm'},
  data: {name:'Data scientists',soc:'15-2051',p10:67240,median:120230,p90:199130,source:'https://www.bls.gov/ooh/math/data-scientists.htm'},
  managers: {name:'Computer & information systems managers',soc:'11-3021',p10:107550,median:175140,p90:297510,source:'https://www.bls.gov/ooh/management/computer-and-information-systems-managers.htm'}
};
const salaryFormat = value => '$' + value.toLocaleString('en-US');
const salaryTabs = [...document.querySelectorAll('[data-salary-role]')];
function selectSalaryRole(role, focusTab=false) {
  const item=salaryData[role]; if(!item)return;
  salaryTabs.forEach(tab => {const chosen=tab.dataset.salaryRole===role;tab.setAttribute('aria-selected',String(chosen));tab.tabIndex=chosen?0:-1;if(chosen&&focusTab)tab.focus();});
  document.getElementById('salary-detail').setAttribute('aria-labelledby','tab-'+role);
  document.getElementById('salary-detail').querySelector('.category').textContent='SELECTED OCCUPATION / SOC '+item.soc;
  document.getElementById('salary-role-name').textContent=item.name;
  document.getElementById('salary-median').textContent=salaryFormat(item.median);
  document.getElementById('salary-p10').textContent=salaryFormat(item.p10);
  document.getElementById('salary-p50').textContent=salaryFormat(item.median);
  document.getElementById('salary-p90').textContent=salaryFormat(item.p90);
  const plot=document.getElementById('salary-plot');
  plot.style.setProperty('--p10',(item.p10/320000*100).toFixed(2)+'%');
  plot.style.setProperty('--p50',(item.median/320000*100).toFixed(2)+'%');
  plot.style.setProperty('--p90',(item.p90/320000*100).toFixed(2)+'%');
  plot.setAttribute('aria-label',`${item.name}: 10th percentile ${salaryFormat(item.p10)}; median ${salaryFormat(item.median)}; 90th percentile ${salaryFormat(item.p90)}.`);
  document.getElementById('salary-source').href=item.source;
  document.querySelectorAll('[data-salary-row]').forEach(row=>row.classList.toggle('selected',row.dataset.salaryRow===role));
  const spread=item.p90-item.median;
  document.querySelector('.salary-takeaway').innerHTML='<b>The spread matters.</b> The 90th-percentile threshold for '+item.name.toLowerCase()+' is '+salaryFormat(item.p90)+'—'+salaryFormat(spread)+' above the occupation’s median.';
}
salaryTabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectSalaryRole(tab.dataset.salaryRole));
  tab.addEventListener('keydown',event=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?salaryTabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+salaryTabs.length)%salaryTabs.length;selectSalaryRole(salaryTabs[next].dataset.salaryRole,true)});
});
document.querySelectorAll('[data-salary-choice]').forEach(button=>button.addEventListener('click',()=>selectSalaryRole(button.dataset.salaryChoice)));

// A small response to the reader's pointer adds depth without moving the copy.
const editorialHero=document.querySelector('.hero-dynamic');
const heroMotion=window.matchMedia('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)');
if(editorialHero){
  editorialHero.addEventListener('pointermove',event=>{
    if(!heroMotion.matches)return;
    const bounds=editorialHero.getBoundingClientRect();
    editorialHero.style.setProperty('--hero-x',((event.clientX-bounds.left)/bounds.width*12-6).toFixed(1)+'px');
    editorialHero.style.setProperty('--hero-y',((event.clientY-bounds.top)/bounds.height*10-5).toFixed(1)+'px');
  });
  editorialHero.addEventListener('pointerleave',()=>{
    editorialHero.style.setProperty('--hero-x','0px');
    editorialHero.style.setProperty('--hero-y','0px');
  });
}
