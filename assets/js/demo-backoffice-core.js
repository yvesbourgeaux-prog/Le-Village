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
// Sample Village hours for this private demonstration; all times are editable.
const defaultService=service=>service==='lunch'
 ?{on:true,restaurantOpen:true,open:'12:00',close:'15:00',start:'12:00',end:'14:30',interval:30,capacity:24,perSlot:{}}
 :{on:true,restaurantOpen:true,open:'19:00',close:'22:00',start:'19:00',end:'21:00',interval:30,capacity:30,perSlot:{}};
const defaultDay=()=>({active:true,maxParty:6,lunch:defaultService('lunch'),dinner:defaultService('dinner')});
const toMinutes=t=>/^\d{2}:\d{2}$/.test(t||'')?Number(t.slice(0,2))*60+Number(t.slice(3)):NaN;
const normalizeService=(service,data)=>{
 const defaults=defaultService(service),merged={...defaults,...data};
 merged.open=data?.open||data?.start||defaults.open;
 merged.close=data?.close|| (service==='lunch'?'15:00':'22:00');
 merged.perSlot=(data?.perSlot&&typeof data.perSlot==='object'&&!Array.isArray(data.perSlot))?data.perSlot:{};
 merged.interval=[15,30,60].includes(Number(merged.interval))?Number(merged.interval):30;
 merged.capacity=Math.max(0,Number(merged.capacity)||0);
 return merged;
};
const rawWeek=load('week',Array.from({length:7},defaultDay));
let week=Array.from({length:7},(_,day)=>{
 const data=Array.isArray(rawWeek)?rawWeek[day]:null;
 return {active:data?.active!==false,maxParty:Math.min(6,Math.max(1,Number(data?.maxParty)||6)),
  lunch:normalizeService('lunch',data?.lunch),dinner:normalizeService('dinner',data?.dinner)};
});
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
function config(date,service){
 const day=week[new Date(date+'T12:00:00').getDay()];
 if(!day.active||closed(date))return {...day[service],on:false,capacity:0,perSlot:{}};
 const custom=specials.find(e=>e.service===service&&eventOn(e,date));
 if(custom)return {...day[service],...custom,open:custom.start,close:custom.end,on:true,capacity:Number(custom.capacity),perSlot:{},maxParty:day.maxParty};
 const regular=day[service];
 return {...regular,on:regular.on!==false&&regular.restaurantOpen!==false,maxParty:day.maxParty};
}
const serviceTimes=(date,service)=>{
 if(!date)return[];
 const c=config(date,service);
 if(!c.on||!c.start||!c.end)return[];
 const start=toMinutes(c.start),end=toMinutes(c.end),open=toMinutes(c.open),close=toMinutes(c.close);
 const step=Number(c.interval)||30;
 if(!Number.isFinite(start)||!Number.isFinite(end)||start>end||start<open||end>close)return[];
 const times=[];
 for(let min=start;min<=end&&times.length<48;min+=step){
  times.push(String(Math.floor(min/60)).padStart(2,'0')+':'+String(min%60).padStart(2,'0'));
 }
 return times;
};
function slotRules(date,service,time){
 const c=config(date,service);
 const override=c.perSlot?.[time]||{};
 return {
  capacity:Math.max(0,Number(override.capacity??c.capacity)||0),
  maxParty:Math.max(1,Math.min(6,Number(c.maxParty)||6,Number(override.maxParty??c.maxParty)||6))
 };
}
window.lvDemoSchedule={
 getTimes:serviceTimes,
 getCapacity:(date,service,time)=>time?slotRules(date,service,time).capacity:Math.max(0,Number(config(date,service).capacity)||0),
 getMaxParty:(date,service,time)=>slotRules(date,service,time).maxParty,
 isDayOpen:date=>!closed(date)&&['lunch','dinner'].some(service=>serviceTimes(date,service).length>0)
};
function allClients(){
 const map=new Map();
 api.getReservations().forEach(r=>{const key=(r.email||r.phone||r.first+r.last).toLowerCase();if(!map.has(key))map.set(key,{id:'r'+r.id,first:r.first,last:r.last,email:r.email,phone:r.phone,visits:0,last:r.date,consentEmail:false,consentSms:false,tags:''});const c=map.get(key);if(r.status!=='cancelled')c.visits++;if(r.date>c.last)c.last=r.date});
 additionalClients.forEach(c=>{const key=(c.email||c.phone||c.first+c.last).toLowerCase();map.set(key,{...map.get(key),...c})});return Array.from(map.values());
}
function notify(msg){let n=$('#lv-extra-message');if(!n){n=document.createElement('div');n.id='lv-extra-message';document.body.append(n)}n.textContent=msg;n.classList.add('show');setTimeout(()=>n.classList.remove('show'),3200)}
const sections=[
 {label:'Au quotidien',items:[['planning','Réservations','calendar'],['schedule','Horaires','clock'],['meta','Statistiques','chart']]},
 {label:'Relation clients',items:[['clients','Clients','users']]},
 {label:'Communication',items:[['communication','Communication','send']]},
 {label:'Paramètres',items:[['settings','Réglages','sliders']]}
];
const iconPaths={
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 chart:'<path d="M4 20V11M10 20V5M16 20v-8M22 20V8M2 20h22"/>',
 users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M17 15a5 5 0 0 1 4 5"/>',
 send:'<path d="M21 3 3 10l7 3 3 8 8-18ZM10 13l11-10"/>',
 sliders:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="currentColor"/><circle cx="16" cy="12" r="2" fill="currentColor"/><circle cx="10" cy="18" r="2" fill="currentColor"/>'
};
const navIcon=k=>'<svg class="lv-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+iconPaths[k]+'</svg>';
const nav=$('.admin-nav',app),main=$('.admin-main',app);
if(!nav||!main)return;
let active='planning';
nav.innerHTML='<div class="admin-logo"><img src="https://assets.zyrosite.com/gnKoPAn3rxzY53IR/chatgpt-image-22-nov.-2025-00_40_31-YvUWBeCav31wXD3h.png" alt="Le Grimaldi × Le Village" width="112" height="112"></div><div class="lv-extra-menu">'
 +sections.map(section=>'<div class="lv-nav-section"><p class="lv-menu-label">'+section.label+'</p>'
 +section.items.map(p=>'<div class="lv-menu-entry"><button type="button" class="lv-menu-btn '+(p[0]==='planning'?'is-active':'')+'" data-lv-nav="'+p[0]+'">'+navIcon(p[2])+'<span>'+p[1]+'</span></button></div>').join('')+'</div>').join('')
 +'</div>';
main.insertAdjacentHTML('afterbegin','<div class="lv-bo-topbar"><span class="lv-bo-topbar-name">Le Village <i>·</i> Espace de gestion</span><div class="lv-bo-topbar-actions"><span class="lv-bo-private">Démo privée</span><a href="/le-village-restaurant-haut-de-cagnes-sur-mer.html" target="_blank" rel="noopener noreferrer">Voir le site ↗</a></div></div>');
const panel=(id,html)=>main.insertAdjacentHTML('beforeend','<section class="admin-tab lv-extra-screen" hidden id="admin-'+id+'">'+html+'</section>');
panel('schedule','<div class="lv-screen-head"><div><span>ORGANISATION</span><h1>Jours & horaires</h1><p>Gérez vos services, jours spéciaux et fermetures.</p></div><button class="lv-action" id="lv-save-schedule">Enregistrer les horaires</button></div><div class="lv-rts-explanation"><strong>Places réservables par créneau</strong><p>Pour chaque heure d’arrivée, le site déduit les personnes déjà réservées à cette même heure. Il ne calcule pas les tables encore occupées par les créneaux précédents.</p></div><div class="lv-week-list" id="lv-schedule-week"></div><div class="lv-duo"><article class="lv-paper"><h2>Jours spéciaux</h2><form class="lv-form" id="lv-special-form"><label>Nom du service<input name="name" required placeholder="Brunch du dimanche"></label><div class="lv-form-grid"><label>Répétition<select name="repeat"><option value="once">Date unique</option><option value="weekly">Chaque semaine</option><option value="monthly">Chaque mois</option><option value="yearly">Chaque année</option></select></label><label>Date de référence<input name="date" type="date" required></label><label>Jour hebdomadaire<select name="weekday">'+names.map((v,i)=>'<option value="'+i+'">'+v+'</option>').join('')+'</select></label><label>Service<select name="service"><option value="lunch">Déjeuner</option><option value="dinner">Dîner</option></select></label><label>Début<input name="start" type="time" value="12:00" required></label><label>Dernière arrivée<input name="end" type="time" value="14:30" required></label><label>Intervalle<select name="interval"><option value="15">15 min</option><option value="30" selected>30 min</option><option value="60">60 min</option></select></label><label>Couverts / créneau<input name="capacity" type="number" min="0" value="20" required></label></div><button class="lv-action" type="submit">Ajouter le service</button></form><div id="lv-special-list"></div></article><article class="lv-paper"><h2>Fermetures exceptionnelles</h2><form id="lv-closure-form" class="lv-form"><label>Motif<input name="name" placeholder="Congés annuels" required></label><div class="lv-form-grid"><label>Du<input name="start" type="date" required></label><label>Au<input name="end" type="date" required></label></div><label class="lv-check"><input type="checkbox" name="block" checked> Bloquer les réservations</label><button type="submit" class="lv-action">Ajouter la fermeture</button></form><div id="lv-closure-list"></div></article></div>');
panel('segments','<div class="lv-screen-head"><div><span>RELATION CLIENT</span><h1>Segments de clients</h1><p>Créez des groupes de contacts pour vos futures communications.</p></div></div><div class="lv-duo"><form class="lv-paper lv-form" id="lv-segment-form"><h2>Nouveau segment</h2><label>Nom du segment<input name="name" placeholder="Ex. Habitués du midi" required></label><label>Consentement<select name="consent"><option value="any">Peu importe</option><option value="email">E-mail accepté</option><option value="sms">SMS accepté</option></select></label><label>Fréquentation<select name="activity"><option value="all">Tous les clients</option><option value="visited">Déjà venu</option><option value="new">Aucune réservation</option></select></label><label>Tag client<input name="tag" placeholder="Ex. terrasse, VIP"></label><button class="lv-action" type="submit">Enregistrer le segment</button></form><article class="lv-paper"><h2>Segments enregistrés</h2><div id="lv-segment-list"></div></article></div>');
panel('email','<div class="lv-screen-head"><div><span>COMMUNICATION</span><h1>Campagnes e-mail</h1><p>Préparez, prévisualisez et simulez vos campagnes.</p></div></div><div class="lv-demo-notice">Aucun message réel ne sera envoyé dans cette démonstration.</div><div class="lv-duo"><form class="lv-paper lv-form" id="lv-email-form"><h2>Nouvel e-mail</h2><label>Nom interne<input name="name" required></label><label>Destinataires<select name="segment"><option value="all">Tous les contacts de la démo</option><option value="visited">Clients déjà venus</option><option value="email">Consentement e-mail</option></select></label><label>Objet<input name="subject" required maxlength="140"></label><label>Texte de prévisualisation<input name="preheader" maxlength="180"></label><label>Message<textarea name="body" required rows="10" placeholder="Bonjour {prénom}, ..."></textarea></label><label>Insérer un modèle<select id="lv-email-template"><option value="">Choisir un modèle</option></select></label><div id="lv-email-count"></div><div class="lv-button-row"><button type="button" data-comms="draft" class="lv-soft-button">Brouillon</button><button type="button" data-comms="test" class="lv-soft-button">Aperçu test</button><button type="button" data-comms="schedule" class="lv-soft-button">Programmer (simulation)</button><button type="button" data-comms="send" class="lv-action">Simuler l’envoi</button></div></form><div class="lv-stack"><article class="lv-paper"><h2>Aperçu</h2><div id="lv-email-preview" class="lv-preview">Rédigez votre message pour afficher l’aperçu.</div></article><article class="lv-paper"><h2>Historique des campagnes</h2><div id="lv-email-history"></div></article></div></div>');
panel('sms','<div class="lv-screen-head"><div><span>COMMUNICATION</span><h1>Campagnes SMS</h1><p>Messages courts, consentements et historique.</p></div></div><div class="lv-demo-notice">Simulation uniquement, aucun SMS envoyé.</div><div class="lv-duo"><form class="lv-paper lv-form" id="lv-sms-form"><h2>Nouveau SMS</h2><label>Nom de la campagne<input name="name" required></label><label>Destinataires<select name="segment"><option value="all">Tous les contacts de la démo</option><option value="visited">Clients déjà venus</option><option value="sms">Consentement SMS</option></select></label><label>Message<textarea name="body" maxlength="918" rows="7" required></textarea></label><label>Insérer un modèle<select id="lv-sms-template"><option value="">Choisir un modèle</option></select></label><div class="lv-button-row" id="lv-sms-count"></div><div class="lv-button-row"><button type="button" data-comms="draft" class="lv-soft-button">Brouillon</button><button type="button" data-comms="test" class="lv-soft-button">Aperçu test</button><button type="button" data-comms="schedule" class="lv-soft-button">Programmer (simulation)</button><button type="button" data-comms="send" class="lv-action">Simuler l’envoi</button></div></form><article class="lv-paper"><h2>Historique SMS</h2><div id="lv-sms-history"></div></article></div>');
panel('automations','<div class="lv-screen-head"><div><span>PARCOURS CLIENT</span><h1>Automatisations</h1><p>Préparez vos confirmations, rappels et remerciements.</p></div></div><div class="lv-demo-notice">Les scénarios sont fictifs. Les interrupteurs ne déclenchent aucun envoi.</div><div class="lv-automation-list" id="lv-automation-list"></div><form class="lv-paper lv-form lv-narrow" id="lv-automation-form"><h2>Ajouter un scénario</h2><div class="lv-form-grid"><label>Nom<input name="name" required></label><label>Moment<select name="timing"><option>À la réservation</option><option>La veille</option><option>Le lendemain</option><option>7 jours après</option></select></label><label>Canal<select name="channel"><option value="email">E-mail</option><option value="sms">SMS</option></select></label><label>Modèle<select name="template" id="lv-automation-template"><option value="">Aucun</option></select></label></div><button class="lv-action" type="submit">Ajouter à la démo</button></form>');
panel('templates','<div class="lv-screen-head"><div><span>COMMUNICATION</span><h1>Modèles</h1><p>Des messages faciles à réutiliser.</p></div></div><div class="lv-duo"><form class="lv-paper lv-form" id="lv-template-form"><h2>Créer ou modifier un modèle</h2><input type="hidden" name="id"><label>Nom<input name="name" required></label><label>Canal<select name="channel"><option value="email">E-mail</option><option value="sms">SMS</option></select></label><label>Objet<input name="subject"></label><label>Message<textarea name="body" rows="9" required></textarea></label><p class="lv-help">Variables : {prénom}, {date}, {heure}.</p><div class="lv-button-row"><button class="lv-action" type="submit">Enregistrer</button><button class="lv-soft-button" type="reset">Nouveau modèle</button></div></form><article class="lv-paper"><h2>Modèles enregistrés</h2><div id="lv-template-list"></div></article></div>');
panel('data','<div class="lv-screen-head"><div><span>DONNÉES</span><h1>Importer / exporter</h1><p>Retrouvez facilement vos données de démonstration.</p></div></div><div class="lv-demo-notice">Les imports ne touchent aucune donnée réelle du restaurant.</div><div class="lv-duo"><article class="lv-paper lv-form"><h2>Importer des clients</h2><p>Fichier CSV avec prénom, nom, e-mail et téléphone.</p><label>Fichier CSV<input type="file" accept=".csv,text/csv" id="lv-csv-file"></label><div id="lv-import-preview"></div><button type="button" class="lv-action" id="lv-import-confirm" hidden>Importer dans la démo</button></article><article class="lv-paper"><h2>Exporter vos données</h2><div class="lv-export-list"><button class="lv-soft-button" data-export="clients">Clients (CSV)</button><button class="lv-soft-button" data-export="reservations">Réservations (CSV)</button><button class="lv-soft-button" data-export="settings">Réglages (JSON)</button></div></article></div>');
panel('users','<div class="lv-screen-head"><div><span>ORGANISATION</span><h1>L’équipe</h1><p>Préparez les profils des collaborateurs.</p></div></div><div class="lv-demo-notice">Les profils ajoutés ne donnent aucun accès réel.</div><div class="lv-duo"><article class="lv-paper"><h2>Les profils</h2><div id="lv-users-list"></div></article><form class="lv-paper lv-form" id="lv-user-form"><h2>Ajouter un profil de test</h2><label>Nom<input name="name" required></label><label>E-mail<input name="email" type="email" required></label><label>Rôle<select name="role"><option>Gérant</option><option>Responsable</option><option>Accueil</option></select></label><button class="lv-action" type="submit">Ajouter</button></form></div>');
panel('account','<div class="lv-screen-head"><div><span>PRÉFÉRENCES</span><h1>Compte</h1><p>Les réglages généraux de votre espace.</p></div></div><form class="lv-paper lv-form lv-narrow" id="lv-account-form"><h2>Informations du restaurant</h2><label>Nom de l’expéditeur<input name="sender" required></label><label>E-mail de réponse<input name="reply" type="email"></label><label>Fuseau horaire<select name="timezone"><option>Europe/Paris</option></select></label><div class="lv-form-grid"><label>SMS à partir de<input name="smsFrom" type="time"></label><label>SMS jusqu’à<input name="smsUntil" type="time"></label></div><button class="lv-action" type="submit">Enregistrer</button><p class="lv-help">Les clés API restent hors de cette démonstration.</p></form>');
panel('communication','<div class="lv-screen-head"><div><span>GARDER LE LIEN</span><h1>Communication</h1><p>Vos campagnes, messages et rappels dans un seul espace.</p></div></div><div class="lv-communication-hint">Créez vos messages, choisissez les bons clients et préparez vos envois en toute simplicité.</div><div id="lv-communication-content"></div>');
panel('meta','<div class="lv-screen-head"><div><span>VOTRE VISIBILITÉ SUR LES RÉSEAUX</span><h1>Statistiques Meta</h1><p>Choisissez Facebook ou Instagram pour consulter les résultats de chaque réseau.</p></div></div><div id="lv-meta-root"></div>');
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
// Progressive disclosure: the owner sees helpful actions, not a wall of forms.
for(const [selector,label,description] of [
 ['#lv-email-form','Créer une campagne e-mail','Une invitation, une actualité ou une nouvelle carte'],
 ['#lv-sms-form','Rédiger un SMS','Un message court pour vos clients'],
 ['#lv-template-form','Créer un modèle','Gagner du temps avec un message prêt à réutiliser'],
 ['#lv-automation-form','Créer un message automatique','Préparer un rappel ou un remerciement']
]){
 const form=$(selector,app);
 if(!form)continue;
 const details=document.createElement('details');
 details.className='lv-compose-fold';
 const title=document.createElement('summary');
 title.innerHTML='<span class="lv-compose-plus">+</span><span><strong>'+label+'</strong><small>'+description+'</small></span>';
 form.before(details);
 details.append(title,form);
}
// Avoid multiple competing headlines inside the single Communication area.
function show(name){
 active=name;
 // Hide only primary navigation panels, never their nested subsections.
 Array.from(main.children).filter(p=>p.classList.contains('admin-tab')).forEach(p=>{p.hidden=p.id!=='admin-'+name});
 $$('[data-lv-nav]',nav).forEach(b=>b.classList.toggle('is-active',b.dataset.lvNav===name));
 if(name==='planning')api.refresh();
 else if(name==='schedule')render('schedule');
 else if(subChoices[name])switchSub(name,currentSub[name]);
 else render(name);
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
// The schedule mirrors the familiar Ramen workflow: day, service, then each arrival.
const openedDays=new Set(),openedServices=new Set(),openedSlots=new Set();
const maxValue=(v,limit=6)=>Math.max(1,Math.min(limit,Number(v)||limit));
const timeOptions=cfg=>{
 const start=toMinutes(cfg.start),end=toMinutes(cfg.end),step=Number(cfg.interval)||30;
 if(!Number.isFinite(start)||!Number.isFinite(end)||start>end)return[];
 const arr=[];
 for(let t=start;t<=end&&arr.length<48;t+=step){
  arr.push(String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0'));
 }
 return arr;
};
function daySummary(day){
 const parts=['lunch','dinner'].map(s=>{
  const cfg=day[s];
  if(!day.active||!cfg.on||cfg.restaurantOpen===false)return null;
  return (s==='lunch'?'Midi':'Soir')+' : '+cfg.open+'–'+cfg.close;
 }).filter(Boolean);
 return parts.length?parts.join(' · '):'Aucune réservation ouverte';
}
function serviceEditor(dayIndex,service){
 const day=week[dayIndex],cfg=day[service],id=dayIndex+'-'+service;
 const expanded=openedServices.has(id),times=timeOptions(cfg),title=service==='lunch'?'Midi':'Soir';
 const choice=(key,type,label,value,extra='')=>'<label class="lv-rts-field">'+label+'<input type="'+type+'" data-day="'+dayIndex+'" data-service="'+service+'" data-field="'+key+'" value="'+esc(value)+'" '+extra+'></label>';
 const check=(key,label,enabled)=>'<label class="lv-rts-check"><input type="checkbox" data-day="'+dayIndex+'" data-service="'+service+'" data-field="'+key+'" '+(enabled?'checked':'')+'>'+label+'</label>';
 const slotRows=times.map(time=>{
  const override=cfg.perSlot?.[time]||{};
  const cap=override.capacity??cfg.capacity,pax=override.maxParty??day.maxParty;
  return '<div class="lv-rts-slot"><strong>'+esc(time)+'</strong><label>Capacité du créneau<input type="number" data-slot-field="capacity" data-day="'+dayIndex+'" data-service="'+service+'" data-time="'+time+'" min="0" max="300" value="'+esc(cap)+'"></label><label>Personnes par réservation<input type="number" data-slot-field="maxParty" data-day="'+dayIndex+'" data-service="'+service+'" data-time="'+time+'" min="1" max="'+day.maxParty+'" value="'+esc(Math.min(day.maxParty,pax))+'"></label></div>';
 }).join('');
 const intervalSelect='<label class="lv-rts-field">Une réservation toutes les<select data-day="'+dayIndex+'" data-service="'+service+'" data-field="interval">'+[15,30,60].map(n=>'<option value="'+n+'" '+(Number(cfg.interval)===n?'selected':'')+'>'+n+' minutes</option>').join('')+'</select></label>';
 return '<section class="lv-rts-service '+(expanded?'is-expanded':'')+'" data-rts-service="'+id+'">'
  +'<button type="button" class="lv-rts-service-summary" data-open-service="'+id+'" aria-expanded="'+expanded+'"><strong>'+title+'</strong><span>Arrivées '+esc(cfg.start)+'–'+esc(cfg.end)+' · toutes les '+esc(cfg.interval)+' minutes</span><em>'+(expanded?'Terminer':'Modifier')+'</em></button>'
  +'<div class="lv-rts-service-content" '+(expanded?'':'hidden')+'>'
  +'<div class="lv-rts-channel-checks">'+check('restaurantOpen','Sur place',cfg.restaurantOpen!==false)+check('on','Réservations habituelles',cfg.on!==false)+'</div>'
  +'<div class="lv-rts-field-grid">'+choice('open','time','Ouverture',cfg.open)+choice('close','time','Fermeture',cfg.close)+choice('start','time','Première arrivée',cfg.start)+choice('end','time','Dernière arrivée',cfg.end)+intervalSelect+choice('capacity','number','Capacité totale du créneau',cfg.capacity,'min="0" max="300"')+'</div>'
  +'<p class="lv-rts-hint">Limite à chaque heure d’arrivée. Pensez aux clients encore à table des créneaux précédents.</p>'
  +'<p class="lv-rts-arrivals">Arrivées : '+(times.length?times.join(' · '):'Aucun horaire pour les paramètres choisis')+'</p>'
  +'<div class="lv-rts-slot-editor '+(openedSlots.has(id)?'is-open':'')+'"><button type="button" data-open-slots="'+id+'" aria-expanded="'+openedSlots.has(id)+'" class="lv-rts-slots-toggle"><span class="lv-rts-arrow"></span>Adapter la capacité et la taille des réservations par heure</button>'
  +'<div class="lv-rts-slot-content" '+(openedSlots.has(id)?'':'hidden')+'><div class="lv-rts-slot-grid">'+(slotRows||'<p>Aucun horaire. Vérifiez les heures d’arrivée.</p>')+'</div></div></div>'
  +'</div></section>';
}
function renderSchedule(){
 const target=$('#lv-schedule-week');if(!target)return;
 target.innerHTML=[1,2,3,4,5,6,0].map(i=>{
  const name=names[i],day=week[i],expanded=openedDays.has(i),active=day.active!==false;
  return '<article class="lv-rts-day '+(expanded?'is-expanded ':'')+(active?'':'is-off')+'" data-rts-day="'+i+'">'
   +'<header class="lv-rts-day-head"><strong class="lv-rts-day-name">'+name+'</strong>'
   +'<label class="lv-rts-day-switch"><input type="checkbox" role="switch" aria-label="Activer '+name+'" data-day="'+i+'" data-field="active" '+(active?'checked':'')+'><span class="lv-rts-switch-track" aria-hidden="true"></span><span>'+(active?'Jour actif':'Jour fermé')+'</span></label>'
   +'<span class="lv-rts-day-preview">'+esc(daySummary(day))+'</span><button type="button" class="lv-rts-day-toggle" aria-expanded="'+expanded+'" data-open-day="'+i+'" aria-label="'+(expanded?'Refermer':'Modifier')+' '+name+'"><span>'+ (expanded?'Refermer':'Modifier')+'</span><span class="lv-rts-chevron" aria-hidden="true"></span></button></header>'
   +'<div class="lv-rts-day-content" '+(expanded?'':'hidden')+'>'
   +'<div class="lv-rts-maxparty"><label>Personnes maximum par réservation — toute la journée<input type="number" min="1" max="6" data-day="'+i+'" data-field="maxParty" value="'+day.maxParty+'"></label><p>Applique cette limite au midi, au soir et aux événements de ce jour. Les exceptions par heure peuvent ensuite être ajustées.</p></div>'
   +'<div class="lv-rts-services">'+serviceEditor(i,'lunch')+serviceEditor(i,'dinner')+'</div></div></article>';
 }).join('');
 const renderList=(selector,rows,kind)=>{
  $(selector).innerHTML=rows.length?rows.map(r=>'<div class="lv-item"><div><strong>'+esc(r.name)+'</strong><small>'+esc(kind==='special'?r.repeat+' · '+r.start+'–'+r.end:r.start+' → '+r.end)+'</small></div><button type="button" class="lv-text-action" data-remove="'+kind+'" data-id="'+esc(r.id)+'">Retirer</button></div>').join(''):'<p class="lv-muted">Aucune période enregistrée.</p>';
 };
 renderList('#lv-special-list',specials,'special');
 renderList('#lv-closure-list',closures,'closure');
}
// Forms for exceptional dates stay folded away until requested.
const scheduleArea=$('#admin-schedule');
for(const [key,title,detail] of [
 ['lv-special-form','Ajouter un service spécial','Brunch, soirée, événement récurrent'],
 ['lv-closure-form','Prévoir une fermeture','Congés ou fermeture exceptionnelle']
]){
 const form=$('#'+key,scheduleArea);
 if(!form)continue;
 const section=document.createElement('details');
 section.className='lv-action-fold';
 const summary=document.createElement('summary');
 summary.innerHTML='<span class="lv-fold-plus">+</span><span><strong>'+title+'</strong><small>'+detail+'</small></span>';
 form.before(section);section.append(summary,form);
}
const special=$('#lv-special-form',scheduleArea);
const recurrence=special?.querySelector('[name="repeat"]');
const recurrentDate=special?.querySelector('[name="weekday"]')?.closest('label');
if(recurrentDate&&!special.querySelector('[name="ordinal"]')){
 recurrentDate.insertAdjacentHTML('afterend','<label>Dans le mois<select name="ordinal"><option value="1">Premier</option><option value="2">Deuxième</option><option value="3">Troisième</option><option value="4">Quatrième</option><option value="-1">Dernier</option></select></label>');
}
const closure=$('#lv-closure-form',scheduleArea);
if(closure&&!closure.querySelector('[name="reopen"]')){
 closure.querySelector('.lv-form-grid')?.insertAdjacentHTML('beforeend','<label>Date de réouverture prévue<input type="date" name="reopen"></label>');
 closure.querySelector('[name="block"]')?.closest('label')?.insertAdjacentHTML('afterend','<label class="lv-check"><input type="checkbox" name="hours" checked> Signaler la fermeture dans la démo</label><label class="lv-check"><input type="checkbox" name="banner"> Prévoir un bandeau d’information (simulation)</label>');
}
register('schedule',renderSchedule);
const weekEl=$('#lv-schedule-week');
weekEl.addEventListener('click',event=>{
 const dayButton=event.target.closest('[data-open-day]');
 if(dayButton){
  const day=Number(dayButton.dataset.openDay);openedDays.has(day)?openedDays.delete(day):openedDays.add(day);renderSchedule();return;
 }
 const serviceButton=event.target.closest('[data-open-service]');
 if(serviceButton){
  const key=serviceButton.dataset.openService;
  openedServices.has(key)?openedServices.delete(key):openedServices.add(key);renderSchedule();return;
 }
 const slotButton=event.target.closest('[data-open-slots]');
 if(slotButton){
  const key=slotButton.dataset.openSlots;
  openedSlots.has(key)?openedSlots.delete(key):openedSlots.add(key);renderSchedule();
 }
});
weekEl.addEventListener('change',event=>{
 const input=event.target,dayIndex=Number(input.dataset.day);
 if(!Number.isInteger(dayIndex)||dayIndex<0||dayIndex>6)return;
 const day=week[dayIndex],service=input.dataset.service;
 if(input.dataset.slotField){
  if(!service||!input.dataset.time)return;
  const cfg=day[service],time=input.dataset.time;
  const slot=cfg.perSlot[time]||{capacity:cfg.capacity,maxParty:day.maxParty};
  slot[input.dataset.slotField]=input.dataset.slotField==='maxParty'?Math.min(day.maxParty,maxValue(input.value)):Math.max(0,Number(input.value)||0);
  cfg.perSlot[time]=slot;
  return;
 }
 const field=input.dataset.field;
 if(!field)return;
 if(field==='active'){day.active=input.checked;renderSchedule();return}
 if(field==='maxParty'){
  day.maxParty=maxValue(input.value);
  for(const kind of ['lunch','dinner']){
   for(const value of Object.values(day[kind].perSlot)){value.maxParty=Math.min(day.maxParty,maxValue(value.maxParty))}
  }
  renderSchedule();return;
 }
 if(!service||!day[service])return;
 const cfg=day[service];
 cfg[field]=['restaurantOpen','on'].includes(field)?input.checked:['interval','capacity'].includes(field)?Math.max(0,Number(input.value)||0):input.value;
 renderSchedule();
});
$('#lv-save-schedule').onclick=()=>{
 const errors=[];
 week.forEach((day,i)=>['lunch','dinner'].forEach(service=>{
  const cfg=day[service];
  if(toMinutes(cfg.open)>toMinutes(cfg.close)||toMinutes(cfg.start)>toMinutes(cfg.end)||
    toMinutes(cfg.start)<toMinutes(cfg.open)||toMinutes(cfg.end)>toMinutes(cfg.close)){
   errors.push(names[i]+' ('+(service==='lunch'?'midi':'soir')+')');
  }
 }));
 if(errors.length){notify('Vérifiez l’ouverture et les heures d’arrivée pour : '+errors.join(', '));return}
 save('week',week);api.refresh();renderSchedule();notify('Planning enregistré dans la démo.');
};
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
