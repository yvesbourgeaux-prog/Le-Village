(()=>{
'use strict';
const extra=window.lvBOExtra,api='/demo-meta-actions-api.php';
if(!extra)return;
const esc=extra.esc;
let csrf='';
const label={facebook:'Facebook',instagram:'Instagram',messenger:'Messenger'};
async function fetchView(mode){const r=await fetch(api+'?mode='+mode,{credentials:'same-origin',cache:'no-store'});const j=await r.json();if(!r.ok)throw Error(j.message||'Meta indisponible.');csrf=j.csrf;return j}
async function send(body){const r=await fetch(api,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,csrf})});const j=await r.json();if(!r.ok)throw Error(j.message||'Envoi impossible.');return j}
function status(data){return Object.entries(data.status||{}).filter(([,v])=>v!=='ok').map(([n,v])=>'<p class="lv-meta-warning">'+esc(label[n]||n)+' : '+esc(v)+'</p>').join('')}
async function comments(){
 const root=document.getElementById('lv-meta-comments-root');if(!root)return;
 root.innerHTML='<p>Chargement des commentaires…</p>';
 try{const d=await fetchView('comments');root.innerHTML='<div class="lv-meta-actions-head"><h2>Commentaires Facebook et Instagram</h2><button class="lv-soft-button" data-refresh>Actualiser</button></div>'+status(d)+(d.items.length?d.items.map(x=>'<article class="lv-meta-action-card"><small>'+esc(label[x.network])+' · '+esc(x.date)+'</small><h3>'+esc(x.author)+'</h3><p>'+esc(x.text)+'</p><small>Sur : '+esc(x.post_text||'Publication')+'</small><form data-reply-comment="'+esc(x.id)+'" data-network="'+esc(x.network)+'"><textarea required maxlength="5000" rows="2" placeholder="Votre réponse publique"></textarea><button class="lv-action">Répondre</button></form></article>').join(''):'<p>Aucun commentaire récent accessible.</p>');
 root.querySelector('[data-refresh]').onclick=comments;
 root.querySelectorAll('form[data-reply-comment]').forEach(f=>f.onsubmit=async e=>{e.preventDefault();const b=f.querySelector('button');b.disabled=true;try{await send({action:'reply_comment',id:f.dataset.replyComment,network:f.dataset.network,message:f.querySelector('textarea').value});extra.notify('Réponse publiée.');await comments()}catch(err){extra.notify(err.message);b.disabled=false}});
 }catch(err){root.textContent=err.message}
}
async function inbox(){
 const root=document.getElementById('lv-meta-inbox-root');if(!root)return;
 root.innerHTML='<p>Chargement des conversations…</p>';
 try{const d=await fetchView('inbox');root.innerHTML='<div class="lv-meta-actions-head"><h2>Messages Instagram et Messenger</h2><button class="lv-soft-button" data-refresh>Actualiser</button></div>'+status(d)+(d.items.length?d.items.map(x=>'<article class="lv-meta-action-card"><small>'+esc(label[x.network])+' · '+esc(x.updated)+'</small><h3>'+esc(x.person)+'</h3><div class="lv-meta-thread">'+x.messages.slice().reverse().map(m=>'<p><small>'+esc(m.from)+' · '+esc(m.date)+'</small><br>'+esc(m.text||'[Pièce jointe]')+'</p>').join('')+'</div><form data-reply-message="'+esc(x.id)+'" data-network="'+esc(x.network)+'"><textarea required maxlength="5000" rows="2" placeholder="Votre réponse privée"></textarea><button class="lv-action">Envoyer</button></form></article>').join(''):'<p>Aucune conversation récente accessible.</p>');
 root.querySelector('[data-refresh]').onclick=inbox;
 root.querySelectorAll('form[data-reply-message]').forEach(f=>f.onsubmit=async e=>{e.preventDefault();const b=f.querySelector('button');b.disabled=true;try{await send({action:'reply_message',id:f.dataset.replyMessage,network:f.dataset.network,message:f.querySelector('textarea').value});extra.notify('Message envoyé.');await inbox()}catch(err){extra.notify(err.message);b.disabled=false}});
 }catch(err){root.textContent=err.message}
}
extra.register('meta_comments',comments);
extra.register('meta_inbox',inbox);
})();
