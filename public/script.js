const menu=document.querySelector('.toggle'),nav=document.querySelector('nav');
function closeMenu(){menu.setAttribute('aria-expanded','false');nav.classList.remove('open')}
menu.onclick=()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));if(open)nav.querySelector('a').focus()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus()}});
nav.addEventListener('click',closeMenu);
document.querySelectorAll('[data-filter]').forEach(btn=>btn.onclick=()=>{
 const section=btn.closest('section')||btn.closest('main');
 section.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
 const cards=[...section.querySelectorAll('[data-cat]')];
 cards.forEach(card=>card.hidden=btn.dataset.filter!=='All'&&card.dataset.cat!==btn.dataset.filter);
 section.querySelector('.empty').hidden=cards.some(c=>!c.hidden);
});
function eventName(name,props={}){if(window.growthAnalyticsConsent===true)window.dispatchEvent(new CustomEvent('growth:analytics',{detail:{name,...props}}))}
eventName('page_view',{path:location.pathname});
document.querySelectorAll('[data-place]').forEach(link=>link.onclick=()=>eventName(link.dataset.place==='hero'?'hero_cta_click':'offer_cta_click',{placement:link.dataset.place}));
const roadmap=document.querySelector('#sprint');
if(roadmap && 'IntersectionObserver' in window){
 let timer;
 const observer=new IntersectionObserver(([entry])=>{clearTimeout(timer);if(entry.isIntersecting)timer=setTimeout(()=>{eventName('roadmap_view');observer.disconnect()},900)});
 observer.observe(roadmap);
}
const form=document.querySelector('#lead');
if(form){
 form.addEventListener('input',()=>eventName('form_start'),{once:true});
 let key=crypto.randomUUID();
 form.addEventListener('submit',async e=>{
  e.preventDefault();const button=form.querySelector('[type=submit]');if(button.disabled)return;
  const status=document.querySelector('#status');
  for(const node of form.querySelectorAll('small'))node.textContent='';
  form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
  const data=Object.fromEntries(new FormData(form));
  data.privacy_consent=form.elements.privacy_consent.checked;
  data.idempotency_key=key;
  if(window.growthAnalyticsConsent===true){try{data.attribution=JSON.parse(sessionStorage.getItem('growth-attribution')||'{}')}catch{}}
  button.disabled=true;button.textContent='Submitting…';status.textContent='';eventName('form_submit_attempt');
  try{
   const response=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
   const result=await response.json();
   if(response.status===201 && result.success && /^[a-f0-9-]{36}$/i.test(result.lead_id)){
    eventName('form_submit_success');try{sessionStorage.setItem('growth-receipt',result.lead_id)}catch{}
    location.assign('/thank-you?ref='+encodeURIComponent(result.lead_id));return;
   }
   for(const [field,msg] of Object.entries(result.field_errors||{})){
    const el=form.elements.namedItem(field);if(el){el.setAttribute('aria-invalid','true');document.getElementById('err-'+field).textContent=msg}
   }
   if(response.status===409)key=crypto.randomUUID();
   throw new Error(result.message||'Please review the marked fields and try again.');
  }catch(err){eventName('form_submit_error');status.textContent=err instanceof SyntaxError||err instanceof TypeError?'Unable to reach the application service. Your answers are still here. Please retry.':err.message;status.focus()}
  finally{button.disabled=false;button.textContent='Submit application'}
 });
}
if(window.growthAnalyticsConsent===true){try{if(!sessionStorage.getItem('growth-attribution')){const q=new URLSearchParams(location.search),a={landing_path:location.pathname};for(const k of ['utm_source','utm_medium','utm_campaign'])if(/^[a-z0-9_-]{1,64}$/i.test(q.get(k)||''))a[k]=q.get(k).toLowerCase();sessionStorage.setItem('growth-attribution',JSON.stringify(a))}}catch{}}
const receipt=document.querySelector('#confirmation');
if(receipt){const ref=new URLSearchParams(location.search).get('ref');try{if(ref&&ref===sessionStorage.getItem('growth-receipt')){document.querySelector('h1').textContent='Application received.';receipt.textContent='Your reference is '+ref+'. Samir will review the fit and follow up by email about the next step.'}}catch{}}
if(location.pathname==='/case-studies' && location.hash.startsWith('#work-')){
 const article=document.getElementById(location.hash.slice(1));
 if(article?.querySelector('details'))article.querySelector('details').open=true;
}
