const trackerData=JSON.parse(document.getElementById('tracker-data').textContent);
const companyTable=document.getElementById('company-table');
const searchInput=document.getElementById('company-search');
const metricFilter=document.getElementById('metric-filter');
const sortSelect=document.getElementById('company-sort');
const verticalButtons=[...document.querySelectorAll('[data-vertical]')];
const groups=new Map([...document.querySelectorAll('[data-company]')].map(el=>[el.dataset.company,el]));
let selectedVertical='All';
function updateTracker(){
  const selected=AITracker.selectCompanies(trackerData.companies,{query:searchInput.value,vertical:selectedVertical,metric:metricFilter.value,sort:sortSelect.value});
  const selectedIds=new Set(selected.map(c=>c.id));
  groups.forEach((group,id)=>{group.hidden=!selectedIds.has(id)});
  selected.forEach(c=>companyTable.appendChild(groups.get(c.id)));
  document.getElementById('tracker-count').textContent=`Showing ${selected.length} of ${trackerData.companies.length} companies`;
  document.getElementById('tracker-empty').hidden=selected.length>0;
  verticalButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.vertical===selectedVertical)));
}
function resetTracker(){searchInput.value='';metricFilter.value='All';sortSelect.value='desc';selectedVertical='All';updateTracker()}
verticalButtons.forEach(button=>button.addEventListener('click',()=>{selectedVertical=button.dataset.vertical;updateTracker()}));
searchInput.addEventListener('input',updateTracker);
metricFilter.addEventListener('change',updateTracker);
sortSelect.addEventListener('change',updateTracker);
document.getElementById('clear-filters').addEventListener('click',resetTracker);
document.getElementById('empty-reset').addEventListener('click',()=>{resetTracker();searchInput.focus()});
document.querySelectorAll('.company-expand').forEach(button=>button.addEventListener('click',()=>{
 const opened=button.getAttribute('aria-expanded')==='true';
 button.setAttribute('aria-expanded',String(!opened));
 document.getElementById(button.getAttribute('aria-controls')).hidden=opened;
 button.querySelector('.expand-symbol').textContent=opened?'+':'−';
}));
const requestedCompany=new URLSearchParams(location.search).get('company');
if(requestedCompany)searchInput.value=requestedCompany.slice(0,100);
updateTracker();
document.getElementById('tracker-brief-form').addEventListener('submit',event=>{event.preventDefault();document.getElementById('tracker-form-message').textContent='This is a design preview. Newsletter signup is not active.'});
