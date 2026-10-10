(()=>{
'use strict';
const root=document.getElementById('lv-reputation-root'),extra=window.lvBOExtra;
if(!root||!extra)return;
const $=(s,c=root)=>c.querySelector(s),$$=(s,c=root)=>Array.from(c.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const profile={source:'google',entity:'restaurant',name:'Fiche Google du Village',type:'Établissement'};
let filter='all',editing=false,loading=false;
let cache=null;
const storedLinks=extra.load('reputation-links',{google:{url:'',id:''}}),links={google:storedLinks?.google||{url:'',id:''}},key='google';
extra.save('reputation-links',links);
const official={google:'https://business.google.com/',docs:'https://developers.google.com/my-business/content/basic-setup'};
function urlAllowed(value){
 if(!value)return '';
 try{const u=new URL(value);if(u.protocol!=='https:')return '';
  const host=u.hostname.toLowerCase(),domain=d=>host===d||host.endsWith('.'+d);
  return domain('google.com')||domain('google.fr')||['g.page','goo.gl','maps.app.goo.gl'].includes(host)?u.href:'';
 }catch{return ''}
}
const statusLabels={connected:'API active',not_connected:'À connecter',connection_error:'Connexion à vérifier',configuration_error:'Configuration incomplète',loading:'Vérification…'};
function rating(data){return data?.rating!=null&&Number.isFinite(Number(data.rating))?Number(data.rating).toLocaleString('fr-FR',{maximumFractionDigits:1}):'—'}
function total(data){return data?.total!=null&&Number.isFinite(Number(data.total))?Number(data.total).toLocaleString('fr-FR'):'—'}
function setup(){
 const cfg=links[key]||{url:'',id:''};
 return '<section class="lv-rep-setup"><h3>Préparer cette fiche</h3><p>Repères publics sauvegardés uniquement sur cet appareil. Les clés API restent sur le serveur.</p>'
 +'<form id="lv-rep-config"><label>Lien public de la fiche<input name="url" type="url" placeholder="Adresse officielle Google" value="'+esc(cfg.url)+'"></label>'
 +'<label>ID Google (facultatif)<input name="id" type="text" maxlength="100" value="'+esc(cfg.id)+'"></label>'
 +'<button class="lv-rep-primary" type="submit">Enregistrer les repères</button></form>'
 +'<p class="lv-rep-hint">Ce formulaire ne connecte pas l’API. Les autorisations et identifiants secrets seront configurés côté serveur.</p></section>';
}
function reviewMarkup(r,index){
 const answered=!!r.reply,draftKey='rep-draft-google-'+(r.id||index),draft=extra.load(draftKey,'');
 return '<article class="lv-rep-review"><div class="lv-rep-review-top"><div><strong>'+esc(r.author||'Visiteur')+'</strong><small>'+esc(r.date||'Date indisponible')+'</small></div><span class="lv-rep-review-rating">'+esc(r.rating??'—')+' / 5</span></div>'
 +(r.title?'<h4>'+esc(r.title)+'</h4>':'')+'<p>'+esc(r.text||'Avis sans commentaire')+'</p>'
 +(answered?'<div class="lv-rep-reply"><strong>Réponse publiée</strong><p>'+esc(r.reply)+'</p></div>':'')
 +(!answered?'<details class="lv-rep-draft"><summary>Préparer une réponse</summary><textarea rows="4" maxlength="4000" data-rep-draft="'+esc(draftKey)+'">'+esc(draft)+'</textarea><button type="button" data-rep-save="'+esc(draftKey)+'">Enregistrer le brouillon</button><small>Pas de publication depuis la démo.</small></details>':'')
 +(r.replyUrl&&urlAllowed(r.replyUrl)?'<a href="'+esc(urlAllowed(r.replyUrl))+'" target="_blank" rel="noopener noreferrer" class="lv-rep-owner-link">Ouvrir l’avis sur Google ↗</a>':'')+'</article>';
}
function render(){
 const d=cache||{status:'not_connected',reviews:[],rating:null,total:null},state=loading?'loading':d.status;
 const publicUrl=urlAllowed(links[key]?.url),reviews=Array.isArray(d.reviews)?d.reviews:[];
 const filtered=reviews.filter(r=>filter==='all'||(filter==='pending'?!r.reply:!!r.reply)),connected=d.status==='connected';
 root.innerHTML='<section class="lv-rep-profile"><div class="lv-rep-profile-top"><span class="lv-rep-icon is-google">G</span>'
 +'<div class="lv-rep-profile-title"><span class="lv-rep-eyebrow">Google Business Profile · '+esc(profile.type)+'</span><h2>'+esc(d.name||profile.name)+'</h2></div>'
 +'<span class="lv-rep-status '+(state==='connected'?'is-connected':'')+'">'+esc(statusLabels[state]||'À connecter')+'</span></div>'
 +'<div class="lv-rep-metrics"><div><strong>'+rating(d)+' <small>/ 5</small></strong><span>Note</span></div><div><strong>'+total(d)+'</strong><span>Avis</span></div><div><strong>'+(connected?'Connectée':'Non connectée')+'</strong><span>Synchronisation</span></div></div>'
 +'<div class="lv-rep-actions"><button type="button" class="lv-rep-primary" data-rep-refresh '+(loading?'disabled':'')+'>'+(loading?'Vérification…':'Vérifier la connexion')+'</button>'
 +(publicUrl?'<a class="lv-rep-outline" href="'+esc(publicUrl)+'" target="_blank" rel="noopener noreferrer">Voir la fiche ↗</a>':'')
 +'<a class="lv-rep-outline" href="'+official.google+'" target="_blank" rel="noopener noreferrer">Gérer sur Google ↗</a>'
 +'<button type="button" class="lv-rep-text" data-rep-edit>'+ (editing?'Fermer les réglages':'Préparer la connexion')+'</button></div></section>'
 +(editing?setup():'')
 +'<section class="lv-rep-reviews"><div class="lv-rep-review-heading"><div><span class="lv-rep-eyebrow">VOS CLIENTS</span><h3>Avis récents</h3><p>Les avis de la fiche Google du restaurant.</p></div>'
 +'<div class="lv-rep-filters">'+[['all','Tous'],['pending','À répondre'],['answered','Répondus']].map(([k,label])=>'<button type="button" data-rep-filter="'+k+'" class="'+(filter===k?'is-active':'')+'">'+label+'</button>').join('')+'</div></div>'
 +(loading?'<div class="lv-rep-empty"><strong>Vérification en cours…</strong><p>Nous consultons la connexion à cette fiche.</p></div>':
 !connected?'<div class="lv-rep-empty"><span class="lv-rep-empty-mark">G</span><strong>Fiche non connectée</strong><p>'+(d.message?esc(d.message):'Les avis apparaîtront ici après autorisation et connexion API.')+'</p></div>':
 !filtered.length?'<div class="lv-rep-empty"><strong>Aucun avis dans cette sélection</strong><p>Choisissez un autre filtre ou actualisez la connexion.</p></div>':
 '<div class="lv-rep-review-list">'+filtered.map((r,i)=>reviewMarkup(r,i)).join('')+'</div>')
 +'</section><section class="lv-rep-help"><div><span class="lv-rep-eyebrow">PROCHAINE ÉTAPE</span><h3>Connexion Google officielle</h3><p>Accès API approuvé, autorisation OAuth du propriétaire et identifiant de la fiche sont nécessaires. Les réponses publiées demanderont une connexion sécurisée.</p>'
 +'<a href="'+official.docs+'" target="_blank" rel="noopener noreferrer">Documentation officielle ↗</a></div>'
 +'<div class="lv-rep-help-steps"><span>01 · Accès API autorisé</span><span>02 · Identifiants sécurisés sur serveur</span><span>03 · Synchronisation des avis</span></div></section>';
 bind();
}
function bind(){
 $('[data-rep-refresh]')?.addEventListener('click',()=>loadActive(true));
 $('[data-rep-edit]')?.addEventListener('click',()=>{editing=!editing;render()});
 $$('[data-rep-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.repFilter;render()});
 $('#lv-rep-config')?.addEventListener('submit',event=>{
  event.preventDefault();const form=event.currentTarget,url=form.elements.url.value.trim(),id=form.elements.id.value.trim();
  if(url&&!urlAllowed(url)){extra.notify('Adresse publique Google invalide.');return}
  links[key]={url,id};extra.save('reputation-links',links);editing=false;render();
  extra.notify('Repères enregistrés localement. L’API reste à connecter.');
 });
 $$('[data-rep-save]').forEach(b=>b.onclick=()=>{
  const field=$$('[data-rep-draft]').find(el=>el.dataset.repDraft===b.dataset.repSave);
  if(!field)return;extra.save(b.dataset.repSave,field.value);extra.notify('Brouillon enregistré. Aucune réponse publiée.');
 });
}
async function loadActive(force=false){
 if(cache&&!force){render();return}
 loading=true;render();
 try{
  const res=await fetch('/demo-reputation-api.php?source=google&entity=restaurant',{credentials:'same-origin',cache:'no-store'});
  cache=await res.json();
 }catch{cache={status:'connection_error',message:'Connexion au serveur indisponible.',rating:null,total:null,reviews:[]}}
 loading=false;render();
}
extra.register('reputation',()=>{render();loadActive()});
})();
