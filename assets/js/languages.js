/* A discreet, persistent override; primary translations are already in the HTML. */
(() => {
 const locales=['fr','en','sv','da','nl','de','it','es','ja','zh-CN'];
 const current=document.documentElement.dataset.siteLocale||'fr';
 const slug=document.documentElement.dataset.pageSlug||'';
 const path=code=>(code==='fr'?'':'/'+code)+(slug?'/'+slug:'/');
 const normalize=value=>{const code=String(value||'').replace('_','-').toLowerCase();return code.startsWith('zh')?'zh-CN':code.split('-')[0];};
 const save=code=>{try{if(code)localStorage.setItem('lv-language',code);else localStorage.removeItem('lv-language');}catch{}};
 document.addEventListener('click',e=>{
  const link=e.target.closest('[data-language]');
  if(link&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey)save(link.dataset.language);
  if(e.target.closest('[data-language-auto]')){
   save('');const preferred=(navigator.languages||[navigator.language]).map(normalize);
   const code=preferred.find(v=>locales.includes(v))||'en';
   location.assign(path(code)+location.search+location.hash);
  }
 });
 const openLabels={fr:'Ouvrir le menu',en:'Open menu',sv:'Öppna menyn',da:'Åbn menuen',nl:'Menu openen',de:'Menü öffnen',it:'Apri il menu',es:'Abrir el menú',ja:'メニューを開く','zh-CN':'打开菜单'};
 const closeLabels={fr:'Fermer le menu',en:'Close menu',sv:'Stäng menyn',da:'Luk menuen',nl:'Menu sluiten',de:'Menü schließen',it:'Chiudi il menu',es:'Cerrar el menú',ja:'メニューを閉じる','zh-CN':'关闭菜单'};
 const menu=document.querySelector('.menu-toggle,#menuBtn');
 if(menu){
  const update=()=>{const label=(menu.getAttribute('aria-expanded')==='true'?closeLabels:openLabels)[document.documentElement.lang]||openLabels.en;if(menu.getAttribute('aria-label')!==label)menu.setAttribute('aria-label',label);};
  new MutationObserver(update).observe(menu,{attributes:true,attributeFilter:['aria-expanded','aria-label']});update();
 }
 async function extraLanguages(){
  let capability;try{const response=await fetch('/api/translate.php?mode=languages');if(!response.ok)return;capability=await response.json();}catch{return;}
  if(!capability.enabled)return;
  const container=document.querySelector('[data-extra-languages]');
  if(container){
   const select=document.createElement('select');select.setAttribute('aria-label','Language');
   const option=document.createElement('option');option.value='';option.textContent='…';select.append(option);
   let displayNames;try{displayNames=new Intl.DisplayNames([current],{type:'language'});}catch{}
   for(const code of capability.languages.filter(code=>!locales.includes(code))){const option=document.createElement('option');option.value=code;try{option.textContent=displayNames?.of(code)||code;}catch{option.textContent=code;}select.append(option);}
   select.addEventListener('change',()=>{if(select.value){save(select.value);apply(select.value);}});
   container.append(select);container.hidden=false;
  }
  const requested=window.lvManualLanguage||window.lvPreferredLanguage;
  if(requested&&!locales.includes(requested)&&capability.languages.includes(requested))await apply(requested);
 }
 async function apply(lang){
  try{
   const response=await fetch('/api/translate.php?lang='+encodeURIComponent(lang)+'&page='+encodeURIComponent(slug||'index'));
   if(!response.ok)return;
   const result=await response.json();if(!result.translations)return;
   for(const element of document.querySelectorAll('[data-i18n]')){
    const mapping=JSON.parse(element.dataset.i18n);
    const texts=[...element.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE);
    for(const [index,key]of Object.entries(mapping.t)){const text=texts[Number(index)];if(!text||!result.translations[key])continue;const value=text.nodeValue;text.nodeValue=value.match(/^\s*/)[0]+result.translations[key]+value.match(/\s*$/)[0];}
    for(const [attribute,key]of Object.entries(mapping.a))if(result.translations[key])element.setAttribute(attribute,result.translations[key]);
   }
   document.documentElement.lang=lang;
   document.documentElement.dir=/^(ar|fa|he|iw|ur|ps|sd|ug)(-|$)/.test(lang)?'rtl':'ltr';
  }catch{}
 }
 extraLanguages();
})();
