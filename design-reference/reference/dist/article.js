const canonicalURL=document.querySelector('link[rel="canonical"]').href;
document.querySelectorAll('[data-copy-link]').forEach(button=>{
  button.addEventListener('click',async()=>{
    const status=button.parentElement.querySelector('.share-status');
    try{
      await navigator.clipboard.writeText(canonicalURL);
      status.textContent='Link copied';
    }catch{
      status.textContent='Copy this address: '+canonicalURL;
    }
  });
});
document.getElementById('article-brief-form').addEventListener('submit',event=>{
  event.preventDefault();
  document.getElementById('article-form-message').textContent='This is a design preview. Newsletter signup is not active.';
});
const tocLinks=[...document.querySelectorAll('.sticky-index a[href^="#"],.mobile-index a[href^="#"]')];
const tocSections=[...new Set(tocLinks.map(link=>document.getElementById(link.hash.slice(1))))].filter(Boolean);
const readingArticle=document.getElementById('main-article');
const progressFill=document.getElementById('reading-progress-fill');
let scrollPending=false;
function updateReadingState(){
  scrollPending=false;
  const start=readingArticle.offsetTop;
  const distance=readingArticle.offsetHeight-window.innerHeight;
  const fraction=Math.max(0,Math.min(1,(window.scrollY-start)/Math.max(1,distance)));
  progressFill.style.width=(fraction*100).toFixed(1)+'%';
  let current=tocSections[0];
  tocSections.forEach(section=>{if(section.getBoundingClientRect().top<=160)current=section});
  tocLinks.forEach(link=>{
    if(current&&link.hash==='#'+current.id)link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  });
}
function queueReadingUpdate(){if(!scrollPending){scrollPending=true;requestAnimationFrame(updateReadingState)}}
window.addEventListener('scroll',queueReadingUpdate,{passive:true});
window.addEventListener('resize',queueReadingUpdate);
window.addEventListener('load',updateReadingState);
updateReadingState();
document.querySelectorAll('.mobile-index a').forEach(link=>link.addEventListener('click',()=>{link.closest('details').open=false}));
