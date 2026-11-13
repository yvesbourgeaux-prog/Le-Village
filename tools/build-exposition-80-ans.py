"""Build the anniversary article and news cards without rebuilding unrelated pages.

The French source, complete per-language copy and existing translated chrome are
kept together so this focused build can be repeated without duplicate cards.
"""
from pathlib import Path
import copy
import gzip
import hashlib
import html
import json
import re
from bs4 import BeautifulSoup
from localize import LANGS, footer, url

ROOT = Path(__file__).resolve().parents[1]
SLUG = 'exposition-80-ans-chateau-musee-grimaldi-cagnes-sur-mer'
TEMPLATE = 'dimanches-musicaux-8-novembre-2026-haut-de-cagnes'
BASE = 'https://legrimaldibylevillage.com'
IMAGE = '/assets/images/articles-hd/exposition-80-ans-grimaldi-affiche.webp'
ANNOUNCEMENT = 'https://ville.cagnes.fr/actualites-csm/exposition-80-ans-du-chateau-musee-grimaldi/'
OFFICIAL = 'https://musees.cagnes.fr/chateau-musee-grimaldi/'
DATA = json.loads((ROOT/'tools/exposition-80-ans-locales.json').read_text())
FR = DATA['fr']
if set(DATA) != set(LANGS):
    raise ValueError('Every site language needs complete article copy')
for lang in LANGS:
    if set(DATA[lang]) != set(FR) or not all(DATA[lang].values()):
        raise ValueError('Incomplete copy for '+lang)
PACKS = {lang: json.loads(gzip.decompress((ROOT/f'i18n/pages/{lang}.json.gz').read_bytes())) for lang in LANGS[1:]}
P = 'text-base md:text-lg text-village-dark/80 leading-relaxed font-sans mb-6'
H = 'font-serif text-3xl md:text-4xl text-village-dark mb-6'

def markup(lang):
    d=DATA[lang]
    def t(k): return html.escape(d[k])
    def p(k, cls=P):
        content=t(k)
        if k=='restaurant_p':
            content+=' '+link('restaurant_link','/le-village-restaurant-haut-de-cagnes-sur-mer')
        return f'<p class="{cls}" data-expo-copy="{k}">{content}</p>'
    def h(k, cls=H):
        label=t(k)
        if k=='visit_h':label=label.replace(' ?', '\u00a0?')
        return f'<h2 class="{cls}" data-expo-copy="{k}">{label}</h2>'
    def link(k, href, cls='underline underline-offset-4', external=False):
        extra=' target="_blank" rel="noopener noreferrer"' if external else ''
        return f'<a class="{cls}" data-expo-copy="{k}" href="{href}"{extra}>{t(k)}</a>'
    def row(label, body):
        return f'<div class="expo-row"><dt data-expo-copy="{label}">{t(label)}</dt><dd>{body}</dd></div>'
    official_button='inline-block w-full sm:w-auto bg-village-dark text-village-light hover:bg-village-accent transition-colors duration-300 py-5 px-10 font-sans tracking-widest uppercase text-sm font-semibold shadow-md hover:shadow-xl'
    return f'''
<div class="lv-block expo-article" id="lv-98666c11f5a2"><div class="font-serif antialiased w-full">
<header class="relative w-full h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden bg-village-dark">
<img src="{IMAGE}" alt="{t('poster_alt')}" width="1372" height="1468" class="absolute inset-0 w-full h-full object-cover" style="object-position:center 42%" fetchpriority="high" decoding="async"/>
<div class="absolute inset-0 bg-gradient-to-t from-village-bg via-village-dark/60 to-village-dark/80"></div>
<div class="relative z-10 text-center px-6 mt-16 md:mt-0 max-w-4xl mx-auto"><span class="font-sans text-village-light uppercase tracking-[0.3em] text-xs md:text-sm block mb-4 drop-shadow-md" data-expo-copy="eyebrow">{t('eyebrow')}</span>
<h1 class="font-cursive text-5xl md:text-7xl lg:text-8xl text-village-white drop-shadow-2xl mb-6 leading-tight" data-expo-copy="h1">{t('h1')}</h1>
{p('subtitle','font-sans text-village-light uppercase tracking-widest text-sm font-semibold mt-4 drop-shadow-md')}</div></header>
<div class="w-full pb-24 -mt-8 relative z-20"><article class="max-w-4xl mx-auto px-6 bg-village-bg relative">
<div class="flex items-center justify-center space-x-4 font-sans text-xs md:text-sm text-village-accent uppercase tracking-widest mb-12 pt-10 border-b border-village-accent/20 pb-6"><span>Le Grimaldi by Le Village</span><span>•</span><time datetime="2026-11-13" data-expo-copy="published">{t('published')}</time></div>
<nav class="font-sans text-xs text-village-accent mb-8" data-expo-breadcrumb></nav>
{p('lead','drop-cap text-lg md:text-xl text-village-dark/90 leading-relaxed mb-6')}{p('intro')}
<section><div class="flex flex-col md:flex-row gap-10 md:gap-16 items-center my-12"><div class="w-full md:w-1/2">{h('history_h')}{p('history_1')}{p('history_2')}</div>
<div class="w-full md:w-1/2 flex justify-center"><figure class="relative bg-village-white p-3 border border-village-dark/10 shadow-xl rounded-sm w-full max-w-[350px] transform rotate-2 hover:rotate-0 transition-transform duration-500">
<a href="{IMAGE}" aria-label="{t('poster_open')}" target="_blank" rel="noopener noreferrer"><img src="{IMAGE}" alt="{t('poster_alt')}" width="1372" height="1468" loading="lazy" decoding="async" class="w-full h-auto block"/></a>
<figcaption class="font-sans text-xs text-village-dark/60 mt-3 text-center" data-expo-copy="poster_credit">{t('poster_credit')}</figcaption></figure></div></div>{p('history_3')}</section>
<section aria-labelledby="expo-practical-title" class="info-card p-8 md:p-12 shadow-xl mb-16 relative mt-16">
{h('practical_h','font-serif text-2xl md:text-3xl text-village-dark mb-6 text-center')}
<dl class="expo-practical font-sans text-village-dark/80 text-base md:text-lg">
{row('dates_label',p('dates','font-semibold'))}{row('location_label',p('location',''))}
{row('hours_label',p('winter','')+p('spring','')+p('closed',''))}
{row('prices_label',p('prices','')+p('combined',''))}{row('access_label',p('access',''))}
</dl><p class="font-sans text-base text-village-dark/80 mb-6"><a href="tel:+33492024735">04 92 02 47 35</a> · <a class="underline" href="mailto:chateau@cagnes.fr">chateau@cagnes.fr</a></p>
{p('ticket_note','font-sans text-xs text-village-dark/60 mt-6 mb-6')}<div class="text-center">{link('official',OFFICIAL,official_button,True)}</div></section>
<section>{h('visit_h',H+' text-center mt-16')}{p('visit_p')}<p class="font-sans text-base text-village-dark/80 mb-6">{link('guide','/visiter-haut-de-cagnes')}</p></section>
<section>{h('restaurant_h',H+' text-center mt-16')}{p('restaurant_p')}
<div class="menu-card expo-table-card">{h('table_h','expo-table-title')}{p('table_p','expo-table-description')}
<div class="expo-table-actions">{link('book','/reserver','expo-table-button')}{link('menu','/la-carte','expo-table-button expo-table-button-outline')}</div>
<div class="expo-table-phone">{link('phone','tel:+33493200886','expo-table-phone-link')}</div></div></section>
<aside class="bg-village-dark text-village-light p-8 md:p-12 shadow-xl mb-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12 rounded-sm border border-village-accent/20 mt-16">
<div class="w-full md:w-1/3 flex justify-center relative z-10"><div class="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-2 border-village-accent/30 shadow-2xl"><img src="/assets/images/articles-hd/chambre-grimaldi-4-hd-480.webp" alt="{t('hotel_alt')}" width="480" height="320" class="w-full h-full object-cover" loading="lazy" decoding="async"/></div></div>
<div class="w-full md:w-2/3 relative z-10 text-center md:text-left">{h('hotel_h','font-cursive text-4xl md:text-5xl text-village-accent mb-4')}{p('hotel_p','font-sans text-base md:text-lg text-village-light/80 leading-relaxed mb-6')}{link('hotel_cta','/hotel-cagnes-sur-mer-le-grimaldi','inline-block border border-village-accent text-village-accent hover:bg-village-accent hover:text-village-white transition-colors duration-300 py-3 px-8 font-sans tracking-widest uppercase text-xs md:text-sm')}</div></aside>
{p('sources','font-sans text-xs text-village-dark/60 leading-relaxed mb-4')}<p class="font-sans text-xs text-village-dark/60 leading-relaxed mb-8">{link('announcement',ANNOUNCEMENT,external=True)}</p>
</article></div></div></div>'''

CSS='''
.expo-article .info-card{background-image:repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(157,98,61,.08) 39px,rgba(157,98,61,.08) 40px);background-color:#fff;border:1px solid rgba(113,53,6,.2)}
.expo-article .expo-row{display:grid;grid-template-columns:110px minmax(0,1fr);gap:20px;padding:16px 0;border-bottom:1px solid rgba(113,53,6,.12)}
.expo-article .expo-row dt{font-weight:600}.expo-article .expo-row dd{margin:0}.expo-article .expo-row p{margin:0 0 8px}.expo-article .expo-practical{margin:0 0 22px}.expo-article h1{overflow-wrap:break-word}.expo-article .expo-row a{overflow-wrap:anywhere}
.expo-article [data-expo-copy=visit_h]{text-wrap:balance}
.expo-article .expo-table-card{position:relative;text-align:center;margin:40px auto 64px;padding:44px 40px 36px;max-width:740px;box-shadow:0 15px 40px -15px rgba(113,53,6,.18)}
.expo-article .expo-table-card:before{content:'';position:absolute;inset:8px;border:1px solid rgba(157,98,61,.18);pointer-events:none}
.expo-article .expo-table-title{font:400 clamp(40px,5vw,54px)/1.2 'Great Vibes',cursive;color:#713506;margin:0 0 18px}
.expo-article .expo-table-description{font:400 16px/1.8 Lato,sans-serif;color:rgba(113,53,6,.8);max-width:510px;margin:0 auto 26px}
.expo-article .expo-table-actions{display:flex;flex-wrap:wrap;align-items:stretch;justify-content:center;gap:14px}
.expo-article .expo-table-button{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:15px 24px;border:1px solid #713506;background:#713506;color:#fcf9f3;font:500 12px/1.5 Poppins,sans-serif;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;transition:background .25s,color .25s}
.expo-article .expo-table-button:hover{background:#9d623d;border-color:#9d623d}
.expo-article .expo-table-button-outline{background:transparent;color:#713506}
.expo-article .expo-table-button-outline:hover{background:#f5f0ea;color:#713506}
.expo-article .expo-table-phone{margin-top:22px}.expo-article .expo-table-phone-link{font:400 13px/1.6 Lato,sans-serif;color:#713506;text-decoration:underline;text-underline-offset:4px}
.expo-article .expo-table-button:focus-visible,.expo-article .expo-table-phone-link:focus-visible{outline:2px solid #9d623d;outline-offset:4px}
@media(max-width:600px){.expo-article .expo-table-card{padding:36px 25px 30px}.expo-article .expo-table-actions{flex-direction:column}.expo-article .expo-table-button{width:100%;box-sizing:border-box}}
@media(max-width:600px){.expo-article .expo-row{grid-template-columns:1fr;gap:6px}.expo-article .info-card{padding:24px}.expo-article h1{font-size:clamp(36px,10vw,48px)}}
'''

def schema(lang):
    d=DATA[lang];u=BASE+url(lang,SLUG)
    return {'@context':'https://schema.org','@graph':[
        {'@type':'WebPage','@id':u+'#webpage','url':u,'name':d['title'],'description':d['description'],'inLanguage':lang},
        {'@type':'BlogPosting','@id':u+'#article','headline':d['h1'],'description':d['description'],'mainEntityOfPage':{'@id':u+'#webpage'},'datePublished':'2026-11-13','dateModified':'2026-11-13','inLanguage':lang,'image':[BASE+IMAGE],'author':{'@type':'Organization','name':'Le Grimaldi by Le Village','url':BASE+'/'},'publisher':{'@type':'Organization','name':'Le Grimaldi by Le Village','url':BASE+'/'}},
        {'@type':'BreadcrumbList','itemListElement':[
            {'@type':'ListItem','position':1,'name':CRUMBS[lang][0],'item':BASE+url(lang,'')},
            {'@type':'ListItem','position':2,'name':CRUMBS[lang][1],'item':BASE+url(lang,'blog-list')},
            {'@type':'ListItem','position':3,'name':d['crumb'],'item':u}]}]}

CRUMBS={}
PAGES={}
for lang in LANGS:
    template=(ROOT/(TEMPLATE+'.html')).read_text() if lang=='fr' else PACKS[lang][TEMPLATE]
    s=BeautifulSoup(template,'html.parser')
    oldnav=s.select_one('main nav');anchors=oldnav.select('a')
    CRUMBS[lang]=[a.get_text(strip=True) for a in anchors[:2]]
    nav=copy.deepcopy(oldnav)
    for child in list(nav.contents): child.extract()
    for i,label in enumerate(CRUMBS[lang]):
        a=s.new_tag('a',href=url(lang,'' if i==0 else 'blog-list'));a.string=label;nav.append(a);nav.append(' / ')
    crumb=s.new_tag('span');crumb.string=DATA[lang]['crumb'];nav.append(crumb)
    main=BeautifulSoup('<main id="main">'+markup(lang)+'</main>','html.parser').main
    main.select_one('[data-expo-breadcrumb]').replace_with(nav)
    main.select_one('[data-expo-copy=practical_h]')['id']='expo-practical-title'
    if lang!='fr':
        for a in main.select('a[href]'):
            href=a['href']
            if href.startswith('/') and not href.startswith('/assets/'):a['href']='/'+lang+href
    s.main.replace_with(main)
    for e in s.select('[data-i18n]'):
        # Common chrome is already translated. The article uses its own catalogue.
        if e.find_parent('main'):del e['data-i18n']
    for e in s.select('style,script[type="application/ld+json"],link[rel=alternate][hreflang],.language-footer'):e.decompose()
    style=s.new_tag('style');style.string=CSS;s.head.append(style)
    s.html['data-page-slug']=SLUG;s.html['lang']=lang;s.html['data-site-locale']=lang
    s.title.string=DATA[lang]['title']
    for e in s.select('meta[name=description],meta[property="og:description"]'):e['content']=DATA[lang]['description']
    s.select_one('meta[property="og:title"]')['content']=DATA[lang]['title']
    s.select_one('meta[property="og:url"]')['content']=BASE+url(lang,SLUG)
    s.select_one('meta[property="og:image"]')['content']=BASE+IMAGE
    s.select_one('link[rel=canonical]')['href']=BASE+url(lang,SLUG)
    # Preserve the existing widget, privacy controls and menu scripts.
    for code in LANGS+['x-default']:
        s.head.append(s.new_tag('link',rel='alternate',hreflang=code,href=BASE+url('fr' if code=='x-default' else code,SLUG)))
    ld=s.new_tag('script',type='application/ld+json');ld.string=json.dumps(schema(lang),ensure_ascii=False);s.head.append(ld)
    s.body.append(BeautifulSoup(footer(lang,SLUG),'html.parser'))
    PAGES[lang]=str(s)
    if lang!='fr':PACKS[lang][SLUG]=PAGES[lang]
(ROOT/(SLUG+'.html')).write_text(PAGES['fr'])

def card(lang, grid=False):
    d=DATA[lang];E=lambda x:html.escape(x,quote=True);href=url(lang,SLUG)
    img=f'<img src="{IMAGE}" alt="{E(d["poster_alt"])}" loading="lazy" decoding="async" width="1372" height="1468" style="object-fit:contain;object-position:center;background:#ded2b9"/>'
    if grid:
        return f'<article data-exposition-80-card><a href="{href}">{img}<h2>{E(d["h1"])}</h2></a><p>{E(d["badge"])}</p><p>{E(d["description"])}</p><a href="{href}">{E(d["read"])}</a></article>'
    img=img.replace('<img ','<img class="village-img w-full h-full" ',1)
    return f'<a data-exposition-80-card href="{href}" class="group flex flex-col w-[280px] md:w-[380px] flex-shrink-0 snap-start no-underline h-full"><div class="village-img-wrapper shadow-md mb-6 h-[220px] md:h-[260px] bg-village-white">{img}</div><div class="flex flex-col flex-grow"><span class="font-sans text-[10px] text-village-dark/50 uppercase tracking-widest mb-3">{E(d["badge"])}</span><h3 class="font-serif text-xl md:text-2xl text-village-dark leading-snug mb-3">{E(d["h1"])}</h3><p class="font-sans text-sm text-village-dark/80 leading-relaxed mb-6 flex-grow">{E(d["description"])}</p><div><span class="village-link-read">{E(d["read"])}</span></div></div></a>'

def add_card(doc,lang,grid=False):
    if 'data-exposition-80-card' in doc:return doc
    pattern=r'(<div\b[^>]*\bclass="article-grid"[^>]*>)' if grid else r'(<div\b[^>]*\bid="blog-track"[^>]*>)'
    result,n=re.subn(pattern,lambda m:m[1]+card(lang,grid),doc,count=1)
    if n!=1:raise ValueError('Missing news slot '+lang+' '+str(grid))
    return result

for name in ['index','le-village-restaurant-haut-de-cagnes-sur-mer','hotel-cagnes-sur-mer-le-grimaldi','blog-list']:
    p=ROOT/(name+'.html');p.write_text(add_card(p.read_text(),'fr',name=='blog-list'))
    source=ROOT/f'tools/source-pages/{name}.json'
    if not source.exists():continue
    data=json.loads(source.read_text())
    for block in data['blocks']:
        if 'id="blog-track"' in block.get('content','') or 'class="article-grid"' in block.get('content',''):block['content']=add_card(block['content'],'fr',name=='blog-list')
    source.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
# Add a contextual link to the cultural guide and the original summer archive.
def related(doc, lang):
    if 'data-exposition-80-related' in doc:return doc
    text=html.escape(DATA[lang]['badge']+' · '+DATA[lang]['read'])
    block=f'<aside data-exposition-80-related class="max-w-4xl mx-auto px-6 py-8 font-sans text-village-dark"><a class="underline underline-offset-4" href="{url(lang,SLUG)}">{text}</a></aside>'
    return doc.replace('</main>',block+'</main>',1)
for name in ['visiter-haut-de-cagnes','fete-de-la-musique-jazz-chateau-cagnes-sur-mer']:
    p=ROOT/(name+'.html');p.write_text(related(p.read_text(),'fr'))
    source=ROOT/f'tools/source-pages/{name}.json'
    data=json.loads(source.read_text())
    if not any('data-exposition-80-related' in b.get('content','') for b in data['blocks']):
        block=related('</main>','fr').replace('</main>','')
        data['blocks'].append({'type':'GridEmbed','content':block})
        source.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    for lang,pages in PACKS.items():pages[name]=related(pages[name],lang)
for lang,pages in PACKS.items():
    for name in ['','le-village-restaurant-haut-de-cagnes-sur-mer','hotel-cagnes-sur-mer-le-grimaldi','blog-list']:
        pages[name]=add_card(pages[name],lang,name=='blog-list')
    (ROOT/f'i18n/pages/{lang}.json.gz').write_bytes(gzip.compress(json.dumps(pages,ensure_ascii=False,separators=(',',':')).encode(),compresslevel=9,mtime=0))

manifest=ROOT/'tools/manifest.json';data=json.loads(manifest.read_text())
if not any(x['path']=='/'+SLUG for x in data):data.insert(0,{'path':'/'+SLUG,'file':SLUG+'.html','title':FR['title'],'kind':'blog'})
manifest.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
source=json.loads((ROOT/f'tools/source-pages/{TEMPLATE}.json').read_text())
source.update(slug=SLUG,date='2026-11-13',sortDate='2026-11-13',meta={'title':FR['title'],'description':FR['description']},blocks=[{'type':'GridEmbed','content':'<style>'+CSS+'</style>'+BeautifulSoup(PAGES['fr'],'html.parser').main.decode_contents()}])
(ROOT/f'tools/source-pages/{SLUG}.json').write_text(json.dumps(source,ensure_ascii=False,indent=2)+'\n')

# A per-article catalogue survives normal rebuilds without modifying the large
# historical catalogue or the translations of any unrelated article.
catalog={}
for k,text in FR.items():catalog[text]={lang:DATA[lang][k] for lang in LANGS[1:]}
for k,text in FR.items():
    if ' ?' in text:
        catalog[text.replace(' ?', '\u00a0?')]={lang:DATA[lang][k].replace(' ?', '\u00a0?') for lang in LANGS[1:]}
catalog_path=ROOT/'tools/i18n/exposition-80-ans.json';catalog_path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
for lang in LANGS:
    p=ROOT/f'assets/i18n/{lang}.json';dictionary=json.loads(p.read_text())
    for k,text in FR.items():dictionary[hashlib.sha256(text.encode()).hexdigest()[:16]]=DATA[lang][k]
    p.write_text(json.dumps(dictionary,ensure_ascii=False,separators=(',',':')))
(ROOT/f'i18n/catalogs/{SLUG}.json').write_text(json.dumps({hashlib.sha256(text.encode()).hexdigest()[:16]:text for text in FR.values()},ensure_ascii=False))
xml=ROOT/'sitemap.xml';text=xml.read_text()
if BASE+'/'+SLUG not in text:
    text=text.replace('</urlset>',''.join('<url><loc>'+BASE+url(lang,SLUG)+'</loc><lastmod>2026-11-13</lastmod></url>' for lang in LANGS)+'</urlset>')
xml.write_text(text)
print('Prepared anniversary exhibition article in',len(PAGES),'languages')
