"""Publish the approved music article and update existing news slots without rebuilding other pages.
Translations and the approved French page are the authoritative inputs for this article.
"""
from pathlib import Path
import json,gzip,hashlib,re,copy,html
from bs4 import BeautifulSoup,NavigableString,Comment
from localize import footer,LANGS,url
ROOT=Path(__file__).resolve().parents[1]
BASE='https://legrimaldibylevillage.com'
SLUG='dimanches-musicaux-8-novembre-2026-haut-de-cagnes'
DEMO='demo-dimanches-musicaux-8-novembre-2026'
OLD='halloween-31-octobre-haut-de-cagnes-soupe-citrouille'
IMAGE='/assets/images/articles-hd/dimanches-musicaux-8-novembre-2026-couverture.webp'
DATA=json.loads((ROOT/'tools/dimanches-musicaux-locales.json').read_text())
FR=DATA['fr']; key=lambda t:hashlib.sha256(t.encode()).hexdigest()[:16]
D={l:json.loads((ROOT/f'assets/i18n/{l}.json').read_text()) for l in LANGS}
# Existing dictionaries provide reviewed shared labels; new copy lives with this article.
for lang in LANGS[1:]:
 for i,t in DATA['translations'][lang].items():D[lang][key(FR[int(i)])]=t
 for i in [69]:D[lang][key(FR[i])]=DATA['translations'][lang]['67']
 for i in [70,73]:D[lang][key(FR[i])]=DATA['translations'][lang]['17']
for i,t in enumerate(FR):D['fr'][key(t)]=t
INVARIANT={FR[i] for i in [5,6,7,10,30,38,46,48,65]}
def tr(t,lang):
 if lang=='fr' or t in INVARIANT:return t
 if t==FR[3]:return {'en':'in Haut-de-Cagnes','sv':'i Haut-de-Cagnes','da':'i Haut-de-Cagnes','nl':'in Haut-de-Cagnes','de':'in Haut-de-Cagnes','it':'a Haut-de-Cagnes','es':'en Haut-de-Cagnes','ja':'Haut-de-Cagnesにて','zh-CN':'在Haut-de-Cagnes','nb':'i Haut-de-Cagnes','ru':'в Haut-de-Cagnes','pl':'w Haut-de-Cagnes'}[lang]
 if key(t) not in D[lang]:raise ValueError('Missing '+lang+': '+t)
 return D[lang][key(t)]

def translate_main(main,lang):
 m=copy.deepcopy(main)
 for e in m.select('[data-i18n]'):del e['data-i18n']
 for n in list(m.descendants):
  if not isinstance(n,NavigableString) or isinstance(n,Comment) or n.parent.name in ['style','script']:continue
  t=str(n).strip()
  if not t:continue
  translated=tr(t,lang)
  n.replace_with(str(n).replace(t,translated,1))
 for e in m.find_all(True):
  for a in ['alt','aria-label','title']:
   if e.get(a):e[a]=tr(e[a],lang)
  if e.name=='a' and e.get('href','').startswith('/') and not e['href'].startswith('/assets/'):
   target=e['href'].strip('/')
   if target and not target.startswith('#') and lang!='fr':e['href']='/'+lang+'/'+target
 return m

original=(ROOT/(DEMO+'.html')).read_text()
s=BeautifulSoup(original.replace(DEMO,SLUG),'html.parser')
s.select_one('.music-preview-note').decompose()
s.select_one('meta[name=robots]')['content']='index,follow'
s.html['data-page-slug']=SLUG
# Restore the common language selection used by all public articles.
routing=s.new_tag('script',src='/assets/js/language-route.js?v=20261004-13');routing['data-lv-language-resource']='';s.select_one('meta[name=viewport]').insert_after(routing)
script=s.new_tag('script',src='/assets/js/languages.js?v=20261013-13',defer='');script['data-lv-language-resource']='';s.head.append(script)
for lang in LANGS+['x-default']:
 link=s.new_tag('link',rel='alternate',hreflang=lang,href=BASE+url('fr' if lang=='x-default' else lang,SLUG));s.head.append(link)
s.select_one('meta[property="og:title"]')['content']=FR[67]
schema=json.loads(s.select_one('script[type="application/ld+json"]').string)
for entity in schema['@graph']:
 if entity['@type']=='BlogPosting':
  entity['datePublished']='2026-11-04';entity['dateModified']='2026-11-04';entity['headline']=FR[67]
# Build each language with its established translated header and footer.
packs={l:json.loads(gzip.decompress((ROOT/f'i18n/pages/{l}.json.gz').read_bytes())) for l in LANGS[1:]}
PAGES={}
for lang in LANGS:
 page=copy.deepcopy(s)
 if lang!='fr':
  template=BeautifulSoup(packs[lang][OLD],'html.parser')
  body=copy.deepcopy(template.body)
  body.select_one('main').replace_with(translate_main(s.main,lang))
  for e in body.select('.language-footer'):e.decompose()
  page.body.replace_with(body)
 else:
  for e in page.select('.language-footer'):e.decompose()
 page.body.append(BeautifulSoup(footer(lang,SLUG),'html.parser'))
 page.html['lang']=lang;page.html['data-site-locale']=lang
 page.title.string=tr(FR[67],lang)
 for meta in page.select('meta[name=description],meta[property="og:description"]'):meta['content']=tr(FR[68],lang)
 page.select_one('meta[property="og:title"]')['content']=tr(FR[67],lang)
 u=BASE+url(lang,SLUG)
 page.select_one('meta[property="og:url"]')['content']=u
 page.select_one('meta[property="og:locale"]')['content']={'fr':'fr_FR','en':'en_GB','sv':'sv_SE','da':'da_DK','nl':'nl_NL','de':'de_DE','it':'it_IT','es':'es_ES','ja':'ja_JP','zh-CN':'zh_CN','nb':'nb_NO','ru':'ru_RU','pl':'pl_PL'}[lang]
 page.select_one('link[rel=canonical]')['href']=u
 def local_schema(v,k=''):
  if isinstance(v,dict):return {a:local_schema(b,a) for a,b in v.items()}
  if isinstance(v,list):return [local_schema(x,k) for x in v]
  if isinstance(v,str):
   if k=='inLanguage':return lang
   if v in [FR[67],FR[68],'Accueil','Actualités','Dimanches musicaux']:return tr(v,lang)
   if v.startswith(BASE) and k in ['@id','url','item']:
    rel=v[len(BASE):]
    if rel.startswith('/'+SLUG):return BASE+url(lang,SLUG)+rel[len('/'+SLUG):]
    if rel=='/blog-list':return BASE+url(lang,'blog-list')
    if rel=='/':return BASE+url(lang,'')
  return v
 page.select_one('script[type="application/ld+json"]').string=json.dumps(local_schema(schema),ensure_ascii=False)
 PAGES[lang]=str(page)
 if lang!='fr':packs[lang][SLUG]=PAGES[lang]
(ROOT/(SLUG+'.html')).write_text(PAGES['fr'])

def card(lang,grid=False):
 title=tr(FR[67],lang).split(' | ')[0];description=tr(FR[68],lang);href=url(lang,SLUG)
 read=D[lang].get(key('Lire l’article →'),{'fr':'Lire l’article →','en':'Read the article →'}.get(lang,'→'))
 E=lambda t:html.escape(t,quote=True)
 if grid:return f'<article data-music-2026-card><a href="{href}"><img src="{IMAGE}" alt="{E(title)}" loading="lazy" width="1200" height="750"/><h2>{E(title)}</h2></a><p>{E(description)}</p><a href="{href}">{E(read)}</a></article>'
 return f'<a data-music-2026-card href="{href}" class="group flex flex-col w-[280px] md:w-[380px] flex-shrink-0 snap-start no-underline h-full"><div class="village-img-wrapper shadow-md mb-6 h-[220px] md:h-[260px] bg-village-white"><img src="{IMAGE}" alt="{E(title)}" loading="lazy" width="1200" height="750" class="village-img w-full h-full" style="object-fit:cover;object-position:center"/></div><div class="flex flex-col flex-grow"><span class="font-sans text-[10px] text-village-dark/50 uppercase tracking-widest mb-3">08.11.2026 · 15:30</span><h3 class="font-serif text-xl md:text-2xl text-village-dark leading-snug mb-3">{E(title)}</h3><p class="font-sans text-sm text-village-dark/80 leading-relaxed mb-6 flex-grow">{E(description)}</p><div><span class="village-link-read">{E(read)}</span></div></div></a>'
def add_card(doc,lang,grid=False):
 if 'data-music-2026-card' in doc:return doc
 pattern=r'(<div\b[^>]*\bclass="article-grid"[^>]*>)' if grid else r'(<div\b[^>]*\bid="blog-track"[^>]*>)'
 updated,n=re.subn(pattern,lambda m:m[1]+card(lang,grid),doc,count=1)
 if n!=1:raise ValueError('Missing news slot: '+lang+str(grid))
 return updated
for name in ['index','le-village-restaurant-haut-de-cagnes-sur-mer','hotel-cagnes-sur-mer-le-grimaldi','blog-list']:
 p=ROOT/(name+'.html');p.write_text(add_card(p.read_text(),'fr',name=='blog-list'))
 # Preserve the existing source blocks so a later rebuild keeps the news card.
 source=ROOT/'tools/source-pages'/(name+'.json')
 if source.exists():
  data=json.loads(source.read_text())
  for block in data['blocks']:
   if 'id="blog-track"' in block.get('content','') or 'class="article-grid"' in block.get('content',''):block['content']=add_card(block['content'],'fr',name=='blog-list')
  source.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
for lang,pages in packs.items():
 for name in ['','le-village-restaurant-haut-de-cagnes-sur-mer','hotel-cagnes-sur-mer-le-grimaldi','blog-list']:pages[name]=add_card(pages[name],lang,name=='blog-list')
 (ROOT/f'i18n/pages/{lang}.json.gz').write_bytes(gzip.compress(json.dumps(pages,ensure_ascii=False,separators=(',',':')).encode(),compresslevel=9,mtime=0))
# Keep source records and targeted translations next to the normal source catalogue.
manifest=ROOT/'tools/manifest.json';m=json.loads(manifest.read_text())
if not any(x['path']=='/'+SLUG for x in m):m.insert(0,{'path':'/'+SLUG,'file':SLUG+'.html','title':FR[67],'kind':'blog'})
manifest.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
source=json.loads((ROOT/'tools/source-pages'/(OLD+'.json')).read_text())
source.update(slug=SLUG,date='2026-11-04',sortDate='2026-11-08',meta={'title':FR[67],'description':FR[68]},blocks=[{'type':'GridEmbed','content':str(s.style)+s.main.decode_contents()}])
(ROOT/'tools/source-pages'/(SLUG+'.json')).write_text(json.dumps(source,ensure_ascii=False,indent=2)+'\n')
# A separate per-article catalogue avoids rewriting translations of unrelated pages.
for lang in LANGS:
 dictionary=D[lang]
 (ROOT/f'assets/i18n/{lang}.json').write_text(json.dumps(dictionary,ensure_ascii=False,separators=(',',':')))
(ROOT/'i18n/catalogs'/(SLUG+'.json')).write_text(json.dumps({key(t):t for t in FR[1:]},ensure_ascii=False))
xml=ROOT/'sitemap.xml';text=xml.read_text()
if BASE+'/'+SLUG not in text:text=text.replace('</urlset>',''.join('<url><loc>'+BASE+url(l,SLUG)+'</loc></url>' for l in LANGS)+'</urlset>')
xml.write_text(text)
ht=ROOT/'.htaccess';text=ht.read_text()
rule='RewriteRule ^'+DEMO+r'(?:\.html)?/?$ /'+SLUG+' [R=301,L]'
if rule not in text:text=text.replace('RewriteEngine On','RewriteEngine On\n# Approved music preview is now a published article.\n'+rule,1)
ht.write_text(text)
print('Published article prepared in',len(PAGES),'languages')
