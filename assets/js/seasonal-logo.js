/* Shared seasonal identity: all pages and locales, through 1 November inclusive (Paris). */
(() => {
 'use strict';
 const parisDate=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const active=()=>{const date=parisDate();return date>='2026-10-22'&&date<='2026-11-01';};
 if(!active())return;
 const saved=new Map(),icons=new Map(),failed=new WeakSet();
 const attributes=['src','srcset','sizes','data-lv-original-src','data-lv-original-tried','data-fallback'];
 const style=document.createElement('style');
 style.textContent='img[data-lv-seasonal-logo]{filter:none!important;mix-blend-mode:normal!important;object-fit:contain!important;background:transparent!important}';
 document.head.appendChild(style);
 const restore=img=>{const original=saved.get(img);if(!original)return;img.removeAttribute('data-lv-seasonal-logo');for(const name of attributes){const value=original[name];if(value===null)img.removeAttribute(name);else img.setAttribute(name,value);}saved.delete(img);};
 const apply=img=>{
  if(saved.has(img)||failed.has(img)||!active())return;
  const source=(img.getAttribute('src')||'')+' '+(img.getAttribute('data-lv-original-src')||'');
  if(!img.matches('.brand img')&&!/chatgpt-image-22-nov\.-2025-00_40_31|\/brand-logo\.png/.test(source))return;
  saved.set(img,Object.fromEntries(attributes.map(name=>[name,img.getAttribute(name)])));
  img.setAttribute('data-lv-seasonal-logo','2026');
  img.removeAttribute('srcset');img.removeAttribute('sizes');
  img.setAttribute('src','/assets/images/logo-halloween-2026-600.webp');
  img.setAttribute('srcset','/assets/images/logo-halloween-2026-300.webp 300w, /assets/images/logo-halloween-2026-600.webp 600w');
  img.setAttribute('sizes','(max-width: 640px) 150px, 200px');
 };
 const applyIcon=link=>{if(icons.has(link))return;icons.set(link,{href:link.getAttribute('href'),type:link.getAttribute('type')});link.setAttribute('href','/assets/images/logo-halloween-2026-icon.png');link.setAttribute('type','image/png');};
 const scan=node=>{if(node.nodeType!==1)return;if(node.tagName==='IMG')apply(node);node.querySelectorAll('img').forEach(apply);if(node.matches('link[rel~=icon],link[rel=apple-touch-icon]'))applyIcon(node);node.querySelectorAll('link[rel~=icon],link[rel=apple-touch-icon]').forEach(applyIcon);};
 document.addEventListener('error',event=>{const img=event.target;if(saved.has(img)){failed.add(img);restore(img);event.stopImmediatePropagation();}},true);
 const observer=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)scan(node);});
 observer.observe(document.documentElement,{childList:true,subtree:true});scan(document.documentElement);
 const check=()=>{if(active())return;observer.disconnect();for(const img of [...saved.keys()])restore(img);for(const [link,original] of icons){for(const name of ['href','type']){if(original[name]===null)link.removeAttribute(name);else link.setAttribute(name,original[name]);}}icons.clear();style.remove();clearInterval(timer);};
 const timer=setInterval(check,60000);window.addEventListener('pageshow',check);document.addEventListener('visibilitychange',check);
})();
