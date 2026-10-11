(()=>{
'use strict';
const root=document.getElementById('lv-meta-root'),extra=window.lvBOExtra;
if(!root||!extra)return;
const esc=extra.esc,fmt=v=>Number.isFinite(Number(v))?Number(v).toLocaleString('fr-FR'):'—';
let platform='facebook',preset='28',compare='none',customSince='',customUntil='',data=null,loading=false,loadedAt=0;
const labels={connected:'Connecté',partial:'Données partielles',not_connected:'À connecter',connection_error:'Connexion à vérifier'};
const metricSpecs={
 facebook:[
  ['views','Vues','Nombre total de vues des contenus'],
  ['viewers','Spectateurs uniques','Personnes ayant vu les contenus'],
  ['interactions','Interactions avec le contenu','Réactions, commentaires, partages et clics'],
  ['visits','Visites de la Page','Consultations de la Page Facebook'],
  ['follows','Followers en plus','Abonnements gagnés pendant la période']
 ],
 instagram:[
  ['views','Vues','Nombre total de vues des contenus'],
  ['reach','Couverture','Comptes touchés par les contenus'],
  ['interactions','Interactions avec le contenu','Réactions, commentaires, partages et enregistrements'],
  ['profileViews','Visites du profil','Consultations du profil Instagram'],
  ['follows','Followers en plus','Abonnements gagnés pendant la période']
 ]
};
function dateLabel(value){try{return new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short'}).format(new Date(value+'T12:00:00'))}catch{return value}}
function chartMode(){const days=Number(data?.range?.days)||0;return days>=300?'month':days>=60?'week':'day'}
function chartSeries(rows,key,mode){
 const groups=new Map();
 rows.forEach(row=>{
  const date=String(row.date||'').slice(0,10);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return;
  let group=date;
  if(mode==='month')group=date.slice(0,7);
  if(mode==='week'){const monday=new Date(date+'T00:00:00Z');monday.setUTCDate(monday.getUTCDate()-((monday.getUTCDay()+6)%7));group=monday.toISOString().slice(0,10)}
  if(!groups.has(group))groups.set(group,{start:date,end:date,value:0});
  const point=groups.get(group),value=Number(row[key]);
  point.start=point.start<date?point.start:date;
  point.end=point.end>date?point.end:date;
  if(Number.isFinite(value))point.value+=value;
 });
 return [...groups.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([,point])=>point);
}
function chartPeriod(point,mode){
 if(mode==='month')return new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric'}).format(new Date(point.start+'T12:00:00'));
 return point.start===point.end?dateLabel(point.start):dateLabel(point.start)+' – '+dateLabel(point.end);
}
function lineChart(rows,key,label,color,kind){
 if(!rows?.length)return '<div class="lv-meta-empty-chart">La courbe apparaîtra dès que Meta renverra cet indicateur.</div>';
 const mode=chartMode(),shown=chartSeries(rows,key,mode);
 if(!shown.length)return '<div class="lv-meta-empty-chart">Aucune donnée disponible pour cette période.</div>';
 const width=760,height=220,pad={l:46,r:18,t:20,b:34},values=shown.map(r=>r.value),max=Math.max(1,...values);
 const x=i=>pad.l+(shown.length===1?0:(i*(width-pad.l-pad.r)/(shown.length-1))),y=v=>pad.t+(height-pad.t-pad.b)*(1-v/max);
 const path=shown.map((r,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(values[i]).toFixed(1)).join(' ');
 const grid=[0,.5,1].map(p=>{const yy=pad.t+(height-pad.t-pad.b)*p,val=Math.round(max*(1-p));return '<g><line x1="'+pad.l+'" y1="'+yy+'" x2="'+(width-pad.r)+'" y2="'+yy+'"/><text x="'+(pad.l-8)+'" y="'+(yy+4)+'">'+fmt(val)+'</text></g>'}).join('');
 const points=shown.map((r,i)=>'<circle cx="'+x(i)+'" cy="'+y(values[i])+'" r="3.5" data-chart-point="'+i+'" data-chart-date="'+esc(chartPeriod(r,mode))+'" data-chart-value="'+esc(fmt(r.value))+'"/>').join('');
 const ticks=[0,Math.floor((shown.length-1)/2),shown.length-1].filter((v,i,a)=>a.indexOf(v)===i).map(i=>'<text class="lv-meta-x" x="'+x(i)+'" y="'+(height-7)+'">'+esc(mode==='month'?new Intl.DateTimeFormat('fr-FR',{month:'short',year:'2-digit'}).format(new Date(shown[i].start+'T12:00:00')):dateLabel(shown[i].start))+'</text>').join('');
 return '<div class="lv-meta-chart" data-chart-label="'+esc(label)+'" style="--chart:'+color+'"><svg viewBox="0 0 '+width+' '+height+'" role="img" aria-label="Évolution de '+esc(label)+'"><g class="lv-meta-grid">'+grid+'</g><path class="lv-meta-line" d="'+path+'"/>'+points+ticks+'<line class="lv-meta-cursor" y1="'+pad.t+'" y2="'+(height-pad.b)+'"/></svg><div class="lv-meta-tooltip"></div></div>';
}
function status(item){const state=item?.status||'not_connected';return '<span class="lv-meta-status '+(state==='connected'?'is-connected':state==='partial'?'is-partial':'')+'">'+esc(labels[state]||'À vérifier')+'</span>'}
function delta(value,previous){
 if(compare==='none'||previous===null||previous===undefined||!Number.isFinite(Number(value))||!Number.isFinite(Number(previous)))return '';
 const current=Number(value),base=Number(previous);
 if(base===0)return current>0?'<em class="is-up">Nouveau</em>':'<em>0 %</em>';
 const change=((current-base)/Math.abs(base))*100,rounded=Math.round(change*10)/10;
 return '<em class="'+(change>0?'is-up':change<0?'is-down':'')+'">'+(change>0?'↑ +':change<0?'↓ ':'')+String(rounded).replace('.',',')+' %</em>';
}
function platformPage(kind,item){
 const facebook=kind==='facebook',color=facebook?'#1877f2':'#c13584',series=item?.series||[],previous=item?.comparison||{};
 const metrics=metricSpecs[kind].map(([key,label,help],index)=>'<article class="lv-meta-stat '+(index===0?'is-main':'')+'"><div class="lv-meta-stat-head"><div><span>'+esc(label)+'</span><div><strong>'+fmt(item?.[key])+'</strong>'+delta(item?.[key],previous?.[key])+'</div><small>'+esc(help)+'</small></div></div>'+lineChart(series,key,label,color,kind)+'</article>').join('');
 const updated=data?.updatedAt?new Intl.DateTimeFormat('fr-FR',{dateStyle:'short',timeStyle:'short'}).format(new Date(data.updatedAt)):'Connexion en attente';
 return '<section class="lv-meta-platform-page"><header class="lv-meta-page-head"><div class="lv-meta-brand '+(facebook?'is-fb':'is-ig')+'">'+(facebook?'f':'◎')+'</div><div><span>'+(facebook?'FACEBOOK':'INSTAGRAM')+'</span><h2>'+esc(item?.name||(facebook?'Restaurant Le Village':'@restaurantlevillagehdc'))+'</h2><p>'+esc(data?.range?.label||'Période choisie')+(data?.comparisonRange?' · comparée avec '+esc(data.comparisonRange.label.toLowerCase()):'')+'</p></div><div class="lv-meta-page-state">'+status(item)+'<small>Mis à jour '+esc(updated)+'</small></div></header>'
  +(item?.message?'<p class="lv-meta-warning">'+esc(item.message)+'</p>':'')
  +(!facebook&&item?.cumulativeWindows?'<p class="lv-meta-note">Sur une longue période, la couverture est additionnée par tranches de 28 jours ; un même compte peut donc apparaître dans plusieurs tranches.</p>':'')
  +(chartMode()==='day'?'':'<p class="lv-meta-note">Courbes regroupées par '+(chartMode()==='week'?'semaine':'mois')+'. Les chiffres en haut de chaque carte portent sur toute la période.</p>')
  +'<div class="lv-meta-stat-grid">'+metrics+'</div></section>';
}
function bindCharts(){
 root.querySelectorAll('.lv-meta-chart').forEach(chart=>{
  const svg=chart.querySelector('svg'),line=chart.querySelector('.lv-meta-cursor'),tip=chart.querySelector('.lv-meta-tooltip'),points=[...chart.querySelectorAll('[data-chart-point]')],label=chart.dataset.chartLabel;
  if(!points.length)return;
  const move=event=>{const rect=svg.getBoundingClientRect(),ratio=(event.clientX-rect.left)/rect.width,viewX=Math.max(0,Math.min(760,ratio*760));let best=points[0],dist=Infinity;points.forEach(p=>{const d=Math.abs(Number(p.getAttribute('cx'))-viewX);if(d<dist){dist=d;best=p}});const cx=best.getAttribute('cx');line.setAttribute('x1',cx);line.setAttribute('x2',cx);line.classList.add('is-visible');tip.innerHTML='<strong>'+esc(best.dataset.chartDate)+'</strong><span>'+esc(best.dataset.chartValue)+' '+esc(label.toLowerCase())+'</span>';tip.style.left=Math.min(82,Math.max(4,(Number(cx)/760)*100))+'%';tip.classList.add('is-visible')};
  chart.onpointermove=move;chart.onpointerleave=()=>{line.classList.remove('is-visible');tip.classList.remove('is-visible')};
 });
}
function render(){
 const today=new Date(),iso=d=>d.toISOString().slice(0,10);
 if(!customUntil)customUntil=iso(today);
 if(!customSince){const start=new Date(today);start.setDate(start.getDate()-27);customSince=iso(start)}
 const periodOptions=[['7','7 derniers jours'],['28','28 derniers jours'],['90','90 derniers jours'],['180','6 derniers mois'],['365','12 derniers mois'],['ytd','Cette année'],['last_year','Année précédente'],['custom','Personnalisé']];
 const controls='<div class="lv-meta-filters"><label><span>Réseau</span><select data-meta-platform><option value="facebook" '+(platform==='facebook'?'selected':'')+'>Facebook</option><option value="instagram" '+(platform==='instagram'?'selected':'')+'>Instagram</option></select></label>'
  +'<label><span>Période</span><select data-meta-preset>'+periodOptions.map(([value,label])=>'<option value="'+value+'" '+(preset===value?'selected':'')+'>'+label+'</option>').join('')+'</select></label>'
  +(preset==='custom'?'<label><span>Du</span><input type="date" data-meta-since value="'+esc(customSince)+'" max="'+iso(today)+'"></label><label><span>Au</span><input type="date" data-meta-until value="'+esc(customUntil)+'" max="'+iso(today)+'"></label>':'')
  +'<label class="lv-meta-compare"><span>Comparer</span><select data-meta-compare><option value="none" '+(compare==='none'?'selected':'')+'>Sans comparaison</option><option value="previous" '+(compare==='previous'?'selected':'')+'>Période précédente</option><option value="year" '+(compare==='year'?'selected':'')+'>Même période l’an dernier</option></select></label>'
  +(preset==='custom'?'<button type="button" class="lv-meta-apply" data-meta-apply>Afficher</button>':'')+'</div>';
 const item=data?.[platform],needsSetup=item?.status==='not_connected';
 root.innerHTML='<div class="lv-meta-toolbar">'+controls+'<div class="lv-meta-toolbar-actions">'+(needsSetup?'<a class="lv-meta-connect" href="/demo-meta-setup.php">Connecter Meta</a>':'')+'<button type="button" class="lv-meta-refresh" data-meta-refresh '+(loading?'disabled':'')+'>'+(loading?'Actualisation…':'Actualiser')+'</button></div></div>'
  +(loading&&!data?'<div class="lv-meta-loading">Chargement des statistiques '+(platform==='facebook'?'Facebook':'Instagram')+'…</div>':platformPage(platform,item));
 root.querySelector('[data-meta-platform]')?.addEventListener('change',event=>{platform=event.target.value;data=null;load()});
 root.querySelector('[data-meta-preset]')?.addEventListener('change',event=>{preset=event.target.value;render();if(preset!=='custom'){data=null;load(true)}});
 root.querySelector('[data-meta-compare]')?.addEventListener('change',event=>{compare=event.target.value;data=null;load(true)});
 root.querySelector('[data-meta-since]')?.addEventListener('change',event=>{customSince=event.target.value});
 root.querySelector('[data-meta-until]')?.addEventListener('change',event=>{customUntil=event.target.value});
 root.querySelector('[data-meta-apply]')?.addEventListener('click',()=>{data=null;load(true)});
 root.querySelector('[data-meta-refresh]')?.addEventListener('click',()=>load(true));bindCharts();
}
async function load(force=false){
 loading=true;render();
 try{const params=new URLSearchParams({platform,preset,compare});if(preset==='custom'){params.set('since',customSince);params.set('until',customUntil)}if(force)params.set('refresh','1');const response=await fetch('/demo-meta-api.php?'+params.toString(),{credentials:'same-origin',cache:'no-store'});data=await response.json();if(!response.ok)throw Error(data.message||'Connexion Meta indisponible.');loadedAt=Date.now()}
 catch(error){data={status:'connection_error',updatedAt:null,[platform]:{status:'connection_error',message:error.message}}}
 loading=false;render();
}
extra.register('meta',()=>{render();if(!data||Date.now()-loadedAt>10*60*1000)load()});
setInterval(()=>{if(data&&Date.now()-loadedAt>15*60*1000)load(true)},60*1000);
})();
