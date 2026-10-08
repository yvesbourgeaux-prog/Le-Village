(()=>{
'use strict';
const app=document.getElementById('lv-demo-app'),api=window.lvDemoBO;
if(!app||!api)return;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const load=(k,defaultValue)=>{try{return JSON.parse(localStorage.getItem('lv-extra-'+k))??defaultValue}catch{return defaultValue}};
const save=(k,v)=>{try{localStorage.setItem('lv-extra-'+k,JSON.stringify(v))}catch{}};
const id=()=>String(Date.now())+Math.random().toString(36).slice(2,6);
const names=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const today=()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)};
const formVals=form=>Object.fromEntries(new FormData(form));
let week=load('week',names.map((name,i)=>({lunch:{on:true,restaurantOpen:true,start:'12:00',end:'14:30',interval:30,capacity:24},dinner:{on:true,restaurantOpen:true,start:'19:00',end:'21:00',interval:30,capacity:30}})));
if(!Array.isArray(week)||week.length!==7)week=names.map(()=>({lunch:{on:true,start:'12:00',end:'14:30',interval:30,capacity:24},dinner:{on:true,start:'19:00',end:'21:00',interval:30,capacity:30}}));
let closures=load('closures',[]),specials=load('specials',[]),additionalClients=load('clients',[]),users=load('users',[{id:'manager',name:'Responsable Le Village',email:'responsable@example.com',role:'Gérant'}]),prefs=load('prefs',{sender:'Le Village',reply:'demo@example.com',smsFrom:'09:00',smsUntil:'20:00'});
const eventOn=(rule,date)=>{
 if(rule.repeat==='once')return rule.date===date;
 const d=new Date(date+'T12:00:00'),r=new Date(rule.date+'T12:00:00');
 if(rule.repeat==='weekly')return d.getDay()===Number(rule.weekday);
 if(rule.repeat==='monthly'){
  if(!rule.ordinal)return d.getDate()===r.getDate();
  if(d.getDay()!==Number(rule.weekday))return false;
  const ordinal=Number(rule.ordinal),max=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
  return ordinal===-1?d.getDate()+7>max:Math.ceil(d.getDate()/7)===ordinal;
 }
 return rule.repeat==='yearly'&&d.getDate()===r.getDate()&&d.getMonth()===r.getMonth();
};
const closed=date=>closures.some(c=>c.block&&c.start<=date&&date<=c.end);
function config(date,service){if(closed(date))return {on:false,capacity:0};const custom=specials.find(e=>e.service===service&&eventOn(e,date));return custom?{...custom,on:true,capacity:Number(custom.capacity)}:(()=>{const r=week[new Date(date+'T12:00:00').getDay()][service];return {...r,on:r.on!==false&&r.restaurantOpen!==false}})()}
const serviceTimes=(date,service)=>{
 if(!date)return[];
 const c=config(date,service);if(!c.on||!c.start||!c.end)return[];
 const toMin=t=>Number(t.slice(0,2))*60+Number(t.slice(3,5));
 const st=toMin(c.start),en=toMin(c.end),step=Math.max(15,Number(c.interval)||30);if(st>en)return[];
 const a=[];for(let t=st;t<=en&&a.length<48;t+=step)a.push(String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0'));return a;
};
window.lvDemoSchedule={getTimes:serviceTimes,getCapacity:(date,svc)=>Math.max(0,Number(config(date,svc).capacity)||0),isDayOpen:date=>!closed(date)&&['lunch','dinner'].some(s=>serviceTimes(date,s).length)};
function allClients(){
 const map=new Map();
 api.getReservations().forEach(r=>{const key=(r.email||r.phone||r.first+r.last).toLowerCase();if(!map.has(key))map.set(key,{id:'r'+r.id,first:r.first,last:r.last,email:r.email,phone:r.phone,visits:0,last:r.date,consentEmail:false,consentSms:false,tags:''});const c=map.get(key);if(r.status!=='cancelled')c.visits++;if(r.date>c.last)c.last=r.date});
 additionalClients.forEach(c=>{const key=(c.email||c.phone||c.first+c.last).toLowerCase();map.set(key,{...map.get(key),...c})});return Array.from(map.values());
}
function notify(msg){let n=$('#lv-extra-message');if(!n){n=document.createElement('div');n.id='lv-extra-message';document.body.append(n)}n.textContent=msg;n.classList.add('show');setTimeout(()=>n.classList.remove('show'),3200)}
const pages=[
 ['planning','Réservations'],
 ['schedule','Horaires & disponibilités'],
 ['clients','Clients'],
 ['communication','Communication'],
 ['settings','Réglages']
];
const nav=$('.admin-nav',app),main=$('.admin-main',app);
if(!nav||!main)return;
let active='planning';
nav.innerHTML='<div class="admin-logo"><span>LV</span><div><b>Le Village</b><small>Votre espace de gestion</small></div></div><p class="lv-welcome">Bienvenue au Village</p><div class="lv-extra-menu">'
 +pages.map((p,i)=>'<div class="lv-menu-entry"><button type="button" class="lv-menu-btn '+(i===0?'is-active':'')+'" data-lv-nav="'+p[0]+'"><span class="lv-main-nav-number">0'+(i+1)+'</span>'+p[1]+'</button></div>').join('')
 +'</div><div class="lv-extra-nav-bottom"><button type="button" id="lv-return-site">Voir le site démo</button><a href="/demo-reservation?logout=1">Déconnexion</a></div>';
const panel=(id,html)=>main.insertAdjacentHTML('beforeend','<section class="admin-tab lv-extra-screen" hidden id="admin-'+id+'">'+html+'</section>');
panel('schedule','<div class="lv-screen-head"><div><span>ORGANISATION</span><h1>Jours & horaires</h1><p>Gérez vos services, jours spéciaux et fermetures.</p></div><button class="lv-action" id="lv-save-schedule">Enregistrer les horaires</button></div><div class="lv-week-list" id="lv-schedule-week"></div><div class="lv-duo"><article class="lv-paper"><h2>Jours spéciaux</h2><form class="lv-form" id="lv-special-form"><label>Nom du service<input name="name" required placeholder="Brunch du dimanche"></label><div class="lv-form-grid"><label>Répétition<select name="repeat"><option value="once">Date unique</option><option value="weekly">Chaque semaine</option><option value="monthly">Chaque mois</option><option value="yearly">Chaque année</option></select></label><label>Date de référence<input name="date" type="date" required></label><label>Jour hebdomadaire<select name="weekday">'+names.map((v,i)=>'<option value="'+i+'">'+v+'</option>').join('')+'</select></label><label>Service<select name="service"><option value="lunch">Déjeuner</option><option value="dinner">Dîner</option></select></label><label>Début<input name="start" type="time" value="12:00" required></label><label>Dernière arrivée<input name="end" type="time" value="14:30" required></label><label>Intervalle<select name="interval"><option value="15">15 min</option><option value="30" selected>30 min</option><option value="60">60 min</option></select></label><label>Couverts / créneau<input name="capacity" type="number" min="0" value="20" required></label></div><button class="lv-action" type="submit">Ajouter le service</button></form><div id="lv-special-list"></div></article><article class="lv-paper"><h2>Fermetures exceptionnelles</h2><form id="lv-closure-form" class="lv-form"><label>Motif<input name="name" placeholder="Congés annuels" required></label><div class="lv-form-grid"><label>Du<input name="start" type="date" required></label><label>Au<input name="end" type="date" required></label></div><label class="lv-check"><input type="checkbox" name="block" checked> Bloquer les réservations</label><button type="submit" class="lv-action">Ajouter la fermeture</button></form><div id="lv-closure-list"></div></article></div>');
panel('segments','<div class="lv-screen-head"><div><span>RELATION CLIENT</span><h1>Segments de clients</h1><p>Créez des groupes de contacts pour vos futures communications.</p></div></div><div class="lv-duo"><form class="lv-paper lv-form" id="lv-segment-form"><h2>Nouveau segment</h2><label>Nom du segment<input name="name" placeholder="Ex. Habitués du midi" required></label><label>Consentement<select name="consent"><option value="any">Peu importe</option><option value="email">E-mail accepté</option><option value="sms">SMS accepté</option></select></label><label>Fréquentation<select name="activity"><option value="all">Tous les clients</option><option value="visited">Déjà venu</option><option value="new">Aucune réservation</option></select></label><label>Tag client<input name="tag" placeholder="Ex. terrasse, VIP"></label><button class="lv-action" type="submit">Enregistrer le segment</button></form><article class="lv-paper"><h2>Segments enregistrés</h2><div id="lv-segment-list"></div></article></div>');
panel('email','<div class="lv-screen-head"><div><span>COMMUNICATION</span><h1>Campagnes e-mail</h1><p>Préparez, prévisualisez et simulez vos campagnes.</p></div></div><div class="lv-demo-notice">Aucun message réel ne sera envoyé dans cette démonstration.</div><div class="lv-duo"><form class="lv-paper lv-form" id="lv-email-form"><h2>Nouvel e-mail</h2><label>Nom interne<input name="name" required></label><label>Destinataires<select name="segment"><option value="all">Tous les contacts de la démo</option><option value="visited">Clients déjà venus</option><option value="email">Consentement e-mail</option></select></label><label>Objet<input name="subject" required maxlength="140"></label><label>Texte de prévisualisation<input name="preheader" maxlength="180"></label><label>Message<textarea name="body" required rows="10" placeholder="Bonjour {prénom}, ..."></textarea></label><label>Insérer un modèle<select id="lv-email-template"><option value="">Choisir un modèle</option></select></label><div id="lv-email-count"></div><div class="lv-button-row"><button type="button" data-comms="draft" class="lv-soft-button">Brouillon</button><button type="button" data-comms="test" class="lv-soft-button">Aperçu test</button><button type="button" data-comms="schedule" class="lv-soft-button">Programmer (simulation)</button><button type="button" data-comms="send" class="lv-action">Simuler l’envoi</button></div></form><div class="lv-stack"><article class="lv-paper"><h2>Aperçu</h2><div id="lv-email-preview" class="lv-preview">Rédigez votre message pour afficher l’aperçu.</div></article><article class="lv-paper"><h2>Historique des campagnes</h2><div id="lv-email-history"></div></article></div></div>');
panel('sms','<div class="lv-screen-head"><div><span>COMMUNICATION</span><h1>Campagnes SMS</h1><p>Messages courts, consentements et historique.</p></div></div><div class="lv-demo-notice">Simulation uniquement, aucun SMS envoyé.</div><div class="lv-duo"><form class="lv-paper lv-form" id="lv-sms-form"><h2>Nouveau SMS</h2><label>Nom de la campagne<input name="name" required></label><label>Destinataires<select name="segment"><option value="all">Tous les contacts de la démo</option><option value="visited">Clients déjà venus</option><option value="sms">Consentement SMS</option></select></label><label>Message<textarea name="body" maxlength="918" rows="7" required></textarea></label><label>Insérer un modèle<select id="lv-sms-template"><option value="">Choisir un modèle</option></select></label><div class="lv-button-row" id="lv-sms-count"></div><div class="lv-button-row"><button type="button" data-comms="draft" class="lv-soft-button">Brouillon</button><button type="button" data-comms="test" class="lv-soft-button">Aperçu test</button><button type="button" data-comms="schedule" class="lv-soft-button">Programmer (simulation)</button><button type="button" data-comms="send" class="lv-action">Simuler l’envoi</button></div></form><article class="lv-paper"><h2>Historique SMS</h2><div id="lv-sms-history"></div></article></div>');
panel('automations','<div class="lv-screen-head"><div><span>PARCOURS CLIENT</span><h1>Automatisations</h1><p>Préparez vos confirmations, rappels et remerciements.</p></div></div><div class="lv-demo-notice">Les scénarios sont fictifs. Les interrupteurs ne déclenchent aucun envoi.</div><div class="lv-automation-list" id="lv-automation-list"></div><form class="lv-paper lv-form lv-narrow" id="lv-automation-form"><h2>Ajouter un scénario</h2><div class="lv-form-grid"><label>Nom<input name="name" required></label><label>Moment<select name="timing"><option>À la réservation</option><option>La veille</option><option>Le lendemain</option><option>7 jours après</option></select></label><label>Canal<select name="channel"><option value="email">E-mail</option><option value="sms">SMS</option></select></label><label>Modèle<select name="template" id="lv-automation-template"><option value="">Aucun</option></select></label></div><button class="lv-action" type="submit">Ajouter à la démo</button></form>');
panel('templates','<div class="lv-screen-head"><div><span>COMMUNICATION</span><h1>Modèles</h1><p>Des messages faciles à réutiliser.</p></div></div><div class="lv-duo"><form class="lv-paper lv-form" id="lv-template-form"><h2>Créer ou modifier un modèle</h2><input type="hidden" name="id"><label>Nom<input name="name" required></label><label>Canal<select name="channel"><option value="email">E-mail</option><option value="sms">SMS</option></select></label><label>Objet<input name="subject"></label><label>Message<textarea name="body" rows="9" required></textarea></label><p class="lv-help">Variables : {prénom}, {date}, {heure}.</p><div class="lv-button-row"><button class="lv-action" type="submit">Enregistrer</button><button class="lv-soft-button" type="reset">Nouveau modèle</button></div></form><article class="lv-paper"><h2>Modèles enregistrés</h2><div id="lv-template-list"></div></article></div>');
panel('data','<div class="lv-screen-head"><div><span>DONNÉES</span><h1>Importer / exporter</h1><p>Retrouvez facilement vos données de démonstration.</p></div></div><div class="lv-demo-notice">Les imports ne touchent aucune donnée réelle du restaurant.</div><div class="lv-duo"><article class="lv-paper lv-form"><h2>Importer des clients</h2><p>Fichier CSV avec prénom, nom, e-mail et téléphone.</p><label>Fichier CSV<input type="file" accept=".csv,text/csv" id="lv-csv-file"></label><div id="lv-import-preview"></div><button type="button" class="lv-action" id="lv-import-confirm" hidden>Importer dans la démo</button></article><article class="lv-paper"><h2>Exporter vos données</h2><div class="lv-export-list"><button class="lv-soft-button" data-export="clients">Clients (CSV)</button><button class="lv-soft-button" data-export="reservations">Réservations (CSV)</button><button class="lv-soft-button" data-export="settings">Réglages (JSON)</button></div></article></div>');
panel('users','<div class="lv-screen-head"><div><span>ORGANISATION</span><h1>L’équipe</h1><p>Préparez les profils des collaborateurs.</p></div></div><div class="lv-demo-notice">Les profils ajoutés ne donnent aucun accès réel.</div><div class="lv-duo"><article class="lv-paper"><h2>Les profils</h2><div id="lv-users-list"></div></article><form class="lv-paper lv-form" id="lv-user-form"><h2>Ajouter un profil de test</h2><label>Nom<input name="name" required></label><label>E-mail<input name="email" type="email" required></label><label>Rôle<select name="role"><option>Gérant</option><option>Responsable</option><option>Accueil</option></select></label><button class="lv-action" type="submit">Ajouter</button></form></div>');
panel('account','<div class="lv-screen-head"><div><span>PRÉFÉRENCES</span><h1>Compte</h1><p>Les réglages généraux de votre espace.</p></div></div><form class="lv-paper lv-form lv-narrow" id="lv-account-form"><h2>Informations du restaurant</h2><label>Nom de l’expéditeur<input name="sender" required></label><label>E-mail de réponse<input name="reply" type="email"></label><label>Fuseau horaire<select name="timezone"><option>Europe/Paris</option></select></label><div class="lv-form-grid"><label>SMS à partir de<input name="smsFrom" type="time"></label><label>SMS jusqu’à<input name="smsUntil" type="time"></label></div><button class="lv-action" type="submit">Enregistrer</button><p class="lv-help">Les clés API restent hors de cette démonstration.</p></form>');
panel('communication','<div class="lv-screen-head"><div><span>GARDER LE LIEN</span><h1>Communication</h1><p>Vos campagnes, messages et rappels dans un seul espace.</p></div></div><div class="lv-communication-hint">Créez vos messages, choisissez les bons clients et préparez vos envois en toute simplicité.</div><div id="lv-communication-content"></div>');
const clientsPanel=$('#admin-clients',app);
if(clientsPanel){
 clientsPanel.querySelector('.admin-head-actions')?.remove();
 const header=clientsPanel.querySelector('.admin-head');
 if(header)header.insertAdjacentHTML('beforeend','<button type="button" class="lv-action" id="lv-add-client">Ajouter un client</button>');
 const list=$('#client-list',clientsPanel);
 if(list)list.insertAdjacentHTML('beforebegin','<div class="lv-client-filter"><label>Fréquentation<select id="lv-client-freq"><option value="all">Tous</option><option value="never">Jamais venu</option><option value="1">1 visite</option><option value="2-3">2 à 3 visites</option><option value="4+">4 visites et +</option></select></label><label>Consentements<select id="lv-client-consent"><option value="all">Tous</option><option value="email">E-mail autorisé</option><option value="sms">SMS autorisé</option><option value="none">Aucun</option></select></label><button type="button" class="lv-soft-button" data-export="clients">Exporter CSV</button></div><div id="lv-client-cards"></div>');
}
// Related screens stay in one place instead of being separate administrative sections.
const subChoices={
 clients:[['directory','Mes clients'],['segments','Groupes de clients']],
 communication:[['email','E-mails'],['sms','SMS'],['templates','Mes modèles'],['automations','Messages automatiques']],
 settings:[['reservation','Réservation en ligne'],['data','Données'],['users','Équipe'],['account','Compte']]
};
const currentSub={clients:'directory',communication:'email',settings:'reservation'};
for(const [group,options] of Object.entries(subChoices)){
 const parent=$('#admin-'+group,app);
 if(!parent)throw Error('Missing demo area: '+group);
 const original=document.createElement('div');
 original.id='lv-'+group+'-original';
 if(group!=='communication'){
  while(parent.firstChild)original.appendChild(parent.firstChild);
 }
 const bar=document.createElement('div');
 bar.className='lv-subnav';
 bar.setAttribute('role','tablist');
 bar.setAttribute('aria-label',group==='communication'?'Communication':group==='clients'?'Clients':'Réglages');
 bar.innerHTML=options.map(([id,label],i)=>'<button type="button" role="tab" data-lv-subgroup="'+group+'" data-lv-sub="'+id+'" aria-selected="'+(i===0?'true':'false')+'" class="'+(i===0?'is-active':'')+'">'+label+'</button>').join('');
 if(group==='communication'){
  const intro=parent.querySelector('.lv-screen-head');
  intro?.insertAdjacentElement('afterend',bar);
 }else{parent.appendChild(bar);original.className='lv-subview';parent.appendChild(original)}
 for(const [id] of options){
  if(id==='directory'||id==='reservation')continue;
  const child=$('#admin-'+id,app);
  if(!child)throw Error('Missing management subsection: '+id);
  child.classList.add('lv-subview');
  child.dataset.lvSubsection=id;
  parent.appendChild(child);
 }
}
function switchSub(group,name){
 const options=subChoices[group];
 if(!options)return;
 currentSub[group]=name;
 const parent=$('#admin-'+group,app);
 $$('[data-lv-subgroup="'+group+'"]',parent).forEach(b=>{
  const selected=b.dataset.lvSub===name;
  b.classList.toggle('is-active',selected);
  b.setAttribute('aria-selected',String(selected));
 });
 const root=$('#lv-'+group+'-original',parent);
 if(root)root.hidden=name!==(group==='clients'?'directory':'reservation');
 for(const [id] of options){
  if(id==='directory'||id==='reservation')continue;
  const pane=$('#admin-'+id,parent);
  if(pane)pane.hidden=id!==name;
 }
 if(group==='clients'&&name==='directory'){renderClients();return}
 if(group==='settings'&&name==='reservation'){api.refresh();return}
 render(name);
}
function show(name){
 active=name;
 // Hide only primary navigation panels, never their nested subsections.
 Array.from(main.children).filter(p=>p.classList.contains('admin-tab')).forEach(p=>{p.hidden=p.id!=='admin-'+name});
 $$('[data-lv-nav]',nav).forEach(b=>b.classList.toggle('is-active',b.dataset.lvNav===name));
 if(name==='planning')api.refresh();
 else if(name==='schedule')render('schedule');
 else if(subChoices[name])switchSub(name,currentSub[name]);
 if(window.innerWidth<800)window.scrollTo({top:0,behavior:'smooth'});
}
main.addEventListener('click',e=>{
 const button=e.target.closest('[data-lv-subgroup][data-lv-sub]');
 if(!button)return;
 switchSub(button.dataset.lvSubgroup,button.dataset.lvSub);
});
nav.addEventListener('click',e=>{const b=e.target.closest('[data-lv-nav]');if(b)show(b.dataset.lvNav)});
const back=document.createElement('div');back.className='lv-extra-nav-bottom';back.innerHTML='<button type="button" id="lv-back-to-site">Voir le site démo</button><a href="/demo-reservation?logout=1">Déconnexion</a>';nav.append(back);
$('#lv-back-to-site').onclick=()=>$('.demo-switchbar [data-go="showcase"]')?.click();
$('.demo-switchbar [data-go="admin"]')?.addEventListener('click',()=>show('planning'));
const renderers={};const render=name=>{if(renderers[name])renderers[name]()};
const register=(name,fn)=>{renderers[name]=fn};
window.lvBOExtra={register,render,show,esc,notify,id,allClients,formVals,load,save,prefs:()=>prefs};
function renderSchedule(){
 const target=$('#lv-schedule-week');
 target.innerHTML=names.map((name,i)=>{
  const ss=['lunch','dinner'].map(service=>{
   const c=week[i][service];
   return '<div class="lv-week-service"><label class="lv-check"><input type="checkbox" data-day="'+i+'" data-service="'+service+'" data-field="on" '+(c.on?'checked':'')+'><strong>'+(service==='lunch'?'Déjeuner':'Dîner')+'</strong></label><div class="lv-form-grid"><label>Début<input type="time" data-day="'+i+'" data-service="'+service+'" data-field="start" value="'+esc(c.start)+'"></label><label>Fin<input type="time" data-day="'+i+'" data-service="'+service+'" data-field="end" value="'+esc(c.end)+'"></label><label>Intervalle<select data-day="'+i+'" data-service="'+service+'" data-field="interval">'+[15,30,60].map(n=>'<option value="'+n+'" '+(Number(c.interval)===n?'selected':'')+'>'+n+' min</option>').join('')+'</select></label><label>Couverts / créneau<input type="number" min="0" data-day="'+i+'" data-service="'+service+'" data-field="capacity" value="'+esc(c.capacity)+'"></label></div></div>';
  }).join('');
  return '<details class="lv-weekday" '+(i===new Date().getDay()?'open':'')+'><summary><strong>'+name+'</strong><span>'+[week[i].lunch.on?'Midi':'',week[i].dinner.on?'Soir':''].filter(Boolean).join(' · ')+'</span></summary>'+ss+'</details>';
 }).join('');
 const list=(sel,items,kind)=>{$(sel).innerHTML=items.length?items.map(it=>'<div class="lv-item"><div><strong>'+esc(it.name)+'</strong><small>'+(kind==='special'?esc(it.repeat)+' · '+esc(it.start)+'–'+esc(it.end):esc(it.start)+' → '+esc(it.end))+'</small></div><button type="button" class="lv-text-action" data-remove="'+kind+'" data-id="'+esc(it.id)+'">Retirer</button></div>').join(''):'<p class="lv-muted">Aucun élément enregistré.</p>'};
 list('#lv-special-list',specials,'special');list('#lv-closure-list',closures,'closure');
}
register('schedule',renderSchedule);
$('#lv-schedule-week').addEventListener('change',e=>{const n=e.target,k=n.dataset.field,day=Number(n.dataset.day),svc=n.dataset.service;if(!Number.isInteger(day)||!svc||!k)return;week[day][svc][k]=['on','restaurantOpen'].includes(k)?n.checked:['interval','capacity'].includes(k)?Number(n.value):n.value});
$('#lv-save-schedule').onclick=()=>{save('week',week);api.refresh();renderSchedule();notify('Horaires enregistrés dans la démo.')};
$('#lv-special-form').addEventListener('submit',e=>{e.preventDefault();const v=formVals(e.target);if(v.start>v.end){notify('Vérifiez les horaires.');return}specials.push({...v,id:id(),weekday:Number(v.weekday),ordinal:Number(v.ordinal),capacity:Number(v.capacity),interval:Number(v.interval)});save('specials',specials);api.refresh();e.target.reset();renderSchedule();notify('Service spécial ajouté.')});
$('#lv-closure-form').addEventListener('submit',e=>{e.preventDefault();const v=formVals(e.target);if(v.start>v.end){notify('Vérifiez les dates.');return}closures.push({...v,id:id(),block:e.target.elements.block.checked,hours:e.target.elements.hours?.checked??false,banner:e.target.elements.banner?.checked??false});save('closures',closures);api.refresh();e.target.reset();renderSchedule();notify('Fermeture enregistrée.')});
$('#admin-schedule').addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(!b)return;if(b.dataset.remove==='special'){specials=specials.filter(v=>v.id!==b.dataset.id);save('specials',specials)}else{closures=closures.filter(v=>v.id!==b.dataset.id);save('closures',closures)}api.refresh();renderSchedule()});
function manualReservation(){
 let dialog=document.createElement('dialog');dialog.className='lv-client-editor lv-manual-dialog';
 dialog.innerHTML='<form class="lv-form" id="lv-manual-form"><div class="lv-editor-head"><div><span class="lv-panel-eyebrow">CAHIER DE RÉSERVATIONS</span><h2>Ajouter une réservation</h2></div><button type="button" data-close-manual class="lv-soft-button" aria-label="Fermer">×</button></div><p class="lv-help">Ajout manuel pour le personnel, jusqu’à 50 couverts. Aucune confirmation externe n’est envoyée.</p><div class="lv-form-grid"><label>Prénom<input name="first" required autocomplete="off"></label><label>Nom<input name="last" required autocomplete="off"></label><label>Téléphone<input name="phone" type="tel" required autocomplete="off"></label><label>E-mail<input name="email" type="email" autocomplete="off"></label><label>Date<input name="date" type="date" required></label><label>Service<select name="service"><option value="lunch">Déjeuner</option><option value="dinner">Dîner</option></select></label><label>Heure d’arrivée<select name="time" required></select></label><label>Couverts<input type="number" name="pax" min="1" max="50" value="2" required></label></div><div id="lv-manual-client-match" class="lv-help"></div><label>Note interne<textarea rows="3" name="note" placeholder="Allergies, terrasse, anniversaire…"></textarea></label><label class="lv-check"><input type="checkbox" name="confirmEmail" disabled> Confirmation par e-mail (disponible après raccordement)</label><div class="lv-button-row"><button type="submit" class="lv-action">Enregistrer dans le planning</button><button type="button" class="lv-soft-button" data-close-manual>Annuler</button></div></form>';
 app.append(dialog);dialog.showModal();dialog.addEventListener('close',()=>dialog.remove());
 const frm=dialog.querySelector('form');
 frm.elements.date.value=today();
 const updateTimes=()=>{
  const date=frm.elements.date.value,service=frm.elements.service.value;
  let options=serviceTimes(date,service);
  if(!options.length)options=service==='lunch'?['12:00','12:30','13:00','13:30']:['19:00','19:30','20:00','20:30'];
  frm.elements.time.innerHTML=options.map(t=>'<option value="'+esc(t)+'">'+esc(t)+'</option>').join('');
 };
 const showMatch=()=>{
  const name=(frm.elements.first.value+' '+frm.elements.last.value).trim().toLowerCase();
  const email=frm.elements.email.value.trim().toLowerCase();
  const phone=frm.elements.phone.value.replace(/\s/g,'');
  const c=allClients().find(v=>(email&&v.email?.toLowerCase()===email)||(phone&&v.phone?.replace(/\s/g,'')===phone)||(name.length>5&&(v.first+' '+v.last).toLowerCase()===name));
  $('#lv-manual-client-match',dialog).textContent=c?'Client déjà présent dans la démo · '+(c.visits||0)+' visite(s)':'';
 };
 [frm.elements.date,frm.elements.service].forEach(el=>el.addEventListener('change',updateTimes));
 ['first','last','email','phone'].forEach(n=>frm.elements[n].addEventListener('input',showMatch));
 dialog.querySelectorAll('[data-close-manual]').forEach(b=>b.addEventListener('click',()=>dialog.close()));
 updateTimes();
 frm.addEventListener('submit',e=>{
  e.preventDefault();if(!frm.reportValidity())return;
  const v=formVals(frm);
  const item={id:'staff-'+id(),date:v.date,time:v.time,service:v.service,pax:Number(v.pax),first:v.first.trim(),last:v.last.trim(),phone:v.phone.trim(),email:(v.email||'').trim(),note:v.note||'',status:'confirmed',created:'Ajout manuel de démonstration'};
  api.setReservations([...api.getReservations(),item]);
  api.setDate(v.date);
  dialog.close();show('planning');notify('Réservation ajoutée au planning de la démo.');
 });
}
document.addEventListener('click',e=>{
 if(!document.body.classList.contains('lv-demo-admin'))return;
 const button=e.target.closest('[data-new-reservation], [data-new-reservation-empty]');
 if(!button||!app.contains(button))return;
 e.preventDefault();e.stopImmediatePropagation();manualReservation();
},true);
function renderClients(){
 const q=($('#client-search')?.value||'').toLowerCase(),freq=$('#lv-client-freq')?.value||'all',consent=$('#lv-client-consent')?.value||'all';
 const found=allClients().filter(c=>{const v=Number(c.visits)||0;return [c.first,c.last,c.email,c.phone,c.tags].join(' ').toLowerCase().includes(q)&&(freq==='all'||freq==='never'&&v===0||freq==='1'&&v===1||freq==='2-3'&&v>=2&&v<=3||freq==='4+'&&v>=4)&&(consent==='all'||consent==='email'&&c.consentEmail||consent==='sms'&&c.consentSms||consent==='none'&&!c.consentEmail&&!c.consentSms)});
 $('#client-list').hidden=true;
 $('#lv-client-cards').innerHTML=found.length?found.map(c=>'<div class="lv-client-card"><span class="lv-avatar">'+esc((c.first||'?')[0]) +esc((c.last||'?')[0])+'</span><div><strong>'+esc(c.first)+' '+esc(c.last)+'</strong><small>'+esc(c.email||c.phone||'Aucune coordonnée')+'</small></div><span class="lv-pill">'+(c.visits||0)+' visite(s)</span><button class="lv-soft-button" data-open-client="'+esc(c.id)+'">Voir</button></div>').join(''):'<div class="lv-empty">Aucun client pour cette recherche.</div>';
}
['client-search','lv-client-freq','lv-client-consent'].forEach(k=>$('#'+k)?.addEventListener(k==='client-search'?'input':'change',renderClients));
$('#lv-add-client').onclick=()=>clientEditor();
$('#lv-client-cards').addEventListener('click',e=>{const b=e.target.closest('[data-open-client]');if(b){const c=allClients().find(it=>it.id===b.dataset.openClient);if(c)clientEditor(c)}});
function clientEditor(c){
 const data=c||{id:id(),first:'',last:'',email:'',phone:'',tags:'',consentEmail:false,consentSms:false,visits:0};
 let dialog=document.createElement('dialog');dialog.className='lv-client-editor';
 dialog.innerHTML='<form class="lv-form" method="dialog"><div class="lv-editor-head"><h2>Fiche client</h2><button value="cancel" aria-label="Fermer" class="lv-soft-button">×</button></div><div class="lv-form-grid"><label>Prénom<input name="first" required value="'+esc(data.first)+'"></label><label>Nom<input name="last" required value="'+esc(data.last)+'"></label><label>E-mail<input name="email" type="email" value="'+esc(data.email)+'"></label><label>Téléphone<input name="phone" type="tel" value="'+esc(data.phone)+'"></label></div><div class="lv-form-grid"><label>Date de naissance<input name="birthday" type="date" value="'+esc(data.birthday||'')+'"></label><label>Tags<input name="tags" value="'+esc(data.tags||'')+'" placeholder="Habituel, terrasse…"></label></div><label>Note sur le client<textarea rows="2" name="note" placeholder="Préférences ou informations utiles">'+esc(data.note||'')+'</textarea></label><label class="lv-check"><input type="checkbox" name="consentEmail" '+(data.consentEmail?'checked':'')+'> Consentement e-mail</label><label class="lv-check"><input type="checkbox" name="consentSms" '+(data.consentSms?'checked':'')+'> Consentement SMS</label><p class="lv-help"><strong>'+(data.visits||0)+' réservation(s) dans cette démo</strong></p><div class="lv-client-history">'+api.getReservations().filter(r=>(data.email&&r.email===data.email)||(data.phone&&r.phone===data.phone)).slice(-5).reverse().map(r=>'<div>'+esc(r.date)+' · '+esc(r.time)+' · '+r.pax+' couvert(s)</div>').join('')+'</div><button type="button" class="lv-action" id="lv-save-client">Enregistrer</button></form>';
 app.append(dialog);dialog.showModal();dialog.addEventListener('close',()=>dialog.remove());
 dialog.querySelector('#lv-save-client').onclick=()=>{const f=dialog.querySelector('form');if(!f.reportValidity())return;const v={...data,...formVals(f),consentEmail:f.elements.consentEmail.checked,consentSms:f.elements.consentSms.checked};const i=additionalClients.findIndex(d=>d.id===data.id);if(i<0)additionalClients.push(v);else additionalClients[i]=v;save('clients',additionalClients);dialog.close();renderClients();notify('Client enregistré.')};
}
function download(name,text,type){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function exportData(kind){
 if(kind==='settings'){download('village-demo-reglages.json',JSON.stringify({week,closures,specials,prefs},null,2),'application/json');return}
 const data=kind==='clients'?allClients():api.getReservations();if(!data.length){notify('Aucune donnée à exporter.');return}
 const cols=[...new Set(data.flatMap(v=>Object.keys(v)))],encode=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
 const csv='\uFEFF'+cols.map(encode).join(';')+'\r\n'+data.map(r=>cols.map(k=>encode(r[k])).join(';')).join('\r\n');
 download('village-demo-'+kind+'.csv',csv,'text/csv;charset=utf-8');
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-export]');if(b&&app.contains(b))exportData(b.dataset.export)});
let parsed=[];
function parseCsv(text){
 const lines=text.replace(/^\uFEFF/,'').trim().split(/\r?\n/);if(lines.length<2)return[];
 const sep=lines[0].includes(';')?';':',';
 function row(line){let out=[],value='',quoted=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'&&quoted&&line[i+1]==='"'){value+='"';i++}else if(c==='"')quoted=!quoted;else if(c===sep&&!quoted){out.push(value);value=''}else value+=c}out.push(value);return out}
 const names=row(lines[0]).map(v=>v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim());
 return lines.slice(1,501).map(l=>{const vals=row(l),a={};names.forEach((n,i)=>a[n]=vals[i]||'');return {id:id(),first:a.prenom||a.firstname||'',last:a.nom||a.lastname||'',email:a.email||a['e-mail']||'',phone:a.telephone||a.phone||'',visits:0,consentEmail:false,consentSms:false}}).filter(c=>c.first||c.last||c.email||c.phone);
}
$('#lv-csv-file').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>1000000){notify('Fichier de plus de 1 Mo refusé.');return}parsed=parseCsv(await file.text());$('#lv-import-preview').textContent=parsed.length+' client(s) reconnus.';$('#lv-import-confirm').hidden=!parsed.length});
$('#lv-import-confirm').onclick=()=>{additionalClients.push(...parsed);save('clients',additionalClients);parsed=[];$('#lv-import-confirm').hidden=true;$('#lv-import-preview').textContent='Contacts ajoutés à la démo.';notify('Import effectué.')};
function renderUsers(){$('#lv-users-list').innerHTML=users.map(u=>'<div class="lv-item"><div><strong>'+esc(u.name)+'</strong><small>'+esc(u.role)+' · '+esc(u.email)+'</small></div>'+(u.id==='manager'?'':'<button class="lv-text-action" data-delete-user="'+esc(u.id)+'">Retirer</button>')+'</div>').join('')}
register('users',renderUsers);
$('#lv-user-form').addEventListener('submit',e=>{e.preventDefault();users.push({...formVals(e.target),id:id()});save('users',users);e.target.reset();renderUsers();notify('Profil fictif ajouté.')});
$('#lv-users-list').addEventListener('click',e=>{const b=e.target.closest('[data-delete-user]');if(!b)return;users=users.filter(u=>u.id!==b.dataset.deleteUser);save('users',users);renderUsers()});
function renderAccount(){const f=$('#lv-account-form');Object.entries(prefs).forEach(([k,v])=>{if(f.elements[k])f.elements[k].value=v})}
register('account',renderAccount);
$('#lv-account-form').addEventListener('submit',e=>{e.preventDefault();prefs=formVals(e.target);save('prefs',prefs);notify('Préférences enregistrées.')});
})();
