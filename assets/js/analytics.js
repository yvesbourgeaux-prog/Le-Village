/* Optional analytics. Consent is owned by privacy.js. */
'use strict';
(() => {
 if(window.lvAnalytics || !/^(www\.)?legrimaldibylevillage\.com$/.test(location.hostname))return;
 const GTM='GTM-NCL2235Z',ID='G-1F6HPCJ4JL',TTL=180*24*60*60*1000;
 const language=document.documentElement.lang||'fr';
 let granted=false,loaded=false,initialized=false,lastAction='',lastTime=0;
 window.dataLayer=window.dataLayer||[];
 function gtag(){window.dataLayer.push(arguments);}
 window.gtag=gtag;
 gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
 window['ga-disable-'+ID]=true;
 function safeLocation(){const u=new URL(location.href);u.hash='';for(const k of [...u.searchParams.keys()])if(!/^utm_(source|medium|campaign|content|term)$/.test(k))u.searchParams.delete(k);return u.href;}
 function safeReferrer(){try{const u=new URL(document.referrer);return u.origin+u.pathname;}catch{return '';}}
 function track(name,params={}){if(!granted)return;gtag('event',name,{send_to:ID,page_language:language,page_slug:document.documentElement.dataset.pageSlug||location.pathname,page_location:safeLocation(),page_referrer:safeReferrer(),...params});}
 function load(){
  window['ga-disable-'+ID]=false;
  gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  if(!initialized){
   initialized=true;
   // The single Google tag is configured in GTM. Keep privacy and URL sanitization.
   gtag('set',{send_page_view:false,page_location:safeLocation(),page_referrer:safeReferrer(),allow_google_signals:false,allow_ad_personalization_signals:false,cookie_expires:TTL/1000,cookie_update:false});
  }
  if(!loaded){
   loaded=true;window.lvPrivacy?.markActive('analytics');
   window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});
   const script=document.createElement('script');script.async=true;script.dataset.lvGtm='';script.src='https://www.googletagmanager.com/gtm.js?id='+GTM;document.head.append(script);
   track('page_view');
  }
 }
 function clearCookies(){const domains=[null,location.hostname,'.'+location.hostname,'.legrimaldibylevillage.com'];for(const raw of document.cookie.split(';')){const name=raw.split('=')[0].trim();if(!/^_ga(?:_|$)/.test(name))continue;for(const domain of domains)document.cookie=name+'=; Max-Age=0; path=/'+(domain?'; domain='+domain:'')+'; SameSite=Lax';}}
 function interaction(e){
  if(!granted)return;const el=e.target?.closest?.('a,button,[role="link"]');if(!el)return;
  const href=el.getAttribute('href')||el.dataset.href||el.dataset.url||'';if(!href)return;let url;try{url=new URL(href,location.href);}catch{return;}
  const p=url.pathname.replace(/^\/(en|sv|da|nl|de|it|es|ja|zh-CN|nb|ru|pl)(?=\/|$)/,'');
  let action='';
  if(url.protocol==='tel:')action='phone_click';
  else if(url.protocol==='mailto:')action='email_click';
  else if(url.origin===location.origin&&(p==='/reserver'||url.searchParams.get('zc')==='open'||url.hash==='#zc-action-open'))action='restaurant_booking_click';
  else if(/(^|\.)zenchef\.com$/.test(url.hostname))action='restaurant_booking_click';
  else if(url.origin===location.origin&&p==='/hotel-cagnes-sur-mer-le-grimaldi'&&(url.hash==='#reservation'||/réserver|book a room|reserveer|boka|prenota|reservar|reservieren|reserver|bestill|rezerw|бронир|заброни|予約|预订|预约/i.test(el.getAttribute('aria-label')||el.textContent||'')))action='hotel_booking_click';
  else if(/(^|\.)(booking\.com|book-secure\.com|reservit\.com|mews\.com)$/.test(url.hostname))action='hotel_booking_click';
  else if(url.origin===location.origin&&p==='/la-carte'&&!url.hash)action='menu_click';
  else if((/(^|\.)google\.[a-z.]+$/.test(url.hostname)&&(/\/maps(?:\/|$)/.test(url.pathname)||url.hostname.startsWith('maps.')))||url.hostname==='maps.app.goo.gl'||(url.hostname==='goo.gl'&&url.pathname.startsWith('/maps')))action='directions_click';
  if(!action)return;const fingerprint=action+href;const now=Date.now();if(fingerprint===lastAction&&now-lastTime<1000)return;lastAction=fingerprint;lastTime=now;track(action,{destination_type:action.startsWith('hotel')?'hotel':action.startsWith('restaurant')?'restaurant':'contact_or_menu'});
 }
 window.addEventListener('pointerdown',interaction,true);window.addEventListener('click',interaction,true);

 function sync(){
  granted=window.lvPrivacy?.allowed('analytics')===true;
  if(granted)load();
  else{window['ga-disable-'+ID]=true;clearCookies();}
 }
 window.lvAnalytics={openSettings:()=>window.lvPrivacy?.open(),track};
 window.addEventListener('lv:consent',sync);sync();
})();
