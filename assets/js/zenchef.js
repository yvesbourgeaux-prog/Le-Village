/* The booking SDK is loaded only after permission, when a reservation is requested. */
'use strict';
(() => {
 const config=document.querySelector('.zc-widget-config');if(!config)return;
 let loading=false,lastOpen=0;
 const floating=document.createElement('button');floating.type='button';floating.className='lv-booking-float';floating.textContent=({fr:'Réserver',en:'Book',es:'Reservar',de:'Reservieren',it:'Prenota',nl:'Reserveren',sv:'Boka',da:'Book',nb:'Bestill',pl:'Zarezerwuj',ru:'Забронировать',ja:'予約','zh-CN':'预订'})[document.documentElement.lang]||'Book';document.body.append(floating);
 function activate(){
  const sdk=window.ZenchefWidget||window.ZcWidget;
  if(sdk&&typeof sdk.open==='function'){sdk.open();return;}
  const trigger=()=>{history.replaceState(null,'',location.pathname+location.search);location.hash='zc-action-open';};
  trigger();setTimeout(trigger,500);setTimeout(trigger,1500);
 }
 function load(){
  window.lvPrivacy.markActive('zenchef');
  if(document.getElementById('zenchef-sdk')){activate();return;}
  if(loading)return;loading=true;config.dataset.open='true';
  const s=document.createElement('script');s.id='zenchef-sdk';s.src='https://sdk.zenchef.com/v1/sdk.min.js';
  s.onload=()=>{loading=false;floating.hidden=true;activate();};
  s.onerror=()=>{loading=false;s.remove();location.href='https://bookings.zenchef.com/results?rid=361354&pid=1001';};document.head.append(s);
 }
 function open(){if(Date.now()-lastOpen<400)return;lastOpen=Date.now();if(window.lvPrivacy)window.lvPrivacy.request('zenchef',load);else window.addEventListener('lv:privacy-ready',()=>window.lvPrivacy.request('zenchef',load),{once:true});}
 floating.addEventListener('click',open);
 function intercept(e){
  if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
  const el=e.target?.closest?.('a,[role="link"],button');if(!el)return;
  const href=el.getAttribute('href')||el.dataset.href||el.dataset.url;if(!href)return;
  let u;try{u=new URL(href,location.href);}catch{return;}
  if(u.origin!==location.origin||!(u.pathname.replace(/^\/(?:en|sv|da|nl|de|it|es|ja|zh-CN|nb|ru|pl)(?=\/|$)/,'')==='/reserver'||u.searchParams.get('zc')==='open'))return;
  e.preventDefault();e.stopImmediatePropagation();open();
 }
 document.addEventListener('click',intercept,true);
 const u=new URL(location.href);
 if(u.searchParams.get('zc')==='open'||u.hash==='#zc-action-open'){
  u.searchParams.delete('zc');u.hash='';history.replaceState(null,'',u.pathname+u.search);open();
 }
})();
