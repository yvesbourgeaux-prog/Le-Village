(()=>{
'use strict';
const root=document.getElementById('lv-reputation-root'),extra=window.lvBOExtra;
if(!root||!extra)return;
const $=(s,c=root)=>c.querySelector(s),$$=(s,c=root)=>Array.from(c.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const profiles={
 google:{source:'google',entity:'restaurant',name:'Fiche Google du Village',type:'Établissement'},
 restaurant:{source:'tripadvisor',entity:'restaurant',name:'Le Village · Restaurant',type:'Restaurant'},
 hotel:{source:'tripadvisor',entity:'hotel',name:'Le Grimaldi by Le Village',type:'Hôtel'}
};
let tab='google',place='restaurant',filter='all',editing=false,loading=false;
const cache={},links=extra.load('reputation-links',{google:{url:'',id:''},restaurant:{url:'',id:''},hotel:{url:'',id:''}});
const current=()=>tab==='google'?'google':place;
function urlAllowed(value,source){
 if(!value)return '';
 try{const u=new URL(value);if(u.protocol!=='https:')return '';
  const host=u.hostname.toLowerCase();
  const ok=source==='google'?(host==='google.com'||host.endsWith('.google.com')||['g.page','goo.gl','maps.app.goo.gl'].includes(host)):
   (host==='tripadvisor.com'||host.endsWith('.tripadvisor.com'));
  return ok?u.href:'';
 }catch{return ''}
}
const statusLabels={connected:'API active',not_connected:'À connecter',requires_license:'Accès à autoriser',connection_error:'Connexion à vérifier',configuration_error:'Configuration incomplète',loading:'Vérification…'};
const official={google:'https://business.google.com/',trip:'https://www.tripadvisor.com/Owners',googleDocs:'https://developers.google.com/my-business/content/basic-setup',tripDocs:'https://docs.terra.tripadvisor.com/docs/overview'};
function tabs(){
 return '<div class="lv-rep-tabs" role="tablist" aria-label="Plateforme">'
 +['google','tripadvisor'].map(k=>'<button type="button" role="tab" data-rep-tab="'+k+'" aria-selected="'+(tab===k)+'" class="'+(tab===k?'is-active':'')+'">'+(k==='google'?'Google':'Tripadvisor')+'</button>').join('')+'</div>'
 +(tab==='tripadvisor'?'<div class="lv-rep-places" role="tablist" aria-label="Fiches Tripadvisor">'
 +['restaurant','hotel'].map(k=>'<button type="button" role="tab" data-rep-place="'+k+'" aria-selected="'+(place===k)+'" class="'+(place===k?'is-active':'')+'">'+(k==='restaurant'?'Restaurant':'Hôtel')+'</button>').join('')+'</div>':'');
}
function rating(data){return data?.rating!=null&&Number.isFinite(Number(data.rating))?Number(data.rating).toLocaleString('fr-FR',{maximumFractionDigits:1}):'—'}
function total(data){return data?.total!=null&&Number.isFinite(Number(data.total))?Number(data.total).toLocaleString('fr-FR'):'—'}
function setup(key,p){
 const cfg=links[key]||{url:'',id:''};
 return '<section class="lv-rep-setup"><h3>Préparer cette fiche</h3><p>Repères publics sauvegardés uniquement sur cet appareil. Les clés API restent sur le serveur.</p>'
 +'<form id="lv-rep-config"><label>Lien public de la fiche<input name="url" type="url" placeholder="Adresse officielle Google ou Tripadvisor" value="'+esc(cfg.url)+'"></label>'
 +'<label>'+(p.source==='google'?'ID Google (facultatif)':'ID Tripadvisor de cette fiche')+'<input name="id" type="text" maxlength="100" value="'+esc(cfg.id)+'"></label>'
 +'<button class="lv-rep-primary" type="submit">Enregistrer les repères</button></form>'
 +'<p class="lv-rep-hint">Ce formulaire ne connecte pas l’API. Les autorisations et identifiants secrets seront configurés côté serveur.</p></section>';
}
function reviewMarkup(key,p,r,index){
 const answered=!!r.reply,draftKey='rep-draft-'+key+'-'+(r.id||index),draft=extra.load(draftKey,'');
 return '<article class="lv-rep-review"><div class="lv-rep-review-top"><div><strong>'+esc(r.author||'Visiteur')+'</strong><small>'+esc(r.date||'Date indisponible')+'</small></div><span class="lv-rep-review-rating">'+esc(r.rating??'—')+' / 5</span></div>'
 +(r.title?'<h4>'+esc(r.title)+'</h4>':'')+'<p>'+esc(r.text||'Avis sans commentaire')+'</p>'
 +(answered?'<div class="lv-rep-reply"><strong>Réponse publiée</strong><p>'+esc(r.reply)+'</p></div>':'')
 +(p.source==='google'&&!answered?'<details class="lv-rep-draft"><summary>Préparer une réponse</summary><textarea rows="4" maxlength="4000" data-rep-draft="'+esc(draftKey)+'">'+esc(draft)+'</textarea><button type="button" data-rep-save="'+esc(draftKey)+'">Enregistrer le brouillon</button><small>Pas de publication depuis la démo.</small></details>':'')
 +(p.source==='tripadvisor'?'<a href="'+official.trip+'" target="_blank" rel="noopener noreferrer" class="lv-rep-owner-link">Répondre depuis l’espace propriétaire Tripadvisor ↗</a>':'')+'</article>';
}
function render(){
 const key=current(),p=profiles[key],d=cache[key]||{status:'not_connected',reviews:[],rating:null,total:null},state=loading?'loading':d.status;
 const publicUrl=urlAllowed(links[key]?.url,p.source);
 const reviews=Array.isArray(d.reviews)?d.reviews:[];
 const filtered=reviews.filter(r=>filter==='all'||(filter==='pending'?!r.reply:!!r.reply));
 const connected=d.status==='connected';
 root.innerHTML=tabs()
 +'<section class="lv-rep-profile"><div class="lv-rep-profile-top"><span class="lv-rep-icon '+(p.source==='google'?'is-google':'is-trip')+'">'+(p.source==='google'?'G':'T')+'</span>'
 +'<div class="lv-rep-profile-title"><span class="lv-rep-eyebrow">'+esc(p.source==='google'?'Google Business Profile':'Tripadvisor')+' · '+esc(p.type)+'</span><h2>'+esc(d.name||p.name)+'</h2></div>'
 +'<span class="lv-rep-status '+(state==='connected'?'is-connected':state==='requires_license'?'is-warning':'')+'">'+esc(statusLabels[state]||'À connecter')+'</span></div>'
 +'<div class="lv-rep-metrics"><div><strong>'+rating(d)+' <small>/ 5</small></strong><span>Note</span></div><div><strong>'+total(d)+'</strong><span>Avis</span></div><div><strong>'+(connected?'Connectée':'Non connectée')+'</strong><span>Synchronisation</span></div></div>'
 +'<div class="lv-rep-actions"><button type="button" class="lv-rep-primary" data-rep-refresh '+(loading?'disabled':'')+'>'+(loading?'Vérification…':'Vérifier la connexion')+'</button>'
 +(publicUrl?'<a class="lv-rep-outline" href="'+esc(publicUrl)+'" target="_blank" rel="noopener noreferrer">Voir la fiche ↗</a>':'')
 +'<button type="button" class="lv-rep-text" data-rep-edit>'+ (editing?'Fermer les réglages':'Préparer la connexion')+'</button></div></section>'
 +(editing?setup(key,p):'')
 +'<section class="lv-rep-reviews"><div class="lv-rep-review-heading"><div><span class="lv-rep-eyebrow">VOS CLIENTS</span><h3>Avis récents</h3><p>Les avis restent séparés par plateforme et établissement.</p></div>'
 +'<div class="lv-rep-filters">'+[['all','Tous'],['pending','À répondre'],['answered','Répondus']].map(([k,label])=>'<button type="button" data-rep-filter="'+k+'" class="'+(filter===k?'is-active':'')+'">'+label+'</button>').join('')+'</div></div>'
 +(loading?'<div class="lv-rep-empty"><strong>Vérification en cours…</strong><p>Nous consultons la connexion à cette fiche.</p></div>':
 !connected?'<div class="lv-rep-empty"><span class="lv-rep-empty-mark">'+(p.source==='google'?'G':'T')+'</span><strong>'+(d.status==='requires_license'?'Autorisation Tripadvisor nécessaire':'Fiche non connectée')+'</strong><p>'+(d.message?esc(d.message):'Les avis apparaîtront ici après autorisation et connexion API.')+'</p></div>':
 !filtered.length?'<div class="lv-rep-empty"><strong>Aucun avis dans cette sélection</strong><p>Choisissez un autre filtre ou actualisez la connexion.</p></div>':
 '<div class="lv-rep-review-list">'+filtered.map((r,i)=>reviewMarkup(key,p,r,i)).join('')+'</div>')
 +'</section>'
 +'<section class="lv-rep-help"><div><span class="lv-rep-eyebrow">PROCHAINE ÉTAPE</span><h3>'+(p.source==='google'?'Connexion Google officielle':'Connexion Tripadvisor · '+p.type)+'</h3><p>'+(p.source==='google'?'Accès API approuvé, autorisation OAuth du propriétaire et identifiant de la fiche sont nécessaires. Les réponses publiées demanderont une connexion sécurisée.':'Les deux fiches Tripadvisor possèdent des identifiants distincts. L’usage en gestion de réputation nécessite les droits appropriés, au-delà de la simple Content API.')+'</p>'
 +'<a href="'+(p.source==='google'?official.googleDocs:official.tripDocs)+'" target="_blank" rel="noopener noreferrer">Documentation officielle ↗</a></div>'
 +'<div class="lv-rep-help-steps"><span>01 · Accès API autorisé</span><span>02 · Identifiants sécurisés sur serveur</span><span>03 · Synchronisation des avis</span></div></section>';
 bind();
}
function bind(){
 $$('[data-rep-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.repTab;filter='all';editing=false;render();loadActive()});
 $$('[data-rep-place]').forEach(b=>b.onclick=()=>{place=b.dataset.repPlace;filter='all';editing=false;render();loadActive()});
 $('[data-rep-refresh]')?.addEventListener('click',()=>loadActive(true));
 $('[data-rep-edit]')?.addEventListener('click',()=>{editing=!editing;render()});
 $$('[data-rep-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.repFilter;render()});
 $('#lv-rep-config')?.addEventListener('submit',event=>{
  event.preventDefault();const form=event.currentTarget,key=current(),p=profiles[key];
  const url=form.elements.url.value.trim(),id=form.elements.id.value.trim();
  if(url&&!urlAllowed(url,p.source)){extra.notify('Adresse publique Google ou Tripadvisor invalide.');return}
  if(id&&p.source==='tripadvisor'&&!/^\d{1,18}$/.test(id)){extra.notify('ID Tripadvisor numérique attendu.');return}
  links[key]={url,id};extra.save('reputation-links',links);editing=false;render();
  extra.notify('Repères enregistrés localement. L’API reste à connecter.');
 });
 $$('[data-rep-save]').forEach(b=>b.onclick=()=>{
  const field=$$('[data-rep-draft]').find(el=>el.dataset.repDraft===b.dataset.repSave);
  if(!field)return;extra.save(b.dataset.repSave,field.value);extra.notify('Brouillon enregistré. Aucune réponse publiée.');
 });
}
async function loadActive(force=false){
 const key=current(),p=profiles[key];
 if(cache[key]&&!force){render();return}
 loading=true;render();
 try{
  const res=await fetch('/demo-reputation-api.php?source='+encodeURIComponent(p.source)+'&entity='+encodeURIComponent(p.entity),{credentials:'same-origin',cache:'no-store'});
  const data=await res.json();
  cache[key]=data;
 }catch{cache[key]={status:'connection_error',message:'Connexion au serveur indisponible.',rating:null,total:null,reviews:[]}}
 loading=false;if(current()===key)render();
}
extra.register('reputation',()=>{render();loadActive()});
})();
