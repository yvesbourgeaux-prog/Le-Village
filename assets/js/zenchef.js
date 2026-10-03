/* Shared native Zenchef widget and legacy booking links. */
'use strict';
(() => {
 if(!document.querySelector('.zc-widget-config'))return;
 let lastOpen=-Infinity;
 function openBooking(){
  if(Date.now()-lastOpen<400)return;
  lastOpen=Date.now();
  const sdk=window.ZenchefWidget||window.ZcWidget;
  if(sdk&&typeof sdk.open==='function'){sdk.open();return;}
  const trigger=()=>{history.replaceState(null,'',location.pathname+location.search);location.hash='zc-action-open';};
  trigger();setTimeout(trigger,500);setTimeout(trigger,1500);
 }
 function intercept(e){
  if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
  const el=e.target?.closest?.('a, [role="link"], button');if(!el)return;
  const href=el.getAttribute('href')||el.dataset.href||el.dataset.url;if(!href)return;
  let u;try{u=new URL(href,location.href);}catch{return;}
  if(u.origin!==location.origin||!(u.pathname==='/reserver'||u.searchParams.get('zc')==='open'))return;
  if(e.cancelable)e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openBooking();
 }
 document.addEventListener('pointerdown',intercept,{capture:true,passive:false});
 document.addEventListener('touchstart',intercept,{capture:true,passive:false});
 document.addEventListener('click',intercept,true);
 const u=new URL(location.href);
 if(u.searchParams.get('zc')==='open'||u.hash==='#zc-action-open'){
  u.searchParams.delete('zc');if(u.hash==='#zc-action-open')u.hash='';
  history.replaceState(null,'',u.pathname+u.search+u.hash);setTimeout(openBooking,60);
 }
})();
