'use strict';
(()=>{
 const header=document.getElementById('dossier-header');if(!header)return;
 const hero=document.getElementById('dossier-hero');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0;
 const render=()=>{
  frame=0;
  header.classList.toggle('is-scrolled',window.scrollY>24);
  if(!hero)return;
  const rect=hero.getBoundingClientRect();
  const limit=window.innerWidth<768?35:100;
  const shift=reduced.matches?0:Math.max(-limit,Math.min(limit,(window.innerHeight/2-rect.top-rect.height/2)*0.22));
  hero.style.setProperty('--hero-shift',shift.toFixed(2)+'px');
 };
 const update=()=>{if(!frame)frame=window.requestAnimationFrame(render);};
 window.addEventListener('resize',update,{passive:true});
 reduced.addEventListener('change',update);
 update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('pageshow',update);
 const menu=header.querySelector('details');
 document.addEventListener('click',event=>{if(!menu.contains(event.target))menu.open=false;});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus();}});
 menu.addEventListener('click',event=>{if(event.target.closest('a'))menu.open=false;});
})();
