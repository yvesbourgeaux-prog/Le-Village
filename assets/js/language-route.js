/* Pick the visitor's preferred language before loading page widgets. */
(() => {
 const available=['fr','en','sv','da','nl','de','it','es','ja','zh-CN','nb','ru','pl'];
 const normalize=value=>{const code=String(value||'').replace('_','-').toLowerCase();return code.startsWith('zh')?'zh-CN':/^(no|nn)(-|$)/.test(code)?'nb':code.split('-')[0];};
 let saved='';try{saved=localStorage.getItem('lv-language')||'';}catch{}
 const first=location.pathname.split('/')[1];
 window.lvLocale=available.includes(first)?first:'fr';
 window.lvManualLanguage=saved;
 window.lvPreferredLanguage=normalize(saved||(navigator.languages||[navigator.language])[0]);
 if(window.lvLocale!=='fr'||/bot|crawler|spider/i.test(navigator.userAgent))return;
 const preferred=saved?[normalize(saved)]:(navigator.languages||[navigator.language]).map(normalize);
 const target=preferred.find(code=>available.includes(code))||'en';
 if(target==='fr')return;
 const path=location.pathname.replace(/\/index\.html$/,'/').replace(/\.html$/,'');
 location.replace('/'+target+(path==='/'?'/':path)+location.search+location.hash);
})();
