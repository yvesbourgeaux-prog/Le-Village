/* Private demonstration: keep the reservation launcher independent of the back office. */
(()=>{
 'use strict';
 const open=(event)=>{
  event.preventDefault();
  event.stopImmediatePropagation();
  try{
   const fn=window.lvDemoBookingOpen;
   if(typeof fn!=='function')throw new Error('Réservation temporairement indisponible : interface non initialisée');
   fn();
   const dialog=document.getElementById('booking-dialog');
   if(!dialog?.open)throw new Error('Le panneau de réservation ne s’est pas ouvert');
  }catch(error){
   console.error('[Le Village démo] Booking launch failed:',error);
   let notice=document.getElementById('lv-booking-error');
   if(!notice){
    notice=document.createElement('div');
    notice.id='lv-booking-error';
    notice.setAttribute('role','alert');
    document.body.appendChild(notice);
   }
   notice.textContent='Impossible d’ouvrir le module pour le moment. Pour réserver, appelez le 04 93 20 08 86.';
   notice.hidden=false;
   window.setTimeout(()=>{notice.hidden=true},7500);
  }
 };
 document.addEventListener('click',e=>{
  const button=e.target.closest?.('#lv-demo-app [data-open-booking]');
  if(button){open(e);return}
  const link=e.target.closest?.('a[href]');
  if(!link||document.getElementById('lv-demo-app')?.contains(link))return;
  const href=link.getAttribute('href');
  if(!href||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
  let url;try{url=new URL(href,location.href)}catch{return}
  if(url.origin===location.origin&&(url.pathname.replace(/\/$/,'')==='/reserver'||url.searchParams.get('zc')==='open'))open(e);
 },true);
})();