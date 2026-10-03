'use strict';
(() => {
 const header=document.querySelector('.home-header');
 if(!header)return;
 const update=()=>header.classList.toggle('is-scrolled',window.scrollY>24);
 update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('pageshow',update);
 const toggle=header.querySelector('.menu-toggle');
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&header.contains(document.activeElement))toggle.focus();});
})();
