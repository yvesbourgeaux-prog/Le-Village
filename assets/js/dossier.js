'use strict';
(()=>{
 const header=document.getElementById('dossier-header');if(!header)return;
 const update=()=>header.classList.toggle('is-scrolled',window.scrollY>24);
 update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('pageshow',update);
 const menu=header.querySelector('details');
 document.addEventListener('click',event=>{if(!menu.contains(event.target))menu.open=false;});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus();}});
 menu.addEventListener('click',event=>{if(event.target.closest('a'))menu.open=false;});
})();
