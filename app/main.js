import * as views from './views.js';
import { escape, hydrateAvatars } from './ui.js';
const root = document.querySelector('main');
let controller;
async function render() {
  controller?.abort(); controller = new AbortController(); const active=controller;
  window.__shotReady = false;
  root.innerHTML='<div class="loading" role="status"><span class="spinner"></span>Loading fresh from make.fun…</div>';
  window.scrollTo(0,0);
  try {
    const parts=(location.hash.slice(1)||'/').split('/').filter(Boolean).map(decodeURIComponent);
    document.querySelector('.board-nav').classList.toggle('selected',parts.length===0);
    if(!parts.length) await views.board(root,active.signal);
    else if(parts[0]==='bounty'&&parts[1]&&parts.length<=3&&(!parts[2]||parts[2]==='leaderboard')) await views[parts[2]?'leaderboard':'detail'](root,parts[1],active.signal);
    else if(parts[0]==='profile'&&parts[1]&&parts.length===2) await views.profile(root,parts[1],active.signal);
    else throw new Error('This page wandered off. Head back to the bounty board.');
    if(!active.signal.aborted) { hydrateAvatars(root); document.title=(root.querySelector('h1')?.textContent||'Bounty board')+' · make.fun'; }
  } catch(error) {
    if(active.signal.aborted) return;
    root.innerHTML=`<section class="error-state"><span class="category-icon">↻</span><span class="eyebrow">A SMALL DETOUR</span><h1>Let’s try that again.</h1><p>${escape(error instanceof TypeError||error.name==='TimeoutError'?'We couldn’t reach make.fun. Check your connection and try again.':error.message)}</p><button class="button" id="retry">Try again ↻</button><a href="#/">Back to bounty board →</a></section>`;
    root.querySelector('#retry').addEventListener('click',render);
  } finally { if(!active.signal.aborted) window.__shotReady = true; }
}
document.addEventListener('submit',event=>{
  if(!event.target.matches('.profile-search'))return;
  event.preventDefault(); const handle=new FormData(event.target).get('handle').trim().replace(/^@/,'');
  if(handle) location.hash='/profile/'+encodeURIComponent(handle);
});
document.addEventListener('keydown',event=>{if(event.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)){const search=document.querySelector('#bounty-search');if(search){event.preventDefault();search.focus();}}});
window.addEventListener('hashchange',render);
render();
const clock=document.querySelector('#utc-clock'); const tick=()=>{if(clock)clock.textContent=new Date().toISOString().slice(11,19)+' UTC'}; tick(); setInterval(tick,1000);
const theme=document.querySelector('#theme-toggle'); theme?.addEventListener('click',()=>{const light=document.documentElement.dataset.theme==='light';document.documentElement.dataset.theme=light?'':'light';theme.textContent=light?'LIGHT':'DARK'});
