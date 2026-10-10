(()=>{
'use strict';
const root=document.getElementById('lv-meta-root'),extra=window.lvBOExtra;
if(!root||!extra)return;
const esc=extra.esc,fmt=v=>Number.isFinite(Number(v))?Number(v).toLocaleString('fr-FR'):'—';
let days=30,data=null,loading=false,loadedAt=0;
const labels={connected:'Connecté',partial:'Partiellement connecté',not_connected:'À connecter',connection_error:'Connexion à vérifier'};
function dateLabel(value){try{return new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short'}).format(new Date(value+'T12:00:00'))}catch{return value}}
function lineChart(rows,key,label,color){
 if(!rows?.length)return '<div class="lv-meta-empty-chart">La courbe apparaîtra dès que Meta renverra les données quotidiennes.</div>';
 const width=760,height=250,pad={l:46,r:18,t:22,b:36},values=rows.map(r=>Number(r[key])||0),max=Math.max(1,...values);
 const x=i=>pad.l+(rows.length===1?0:(i*(width-pad.l-pad.r)/(rows.length-1))),y=v=>pad.t+(height-pad.t-pad.b)*(1-v/max);
 const path=rows.map((r,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(values[i]).toFixed(1)).join(' ');
 const grid=[0,.25,.5,.75,1].map(p=>{const yy=pad.t+(height-pad.t-pad.b)*p,val=Math.round(max*(1-p));return '<g><line x1="'+pad.l+'" y1="'+yy+'" x2="'+(width-pad.r)+'" y2="'+yy+'"/><text x="'+(pad.l-8)+'" y="'+(yy+4)+'">'+fmt(val)+'</text></g>'}).join('');
 const points=rows.map((r,i)=>'<circle cx="'+x(i)+'" cy="'+y(values[i])+'" r="3.5" data-chart-point="'+i+'"/>').join('');
 const ticks=[0,Math.floor((rows.length-1)/2),rows.length-1].filter((v,i,a)=>a.indexOf(v)===i).map(i=>'<text class="lv-meta-x" x="'+x(i)+'" y="'+(height-9)+'">'+esc(dateLabel(rows[i].date))+'</text>').join('');
 return '<div class="lv-meta-chart" data-chart-key="'+esc(key)+'" data-chart-label="'+esc(label)+'" style="--chart:'+color+'"><svg viewBox="0 0 '+width+' '+height+'" role="img" aria-label="Évolution de '+esc(label)+'"><g class="lv-meta-grid">'+grid+'</g><path class="lv-meta-line" d="'+path+'"/>'+points+ticks+'<line class="lv-meta-cursor" y1="'+pad.t+'" y2="'+(height-pad.b)+'"/></svg><div class="lv-meta-tooltip"></div></div>';
}
function status(platform){const state=platform?.status||'not_connected';return '<span class="lv-meta-status '+(state==='connected'?'is-connected':state==='partial'?'is-partial':'')+'">'+esc(labels[state]||'À vérifier')+'</span>'}
function metric(value,label,accent=''){return '<div class="lv-meta-kpi '+accent+'"><strong>'+fmt(value)+'</strong><span>'+esc(label)+'</span></div>'}
function platformCard(kind,item){
 const facebook=kind==='facebook',series=item?.series||[];
 const metrics=facebook
  ?metric(item?.views,'Vues des contenus','is-fb')+metric(item?.interactions,'Interactions')+metric(item?.followers,'Abonnés')
  :metric(item?.reach,'Comptes touchés','is-ig')+metric(item?.interactions,'Interactions')+metric(item?.profileViews,'Visites du profil')+metric(item?.followers,'Abonnés');
 const chart=facebook?lineChart(series,'views','vues Facebook','#1877f2'):lineChart(series,'reach','comptes touchés sur Instagram','#c13584');
 return '<article class="lv-meta-platform"><header><div class="lv-meta-brand '+(facebook?'is-fb':'is-ig')+'">'+(facebook?'f':'◎')+'</div><div><span>'+(facebook?'FACEBOOK':'INSTAGRAM')+'</span><h2>'+esc(item?.name||(facebook?'Restaurant Le Village':'@restaurantlevillagehdc'))+'</h2></div>'+status(item)+'</header>'
  +(item?.message?'<p class="lv-meta-warning">'+esc(item.message)+'</p>':'')+'<div class="lv-meta-kpis">'+metrics+'</div><div class="lv-meta-chart-head"><strong>Évolution quotidienne</strong><span>'+days+' derniers jours</span></div>'+chart+'</article>';
}
function bindCharts(){
 root.querySelectorAll('.lv-meta-chart').forEach(chart=>{
  const svg=chart.querySelector('svg'),line=chart.querySelector('.lv-meta-cursor'),tip=chart.querySelector('.lv-meta-tooltip'),points=[...chart.querySelectorAll('[data-chart-point]')],key=chart.dataset.chartKey,label=chart.dataset.chartLabel;
  if(!points.length)return;
  const move=event=>{const rect=svg.getBoundingClientRect(),ratio=(event.clientX-rect.left)/rect.width,viewX=Math.max(0,Math.min(760,ratio*760));let best=points[0],dist=Infinity;points.forEach(p=>{const d=Math.abs(Number(p.getAttribute('cx'))-viewX);if(d<dist){dist=d;best=p}});const index=Number(best.dataset.chartPoint),row=(key==='views'?data.facebook.series:data.instagram.series)[index],cx=best.getAttribute('cx');line.setAttribute('x1',cx);line.setAttribute('x2',cx);line.classList.add('is-visible');tip.innerHTML='<strong>'+esc(dateLabel(row.date))+'</strong><span>'+fmt(row[key])+' '+esc(label)+'</span>';tip.style.left=Math.min(82,Math.max(4,(Number(cx)/760)*100))+'%';tip.classList.add('is-visible')};
  chart.onpointermove=move;chart.onpointerleave=()=>{line.classList.remove('is-visible');tip.classList.remove('is-visible')};
 });
}
function render(){
 root.innerHTML='<div class="lv-meta-toolbar"><div class="lv-meta-period" aria-label="Période">'+[7,30,90].map(n=>'<button type="button" data-meta-days="'+n+'" class="'+(days===n?'is-active':'')+'">'+n+' jours</button>').join('')+'</div><button type="button" class="lv-meta-refresh" data-meta-refresh '+(loading?'disabled':'')+'>'+(loading?'Actualisation…':'Actualiser')+'</button></div>'
  +(loading&&!data?'<div class="lv-meta-loading">Connexion à Meta et chargement des statistiques…</div>':
  '<div class="lv-meta-summary"><div><span>LECTURE SIMPLE</span><h2>La visibilité et les réactions de vos réseaux, au même endroit</h2><p>Les chiffres se mettent à jour automatiquement. Survolez une courbe pour lire le détail d’une journée.</p></div><small>'+(data?.updatedAt?'Mis à jour '+new Intl.DateTimeFormat('fr-FR',{dateStyle:'short',timeStyle:'short'}).format(new Date(data.updatedAt)):'Connexion en attente')+'</small></div><div class="lv-meta-grid-cards">'+platformCard('facebook',data?.facebook)+platformCard('instagram',data?.instagram)+'</div>');
 root.querySelectorAll('[data-meta-days]').forEach(b=>b.onclick=()=>{days=Number(b.dataset.metaDays);load(true)});
 root.querySelector('[data-meta-refresh]')?.addEventListener('click',()=>load(true));bindCharts();
}
async function load(force=false){
 loading=true;render();
 try{const response=await fetch('/demo-meta-api.php?days='+days+(force?'&refresh=1':''),{credentials:'same-origin',cache:'no-store'});data=await response.json();if(!response.ok)throw Error(data.message||'Connexion Meta indisponible.');loadedAt=Date.now()}
 catch(error){data={status:'connection_error',updatedAt:null,facebook:{status:'connection_error',message:error.message},instagram:{status:'connection_error',message:error.message}}}
 loading=false;render();
}
extra.register('meta',()=>{render();if(!data||Date.now()-loadedAt>10*60*1000)load()});
setInterval(()=>{if(data&&Date.now()-loadedAt>15*60*1000)load(true)},60*1000);
})();
