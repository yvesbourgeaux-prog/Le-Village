(()=>{
'use strict';
const root=document.getElementById('lv-editorial-root'),extra=window.lvBOExtra;
if(!root||!extra)return;
const esc=extra.esc,api='/demo-meta-editorial-api.php';
let items=[],csrf='',loaded=false,busy=false,editing='',month=new Date();
month=new Date(month.getFullYear(),month.getMonth(),1);
const pad=n=>String(n).padStart(2,'0');
const dayKey=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const human=d=>new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric'}).format(d);
const sameMonth=date=>date.slice(0,7)===dayKey(month).slice(0,7);
function calendar(){
 const offset=(new Date(month.getFullYear(),month.getMonth(),1).getDay()+6)%7;
 const days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
 let html='<div class="lv-editorial-weekdays">'+['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(x=>'<span>'+x+'</span>').join('')+'</div><div class="lv-editorial-grid">';
 for(let i=0;i<offset;i++)html+='<div class="is-empty"></div>';
 for(let day=1;day<=days;day++){
  const date=dayKey(new Date(month.getFullYear(),month.getMonth(),day));
  const today=date===dayKey(new Date());
  const posts=items.filter(item=>item.date?.startsWith(date));
  html+='<button type="button" class="lv-editorial-day '+(today?'is-today':'')+'" data-editorial-day="'+date+'"><strong>'+day+'</strong>'+
   posts.map(item=>'<span class="lv-editorial-chip">'+esc(item.date.slice(11))+' · '+esc(item.title)+'</span>').join('')+'</button>';
 }
 return html+'</div>';
}
function form(item={},date=''){
 const initial=date||item.date?.slice(0,10)||dayKey(new Date());
 return '<form id="lv-editorial-form"><input type="hidden" name="id" value="'+esc(item.id||'')+'"><h3>'+(item.id?'Modifier le contenu':'Préparer un contenu')+'</h3>'+
  '<label>Titre interne<input name="title" maxlength="140" required value="'+esc(item.title||'')+'" placeholder="Ex. Menu d’automne"></label>'+
  '<div class="lv-editorial-two"><label>Date prévue<input type="date" name="day" required value="'+esc(initial)+'"></label><label>Heure<input type="time" name="time" required value="'+esc(item.date?.slice(11)||'12:00')+'"></label></div>'+
  '<label>Format<select name="format">'+['Publication','Reel','Story'].map(x=>'<option '+(item.format===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label>'+
  '<fieldset><legend>Réseaux</legend><label><input type="checkbox" name="facebook" '+(item.networks?.includes('facebook')||!item.id?'checked':'')+'> Facebook</label><label><input type="checkbox" name="instagram" '+(item.networks?.includes('instagram')||!item.id?'checked':'')+'> Instagram</label></fieldset>'+
  '<label>Texte<textarea name="caption" rows="5" maxlength="5000" placeholder="Légende du contenu">'+esc(item.caption||'')+'</textarea></label>'+
  '<label>URL publique du média, si disponible<input type="url" name="media" value="'+esc(item.media||'')+'" placeholder="https://…"></label>'+
  '<div class="lv-editorial-actions"><button type="submit" class="lv-action" '+(busy||item.status==='published'?'disabled':'')+'>Enregistrer dans le calendrier</button>'+
  (item.id&&item.status!=='published'?'<button type="button" class="lv-soft-button" data-editorial-publish="'+esc(item.id)+'">Publier maintenant</button>':'')+
  (item.id&&item.status!=='published'?'<button type="button" class="lv-editorial-delete" data-editorial-delete="'+esc(item.id)+'">Supprimer</button>':'')+'</div>'+
  (item.published?'<p>Publié sur : '+esc(Object.keys(item.published).join(', '))+'</p>':'')+
  (item.errors?'<p class="lv-meta-warning">'+esc(Object.entries(item.errors).map(([n,e])=>n+' : '+e).join(' · '))+'</p>':'')+'</form>';
}
function render(date=''){
 const item=items.find(x=>x.id===editing)||{};
 const visible=items.filter(x=>sameMonth(x.date||''));
 root.innerHTML='<div class="lv-editorial-intro"><div><h2>Calendrier éditorial</h2><p>Préparez vos contenus puis publiez-les depuis le calendrier. La date prévue organise le planning ; l’envoi automatique à cette date sera activé après la configuration du programmateur serveur.</p></div><div class="lv-editorial-month"><button type="button" data-editorial-month="-1" aria-label="Mois précédent">‹</button><strong>'+esc(human(month))+'</strong><button type="button" data-editorial-month="1" aria-label="Mois suivant">›</button></div></div>'+
  '<div class="lv-editorial-layout"><div class="lv-editorial-calendar">'+calendar()+'<div class="lv-editorial-list"><h3>Contenus du mois ('+visible.length+')</h3>'+
  (visible.length?visible.map(x=>'<button type="button" data-editorial-edit="'+esc(x.id)+'"><time>'+esc(x.date.replace('T',' · '))+'</time><b>'+esc(x.title)+'</b><small>'+esc(x.networks.join(' + '))+' · '+esc(x.format)+'</small></button>').join(''):'<p>Aucun contenu prévu ce mois-ci.</p>')+'</div></div><div class="lv-editorial-form">'+form(item,date)+'</div></div>';
 root.querySelectorAll('[data-editorial-month]').forEach(button=>button.onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()+Number(button.dataset.editorialMonth),1);editing='';render()});
 root.querySelectorAll('[data-editorial-day]').forEach(button=>button.onclick=()=>{editing='';render(button.dataset.editorialDay)});
 root.querySelectorAll('[data-editorial-edit]').forEach(button=>button.onclick=()=>{editing=button.dataset.editorialEdit;render()});
 root.querySelector('[data-editorial-delete]')?.addEventListener('click',async event=>{if(!confirm('Supprimer ce contenu du calendrier ?'))return;await change({action:'delete',id:event.target.dataset.editorialDelete})});
 root.querySelector('[data-editorial-publish]')?.addEventListener('click',async event=>{
  const id=event.target.dataset.editorialPublish, post=items.find(x=>x.id===id);
  if(!post||busy||!confirm('Publier maintenant « '+post.title+' » sur '+post.networks.join(' et ')+' ?'))return;
  busy=true;event.target.disabled=true;
  try{const response=await fetch('/demo-meta-publish-api.php',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,csrf})});const result=await response.json();if(!response.ok)throw Error(result.message||'Publication impossible.');extra.notify(result.message);loaded=false;await load();editing=id;render()}
  catch(error){extra.notify(error.message);event.target.disabled=false}
  finally{busy=false}
 });
 root.querySelector('#lv-editorial-form')?.addEventListener('submit',async event=>{
  event.preventDefault();const f=new FormData(event.target);
  await change({action:'save',id:f.get('id'),title:f.get('title'),date:f.get('day')+'T'+f.get('time'),format:f.get('format'),caption:f.get('caption'),media:f.get('media'),networks:['facebook','instagram'].filter(x=>f.get(x))});
 });
}
async function change(payload){
 if(busy)return;busy=true;
 try{
  const response=await fetch(api,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,csrf})});
  const result=await response.json();if(!response.ok)throw Error(result.message||'Enregistrement impossible.');
  items=result.items;csrf=result.csrf;editing='';render();extra.notify('Calendrier enregistré.');
 }catch(error){extra.notify(error.message)}finally{busy=false}
}
async function load(){
 if(loaded){render();return}root.innerHTML='<p>Chargement du calendrier…</p>';
 try{const response=await fetch(api,{credentials:'same-origin',cache:'no-store'});const result=await response.json();if(!response.ok)throw Error(result.message||'Calendrier indisponible.');items=result.items||[];csrf=result.csrf;loaded=true;render()}
 catch(error){root.textContent=error.message}
}
extra.register('editorial',load);
})();
