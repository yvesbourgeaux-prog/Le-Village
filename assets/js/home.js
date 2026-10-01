'use strict';
(() => {
 const header=document.querySelector('.home-header');
 if(!header)return;
 const update=()=>header.classList.toggle('is-scrolled',window.scrollY>24);
 update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('pageshow',update);
 const toggle=header.querySelector('.menu-toggle');
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&header.contains(document.activeElement))toggle.focus();});
})();
// Native Zenchef SDK; a normal booking link remains usable if the SDK cannot load.
(() => {
 if(!document.querySelector('.zc-widget-config'))return;
 const fallback='https://bookings.zenchef.com/results?rid=361354&pid=1001';
 function openBooking(){
  let attempts=0;
  const tryOpen=()=>{
   const sdk=window.ZenchefWidget||window.ZcWidget;
   if(sdk){sdk.open();return;}
   if(++attempts<20){setTimeout(tryOpen,150);return;}
   location.href=fallback;
  };
  tryOpen();
 }
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
  const u=new URL(a.href,location.href);
  if(u.origin!==location.origin||!(u.pathname==='/reserver'||u.searchParams.get('zc')==='open'))return;
  e.preventDefault();e.stopImmediatePropagation();openBooking();
 },true);
 const u=new URL(location.href);
 if(u.searchParams.get('zc')==='open'||u.hash==='#zc-action-open'){
  u.searchParams.delete('zc');if(u.hash==='#zc-action-open')u.hash='';
  history.replaceState(null,'',u.pathname+u.search+u.hash);openBooking();
 }
})();
