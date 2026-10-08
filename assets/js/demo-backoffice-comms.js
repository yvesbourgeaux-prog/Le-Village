(()=>{
'use strict';
const app=document.getElementById('lv-demo-app'),extra=window.lvBOExtra;
if(!app||!extra)return;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const {esc,notify,id,allClients,formVals,load,save,register}=extra;
let templates=load('templates',[
 {id:'mail-confirm',name:'Confirmation de réservation',channel:'email',subject:'Votre réservation au Village',body:'Bonjour {prénom},\nVotre table est réservée pour le {date} à {heure}.\nAu plaisir de vous retrouver au Village !'},
 {id:'sms-remind',name:'Rappel de réservation',channel:'sms',subject:'',body:'Bonjour {prénom}, nous vous attendons demain à {heure} au Village. À bientôt !'}
]);
let campaigns=load('campaigns',[]);
let segments=load('segments',[]);
let automations=load('automations',[
 {id:'rule-confirm',name:'Confirmation de réservation',channel:'email',timing:'À la réservation',template:'mail-confirm',enabled:true},
 {id:'rule-reminder',name:'Rappel de la réservation',channel:'sms',timing:'La veille',template:'sms-remind',enabled:false},
 {id:'rule-thanks',name:'Message de remerciement',channel:'email',timing:'Le lendemain',template:'',enabled:false}
]);
const countRecipients=(segment,channel)=>{
 const cs=allClients();
 segment=String(segment||'all');
 const saved=segment.startsWith('seg:')?segments.find(s=>s.id===segment.slice(4)):null;
 return cs.filter(c=>{
  if(channel==='email'&&!c.consentEmail||channel==='sms'&&!c.consentSms)return false;
  if(saved){
   if(saved.consent==='email'&&!c.consentEmail||saved.consent==='sms'&&!c.consentSms)return false;
   if(saved.activity==='visited'&&!(c.visits>0)||saved.activity==='new'&&c.visits>0)return false;
   if(saved.tag&&!(c.tags||'').toLowerCase().includes(saved.tag.toLowerCase()))return false;
  }else if(segment==='visited'&&!(c.visits>0))return false;
  else if(segment==='email'&&!c.consentEmail||segment==='sms'&&!c.consentSms)return false;
  return channel==='email'?Boolean(c.email):Boolean(c.phone);
 }).length;
};
function renderSegments(){
 $('#lv-segment-list').innerHTML=segments.length?segments.map(seg=>
  '<div class="lv-item"><div><strong>'+esc(seg.name)+'</strong><small>'+esc(seg.activity)+' · '+esc(seg.consent)+' · '+esc(seg.tag||'Tous les tags')+'</small></div><button type="button" class="lv-text-action" data-delete-segment="'+esc(seg.id)+'">Retirer</button></div>'
 ).join(''):'<div class="lv-empty">Aucun segment enregistré.</div>';
 ['email','sms'].forEach(channel=>{
  const select=$('#lv-'+channel+'-form [name="segment"]');
  if(!select)return;
  const current=select.value;
  Array.from(select.querySelectorAll('[data-stored-segment]')).forEach(o=>o.remove());
  segments.forEach(seg=>{const option=document.createElement('option');option.value='seg:'+seg.id;option.textContent=seg.name;option.dataset.storedSegment='';select.append(option)});
  if(Array.from(select.options||[]).some(o=>o.value===current))select.value=current;
 });
}
register('segments',renderSegments);
$('#lv-segment-form').addEventListener('submit',e=>{
 e.preventDefault();segments.push({id:id(),...formVals(e.target)});save('segments',segments);e.target.reset();renderSegments();notify('Segment ajouté dans la démo.');
});
$('#lv-segment-list').addEventListener('click',e=>{
 const b=e.target.closest('[data-delete-segment]');if(!b)return;
 segments=segments.filter(seg=>seg.id!==b.dataset.deleteSegment);
 save('segments',segments);renderSegments();notify('Segment supprimé.');
});
function options(channel){return '<option value="">Choisir un modèle…</option>'+templates.filter(t=>t.channel===channel).map(t=>'<option value="'+esc(t.id)+'">'+esc(t.name)+'</option>').join('')}
function renderTemplates(){
 $('#lv-template-list').innerHTML=templates.length?templates.map(t=>
  '<div class="lv-item"><div><strong>'+esc(t.name)+'</strong><small>'+(t.channel==='email'?'E-mail':'SMS')+' · '+esc(t.subject||t.body.slice(0,45))+'</small></div><div class="lv-button-row"><button class="lv-text-action" data-edit-template="'+esc(t.id)+'">Modifier</button><button class="lv-text-action" data-delete-template="'+esc(t.id)+'">Retirer</button></div></div>'
 ).join(''):'<div class="lv-empty">Aucun modèle pour le moment.</div>';
 $('#lv-email-template').innerHTML=options('email');$('#lv-sms-template').innerHTML=options('sms');
 $('#lv-automation-template').innerHTML='<option value="">Aucun modèle</option>'+templates.map(t=>'<option value="'+esc(t.id)+'">'+esc(t.name)+'</option>').join('');
}
register('templates',renderTemplates);
const templateForm=$('#lv-template-form');
templateForm.addEventListener('submit',e=>{
 e.preventDefault();if(!e.target.reportValidity())return;
 const v=formVals(e.target);if(v.channel==='sms'&&v.body.length>918){notify('Maximum 918 caractères pour un SMS.');return}
 if(!v.id)v.id=id();
 const index=templates.findIndex(t=>t.id===v.id);
 if(index<0)templates.push(v);else templates[index]=v;
 save('templates',templates);e.target.reset();renderTemplates();notify('Modèle enregistré.');
});
$('#lv-template-list').addEventListener('click',e=>{
 const edit=e.target.closest('[data-edit-template]'),del=e.target.closest('[data-delete-template]');
 if(edit){const t=templates.find(t=>t.id===edit.dataset.editTemplate);if(!t)return;Object.entries(t).forEach(([k,v])=>{if(templateForm.elements[k])templateForm.elements[k].value=v});templateForm.scrollIntoView({behavior:'smooth',block:'start'})}
 if(del){templates=templates.filter(t=>t.id!==del.dataset.deleteTemplate);save('templates',templates);renderTemplates();notify('Modèle retiré.')}
});
function applyTemplate(channel,idVal){
 const t=templates.find(t=>t.id===idVal&&t.channel===channel);if(!t)return;
 const form=$('#lv-'+channel+'-form');form.elements.body.value=t.body;
 if(form.elements.subject)form.elements.subject.value=t.subject||'';
 updatePreview();updateSmsCount();
}
$('#lv-email-template').onchange=e=>applyTemplate('email',e.target.value);
$('#lv-sms-template').onchange=e=>applyTemplate('sms',e.target.value);
function updatePreview(){
 const f=$('#lv-email-form'),v=formVals(f),recipient=countRecipients(v.segment,'email');
 $('#lv-email-count').textContent=recipient+' destinataire(s) dans la démo';
 const body=esc(v.body||'Votre message apparaîtra ici.').replace(/\n/g,'<br>');
 $('#lv-email-preview').innerHTML='<div class="lv-preview-title">'+esc(v.subject||'Objet de votre e-mail')+'</div><div class="lv-preview-preheader">'+esc(v.preheader||'Aperçu du message')+'</div><div class="lv-preview-content">'+body+'</div><p class="lv-help">Simulation, aucun envoi.</p>';
}
function updateSmsCount(){
 const f=$('#lv-sms-form'),v=formVals(f),chars=String(v.body||'').length,parts=chars<=160?1:Math.ceil(chars/153);
 $('#lv-sms-count').textContent=chars+' caractère(s) · '+parts+' SMS / destinataire · '+countRecipients(v.segment,'sms')+' destinataire(s) de démonstration';
}
$('#lv-email-form').addEventListener('input',updatePreview);
$('#lv-sms-form').addEventListener('input',updateSmsCount);
function renderCampaigns(channel){
 const el=$('#lv-'+channel+'-history');
 const list=campaigns.filter(c=>c.channel===channel);
 el.innerHTML=list.length?list.slice().reverse().map(c=>
  '<div class="lv-item"><div><strong>'+esc(c.name||'Campagne sans nom')+'</strong><small>'+esc(c.subject||c.body.slice(0,55))+' · '+esc(c.status)+'</small></div><button type="button" class="lv-text-action" data-delete-campaign="'+esc(c.id)+'">Retirer</button></div>'
 ).join(''):'<div class="lv-empty">Aucune campagne enregistrée.</div>';
}
register('email',()=>{renderSegments();renderTemplates();updatePreview();renderCampaigns('email')});
register('sms',()=>{renderSegments();renderTemplates();updateSmsCount();renderCampaigns('sms')});
['email','sms'].forEach(channel=>{
 const form=$('#lv-'+channel+'-form');
 form.addEventListener('click',e=>{
  const btn=e.target.closest('[data-comms]');if(!btn)return;
  const action=btn.dataset.comms,values=formVals(form);
  if(!form.reportValidity())return;
  const targets=countRecipients(values.segment,channel);
  if(action==='test'){
   if(channel==='email'){updatePreview();notify('Aperçu test affiché. Aucun e-mail envoyé.')}
   else notify('Aperçu SMS : '+values.body.slice(0,120));
   return;
  }
  const status=action==='draft'?'Brouillon':action==='schedule'?'Programmation simulée':'Envoi simulé';
  campaigns.push({id:id(),channel,...values,status,targets,created:new Date().toISOString()});
  save('campaigns',campaigns);renderCampaigns(channel);
  notify(status+' · '+targets+' destinataire(s) simulé(s).');
 });
});
['email','sms'].forEach(channel=>$('#lv-'+channel+'-history').addEventListener('click',e=>{
 const b=e.target.closest('[data-delete-campaign]');if(!b)return;
 campaigns=campaigns.filter(c=>c.id!==b.dataset.deleteCampaign);save('campaigns',campaigns);renderCampaigns(channel)
}));
function renderAutomations(){
 $('#lv-automation-list').innerHTML=automations.map(rule=>{
  const template=templates.find(t=>t.id===rule.template);
  return '<article class="lv-automation"><div class="lv-automation-mark">'+(rule.channel==='email'?'@':'SMS')+'</div><div class="lv-automation-copy"><strong>'+esc(rule.name)+'</strong><span>'+esc(rule.timing)+' · '+(rule.channel==='email'?'E-mail':'SMS')+'</span><small>'+esc(template?.name||'Aucun modèle associé')+'</small></div><label class="lv-switch"><input type="checkbox" data-automation-toggle="'+esc(rule.id)+'" '+(rule.enabled?'checked':'')+'><span></span></label><button type="button" class="lv-text-action" data-automation-delete="'+esc(rule.id)+'">Retirer</button></article>';
 }).join('');
 renderTemplates();
}
register('automations',renderAutomations);
$('#lv-automation-list').addEventListener('change',e=>{
 const b=e.target.closest('[data-automation-toggle]');if(!b)return;
 const item=automations.find(a=>a.id===b.dataset.automationToggle);
 if(item){item.enabled=b.checked;save('automations',automations);notify('Scénario '+(b.checked?'activé':'désactivé')+' pour la démo, sans envoi réel.')}
});
$('#lv-automation-list').addEventListener('click',e=>{
 const b=e.target.closest('[data-automation-delete]');if(!b)return;
 automations=automations.filter(a=>a.id!==b.dataset.automationDelete);save('automations',automations);renderAutomations()
});
$('#lv-automation-form').addEventListener('submit',e=>{
 e.preventDefault();automations.push({id:id(),...formVals(e.target),enabled:false});save('automations',automations);e.target.reset();renderAutomations();notify('Scénario ajouté en pause.')
});
renderTemplates();
})();
