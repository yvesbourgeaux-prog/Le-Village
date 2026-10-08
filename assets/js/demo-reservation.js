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
{id:'r1',date:seedDate,time:'12:30',service:'lunch',pax:2,first:'Claire',last:'Martin',phone:'06 12 34 56 78',email:'claire.martin@example.com',note:'Table au calme si possible',status:'confirmed',created:'Démo'},
{id:'r2',date:seedDate,time:'13:30',service:'lunch',pax:4,first:'Julien',last:'Rossi',phone:'06 44 20 31 09',email:'julien.rossi@example.com',note:'Anniversaire',status:'confirmed',created:'Démo'},
{id:'r3',date:seedDate,time:'19:00',service:'dinner',pax:5,first:'Alexander',last:'Tandberg',phone:'+46 76 186 14 86',email:'tandberg.a@gmail.com',note:'',status:'confirmed',created:'Démo'},
{id:'r4',date:seedDate,time:'19:30',service:'dinner',pax:2,first:'Christelle',last:'Gerussi',phone:'06 10 20 30 40',email:'christelle.g@example.com',note:'Sans gluten',status:'confirmed',created:'Démo'},
{id:'r5',date:addDays(seedDate,1),time:'20:00',service:'dinner',pax:2,first:'Emma',last:'Bernard',phone:'06 55 61 10 22',email:'emma@example.com',note:'Terrasse',status:'confirmed',created:'Démo'}
];
let reservations=load('lv-demo-reservations',null);if(!reservations){reservations=seed;save('lv-demo-reservations',reservations)}
let selectedAdminDate=todayISO(),calendarCursor=new Date(selectedAdminDate+'T12:00:00'),serviceFilter='all';
let booking={step:1,pax:null,date:null,service:null,time:null,contact:{}};
const bookingDialog=$('#booking-dialog'),content=$('#booking-content'),progress=$('#booking-progress');

function go(view){$$('[data-go]').forEach(b=>b.classList.toggle('is-active',b.dataset.go===view));$$('.view').forEach(v=>{const active=v.id===view;v.hidden=!active;v.classList.toggle('is-active',active)});if(view==='admin'){renderAdmin();$('.booking-float').hidden=true}else $('.booking-float').hidden=false}
$$('[data-go]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();go(b.dataset.go)}));

function openBooking(){booking={step:1,pax:null,date:null,service:null,time:null,contact:{}};renderBooking();bookingDialog.showModal()}
$$('[data-open-booking]').forEach(b=>b.addEventListener('click',openBooking));
bookingDialog.addEventListener('close',()=>{});
function summary(){
 const items=[];
 if(booking.pax)items.push('<button data-edit="1">🍴 '+booking.pax+' couvert'+(booking.pax>1?'s':'')+'</button>');
 if(booking.date)items.push('<button data-edit="2">📅 '+esc(fmtDate(booking.date))+'</button>');
 if(booking.service)items.push('<button data-edit="3">'+(booking.service==='lunch'?'☀️ Déjeuner':'🌙 Dîner')+'</button>');
 if(booking.time)items.push('<button data-edit="4">◷ '+esc(booking.time)+'</button>');
 return items.length?'<div class="summary-strip">'+items.join('')+'</div>':'';
}
function renderBooking(){
 progress.style.setProperty('--progress',(booking.step/5*100)+'%');
 let html='<section class="book-step">'+summary();
 if(booking.step===1){
  html+='<h2>Combien serez-vous ?</h2><p class="lead">Choisissez le nombre de personnes.</p><div class="party-grid">';
  for(let i=1;i<=settings.maxParty;i++)html+='<button type="button" data-pax="'+i+'" class="'+(booking.pax===i?'is-active':'')+'">'+i+'</button>';
  html+='<button type="button" data-pax="7+">7+</button></div><div id="large-party-slot"></div>';
 } else if(booking.step===2){
  html+='<h2>Quelle date vous convient ?</h2><p class="lead">Choisissez une date disponible.</p>'+quickDates()+calendarMarkup();
 } else if(booking.step===3){
  html+='<h2>Quel service ?</h2><p class="lead">Choisissez d’abord le déjeuner ou le dîner.</p><div class="service-list"><button type="button" class="service-card" data-service="lunch"><div><strong>Déjeuner</strong><span>'+settings.lunchTimes[0]+' — '+settings.lunchTimes.at(-1)+'</span></div><b>→</b></button><button type="button" class="service-card" data-service="dinner"><div><strong>Dîner</strong><span>'+settings.dinnerTimes[0]+' — '+settings.dinnerTimes.at(-1)+'</span></div><b>→</b></button></div>';
 } else if(booking.step===4){
  const times=booking.service==='lunch'?settings.lunchTimes:settings.dinnerTimes;
  html+='<h2>Choisissez votre horaire</h2><p class="lead">'+(booking.service==='lunch'?'Déjeuner':'Dîner')+' · '+esc(fmtDate(booking.date,true))+'</p><div class="times-grid">'+times.map(t=>'<button type="button" class="time-button '+(booking.time===t?'is-active':'')+'" data-time="'+esc(t)+'">'+esc(t)+'</button>').join('')+'</div>';
 } else {
  html+='<h2>Vos coordonnées</h2><p class="lead">Plus rapide et plus lisible : uniquement les informations utiles à votre réservation.</p><div class="contact-grid"><label>Prénom<input id="book-first" autocomplete="given-name" required></label><label>Nom<input id="book-last" autocomplete="family-name" required></label><label>Téléphone<input id="book-phone" type="tel" autocomplete="tel" required></label><label>Email<input id="book-email" type="email" autocomplete="email" required></label><label class="full">Une demande particulière ? <span style="font-weight:400">(facultatif)</span><textarea id="book-note" rows="3" placeholder="Allergie, poussette, occasion particulière…"></textarea></label></div><label class="consent"><input id="book-consent" type="checkbox" required> <span>J’accepte que mes informations soient utilisées pour gérer cette réservation.</span></label><div class="booking-actions"><button type="button" class="secondary" data-back>Retour</button><button type="button" class="primary" data-confirm>Confirmer la réservation</button></div>';
 }
 html+='</section>';content.innerHTML=html;
 $$('[data-edit]',content).forEach(b=>b.onclick=()=>{booking.step=Number(b.dataset.edit);if(booking.step<=4)booking.time=null;if(booking.step<=3)booking.service=null;if(booking.step<=2)booking.date=null;renderBooking()});
 $$('[data-pax]',content).forEach(b=>b.onclick=()=>{if(b.dataset.pax==='7+'){const slot=$('#large-party-slot',content);slot.innerHTML='<div class="large-party">'+esc(settings.largeMessage)+'<br><a href="'+PHONE_LINK+'">📞 '+PHONE_DISPLAY+'</a></div>';return}booking.pax=Number(b.dataset.pax);booking.step=2;renderBooking()});
 $$('[data-date]',content).forEach(b=>b.onclick=()=>{booking.date=b.dataset.date;booking.step=3;renderBooking()});
 $$('[data-service]',content).forEach(b=>b.onclick=()=>{booking.service=b.dataset.service;booking.step=4;renderBooking()});
 $$('[data-time]',content).forEach(b=>b.onclick=()=>{booking.time=b.dataset.time;booking.step=5;renderBooking()});
 $('[data-back]',content)?.addEventListener('click',()=>{booking.step=4;renderBooking()});
 $('[data-confirm]',content)?.addEventListener('click',confirmBooking);
}
function quickDates(){return '<div class="quick-dates">'+[0,1,2].map(n=>{const d=addDays(todayISO(),n);return '<button type="button" class="date-option" data-date="'+d+'"><small>'+(n===0?"Aujourd’hui":n===1?'Demain':'Après-demain')+'</small><br>'+esc(fmtDate(d))+'</button>'}).join('')+'</div>'}
function calendarMarkup(){
 const base=new Date((booking.date||todayISO())+'T12:00:00'),y=base.getFullYear(),m=base.getMonth(),first=new Date(y,m,1),last=new Date(y,m+1,0),start=(first.getDay()+6)%7;
 let cells='';for(let i=0;i<start;i++)cells+='<span></span>';
 for(let day=1;day<=last.getDate();day++){const d=new Date(y,m,day),iso=d.toISOString().slice(0,10),open=settings.weekdays.includes(d.getDay())&&iso>=todayISO();cells+='<button type="button" '+(open?'data-date="'+iso+'"':'disabled')+' class="'+(open?'available ':'')+(booking.date===iso?'is-active':'')+'">'+day+'</button>'}
 return '<div class="calendar-box"><div class="calendar-head"><button type="button" disabled>‹</button><strong>'+esc(monthName(base))+'</strong><button type="button" disabled>›</button></div><div class="mini-week"><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span></div><div class="mini-cal">'+cells+'</div></div>';
}
function confirmBooking(){
 const first=$('#book-first').value.trim(),last=$('#book-last').value.trim(),phone=$('#book-phone').value.trim(),email=$('#book-email').value.trim(),note=$('#book-note').value.trim(),consent=$('#book-consent').checked;
 if(!first||!last||!phone||!email||!consent){alert('Merci de compléter les champs obligatoires.');return}
 const r={id:'r'+Date.now(),date:booking.date,time:booking.time,service:booking.service,pax:booking.pax,first,last,phone,email,note,status:'confirmed',created:'Module démo'};
 reservations.push(r);save('lv-demo-reservations',reservations);
 progress.style.setProperty('--progress','100%');
 content.innerHTML='<div class="success-card"><div class="success-icon">✓</div><h2>Table réservée</h2><p><strong>'+esc(first)+', votre réservation est bien enregistrée.</strong></p><p>'+esc(fmtDate(booking.date,true))+' à '+esc(booking.time)+' · '+booking.pax+' couvert'+(booking.pax>1?'s':'')+'</p><p>Une confirmation peut être envoyée automatiquement par email ou SMS dans la future version.</p><button class="primary" type="button" data-close-success>Terminer</button></div>';
 $('[data-close-success]',content).onclick=()=>bookingDialog.close();
}

function renderAdmin(){
 $('#admin-date').value=selectedAdminDate;
 $('#admin-date-title').textContent=fmtDate(selectedAdminDate,true);
 renderCalendar();renderReservations();renderClients();renderSettings();
}
$('#admin-date').addEventListener('change',e=>{selectedAdminDate=e.target.value;calendarCursor=new Date(selectedAdminDate+'T12:00:00');renderAdmin()});
$$('[data-admin-tab]').forEach(b=>b.onclick=()=>{$$('[data-admin-tab]').forEach(x=>x.classList.toggle('is-active',x===b));$$('.admin-tab').forEach(t=>{const yes=t.id==='admin-'+b.dataset.adminTab;t.hidden=!yes;t.classList.toggle('is-active',yes)});if(b.dataset.adminTab==='clients')renderClients();if(b.dataset.adminTab==='settings')renderSettings()});
$$('[data-service-filter]').forEach(b=>b.onclick=()=>{serviceFilter=b.dataset.serviceFilter;$$('[data-service-filter]').forEach(x=>x.classList.toggle('is-active',x===b));renderReservations()});
$$('[data-month]').forEach(b=>b.onclick=()=>{calendarCursor.setMonth(calendarCursor.getMonth()+Number(b.dataset.month));renderCalendar()});
$('[data-new-reservation]').onclick=openBooking;

function renderCalendar(){
 $('#month-title').textContent=monthName(calendarCursor);
 const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth(),first=new Date(y,m,1),last=new Date(y,m+1,0),start=(first.getDay()+6)%7;
 let h='';for(let i=0;i<start;i++)h+='<span></span>';
 for(let d=1;d<=last.getDate();d++){const dt=new Date(y,m,d),iso=dt.toISOString().slice(0,10),has=reservations.some(r=>r.date===iso);h+='<button class="'+(iso===selectedAdminDate?'is-selected ':'')+(has?'has-booking':'')+'" data-admin-day="'+iso+'">'+d+'</button>'}
 $('#admin-calendar').innerHTML=h;
 $$('[data-admin-day]').forEach(b=>b.onclick=()=>{selectedAdminDate=b.dataset.adminDay;$('#admin-date').value=selectedAdminDate;$('#admin-date-title').textContent=fmtDate(selectedAdminDate,true);renderCalendar();renderReservations()});
}
function renderReservations(){
 const all=reservations.filter(r=>r.date===selectedAdminDate),list=all.filter(r=>serviceFilter==='all'||r.service===serviceFilter);
 $('#kpi-covers').textContent=all.reduce((s,r)=>s+r.pax,0);$('#kpi-bookings').textContent=all.length;$('#kpi-lunch').textContent=all.filter(r=>r.service==='lunch').reduce((s,r)=>s+r.pax,0);$('#kpi-dinner').textContent=all.filter(r=>r.service==='dinner').reduce((s,r)=>s+r.pax,0);
 $('#reservation-list').innerHTML=list.length?list.sort((a,b)=>a.time.localeCompare(b.time)).map(r=>'<article class="reservation-card" data-res-id="'+r.id+'"><div class="time">'+esc(r.time)+'</div><div><strong>'+esc(r.last.toUpperCase())+' '+esc(r.first)+'</strong><small>'+(r.note?'💬 '+esc(r.note):r.service==='lunch'?'Déjeuner':'Dîner')+'</small></div><span class="pax-badge">🍴 '+r.pax+'</span></article>').join(''):'<div class="empty-state">Aucune réservation sur ce service.</div>';
 $$('[data-res-id]').forEach(el=>el.onclick=()=>openDetail(el.dataset.resId));
}
function openDetail(id){
 const r=reservations.find(x=>x.id===id);if(!r)return;
 const prev=reservations.filter(x=>x.email===r.email||x.phone===r.phone);
 $('#detail-content').innerHTML='<div class="detail-wrap"><div class="detail-head"><div><p class="eyebrow">Réservation confirmée</p><h2>'+esc(r.first)+' '+esc(r.last)+'</h2></div><button data-close-detail>×</button></div><div class="detail-meta"><div><span>Date</span><strong>'+esc(fmtDate(r.date))+'</strong></div><div><span>Horaire</span><strong>'+esc(r.time)+'</strong></div><div><span>Couverts</span><strong>'+r.pax+'</strong></div></div><div class="detail-section"><h3>Coordonnées</h3><p>📞 <a href="tel:'+esc(r.phone.replace(/\s/g,''))+'">'+esc(r.phone)+'</a><br>✉️ <a href="mailto:'+esc(r.email)+'">'+esc(r.email)+'</a></p></div><div class="detail-section"><h3>Note de réservation</h3><p>'+(r.note?esc(r.note):'Aucune note')+'</p></div><div class="detail-section"><h3>Historique client</h3><p><strong>'+prev.length+'</strong> réservation'+(prev.length>1?'s':'')+' dans cette démonstration.</p></div></div>';
 $('#detail-dialog').showModal();$('[data-close-detail]').onclick=()=>$('#detail-dialog').close();
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
$('#save-settings').onclick=()=>{settings={...settings,maxParty:Number($('#set-max-party').value)||6,notice:Number($('#set-notice').value)||0,largeMessage:$('#set-large-message').value.trim()||defaults.largeMessage,lunchTimes:$('#set-lunch-times').value.split(',').map(s=>s.trim()).filter(Boolean),dinnerTimes:$('#set-dinner-times').value.split(',').map(s=>s.trim()).filter(Boolean),lunchCap:Number($('#set-lunch-cap').value)||24,dinnerCap:Number($('#set-dinner-cap').value)||30,weekdays:$$('#weekday-settings input:checked').map(i=>Number(i.value))};save('lv-demo-settings',settings);alert('Paramètres enregistrés pour la démonstration.')};
go('showcase');
})();