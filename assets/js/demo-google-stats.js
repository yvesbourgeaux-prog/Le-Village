(() => {
 'use strict';
 const bo=window.lvBOExtra, root=document.getElementById('lv-site-stats-root');
 if(!bo||!root)return;
 const esc=bo.esc, number=new Intl.NumberFormat('fr-FR');
 const fmt=n=>number.format(Math.round(Number(n)||0));
 const pct=n=>(Number(n||0)*100).toLocaleString('fr-FR',{maximumFractionDigits:1})+' %';
 const labels={restaurant_booking_click:'Réservations restaurant',hotel_booking_click:'Réservations hôtel',phone_click:'Appels',email_click:'E-mails',menu_click:'Consultations de la carte',directions_click:'Itinéraires'};
 let days=28, request=0, queryRequest=0, queryRows=[], selectedQuery='';
 const date=s=>/^\d{8}$/.test(s)?s.slice(0,4)+'-'+s.slice(4,6)+'-'+s.slice(6):s;
 const short=s=>new Date(s+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
 const range=r=>short(r.startDate)+' – '+short(r.endDate);
 function chart(points,metric){
  if(!points.length)return '<p class="lv-site-empty">Aucune donnée disponible pour cette période.</p>';
  const grouped=new Map(),monthly=days>90,weekly=days>28&&!monthly;
  for(const p of points){
   const day=date(p.label),d=new Date(day+'T12:00:00');
   if(Number.isNaN(d.getTime()))continue;
   if(weekly)d.setDate(d.getDate()-((d.getDay()+6)%7));
   const key=monthly?day.slice(0,7):weekly?d.toISOString().slice(0,10):day;
   grouped.set(key,(grouped.get(key)||0)+Number(p.value||0));
  }
  const values=[...grouped.entries()].sort(([a],[b])=>a.localeCompare(b));
  const max=Math.max(1,...values.map(([,v])=>v));
  const barWidth=Math.max(3,Math.min(24,620/(values.length*1.7)));
  const gap=(660-values.length*barWidth)/Math.max(values.length,1);
  const bars=values.map(([key,value],i)=>{
   const h=Math.max(value?3:0,125*value/max),x=10+i*(barWidth+gap),y=145-h;
   return '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+barWidth.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="2"><title>'+esc(key)+' : '+fmt(value)+' '+metric+'</title></rect>';
  }).join('');
  const first=values[0]?.[0],last=values.at(-1)?.[0];
  const label=k=>monthly?new Date(k+'-01T12:00:00').toLocaleDateString('fr-FR',{month:'short',year:'numeric'}):short(k);
  return '<div class="lv-site-chart"><svg viewBox="0 0 680 160" role="img" aria-label="Évolution des '+esc(metric)+' : '+values.length+' périodes">'+bars+'</svg><div class="lv-site-chart-axis"><span>'+esc(label(first))+'</span><span>'+esc(label(last))+'</span></div><small>'+ (monthly?'Par mois':weekly?'Par semaine':'Par jour') +' · survolez les barres pour les valeurs</small></div>';
 }
 const table=(rows,cols,empty)=>rows.length?'<div class="lv-site-table-wrap"><table class="lv-site-table"><thead><tr>'+cols.map(c=>'<th scope="col">'+c[0]+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+cols.map(([_,key,formatter])=>'<td>'+esc(formatter?formatter(row[key]):row[key])+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>':'<p class="lv-site-empty">'+empty+'</p>';
 const path=s=>{try{const u=new URL(s,'https://legrimaldibylevillage.com');return u.pathname==='/'?'Accueil':u.pathname.replace(/^\//,'').replaceAll('-',' ')}catch{return s}};
 const position=n=>Number(n||0)>0?Number(n).toLocaleString('fr-FR',{maximumFractionDigits:1}):'—';
 function queryTable(){
  const filter=(root.querySelector('[data-query-filter]')?.value||'').trim().toLocaleLowerCase();
  const order=root.querySelector('[data-query-sort]')?.value||'clicks';
  const rows=queryRows.filter(row=>row.label.toLocaleLowerCase().includes(filter)).sort((a,b)=>order==='position'?(Number(a.position||Infinity)-Number(b.position||Infinity)):(Number(b[order]||0)-Number(a[order]||0)));
  const target=root.querySelector('#lv-site-query-table');
  if(!target)return;
  target.innerHTML=rows.length?'<div class="lv-site-table-wrap"><table class="lv-site-table"><thead><tr><th scope="col">Recherche</th><th scope="col">Clics</th><th scope="col">Impressions</th><th scope="col">CTR</th><th scope="col">Position moy.</th></tr></thead><tbody>'+
   rows.map(row=>'<tr><td><button type="button" class="lv-site-query-link" data-site-query="'+esc(row.label)+'" aria-label="Voir l’évolution de '+esc(row.label)+'">'+esc(row.label)+'</button></td><td>'+fmt(row.clicks)+'</td><td>'+fmt(row.impressions)+'</td><td>'+pct(row.ctr)+'</td><td>'+position(row.position)+'</td></tr>').join('')+'</tbody></table></div>':
   '<p class="lv-site-empty">'+(queryRows.length?'Aucune recherche ne correspond à ce filtre.':'Aucune recherche disponible pour cette période.')+'</p>';
  root.querySelector('[data-query-count]').textContent=fmt(rows.length)+' recherches affichées';
 }
 function queryTrend(rows,metric){
  const points=rows.filter(r=>/^\d{4}-\d{2}-\d{2}$/.test(r.label)).sort((a,b)=>a.label.localeCompare(b.label));
  if(!points.length)return '<p class="lv-site-empty">Pas de données quotidiennes pour cette recherche.</p>';
  const values=points.map(r=>Number(r[metric]||0)),max=Math.max(1,...values),min=metric==='position'?Math.min(...values):0;
  const coords=values.map((v,i)=>[20+i*620/Math.max(1,values.length-1),metric==='position'?25+110*(v-min)/Math.max(1,max-min):135-110*v/max]);
  return '<div class="lv-site-chart lv-site-trend"><svg viewBox="0 0 660 160" role="img" aria-label="Évolution de '+esc(metric)+' sur '+points.length+' jours"><path d="M20 135H640" class="lv-site-baseline"/><polyline points="'+coords.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')+'"/>'+coords.map((p,i)=>'<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="4"><title>'+esc(short(points[i].label))+' : '+(metric==='ctr'?pct(values[i]):metric==='position'?position(values[i]):fmt(values[i]))+'</title></circle>').join('')+'</svg><div class="lv-site-chart-axis"><span>'+esc(short(points[0].label))+'</span><span>'+esc(short(points.at(-1).label))+'</span></div><small>Chaque point représente un jour · position moyenne : plus le chiffre est petit, plus le résultat est haut placé.</small></div>';
 }
 async function openQuery(query){
  selectedQuery=query;
  const target=root.querySelector('#lv-site-query-detail');if(!target)return;
  target.hidden=false;target.innerHTML='<p class="lv-site-empty">Chargement de la recherche « '+esc(query)+' »…</p>';
  target.scrollIntoView({behavior:'smooth',block:'nearest'});
  const current=++queryRequest;
  try{
   const response=await fetch('/demo-google-stats-api.php?days='+days+'&query='+encodeURIComponent(query),{credentials:'same-origin',cache:'no-store'});
   const data=await response.json();
   if(current!==queryRequest||selectedQuery!==query)return;
   if(!response.ok)throw Error(data.error||'Données indisponibles.');
   const t=data.totals||{},daily=data.daily||[],pages=data.pages||[];
   target.innerHTML='<div class="lv-site-detail-head"><div><span>ANALYSE D’UNE RECHERCHE</span><h3>'+esc(query)+'</h3><small>'+esc(range(data.searchRange))+'</small></div><button type="button" data-site-query-close aria-label="Fermer le détail">Fermer ×</button></div>'+
    '<div class="lv-site-kpis">'+[['Clics',fmt(t.clicks)],['Impressions',fmt(t.impressions)],['Taux de clic',pct(t.ctr)],['Position moyenne',position(t.position)]].map(([label,value])=>'<article><span>'+label+'</span><strong>'+value+'</strong></article>').join('')+'</div>'+
    '<div class="lv-site-metric" role="group" aria-label="Mesure du graphique">'+[['clicks','Clics'],['impressions','Impressions'],['ctr','Taux de clic'],['position','Position']].map(([key,label])=>'<button type="button" data-site-metric="'+key+'" class="'+(key==='clicks'?'is-active':'')+'">'+label+'</button>').join('')+'</div>'+
    '<div id="lv-site-query-trend">'+queryTrend(daily,'clicks')+'</div><h4>Pages apparues pour cette recherche</h4>'+
    table(pages.map(row=>({...row,page:path(row.label)})),[['Page','page'],['Clics','clicks',fmt],['Impressions','impressions',fmt],['CTR','ctr',pct],['Position','position',position]],'Aucune page disponible.')+
    '<p class="lv-site-note">Les positions sont des moyennes de Search Console ; elles varient selon le lieu, l’appareil et le moment de la recherche.</p>';
   target._daily=daily;
  }catch(error){if(current===queryRequest)target.innerHTML='<div class="lv-site-unavailable"><strong>Détail indisponible</strong><p>'+esc(error.message)+'</p></div>'}
 }
 function shell(){
  root.innerHTML='<div class="lv-site-toolbar"><div class="lv-site-period" role="group" aria-label="Période des statistiques">'+[7,28,90,180].map(n=>'<button type="button" data-site-days="'+n+'" class="'+(n===days?'is-active':'')+'">'+(n===180?'6 mois':n+' j')+'</button>').join('')+'</div><button type="button" class="lv-site-refresh" data-site-refresh>Actualiser</button></div><div id="lv-site-results" role="status">Chargement des données Google…</div>';
 }
 async function render(){
  shell();const current=++request;
  try{
   const response=await fetch('/demo-google-stats-api.php?days='+days,{credentials:'same-origin',cache:'no-store'});
   const data=await response.json();
   if(current!==request)return;
   if(!response.ok){
    if(data.connect_url || data.code==='not_authorized' || /Autorisez la lecture de Google Analytics/.test(data.error||'')){
     document.getElementById('lv-site-results').innerHTML='<div class="lv-site-unavailable"><strong>Autorisation Google nécessaire</strong><p>'+esc(data.error||'Connexion requise.')+'</p><a href="'+esc(data.connect_url||'/demo-google-oauth.php')+'">Connecter Google Analytics et Search Console</a></div>';
     return;
    }
    throw Error(data.error||'Données indisponibles.');
   }
   const a=data.analytics,s=data.search,at=a.totals||[0,0,0,0],st=s.totals||{};
   const gaDaily=a.daily.map(row=>({label:date(row.dimensions[0]),value:row.metrics[0]}));
   const scDaily=s.daily.map(row=>({label:row.label,value:row.clicks}));
   const gaPages=a.pages.map(row=>({page:path(row.dimensions[0]),views:row.metrics[0],users:row.metrics[1]}));
   const scPages=s.pages.map(row=>({...row,page:path(row.label)}));
   queryRows=Array.isArray(s.queries)?s.queries:[];
   selectedQuery='';
   const events=Object.entries(labels).map(([id,label])=>({label,count:a.events[id]||0})).filter(row=>row.count>0);
   document.getElementById('lv-site-results').innerHTML='<p class="lv-site-source">Google Analytics 4 · '+esc(range(data.analyticsRange))+' <span>Search Console · '+esc(range(data.searchRange))+'</span></p>'+
    '<section class="lv-site-section"><div class="lv-site-section-title"><h2>Fréquentation du site</h2><small>Google Analytics 4</small></div><div class="lv-site-kpis">'+[
      ['Vues des pages',fmt(at[2])],['Visiteurs actifs',fmt(at[0])],['Sessions',fmt(at[1])],['Taux d’engagement',pct(at[3])]
    ].map(([label,value])=>'<article><span>'+label+'</span><strong>'+value+'</strong></article>').join('')+'</div><div class="lv-site-card"><h3>Vues des pages</h3>'+chart(gaDaily,'vues')+'</div><div class="lv-site-columns"><div class="lv-site-card"><h3>Pages les plus vues</h3>'+table(gaPages,[['Page','page'],['Vues','views',fmt],['Visiteurs','users',fmt]],'Pas encore de pages mesurées.')+'</div><div class="lv-site-card"><h3>Actions sur le site</h3>'+table(events,[['Action','label'],['Clics','count',fmt]],'Aucun clic mesuré sur ces actions pour cette période.')+'<p class="lv-site-note">Les événements sont enregistrés via Google Tag Manager uniquement après consentement aux statistiques. Un clic n’est pas une réservation confirmée.</p></div></div></section>'+
    '<section class="lv-site-section"><div class="lv-site-section-title"><h2>Visibilité sur Google</h2><small>Search Console</small></div><div class="lv-site-kpis">'+[
      ['Clics depuis Google',fmt(st.clicks)],['Affichages dans les résultats',fmt(st.impressions)],['Taux de clic',pct(st.ctr)],['Position moyenne',Number(st.position||0).toLocaleString('fr-FR',{maximumFractionDigits:1})]
    ].map(([label,value])=>'<article><span>'+label+'</span><strong>'+value+'</strong></article>').join('')+'</div><div class="lv-site-card"><h3>Clics depuis la recherche Google</h3>'+chart(scDaily,'clics')+'</div>'+
    '<div class="lv-site-card"><div class="lv-site-query-heading"><div><h3>Recherches Google</h3><p class="lv-site-note">Cliquez sur une recherche pour voir son évolution et les pages associées.</p></div><div class="lv-site-query-controls"><label>Filtrer<input type="search" data-query-filter placeholder="Ex. restaurant cagnes"></label><label>Trier<select data-query-sort><option value="clicks">Clics</option><option value="impressions">Impressions</option><option value="position">Position moyenne</option><option value="ctr">Taux de clic</option></select></label></div></div><p class="lv-site-note" data-query-count></p><div id="lv-site-query-detail" hidden></div><div id="lv-site-query-table"></div></div>'+
    '<div class="lv-site-card"><h3>Pages présentes dans Google</h3>'+table(scPages,[['Page','page'],['Clics','clicks',fmt],['Impressions','impressions',fmt],['CTR','ctr',pct],['Position','position',position]],'Aucune page dans les résultats disponibles.')+'</div></section>'+
    '<p class="lv-site-footer">Tag Manager '+esc(data.tagManager.container)+' est configuré pour transmettre les mesures à GA4 après consentement. Les recherches et positions viennent de Search Console ; les données récentes peuvent arriver avec un décalage. Certaines requêtes peu fréquentes ne sont pas fournies par Google.</p>';
   queryTable();
  }catch(error){if(current===request)document.getElementById('lv-site-results').innerHTML='<div class="lv-site-unavailable"><strong>Statistiques du site à connecter</strong><p>'+esc(error.message)+'</p><p>Les valeurs ne seront affichées qu’après connexion sécurisée de Google Analytics 4 et Search Console.</p></div>'}
 }
 root.addEventListener('click',e=>{
  const period=e.target.closest('[data-site-days]');
  if(period){days=Number(period.dataset.siteDays);++queryRequest;render();return}
  if(e.target.closest('[data-site-refresh]')){++queryRequest;render();return}
  const query=e.target.closest('[data-site-query]');if(query){openQuery(query.dataset.siteQuery);return}
  if(e.target.closest('[data-site-query-close]')){selectedQuery='';++queryRequest;const detail=root.querySelector('#lv-site-query-detail');detail.hidden=true;detail.innerHTML='';return}
  const metric=e.target.closest('[data-site-metric]');
  if(metric){const detail=root.querySelector('#lv-site-query-detail');detail.querySelectorAll('[data-site-metric]').forEach(b=>b.classList.toggle('is-active',b===metric));detail.querySelector('#lv-site-query-trend').innerHTML=queryTrend(detail._daily||[],metric.dataset.siteMetric)}
 });
 root.addEventListener('input',e=>{if(e.target.matches('[data-query-filter]'))queryTable()});
 root.addEventListener('change',e=>{if(e.target.matches('[data-query-sort]'))queryTable()});
 bo.register('site_stats',render);
})();
