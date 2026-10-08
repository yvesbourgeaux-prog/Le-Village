(()=>{
'use strict';
const PHONE_DISPLAY='04 93 20 08 86',PHONE_LINK='tel:+33493200886';
const root=document.getElementById('lv-demo-app');if(!root)return;
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const todayISO=()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)};
const addDays=(iso,n)=>{const d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const fmtDate=(iso,long=false)=>new Intl.DateTimeFormat('fr-FR',long?{weekday:'long',day:'numeric',month:'long',year:'numeric'}:{weekday:'short',day:'numeric',month:'short'}).format(new Date(iso+'T12:00:00'));
const monthName=(d)=>new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric'}).format(d);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const defaults={maxParty:6,notice:0,largeMessage:'Pour 7 personnes ou plus, appelez-nous directement afin que nous puissions organiser votre table.',lunchTimes:['12:00','12:30','13:00','13:30','14:00','14:30'],dinnerTimes:['19:00','19:30','20:00','20:30','21:00'],lunchCap:24,dinnerCap:30,weekdays:[1,2,3,4,5,6,0]};
const load=(k,fallback)=>{try{return JSON.parse(localStorage.getItem(k))??fallback}catch{return fallback}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
let settings={...defaults,...load('lv-demo-settings',{})};
const seedDate=todayISO();
const seed=[
{id:'r1',date:seedDate,time:'12:30',service:'lunch',pax:2,first:'Camille',last:'Laurent',phone:'06 00 00 00 01',email:'camille@example.com',note:'Table au calme si possible',status:'confirmed',created:'Exemple fictif'},
{id:'r2',date:seedDate,time:'13:30',service:'lunch',pax:4,first:'Thomas',last:'Moreau',phone:'06 00 00 00 02',email:'thomas@example.com',note:'Anniversaire',status:'confirmed',created:'Exemple fictif'},
{id:'r3',date:seedDate,time:'19:00',service:'dinner',pax:5,first:'Marie',last:'Petit',phone:'06 00 00 00 03',email:'marie@example.com',note:'',status:'confirmed',created:'Exemple fictif'},
{id:'r4',date:seedDate,time:'19:30',service:'dinner',pax:2,first:'Lucas',last:'Dubois',phone:'06 00 00 00 04',email:'lucas@example.com',note:'Sans gluten',status:'confirmed',created:'Exemple fictif'},
{id:'r5',date:addDays(seedDate,1),time:'20:00',service:'dinner',pax:2,first:'Emma',last:'Bernard',phone:'06 00 00 00 05',email:'emma@example.com',note:'Terrasse',status:'confirmed',created:'Exemple fictif'}
];
let reservations=load('lv-demo-reservations-v2',null);if(!reservations){reservations=seed;save('lv-demo-reservations-v2',reservations)}
let selectedAdminDate=todayISO(),calendarCursor=new Date(selectedAdminDate+'T12:00:00'),serviceFilter='all';

const bookingDialog=$('#booking-dialog'),content=$('#booking-content');
const two=n=>String(n).padStart(2,'0');
const asLocalISO=d=>d.getFullYear()+'-'+two(d.getMonth()+1)+'-'+two(d.getDate());
const weekdayNames=['Dim.','Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.'];
const dateLong=iso=>new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'}).format(new Date(iso+'T12:00:00'));
const dateShort=iso=>new Intl.DateTimeFormat('fr-FR',{weekday:'short',day:'numeric',month:'short'}).format(new Date(iso+'T12:00:00'));
const dateDiff=(a,b)=>Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000);
function dayOpen(iso){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(iso))return false;
 const date=new Date(iso+'T12:00:00');
 return iso>=todayISO()&&settings.weekdays.includes(date.getDay())&&dateDiff(todayISO(),iso)<=365;
}
function slotAvailable(date,service,time,pax){
 if(!dayOpen(date)||!time)return false;
 const at=new Date(date+'T'+time+':00').getTime();
 if(at<Date.now()+settings.notice*60000)return false;
 const taken=reservations.filter(r=>r.date===date&&r.service===service&&r.time===time&&r.status!=='cancelled').reduce((sum,r)=>sum+r.pax,0);
 const cap=Number(service==='lunch'?settings.lunchCap:settings.dinnerCap)||0;
 return taken+pax<=cap;
}
function dayAvailable(iso,pax=2){
 return dayOpen(iso)&&['lunch','dinner'].some(service=>(service==='lunch'?settings.lunchTimes:settings.dinnerTimes).some(time=>slotAvailable(iso,service,time,pax)));
}
function nextAvailable(after=todayISO(),pax=2){
 for(let i=0;i<120;i++){const d=addDays(after,i);if(dayAvailable(d,pax))return d}
 return after;
}
function firstTwoDates(){
 const a=nextAvailable(todayISO(),booking.pax),b=nextAvailable(addDays(a,1),booking.pax);
 return [a,b];
}
function describeQuickDate(iso){
 const diff=dateDiff(todayISO(),iso);
 return diff===0?"Aujourd'hui":diff===1?'Demain':diff===2?'Dans 2 jours':'Dans '+diff+' jours';
}
let booking={pax:2,date:null,service:null,time:null,expanded:'date',showCalendar:false,month:null,contact:false};
function resetBooking(){
 const date=nextAvailable(todayISO(),2);
 booking={pax:2,date,service:null,time:null,expanded:'date',showCalendar:false,month:new Date(date+'T12:00:00'),contact:false};
}
function go(view){
 document.body.classList.toggle('lv-demo-admin',view==='admin');
 $$('#lv-demo-app [data-go]').forEach(b=>b.classList.toggle('is-active',b.dataset.go===view));
 $$('#lv-demo-app .view').forEach(v=>{const active=v.id===view;v.hidden=!active;v.classList.toggle('is-active',active)});
 if(view==='admin'){renderAdmin();$('.booking-float',root).hidden=true}
 else $('.booking-float',root).hidden=false;
}
$$('#lv-demo-app [data-go]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();go(b.dataset.go)}));
function openBooking(){
 resetBooking();bookingDialog.classList.remove('is-contact');
 renderBooking();bookingDialog.showModal();
}
$$('#lv-demo-app [data-open-booking]').forEach(b=>b.addEventListener('click',openBooking));
// Use the exact restaurant page, while replacing every public restaurant booking trigger.
document.addEventListener('click',e=>{
 if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
 const a=e.target.closest('a[href],button[data-href]');
 if(!a||root.contains(a))return;
 const href=a.getAttribute('href')||a.dataset.href||'';
 let u;try{u=new URL(href,location.href)}catch{return}
 const path=u.pathname.replace(/\/$/,'');
 if(u.origin===location.origin&&(path==='/reserver'||u.searchParams.get('zc')==='open')){
  e.preventDefault();e.stopImmediatePropagation();openBooking();
 }
},true);
$('[data-close-booking]',root).onclick=()=>bookingDialog.close();
bookingDialog.addEventListener('close',()=>{bookingDialog.classList.remove('is-contact')});
function bookingSummary(){
 return '<div class="booking-intro"><p>Pas de disponibilité en ligne ?<br>Appelez-nous au <a href="'+PHONE_LINK+'">'+PHONE_DISPLAY+'</a>.</p><p class="greeting">À très bientôt !</p></div>';
}
function acc(label,num,value,opened,inner,section){
 return '<section class="demo-accordion '+(opened?'is-open':'')+'"><button type="button" class="demo-acc-title" data-expand="'+section+'" aria-expanded="'+(opened?'true':'false')+'"><span class="acc-index">'+num+'</span><span class="acc-value">'+label+(value?' <strong>'+value+'</strong>':'')+'</span><span class="chevron" aria-hidden="true"></span></button>'+(opened?'<div class="demo-acc-body">'+inner+'</div>':'')+'</section>';
}
function renderParty(){
 let h='<div class="demo-party-options">';
 for(let n=1;n<=Math.min(6,Math.max(1,settings.maxParty));n++)h+='<button type="button" class="demo-option '+(booking.pax===n?'is-selected':'')+'" data-pax="'+n+'">'+n+'</button>';
 h+='<button type="button" class="demo-option" data-pax="7">'+'7+'+'</button></div>';
 return h+'<div id="demo-big-party-slot"></div>';
}
function renderBookingCalendar(){
 const d=booking.month||new Date(booking.date+'T12:00:00'),year=d.getFullYear(),month=d.getMonth(),start=(new Date(year,month,1).getDay()+6)%7;
 const monthEnd=new Date(year,month+1,0).getDate();
 let cells='';for(let n=0;n<start;n++)cells+='<span></span>';
 for(let n=1;n<=monthEnd;n++){
  const iso=asLocalISO(new Date(year,month,n)),available=dayAvailable(iso,booking.pax);
  cells+='<button type="button" '+(available?'data-date-select="'+iso+'"':'disabled')+' class="'+(booking.date===iso?'is-selected':'')+'" aria-label="'+esc(dateLong(iso))+'">'+n+'</button>';
 }
 const canBack=new Date(year,month,1)>new Date(new Date().getFullYear(),new Date().getMonth(),1);
 const canForward=dateDiff(todayISO(),asLocalISO(new Date(year,month+1,1)))<365;
 return '<div class="demo-month-head"><button type="button" data-calendar-nav="-1" '+(!canBack?'disabled':'')+' aria-label="Mois précédent">‹</button><strong>'+esc(monthName(d))+'</strong><button type="button" data-calendar-nav="1" '+(!canForward?'disabled':'')+' aria-label="Mois suivant">›</button></div><div class="demo-calendar-week"><span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span></div><div class="demo-calendar-days">'+cells+'</div>';
}
function renderDates(){
 const twoDates=firstTwoDates();
 let h='<p class="demo-next-availability"><span>Prochaine disponibilité</span></p><div class="demo-date-tabs">';
 for(const d of twoDates)h+='<button type="button" data-date-select="'+d+'" class="demo-date-choice '+(booking.date===d?'is-selected':'')+'"><strong>'+esc(dateShort(d))+'</strong><small>'+esc(describeQuickDate(d))+'</small></button>';
 h+='<button type="button" data-other-date class="demo-date-choice '+(booking.showCalendar?'is-selected':'')+'"><strong>Autre</strong><small>Choisir une date</small></button></div>';
 if(booking.showCalendar)h+='<div class="demo-calendar-shell" id="booking-month-calendar">'+renderBookingCalendar()+'</div>';
 return h;
}
function renderTime(){
 return '<div class="demo-service-list">'+['lunch','dinner'].map(service=>{
  const isLunch=service==='lunch',open=booking.service===service;
  const times=isLunch?settings.lunchTimes:settings.dinnerTimes;
  const slots=times.map(t=>({time:t,available:slotAvailable(booking.date,service,t,booking.pax)}));
  const h='<section class="demo-service-row"><button type="button" class="demo-service-toggle" data-service-toggle="'+service+'" aria-expanded="'+(open?'true':'false')+'"><span>'+(isLunch?'Déjeuner':'Dîner')+'<small>'+(open?'Sélectionnez votre heure':'Voir les horaires disponibles')+'</small></span><span class="chevron" style="transform:rotate('+(open?'225':'45')+'deg)"></span></button>';
  if(!open)return h+'</section>';
  return h+'<div class="demo-service-times">'+(slots.some(x=>x.available)?slots.map(x=>'<button type="button" class="demo-time-choice '+(booking.time===x.time?'is-selected':'')+'" data-time-select="'+x.time+'" '+(!x.available?'disabled':'')+'><span class="slot-dot"></span>'+esc(x.time)+(booking.time===x.time?' · sélectionné':'')+'</button>').join(''):'<div class="demo-big-party">Aucun créneau disponible pour ce service. Essayez une autre date.</div>')+'</div></section>';
 }).join('')+'</div>';
}
function renderBooking(){
 bookingDialog.classList.remove('is-contact');
 const guest=acc('Couverts','01',booking.pax+' couvert'+(booking.pax>1?'s':''),booking.expanded==='pax',renderParty(),'pax');
 const date=acc('Date','02',booking.date?esc(dateShort(booking.date)):'Choisir',booking.expanded==='date',renderDates(),'date');
 const time=acc('Horaire','03',booking.time?esc(booking.time):'',booking.expanded==='time',renderTime(),'time');
 content.innerHTML='<div class="booking-main">'+bookingSummary()+guest+date+time+'</div><div class="demo-book-footer"><button type="button" data-confirm-time '+(!booking.time?'disabled':'')+'>Réserver</button><div class="demo-demo-label">Démonstration : aucune réservation réelle transmise</div></div>';
 $$('[data-expand]',content).forEach(b=>b.onclick=()=>{booking.expanded=b.dataset.expand;renderBooking()});
 $$('[data-pax]',content).forEach(b=>b.onclick=()=>{
  const n=Number(b.dataset.pax);
  if(n>Math.min(6,Math.max(1,settings.maxParty))){$('#demo-big-party-slot',content).innerHTML='<div class="demo-big-party">'+esc(settings.largeMessage)+'<a href="'+PHONE_LINK+'">'+PHONE_DISPLAY+'</a></div>';return}
  booking.pax=n;booking.time=null;booking.service=null;
  if(!dayAvailable(booking.date,n))booking.date=nextAvailable(todayISO(),n);
  booking.month=new Date(booking.date+'T12:00:00');booking.expanded='date';booking.showCalendar=false;renderBooking();
 });
 $('[data-other-date]',content)?.addEventListener('click',()=>{booking.showCalendar=!booking.showCalendar;booking.month=new Date(booking.date+'T12:00:00');renderBooking();if(booking.showCalendar){const calendar=$('.demo-month-head',content);calendar?.scrollIntoView({block:'nearest',behavior:'smooth'})}});
 $('[data-calendar-nav]',content).forEach(b=>b.onclick=()=>{booking.month=new Date(booking.month.getFullYear(),booking.month.getMonth()+Number(b.dataset.calendarNav),1);renderBooking();$('#booking-month-calendar',content)?.scrollIntoView({block:'nearest',behavior:'instant'})});
 $$('[data-date-select]',content).forEach(b=>b.onclick=()=>{booking.date=b.dataset.dateSelect;booking.month=new Date(booking.date+'T12:00:00');booking.expanded='time';booking.showCalendar=false;booking.service=null;booking.time=null;renderBooking()});
 $$('[data-service-toggle]',content).forEach(b=>b.onclick=()=>{const service=b.dataset.serviceToggle;booking.service=booking.service===service?null:service;booking.time=null;renderBooking()});
 $$('[data-time-select]',content).forEach(b=>b.onclick=()=>{booking.time=b.dataset.timeSelect;renderBooking()});
 $('[data-confirm-time]',content).onclick=()=>{if(booking.time)renderContact()};
}
function renderContact(){
 bookingDialog.classList.add('is-contact');
 content.innerHTML='<div class="demo-contact-layout"><div class="demo-contact-left"><button type="button" class="demo-contact-back" data-back-to-booking>‹ Modifier ma réservation</button><h2 class="demo-contact-title">Vos coordonnées</h2><p class="demo-contact-sub">Quelques informations suffisent pour finaliser votre demande. Pour la démonstration, utilisez des coordonnées fictives.</p><form id="demo-contact-form"><div class="demo-contact-grid"><label>Prénom *<input name="first" autocomplete="off" maxlength="70" required placeholder="Votre prénom"></label><label>Nom *<input name="last" autocomplete="off" maxlength="70" required placeholder="Votre nom"></label><label>Téléphone *<input name="phone" type="tel" maxlength="30" required placeholder="+33 6…"></label><label>Email *<input name="email" type="email" maxlength="150" required placeholder="vous@exemple.fr"></label><label class="is-wide">Informations utiles (facultatif)<textarea name="note" rows="3" maxlength="500" placeholder="Allergie, anniversaire, poussette, demande particulière…"></textarea></label></div><label class="demo-consent"><input name="consent" type="checkbox" required><span>J’accepte l’utilisation de ces informations pour cette réservation de démonstration. Aucune demande n’est envoyée au restaurant.</span></label><button type="submit" class="demo-submit">Confirmer cette réservation</button><p class="demo-validation" id="demo-contact-error" aria-live="polite"></p></form></div><aside class="demo-contact-summary"><h3>Votre réservation</h3><p><span>Date</span><strong>'+esc(dateLong(booking.date))+'</strong></p><p><span>Service</span><strong>'+(booking.service==='lunch'?'Déjeuner':'Dîner')+'</strong></p><p><span>Horaire</span><strong>'+esc(booking.time)+'</strong></p><p><span>Personnes</span><strong>'+booking.pax+'</strong></p><address>Le Village · 4 place du Château<br>06800 Cagnes-sur-Mer</address></aside></div>';
 $('[data-back-to-booking]',content).onclick=renderBooking;
 $('#demo-contact-form',content).addEventListener('submit',e=>{e.preventDefault();confirmBooking(new FormData(e.currentTarget))});
}
function confirmBooking(form){
 if(!slotAvailable(booking.date,booking.service,booking.time,booking.pax)){
  $('#demo-contact-error',content).textContent='Ce créneau n’est plus disponible dans la démo. Merci d’en choisir un autre.';return;
 }
 const first=String(form.get('first')||'').trim(),last=String(form.get('last')||'').trim(),phone=String(form.get('phone')||'').trim(),email=String(form.get('email')||'').trim(),note=String(form.get('note')||'').trim();
 if(!first||!last||!phone||!email||!form.has('consent'))return;
 const r={id:'r'+Date.now(),date:booking.date,time:booking.time,service:booking.service,pax:booking.pax,first,last,phone,email,note,status:'confirmed',created:'Module démo'};
 reservations.push(r);save('lv-demo-reservations-v2',reservations);
 if(document.body.classList.contains('lv-demo-admin'))renderAdmin();
 content.innerHTML='<div class="demo-success"><div class="success-symbol">✓</div><h2>Réservation enregistrée</h2><p>'+esc(first)+', votre démonstration de réservation est prête.</p><p><strong>'+esc(dateLong(booking.date))+' à '+esc(booking.time)+'</strong> · '+booking.pax+' couvert'+(booking.pax>1?'s':'')+'</p><p>Elle apparaît dans le back-office de ce navigateur uniquement. Aucun email ni SMS envoyé.</p><button type="button" class="demo-submit" data-demo-done>Terminer</button></div>';
 $('[data-demo-done]',content).onclick=()=>bookingDialog.close();
}
function renderAdmin(){
 $('#admin-date').value=selectedAdminDate;
 $('#admin-date-title').textContent=fmtDate(selectedAdminDate,true);
 renderCalendar();renderReservations();renderClients();renderSettings();
}
$('#admin-date').addEventListener('change',e=>{selectedAdminDate=e.target.value;calendarCursor=new Date(selectedAdminDate+'T12:00:00');renderAdmin()});
$$('[data-day-shift]').forEach(b=>b.addEventListener('click',()=>{
 selectedAdminDate=addDays(selectedAdminDate,Number(b.dataset.dayShift));
 calendarCursor=new Date(selectedAdminDate+'T12:00:00');renderAdmin();
}));
$('[data-admin-today]')?.addEventListener('click',()=>{
 selectedAdminDate=todayISO();calendarCursor=new Date(selectedAdminDate+'T12:00:00');renderAdmin();
});
$('#reservation-search')?.addEventListener('input',renderReservations);
$$('[data-admin-tab]').forEach(b=>b.onclick=()=>{$$('[data-admin-tab]').forEach(x=>x.classList.toggle('is-active',x===b));$$('.admin-tab').forEach(t=>{const yes=t.id==='admin-'+b.dataset.adminTab;t.hidden=!yes;t.classList.toggle('is-active',yes)});if(b.dataset.adminTab==='clients')renderClients();if(b.dataset.adminTab==='settings')renderSettings()});
$$('[data-service-filter]').forEach(b=>b.onclick=()=>{serviceFilter=b.dataset.serviceFilter;$$('[data-service-filter]').forEach(x=>x.classList.toggle('is-active',x===b));renderReservations()});
$$('[data-month]').forEach(b=>b.onclick=()=>{calendarCursor.setMonth(calendarCursor.getMonth()+Number(b.dataset.month));renderCalendar()});
$('[data-new-reservation]').onclick=openBooking;

function renderCalendar(){
 $('#month-title').textContent=monthName(calendarCursor);
 const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth(),first=new Date(y,m,1),last=new Date(y,m+1,0),start=(first.getDay()+6)%7;
 let cells='';for(let i=0;i<start;i++)cells+='<span class="calendar-empty" aria-hidden="true"></span>';
 for(let day=1;day<=last.getDate();day++){
  const iso=asLocalISO(new Date(y,m,day)),onDay=reservations.filter(r=>r.date===iso&&r.status!=='cancelled');
  const lunch=onDay.filter(r=>r.service==='lunch').reduce((sum,r)=>sum+r.pax,0),dinner=onDay.filter(r=>r.service==='dinner').reduce((sum,r)=>sum+r.pax,0);
  const covers=lunch+dinner,isToday=iso===todayISO();
  cells+='<button type="button" class="calendar-day '+(iso===selectedAdminDate?'is-selected ':'')+(covers?'has-booking ':'')+(isToday?'is-today':'')+'" data-admin-day="'+iso+'" aria-label="'+esc(dateLong(iso))+', '+covers+' couverts">'
  +'<span class="calendar-day-number">'+day+'</span>'
  +(covers?'<span class="calendar-covers">'+covers+' cv.</span>':'<span class="calendar-covers is-empty">—</span>')
  +'<span class="calendar-day-services"><i class="'+(lunch?'has-lunch':'')+'"></i><i class="'+(dinner?'has-dinner':'')+'"></i></span></button>';
 }
 $('#admin-calendar').innerHTML=cells;
 $$('[data-admin-day]').forEach(button=>button.onclick=()=>{
  selectedAdminDate=button.dataset.adminDay;
  $('#admin-date').value=selectedAdminDate;
  $('#admin-date-title').textContent=fmtDate(selectedAdminDate,true);
  renderCalendar();renderReservations();
  if(window.innerWidth<901)$('.reservations-panel')?.scrollIntoView({block:'start',behavior:'smooth'});
 });
}
function renderReservations(){
 const all=reservations.filter(r=>r.date===selectedAdminDate);
 const active=all.filter(r=>r.status!=='cancelled');
 const lunch=active.filter(r=>r.service==='lunch'),dinner=active.filter(r=>r.service==='dinner');
 const coverCount=items=>items.reduce((sum,r)=>sum+r.pax,0);
 $('#kpi-covers').textContent=coverCount(active);
 $('#kpi-bookings').textContent=active.length;
 $('#kpi-lunch').textContent=coverCount(lunch);
 $('#kpi-dinner').textContent=coverCount(dinner);
 const qs=($('#reservation-search')?.value||'').toLowerCase().trim();
 const filtered=all.filter(r=>(serviceFilter==='all'||r.service===serviceFilter)&&(!qs||[r.first,r.last,r.phone,r.email,r.time].join(' ').toLowerCase().includes(qs)));
 $$('[data-service-filter]').forEach(b=>{
  const service=b.dataset.serviceFilter;
  const count=service==='all'?active.length:active.filter(r=>r.service===service).length;
  b.textContent=(service==='all'?'Tous':service==='lunch'?'Déjeuner':'Dîner')+' ('+count+')';
 });
 const sumLabel=(name,items)=>'<div class="service-summary-item"><span>'+name+'</span><strong>'+coverCount(items)+' <small>couverts</small></strong><small>'+items.length+' réservation'+(items.length>1?'s':'')+'</small></div>';
 $('#service-summary').innerHTML=sumLabel('Déjeuner',lunch)+sumLabel('Dîner',dinner);
 const group=(service,name)=>{
  const data=filtered.filter(r=>r.service===service).sort((x,y)=>x.time.localeCompare(y.time));
  if(!data.length)return '';
  return '<div class="reservation-group"><div class="reservation-group-head"><span>'+name+'</span><small>'+coverCount(data.filter(r=>r.status!=='cancelled'))+' couverts</small></div>'
  +data.map(r=>'<button type="button" class="reservation-card '+(r.status==='cancelled'?'is-cancelled':'')+'" data-res-id="'+esc(r.id)+'">'
   +'<div class="time">'+esc(r.time)+'</div><div class="reservation-guest"><strong>'+esc(r.last.toUpperCase())+' '+esc(r.first)+'</strong><small>'+(r.status==='cancelled'?'Annulée':r.note?'Note : '+esc(r.note):'Confirmée')+'</small></div>'
   +'<span class="pax-badge">'+r.pax+' <small>pers.</small></span></button>').join('')+'</div>';
 };
 $('#reservation-list').innerHTML=filtered.length?group('lunch','Déjeuner')+group('dinner','Dîner'):'<div class="empty-state"><strong>Aucune réservation</strong><p>Pas de réservation pour cette sélection.</p><button type="button" class="secondary" data-new-reservation-empty>Ajouter une réservation</button></div>';
 $$('[data-res-id]').forEach(el=>el.onclick=()=>openDetail(el.dataset.resId));
 $('[data-new-reservation-empty]')?.addEventListener('click',openBooking);
}
function openDetail(id){
 const r=reservations.find(x=>x.id===id);if(!r)return;
 const prev=reservations.filter(x=>x.email===r.email||x.phone===r.phone);
 const confirmed=prev.filter(x=>x.status!=='cancelled').length,cancelled=prev.filter(x=>x.status==='cancelled').length;
 $('#detail-content').innerHTML='<div class="demo-detail"><header class="demo-detail-top"><div><small>'+(r.status==='cancelled'?'ANNULÉE':'CONFIRMÉE')+'</small><h2>'+esc(r.first)+' '+esc(r.last)+'</h2></div><button type="button" data-close-detail aria-label="Fermer">×</button></header><nav class="demo-detail-tabs"><button class="is-active" type="button" data-detail-tab="reservation">Réservation</button><button type="button" data-detail-tab="client">Client</button></nav><section class="demo-detail-body" id="detail-reservation"><div class="demo-detail-facts"><div><label>Date</label><strong>'+esc(fmtDate(r.date,true))+'</strong></div><div><label>Horaire</label><strong>'+esc(r.time)+'</strong></div><div><label>Nombre de couverts</label><strong>'+r.pax+'</strong></div><div><label>Service</label><strong>'+(r.service==='lunch'?'Déjeuner':'Dîner')+'</strong></div></div><div class="demo-detail-section"><h3>Note de réservation</h3><p>'+(r.note?esc(r.note):'Aucune demande particulière')+'</p></div><div class="demo-detail-section"><h3>Statut</h3><p>'+(r.status==='cancelled'?'Réservation annulée':'Réservation confirmée')+'</p><button type="button" class="demo-status-button" data-toggle-status>'+(r.status==='cancelled'?'Réactiver cette réservation':'Annuler cette réservation')+'</button></div></section><section class="demo-detail-body" id="detail-client" hidden><div class="demo-client-stats"><div><small>Réservations</small><strong>'+confirmed+'</strong></div><div><small>Annulées</small><strong>'+cancelled+'</strong></div><div><small>No-show</small><strong>0</strong></div></div><div class="demo-detail-section"><h3>Informations client</h3><p><strong>'+esc(r.first)+' '+esc(r.last)+'</strong></p><p>Téléphone : <a href="tel:'+esc(r.phone.replace(/\s/g,''))+'">'+esc(r.phone)+'</a></p><p>Email : <a href="mailto:'+esc(r.email)+'">'+esc(r.email)+'</a></p></div><div class="demo-detail-section"><h3>Historique</h3><p>'+prev.length+' réservation'+(prev.length>1?'s':'')+' enregistrée'+(prev.length>1?'s':'')+' dans cette démonstration.</p></div></section></div>';
 $('#detail-dialog').showModal();
 $('[data-close-detail]').onclick=()=>$('#detail-dialog').close();
 $$('[data-detail-tab]').forEach(button=>button.onclick=()=>{
  $$('[data-detail-tab]').forEach(b=>b.classList.toggle('is-active',b===button));
  $('#detail-reservation').hidden=button.dataset.detailTab!=='reservation';
  $('#detail-client').hidden=button.dataset.detailTab!=='client';
 });
 $('[data-toggle-status]').onclick=()=>{
  r.status=r.status==='cancelled'?'confirmed':'cancelled';save('lv-demo-reservations-v2',reservations);
  $('#detail-dialog').close();renderReservations();renderClients();renderCalendar();
 };
}
function renderClients(){
 const q=($('#client-search')?.value||'').toLowerCase(),map=new Map();
 reservations.forEach(r=>{const key=r.email||r.phone;if(!map.has(key))map.set(key,{...r,count:0,covers:0});const c=map.get(key);c.count++;c.covers+=r.pax});
 const list=[...map.values()].filter(c=>(c.first+' '+c.last+' '+c.email+' '+c.phone).toLowerCase().includes(q));
 $('#client-list').innerHTML=list.map(c=>'<article class="client-row"><div><strong>'+esc(c.first)+' '+esc(c.last)+'</strong><small>'+esc(c.email)+'</small></div><div>'+esc(c.phone)+'</div><div>'+c.count+' résa · '+c.covers+' couverts</div><button data-client-detail="'+c.id+'">Voir</button></article>').join('');
 $$('[data-client-detail]').forEach(b=>b.onclick=()=>openDetail(b.dataset.clientDetail));
}
$('#client-search')?.addEventListener('input',renderClients);
function renderSettings(){
 $('#set-max-party').value=settings.maxParty;$('#set-notice').value=String(settings.notice);$('#set-large-message').value=settings.largeMessage;$('#set-lunch-times').value=settings.lunchTimes.join(', ');$('#set-dinner-times').value=settings.dinnerTimes.join(', ');$('#set-lunch-cap').value=settings.lunchCap;$('#set-dinner-cap').value=settings.dinnerCap;
 const names=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];$('#weekday-settings').innerHTML=names.map((n,i)=>'<label><input type="checkbox" value="'+i+'" '+(settings.weekdays.includes(i)?'checked':'')+'> '+n+'</label>').join('');
}
$('#save-settings').onclick=()=>{settings={...settings,maxParty:Math.min(6,Math.max(1,Number($('#set-max-party').value)||6)),notice:Number($('#set-notice').value)||0,largeMessage:$('#set-large-message').value.trim()||defaults.largeMessage,lunchTimes:$('#set-lunch-times').value.split(',').map(s=>s.trim()).filter(Boolean),dinnerTimes:$('#set-dinner-times').value.split(',').map(s=>s.trim()).filter(Boolean),lunchCap:Number($('#set-lunch-cap').value)||24,dinnerCap:Number($('#set-dinner-cap').value)||30,weekdays:$$('#weekday-settings input:checked').map(i=>Number(i.value))};save('lv-demo-settings',settings);alert('Paramètres enregistrés pour la démonstration.')};
go('showcase');
})();