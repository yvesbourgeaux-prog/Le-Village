'use strict';
window.lvScopedDocument=function(root){return new Proxy(window.document,{get(target,key){if(key==='querySelector')return selector=>root.querySelector(selector);if(key==='querySelectorAll')return selector=>root.querySelectorAll(selector);if(key==='getElementById')return id=>root.querySelector('#'+CSS.escape(id))||target.getElementById(id);const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}})};
const menu=document.querySelector('.menu-toggle'),nav=document.getElementById('site-nav');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Ouvrir le menu');}
if(menu&&nav){
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();window.lvPrivacy?.close();}});
for(const a of nav.querySelectorAll('a'))if(a.pathname===location.pathname)a.setAttribute('aria-current','page');
}
const fallback='https://assets.zyrosite.com/gnKoPAn3rxzY53IR/548927768_18110917903554133_6103352769976099505_n-tx4bw2LvKuuQwaTd.jpg';
document.addEventListener('error',event=>{const img=event.target;if(img.tagName==='IMG'&&img.dataset.lvOriginalSrc&&!img.dataset.lvOriginalTried){img.dataset.lvOriginalTried='true';img.removeAttribute('srcset');img.removeAttribute('sizes');img.src=img.dataset.lvOriginalSrc;return;}if(img.tagName==='IMG'&&!img.dataset.fallback){img.dataset.fallback='true';img.src=fallback;img.alt='Terrasse du restaurant Le Village au Haut-de-Cagnes';}},true);
// Old reservation links remain valid after migration.
if(!document.querySelector('.zc-widget-config')&&(new URLSearchParams(location.search).get('zc')==='open'||location.hash==='#zc-action-open'))location.replace('/reserver');
// Preserve the original one-click restaurant booking overlay, with usable fallbacks.
if(!document.querySelector('.zc-widget-config')){
const bookingDialog=document.createElement('dialog');bookingDialog.className='booking-dialog';bookingDialog.setAttribute('aria-labelledby','booking-dialog-title');bookingDialog.innerHTML='<div class="booking-dialog-top"><h2 id="booking-dialog-title">Réserver une table au Village</h2><button type="button" aria-label="Fermer la réservation">×</button></div><p class="booking-help">Vous pouvez aussi <a href="tel:+33493200886">appeler le 04 93 20 08 86</a> ou <a href="/hotel-cagnes-sur-mer-le-grimaldi#reservation">réserver une chambre</a>.</p><iframe title="Réservation du restaurant Le Village avec Zenchef"></iframe><a class="booking-external" target="_blank" rel="noopener noreferrer" href="https://bookings.zenchef.com/results?rid=361354&pid=1001">Ouvrir Zenchef dans un nouvel onglet</a>';document.body.append(bookingDialog);
bookingDialog.querySelector('button').addEventListener('click',()=>bookingDialog.close());bookingDialog.addEventListener('click',event=>{if(event.target===bookingDialog)bookingDialog.close();});
document.addEventListener('click',event=>{const a=event.target.closest('a[href="/reserver"]');if(!a||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();const frame=bookingDialog.querySelector('iframe');if(!frame.src)frame.src='https://bookings.zenchef.com/results?sdk=1&withCloseButton=1&rid=361354&lang=fr&primaryColor=794116&showCollapsed=1';bookingDialog.showModal();});
}
if(document.getElementById('lvLeafletMap')){const link=document.createElement('link');link.rel='stylesheet';link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.append(link);}

// Load the local consent manager before the optional analytics engine.
(() => {
 if(document.querySelector('script[data-lv-privacy]'))return;
 const s=document.createElement('script');s.dataset.lvPrivacy='';s.src='/assets/js/privacy.js?v=20261006-privacy1';
 s.onload=()=>{const a=document.createElement('script');a.src='/assets/js/analytics.js?v=20261006-privacy1';a.dataset.lvAnalytics='';document.head.append(a);};
 document.head.append(s);
})();
