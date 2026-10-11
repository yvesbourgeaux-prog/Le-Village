(() => {
 'use strict';
 const bo=window.lvBOExtra, root=document.getElementById('lv-site-stats-root');
 if(!bo||!root)return;
 const esc=bo.esc, number=new Intl.NumberFormat('fr-FR');
 const fmt=n=>number.format(Math.round(Number(n)||0));
 const pct=n=>(Number(n||0)*100).toLocaleString('fr-FR',{maximumFractionDigits:1})+' %';
 const labels={restaurant_booking_click:'Réservations restaurant',hotel_booking_click:'Réservations hôtel',phone_click:'Appels',email_click:'E-mails',menu_click:'Consultations de la carte',directions_click:'Itinéraires'};
 let days=28, request=0;
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
    if(data.connect_url){
     document.getElementById('lv-site-results').innerHTML='<div class="lv-site-unavailable"><strong>Autorisation Google nécessaire</strong><p>'+esc(data.error||'Connexion requise.')+'</p><a href="'+esc(data.connect_url)+'">Connecter Google Analytics et Search Console</a></div>';
     return;
    }
    throw Error(data.error||'Données indisponibles.');
   }
   const a=data.analytics,s=data.search,at=a.totals||[0,0,0,0],st=s.totals||{};
   const gaDaily=a.daily.map(row=>({label:date(row.dimensions[0]),value:row.metrics[0]}));
   const scDaily=s.daily.map(row=>({label:row.label,value:row.clicks}));
   const gaPages=a.pages.map(row=>({page:path(row.dimensions[0]),views:row.metrics[0],users:row.metrics[1]}));
   const scPages=s.pages.map(row=>({...row,page:path(row.label)}));
   const events=Object.entries(labels).map(([id,label])=>({label,count:a.events[id]||0})).filter(row=>row.count>0);
   document.getElementById('lv-site-results').innerHTML='<p class="lv-site-source">Google Analytics 4 · '+esc(range(data.analyticsRange))+' <span>Search Console · '+esc(range(data.searchRange))+'</span></p>'+
    '<section class="lv-site-section"><div class="lv-site-section-title"><h2>Fréquentation du site</h2><small>Google Analytics 4</small></div><div class="lv-site-kpis">'+[
      ['Vues des pages',fmt(at[2])],['Visiteurs actifs',fmt(at[0])],['Sessions',fmt(at[1])],['Taux d’engagement',pct(at[3])]
    ].map(([label,value])=>'<article><span>'+label+'</span><strong>'+value+'</strong></article>').join('')+'</div><div class="lv-site-card"><h3>Vues des pages</h3>'+chart(gaDaily,'vues')+'</div><div class="lv-site-columns"><div class="lv-site-card"><h3>Pages les plus vues</h3>'+table(gaPages,[['Page','page'],['Vues','views',fmt],['Visiteurs','users',fmt]],'Pas encore de pages mesurées.')+'</div><div class="lv-site-card"><h3>Actions sur le site</h3>'+table(events,[['Action','label'],['Clics','count',fmt]],'Aucun clic mesuré sur ces actions pour cette période.')+'<p class="lv-site-note">Les événements sont enregistrés via Google Tag Manager uniquement après consentement aux statistiques. Un clic n’est pas une réservation confirmée.</p></div></div></section>'+
    '<section class="lv-site-section"><div class="lv-site-section-title"><h2>Visibilité sur Google</h2><small>Search Console</small></div><div class="lv-site-kpis">'+[
      ['Clics depuis Google',fmt(st.clicks)],['Affichages dans les résultats',fmt(st.impressions)],['Taux de clic',pct(st.ctr)],['Position moyenne',Number(st.position||0).toLocaleString('fr-FR',{maximumFractionDigits:1})]
    ].map(([label,value])=>'<article><span>'+label+'</span><strong>'+value+'</strong></article>').join('')+'</div><div class="lv-site-card"><h3>Clics depuis la recherche Google</h3>'+chart(scDaily,'clics')+'</div><div class="lv-site-columns"><div class="lv-site-card"><h3>Pages qui attirent des visiteurs</h3>'+table(scPages,[['Page','page'],['Clics','clicks',fmt],['Affichages','impressions',fmt]],'Aucune page dans les résultats disponibles.')+'</div><div class="lv-site-card"><h3>Recherches populaires</h3>'+table(s.queries,[['Recherche','label'],['Clics','clicks',fmt],['Affichages','impressions',fmt]],'Aucune recherche disponible.')+'</div></div></section>'+
    '<p class="lv-site-footer">Tag Manager '+esc(data.tagManager.container)+' est configuré pour transmettre les mesures à GA4 après consentement. Tag Manager ne fournit pas de chiffres de fréquentation : ceux-ci viennent de GA4 et Search Console. Les données récentes de Search Console peuvent arriver avec un décalage.</p>';
  }catch(error){if(current===request)document.getElementById('lv-site-results').innerHTML='<div class="lv-site-unavailable"><strong>Statistiques du site à connecter</strong><p>'+esc(error.message)+'</p><p>Les valeurs ne seront affichées qu’après connexion sécurisée de Google Analytics 4 et Search Console.</p></div>'}
 }
 root.addEventListener('click',e=>{const period=e.target.closest('[data-site-days]');if(period){days=Number(period.dataset.siteDays);render()}else if(e.target.closest('[data-site-refresh]'))render()});
 bo.register('site_stats',render);
})();
