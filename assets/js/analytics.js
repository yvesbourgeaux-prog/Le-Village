/* GA4: optional audience measurement, loaded only after consent. */
'use strict';
(() => {
 if (window.lvAnalytics || !/^(www\.)?legrimaldibylevillage\.com$/.test(location.hostname)) return;
 const ID='G-1F6HPCJ4JL', KEY='lv_analytics_consent_v1', TTL=180*24*60*60*1000;
 const language=document.documentElement.lang||'fr';
 const copy={
 fr:['Mesure d’audience','Avec votre accord, Google Analytics nous aide à comprendre les visites et les clics vers la réservation. Le site et la réservation fonctionnent aussi sans cette mesure.','Refuser','Accepter','Confidentialité','Mesure d’audience : vos choix','Votre choix est conservé pendant six mois. Vous pouvez le modifier à tout moment. Aucun suivi publicitaire n’est activé.','Fermer'],
 en:['Audience measurement','With your permission, Google Analytics helps us understand visits and clicks towards booking. The website and booking work without this measurement.','Decline','Accept','Privacy','Audience measurement: your choice','Your choice is saved for six months. You can change it at any time. Advertising tracking is not enabled.','Close'],
 de:['Besucherstatistik','Mit Ihrer Zustimmung hilft uns Google Analytics, Besuche und Klicks zur Reservierung zu verstehen. Die Website und die Reservierung funktionieren auch ohne diese Messung.','Ablehnen','Akzeptieren','Datenschutz','Besucherstatistik: Ihre Auswahl','Ihre Auswahl wird sechs Monate gespeichert. Sie können sie jederzeit ändern. Werbetracking ist nicht aktiviert.','Schließen'],
 it:['Statistiche di visita','Con il tuo consenso, Google Analytics ci aiuta a capire le visite e i clic verso la prenotazione. Il sito e le prenotazioni funzionano anche senza questa misurazione.','Rifiuta','Accetta','Privacy','Statistiche di visita: la tua scelta','La scelta viene conservata per sei mesi. Puoi modificarla in qualsiasi momento. Il tracciamento pubblicitario non è attivo.','Chiudi'],
 es:['Medición de audiencia','Con tu permiso, Google Analytics nos ayuda a comprender las visitas y los clics hacia la reserva. El sitio y las reservas funcionan también sin esta medición.','Rechazar','Aceptar','Privacidad','Medición de audiencia: tu elección','Tu elección se guarda durante seis meses. Puedes cambiarla en cualquier momento. No se activa el seguimiento publicitario.','Cerrar'],
 sv:['Besöksstatistik','Med ditt samtycke hjälper Google Analytics oss att förstå besök och klick till bokning. Webbplatsen och bokningen fungerar även utan denna mätning.','Avvisa','Godkänn','Integritet','Besöksstatistik: ditt val','Ditt val sparas i sex månader och kan ändras när som helst. Ingen annonsspårning aktiveras.','Stäng'],
 da:['Besøgsstatistik','Med dit samtykke hjælper Google Analytics os med at forstå besøg og klik til booking. Hjemmesiden og booking fungerer også uden denne måling.','Afvis','Acceptér','Privatliv','Besøgsstatistik: dit valg','Dit valg gemmes i seks måneder og kan ændres når som helst. Annoncesporing er ikke aktiveret.','Luk'],
 nl:['Bezoekersstatistieken','Met uw toestemming helpt Google Analytics ons bezoeken en klikken naar reserveringen te begrijpen. De website en reserveringen werken ook zonder deze meting.','Weigeren','Accepteren','Privacy','Bezoekersstatistieken: uw keuze','Uw keuze wordt zes maanden bewaard en kan altijd worden gewijzigd. Advertentietracking is niet ingeschakeld.','Sluiten'],
 nb:['Besøksstatistikk','Med ditt samtykke hjelper Google Analytics oss å forstå besøk og klikk til bestilling. Nettstedet og bestillingen fungerer også uten denne målingen.','Avslå','Godta','Personvern','Besøksstatistikk: ditt valg','Valget ditt lagres i seks måneder og kan endres når som helst. Annonssporing er ikke aktivert.','Lukk'],
 pl:['Statystyki odwiedzin','Za Twoją zgodą Google Analytics pomaga nam analizować wizyty i kliknięcia prowadzące do rezerwacji. Strona i rezerwacje działają również bez tego pomiaru.','Odrzuć','Akceptuj','Prywatność','Statystyki odwiedzin: Twój wybór','Twój wybór jest zapisywany przez sześć miesięcy. Możesz go zmienić w dowolnym momencie. Śledzenie reklam nie jest włączone.','Zamknij'],
 ru:['Статистика посещений','С вашего согласия Google Analytics помогает нам анализировать посещения и переходы к бронированию. Сайт и бронирование работают и без этой статистики.','Отклонить','Принять','Конфиденциальность','Статистика посещений: ваш выбор','Ваш выбор сохраняется на шесть месяцев. Его можно изменить в любое время. Рекламное отслеживание отключено.','Закрыть'],
 ja:['アクセス解析','同意いただいた場合、Google Analyticsで訪問と予約へのクリックを分析します。同意しなくてもサイトと予約を利用できます。','拒否する','同意する','プライバシー','アクセス解析の設定','選択は6か月間保存され、いつでも変更できます。広告トラッキングは有効にしません。','閉じる'],
 'zh-CN':['访问统计','经您同意，Google Analytics将帮助我们了解访问情况及预约点击。不同意也可正常使用网站和预约服务。','拒绝','接受','隐私','访问统计：您的选择','您的选择将保存六个月，可随时更改。不会启用广告跟踪。','关闭']
 };
 const t=copy[language]||copy[language.split('-')[0]]||copy.en;
 const privacy={fr:'Si vous acceptez, des cookies Google Analytics (_ga) sont utilisés et des données de navigation sont transmises à Google pour produire les statistiques. Les cookies sont limités à six mois. Vous pouvez refuser ou retirer votre accord ici.',en:'If you accept, Google Analytics cookies (_ga) are used and browsing data is sent to Google to produce statistics. Cookies are limited to six months. You can decline or withdraw your consent here.',de:'Wenn Sie zustimmen, werden Google-Analytics-Cookies (_ga) verwendet und Nutzungsdaten für Statistiken an Google übermittelt. Die Cookies sind auf sechs Monate begrenzt. Sie können hier ablehnen oder Ihre Zustimmung widerrufen.',it:'Se accetti, vengono utilizzati cookie Google Analytics (_ga) e dati di navigazione vengono inviati a Google per le statistiche. I cookie durano al massimo sei mesi. Puoi rifiutare o revocare il consenso qui.',es:'Si aceptas, se utilizan cookies de Google Analytics (_ga) y se envían datos de navegación a Google para las estadísticas. Las cookies duran como máximo seis meses. Puedes rechazar o retirar tu consentimiento aquí.'};
 const privacyText=privacy[language]||privacy.en;
 let granted=false, loaded=false, initialized=false, previousFocus=null, lastAction='', lastTime=0;
 let choice=null;try{const c=JSON.parse(localStorage.getItem(KEY));if(c&&typeof c.granted==='boolean'&&Number.isFinite(c.at)&&c.at<=Date.now()&&Date.now()-c.at<TTL)choice=c;}catch{}
 window.dataLayer=window.dataLayer||[];
 function gtag(){window.dataLayer.push(arguments);}
 window.gtag=gtag;
 gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
 window['ga-disable-'+ID]=true;
 function safeLocation(){const u=new URL(location.href);u.hash='';for(const k of [...u.searchParams.keys()])if(!/^utm_(source|medium|campaign|content|term)$/.test(k))u.searchParams.delete(k);return u.href;}
 function safeReferrer(){try{const u=new URL(document.referrer);return u.origin+u.pathname;}catch{return '';}}
 function track(name,params={}){if(!granted)return;gtag('event',name,{page_language:language,page_slug:document.documentElement.dataset.pageSlug||location.pathname,page_location:safeLocation(),page_referrer:safeReferrer(),...params});}
 function load(){
  window['ga-disable-'+ID]=false;
  gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  if(!initialized){initialized=true;gtag('js',new Date());gtag('config',ID,{send_page_view:false,page_location:safeLocation(),page_referrer:safeReferrer(),allow_google_signals:false,allow_ad_personalization_signals:false,cookie_expires:TTL/1000,cookie_update:false});track('page_view');}
  if(!loaded){loaded=true;const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+ID;document.head.append(script);}
 }
 function clearCookies(){const domains=[null,location.hostname,'.'+location.hostname,'.legrimaldibylevillage.com'];for(const raw of document.cookie.split(';')){const name=raw.split('=')[0].trim();if(!/^_ga(?:_|$)/.test(name))continue;for(const domain of domains)document.cookie=name+'=; Max-Age=0; path=/'+(domain?'; domain='+domain:'')+'; SameSite=Lax';}}
 const link=document.createElement('link');link.rel='stylesheet';link.href='/assets/css/analytics.css?v=20261005-1';document.head.append(link);
 const panel=document.createElement('section');panel.className='lv-consent';panel.setAttribute('role','region');panel.setAttribute('aria-labelledby','lv-consent-title');panel.innerHTML='<h2 id="lv-consent-title"></h2><p></p><div class="lv-consent-actions"><button type="button" data-lv-consent="deny"></button><button type="button" data-lv-consent="accept"></button><button type="button" data-lv-consent="close" hidden></button></div><details><summary></summary><p></p></details>';
 panel.querySelector('h2').textContent=t[0];panel.querySelector('p').textContent=t[1];panel.querySelector('[data-lv-consent="deny"]').textContent=t[2];panel.querySelector('[data-lv-consent="accept"]').textContent=t[3];panel.querySelector('summary').textContent=t[4];panel.querySelector('details p').textContent=privacyText+' '+t[6];panel.querySelector('[data-lv-consent="close"]').textContent=t[7];document.body.append(panel);
 function show(settings=false){previousFocus=document.activeElement;panel.hidden=false;panel.querySelector('h2').textContent=settings?t[5]:t[0];panel.querySelector('[data-lv-consent="close"]').hidden=!settings;if(settings)panel.querySelector('[data-lv-consent="deny"]').focus();}
 function hide(){panel.hidden=true;if(previousFocus&&previousFocus.isConnected)previousFocus.focus();}
 function decide(value){granted=value;choice={granted:value,at:Date.now()};try{localStorage.setItem(KEY,JSON.stringify(choice));}catch{}if(value)load();else{window['ga-disable-'+ID]=true;gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});clearCookies();}hide();}
 panel.addEventListener('click',e=>{const b=e.target.closest('[data-lv-consent]');if(!b)return;const action=b.dataset.lvConsent;if(action==='close')hide();else decide(action==='accept');});
 document.addEventListener('click',e=>{if(e.target.closest('[data-reset-consent]')){decide(false);}});
 // Keep analytics choices accessible even on pages without the legacy privacy footer.
 const settings=document.createElement('button');settings.type='button';settings.className='lv-consent-settings';settings.textContent=t[5];settings.addEventListener('click',()=>show(true));document.body.append(settings);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&choice)hide();});
 window.addEventListener('storage',e=>{if(e.key!==KEY)return;let c;try{c=JSON.parse(e.newValue);}catch{}granted=!!(c&&c.granted&&Date.now()-c.at<TTL);if(granted)load();else{window['ga-disable-'+ID]=true;gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});clearCookies();} });
 // Window capture runs before the Zenchef document interceptor; deduplicate touch/click.
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
  if(!action)return;const fingerprint=action+href;const now=Date.now();if(fingerprint===lastAction&&now-lastTime<1000)return;lastAction=fingerprint;lastTime=now;track(action,{destination_type:action.startsWith('hotel')?'hotel':action.startsWith('restaurant')?'restaurant':'contact_or_menu'});
 }
 window.addEventListener('pointerdown',interaction,true);window.addEventListener('click',interaction,true);
 window.lvAnalytics={openSettings:()=>show(true),track,get consentGranted(){return granted;}};
 if(choice){panel.hidden=true;granted=choice.granted;if(granted)load();}else show();
})();
