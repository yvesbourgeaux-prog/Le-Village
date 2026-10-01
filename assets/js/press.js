'use strict';
(()=>{
 const header=document.getElementById('press-header'),button=document.getElementById('menuBtn'),menu=document.getElementById('mobileMenu');
 if(!header||!button||!menu)return;
 const update=()=>header.classList.toggle('is-scrolled',window.scrollY>24);
 update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('pageshow',update);
 const close=()=>{menu.classList.add('hidden');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Ouvrir le menu');};
 button.addEventListener('click',()=>{const open=menu.classList.contains('hidden');menu.classList.toggle('hidden',!open);button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');});
 menu.addEventListener('click',e=>{if(e.target.closest('a'))close();});
 document.addEventListener('click',e=>{if(!header.contains(e.target))close();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.classList.contains('hidden')){close();button.focus();}});
})();
