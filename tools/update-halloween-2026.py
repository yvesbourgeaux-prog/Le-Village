"""Publish the October 31 invitation while preserving existing pages and locale packs.

Content is maintained in halloween-2026-locales.json and the normal source catalogue.
Run only when updating this campaign; does not rebuild unrelated HTML.
"""
import gzip, hashlib, html, json, re
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://legrimaldibylevillage.com'
OLD = 'automne-halloween-haut-de-cagnes'
SLUG = 'halloween-31-octobre-haut-de-cagnes-soupe-citrouille'
POSTER = '/assets/images/halloween-31-octobre-2026.webp'
VERSION = '20261027-style2'
DATA = json.loads((ROOT/'tools/halloween-2026-locales.json').read_text())
LANGS = list(DATA)
FRENCH = DATA['fr']
assert all(len(v)==len(FRENCH)==29 for v in DATA.values())
E = lambda s: html.escape(s, quote=True)
url = lambda lang, slug: ('' if lang=='fr' else '/'+lang)+'/'+slug
def tag(name, i, cls=''):
    mapping=E(json.dumps({'t':{'0':hashlib.sha256(FRENCH[i].encode()).hexdigest()[:16]},'a':{}},separators=(',',':')))
    return f'<{name}'+(f' class="{cls}"' if cls else '')+f' data-i18n="{mapping}">{E(T[i])}</{name}>'

def hotel_aside(lang):
    template=(ROOT/(OLD+'.html')).read_text() if lang=='fr' else json.loads(gzip.decompress((ROOT/f'i18n/pages/{lang}.json.gz').read_bytes()))[OLD]
    aside=re.search(r'<aside class="bg-village-dark\b.*?</aside>',template,re.S)
    if not aside:raise ValueError('Missing hotel aside: '+lang)
    return aside[0].replace('<aside ', '<aside data-halloween-hotel ', 1)

def content(lang):
    global T
    T=DATA[lang]
    book=BOOK[lang]['book']
    p='text-base md:text-lg text-village-dark/80 leading-relaxed font-sans mb-6'
    h='font-serif text-3xl md:text-4xl text-village-dark mb-6 text-center mt-16'
    links=f'<div class="nav-links-village"><div class="nav-col"><a class="village-link" href="{url(lang,OLD)}">{E(T[26])}</a><a class="village-link" href="{url(lang,"visiter-haut-de-cagnes")}">{E(T[27])}</a></div></div>'
    video='https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F4281712742126931%2F&show_text=false&width=267&t=0'
    return f'''<div class="lv-block" id="lv-2245ee60793a"><div class="font-serif antialiased w-full" id="village-blog-halloween-soupe-block">
<header class="relative w-full h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden bg-village-dark">
<img class="absolute inset-0 w-full h-full object-cover" src="{POSTER}" alt="{E(T[17])}" width="765" height="1024" fetchpriority="high" decoding="async" style="object-position:center 30%"/>
<div class="absolute inset-0 bg-gradient-to-t from-village-bg via-village-dark/60 to-village-dark/80"></div>
<div class="relative z-10 text-center px-6 mt-16 md:mt-0 max-w-4xl mx-auto">{tag('p',2,'font-sans text-village-light uppercase tracking-widest text-xs md:text-sm block mb-4 drop-shadow-md')}{tag('h1',3,'font-cursive text-5xl md:text-7xl text-village-white drop-shadow-2xl mb-6 leading-tight')}</div>
</header>
<div class="w-full pb-24 -mt-8 relative z-20"><article class="max-w-4xl mx-auto px-6 bg-village-bg relative">
<div class="flex items-center justify-center space-x-4 font-sans text-xs md:text-sm text-village-accent uppercase tracking-widest mb-12 pt-10 border-b border-village-accent/20 pb-6"><span>Le Grimaldi by Le Village</span><span>•</span><time datetime="2026-10-31">31.10.2026 · 19h</time></div>
{tag('p',4,'drop-cap text-lg md:text-xl text-village-dark/90 leading-relaxed mb-10')}
<section>{tag('h2',5,h)}{tag('p',6,p)}{links}</section>
<section><div class="flex flex-col md:flex-row gap-10 md:gap-16 items-center my-12"><div class="w-full md:w-1/2">{tag('h2',7,'font-serif text-3xl md:text-4xl text-village-dark mb-6')}{tag('p',8,p)}</div><div class="w-full md:w-1/2 flex justify-center"><figure class="relative bg-village-white p-3 border border-village-dark/10 shadow-xl rounded-sm w-full max-w-[350px] transform rotate-2 hover:rotate-0 transition-transform duration-500"><img src="{POSTER}" alt="{E(T[17])}" width="765" height="1024" loading="lazy" decoding="async" class="w-full h-auto block"/></figure></div></div></section>
<section>{tag('h2',9,h)}{tag('p',10,p)}</section>
<section class="my-12 text-center border-t border-b border-village-accent/30 py-8 px-4">{tag('h2',15,'font-cursive text-4xl md:text-5xl text-village-accent leading-relaxed mb-6')}<div class="hw-video-shell"><iframe data-consent-src="{E(video)}" hidden="" title="{E(T[15])}" width="267" height="476" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; web-share" allowfullscreen="" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>{tag('p',16,'font-sans text-sm text-village-dark/70 leading-relaxed mt-6')}</section>
<section>{tag('h2',11,h)}{tag('p',12,p)}</section>
<section class="info-card p-8 md:p-12 shadow-xl mb-16 relative mt-16" id="programme">{tag('h2',24,'font-serif text-2xl md:text-3xl text-village-dark mb-6 text-center')}{tag('p',25,'font-sans text-village-dark/80 leading-relaxed text-base md:text-lg text-center')}</section>
<section class="text-center border-t border-village-accent/20 pt-10 pb-12">{tag('h2',13,'font-serif text-3xl md:text-4xl text-village-dark mb-6')}{tag('p',14,p)}<div class="nav-links-village"><div class="nav-col"><a class="village-link" href="{url(lang,'la-carte')}">{E(T[28])}</a><a class="book-button" href="{url(lang,'reserver')}">{E(book)}</a></div></div></section>
{hotel_aside(lang)}</article></div></div></div>'''

def schema(lang):
    t=DATA[lang];u=BASE+url(lang,SLUG)
    return {'@context':'https://schema.org','@graph':[
        {'@type':'WebPage','@id':u+'#webpage','url':u,'name':t[0],'description':t[1],'inLanguage':lang},
        {'@type':'BlogPosting','@id':u+'#article','mainEntityOfPage':{'@id':u+'#webpage'},'headline':t[3],'description':t[1],'image':BASE+POSTER,'datePublished':'2026-10-27T22:00:00+01:00','dateModified':'2026-10-27T22:00:00+01:00','author':{'@type':'Organization','name':'Le Village','url':BASE},'publisher':{'@type':'Organization','name':'Le Grimaldi by Le Village','url':BASE},'inLanguage':lang},
        {'@type':'Event','@id':u+'#event','name':t[19],'description':t[8],'startDate':'2026-10-31T19:00:00+01:00','eventStatus':'https://schema.org/EventScheduled','eventAttendanceMode':'https://schema.org/OfflineEventAttendanceMode','isAccessibleForFree':True,'image':BASE+POSTER,'url':u,'location':{'@type':'Place','name':'Place du Château, Haut-de-Cagnes','address':{'@type':'PostalAddress','streetAddress':'Place du Château','addressLocality':'Cagnes-sur-Mer','postalCode':'06800','addressCountry':'FR'}},'organizer':[{'@type':'Organization','name':'Association des Haut-Cagnois','url':'https://www.facebook.com/profile.php?id=100077381420018'},{'@type':'Restaurant','name':'Le Village','url':BASE+'/le-village-restaurant-haut-de-cagnes-sur-mer'}]},
        {'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Le Village','item':BASE+url(lang,'')},{'@type':'ListItem','position':2,'name':t[19],'item':u}]}
    ]}

def make_page(template,lang):
    # Preserve the established navigation, footer and consent scripts of each locale.
    doc=template.replace(OLD,SLUG)
    doc=re.sub(r'<main\b[^>]*>.*?</main>',lambda m:'<main id="main">'+content(lang)+'</main>',doc,count=1,flags=re.S)
    head,body=doc.split('</head>',1)
    head=re.sub(r'<title\b[^>]*>.*?</title>',lambda m:'<title>'+E(DATA[lang][0])+'</title>',head,flags=re.S)
    def meta(m):
        tag=m.group();key=re.search(r'(?:name|property)=["\']([^"\']+)',tag)
        if not key:return tag
        k=key[1];value=DATA[lang][0] if k in ('og:title','twitter:title') else DATA[lang][1] if k in ('description','og:description','twitter:description') else BASE+POSTER if k in ('og:image','twitter:image') else None
        if value is None:return tag
        tag=re.sub(r'\sdata-i18n=(?:\'[^\']*\'|"[^"]*")','',tag)
        return re.sub(r'\bcontent=(?:"[^"]*"|\'[^\']*\')',lambda m:'content="'+E(value)+'"',tag)
    head=re.sub(r'<meta\b[^>]*>',meta,head)
    head=re.sub(r'<script\b[^>]*type="application/ld\+json"[^>]*>.*?</script>','',head,flags=re.S)
    head=re.sub(r'<link\b(?=[^>]*\bhreflang=)[^>]*>','',head)
    for alternate in LANGS:
        head+=f'<link rel="alternate" hreflang="{alternate}" href="{BASE+url(alternate,SLUG)}"/>'
    head+=f'<link rel="alternate" hreflang="x-default" href="{BASE}/{SLUG}"/>'
    head=re.sub(r'<link\b[^>]*halloween-event\.css[^>]*>','',head)
    head+= '<script type="application/ld+json">'+json.dumps(schema(lang),ensure_ascii=False).replace('</','<\\/')+'</script>'
    head+=f'<link rel="stylesheet" href="/assets/css/halloween-event.css?v={VERSION}"/>'
    # The old article-specific code is not needed by this new layout.
    head=re.sub(r'<script\b[^>]*src="/assets/js/lv-2245ee60793a\.js"[^>]*></script>','',head)
    return head+'</head>'+body

def card(lang,grid=False):
    t=DATA[lang];u=url(lang,SLUG)
    if grid:return f'<article data-halloween-2026-card><a href="{u}"><img src="{POSTER}" alt="{E(t[17])}" loading="lazy" style="object-fit:cover;object-position:center"/><h2>{E(t[19])}</h2></a><p>{E(t[20])}</p><a href="{u}">{E(t[21])} →</a></article>'
    return f'''<a data-halloween-2026-card href="{u}" class="group flex flex-col w-[280px] md:w-[380px] flex-shrink-0 snap-start no-underline h-full"><div class="village-img-wrapper shadow-md mb-6 h-[220px] md:h-[260px] bg-village-white"><img src="{POSTER}" alt="{E(t[17])}" loading="lazy" class="village-img w-full h-full" style="object-fit:cover;object-position:center"/></div><div class="flex flex-col flex-grow"><span class="font-sans text-[10px] text-village-dark/50 uppercase tracking-widest mb-3">{E(t[18])}</span><h3 class="font-serif text-xl md:text-2xl text-village-dark leading-snug mb-3">{E(t[19])}</h3><p class="font-sans text-sm text-village-dark/80 leading-relaxed mb-6 flex-grow">{E(t[20])}</p><div><span class="village-link-read">{E(t[21])}</span></div></div></a>'''

def add_card(doc,lang,grid=False):
    if 'data-halloween-2026-card' in doc:return doc
    pat=r'(<div\b[^>]*\bclass="article-grid"[^>]*>)' if grid else r'(<div\b[^>]*\bid="blog-track"[^>]*>)'
    return re.sub(pat,lambda m:m[1]+card(lang,grid),doc,count=1)

def add_notice(doc,lang):
    if 'data-halloween-2026-notice' in doc:return doc
    t=DATA[lang]
    notice=f'<aside data-halloween-2026-notice class="hw-related-notice"><a href="{url(lang,SLUG)}">{E(t[18])} — {E(t[19])} →</a></aside>'
    doc=re.sub(r'(<main\b[^>]*>)',lambda m:m[1]+notice,doc,count=1)
    return doc.replace('</head>',f'<link rel="stylesheet" href="/assets/css/halloween-event.css?v={VERSION}"/></head>')

popup_path=ROOT/'assets/js/automne-popup.js'
popup=popup_path.read_text()
match=re.search(r'const messages = (\{.*?\n\});',popup,re.S)
BOOK=json.loads(match[1]);messages=json.loads(match[1])
for lang,t in DATA.items():
    messages[lang].update(eyebrow=t[18],title=t[22],description=t[23],event=t[21],alt=t[17])
popup=popup[:match.start(1)]+json.dumps(messages,ensure_ascii=False,indent=2)+popup[match.end(1):]
popup=popup.replace('2026-11-02T00:00:00+01:00','2026-11-01T00:00:00+01:00')
popup=popup.replace("const key = 'lv-autumn-popup-2026';\n  try { if (localStorage.getItem(key)) return; } catch (_) {}", """const key = 'lv-halloween-soup-20261027-v1';
  // A new campaign resets the previous once-only dismissal for every visitor.
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());
  let views = { day, count: 0, last: 0 };
  try {
    localStorage.removeItem('lv-autumn-popup-2026');
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && saved.day === day && Number.isFinite(saved.count) && Number.isFinite(saved.last)) views = saved;
    if (views.count >= 3 || Date.now() - views.last < 20 * 60 * 1000) return;
  } catch (_) {}""")
popup=popup.replace('/assets/images/automne-popup.webp',POSTER).replace('/'+OLD,'/'+SLUG)
popup=popup.replace("const remember = () => { try { localStorage.setItem(key, String(Date.now())); } catch (_) {} };", "const remember = () => {};")
if 'views.count += 1' not in popup:popup=popup.replace('    dialog.showModal();',"""    if (dialog.open) return;
    dialog.showModal();
    views.count += 1;
    views.last = Date.now();
    try { localStorage.setItem(key, JSON.stringify(views)); } catch (_) {}""")
if '}, 6500)' not in popup:popup=popup.replace("  window.addEventListener('scroll', onScroll, { passive: true });", """  window.addEventListener('scroll', onScroll, { passive: true });
  // Also reach visitors who remain above the fold after choosing their cookies.
  window.setTimeout(() => { if (!initiated) { initiated = true; window.removeEventListener('scroll', onScroll); tryOpen(); } }, 6500);""")
popup_path.write_text(popup)

# Image conversion keeps the supplied poster intact; no crop, redraw or logo change.
poster_input=ROOT.parent/'upload/image(20261027-220111).png'
if poster_input.exists():Image.open(poster_input).convert('RGB').save(ROOT/POSTER.lstrip('/'),'WEBP',quality=94,method=6)

catalog_path=ROOT/'tools/i18n/catalogue.json';catalog=json.loads(catalog_path.read_text())
for i,original in enumerate(FRENCH):catalog[original]={lang:t[i] for lang,t in DATA.items() if lang!='fr'}
catalog_path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')

french_template=(ROOT/(OLD+'.html')).read_text()
new_french=make_page(french_template,'fr');(ROOT/(SLUG+'.html')).write_text(new_french)
manifest_path=ROOT/'tools/manifest.json';manifest=json.loads(manifest_path.read_text())
if not any(m['path']=='/'+SLUG for m in manifest):manifest.insert(0,{'path':'/'+SLUG,'file':SLUG+'.html','title':FRENCH[0],'kind':'blog'})
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
source=json.loads((ROOT/'tools/source-pages'/ (OLD+'.json')).read_text())
new_source={**source,'slug':SLUG,'date':'2026-10-27','sortDate':'2026-10-31','meta':{'title':FRENCH[0],'description':FRENCH[1]},'blocks':[{'type':'GridEmbed','content':content('fr')}]}
(ROOT/'tools/source-pages'/(SLUG+'.json')).write_text(json.dumps(new_source,ensure_ascii=False,indent=2)+'\n')
for path in (ROOT/'tools/source-pages').glob('*.json'):
    if path.stem==SLUG:continue
    p=json.loads(path.read_text());changed=False
    for block in p['blocks']:
        if 'content' not in block:continue
        before=block['content'];block['content']=add_card(before,'fr');changed|=before!=block['content']
    if p['slug']==OLD and not any('data-halloween-2026-notice' in b.get('content','') for b in p['blocks']):
        p['blocks'].insert(0,{'type':'GridEmbed','content':f'<aside data-halloween-2026-notice class="hw-related-notice"><a href="/{SLUG}">{E(FRENCH[18])} — {E(FRENCH[19])} →</a></aside>'});changed=True
    if changed:path.write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')

for path in ROOT.glob('*.html'):
    if path.stem==SLUG:continue
    doc=path.read_text();original=doc
    doc=add_card(doc,'fr',path.stem=='blog-list')
    if path.stem==OLD:doc=add_notice(doc,'fr')
    doc=re.sub(r'(/assets/(?:js|css)/automne-popup\.(?:js|css)\?v=)[^"\s<>]*',lambda m:m[1]+VERSION,doc)
    if doc!=original:path.write_text(doc)

for lang in LANGS:
    if lang=='fr':continue
    path=ROOT/f'i18n/pages/{lang}.json.gz';pages=json.loads(gzip.decompress(path.read_bytes()))
    pages[SLUG]=make_page(pages[OLD],lang)
    for slug,doc in list(pages.items()):
        if slug==SLUG:continue
        doc=add_card(doc,lang,slug=='blog-list')
        if slug==OLD:doc=add_notice(doc,lang)
        doc=re.sub(r'(/assets/(?:js|css)/automne-popup\.(?:js|css)\?v=)[^"\s<>]*',lambda m:m[1]+VERSION,doc)
        pages[slug]=doc
    path.write_bytes(gzip.compress(json.dumps(pages,ensure_ascii=False,separators=(',',':')).encode(),compresslevel=9,mtime=0))

# Rebuild-compatible translations and search discovery.
for lang in LANGS:
    dictionary_path=ROOT/f'assets/i18n/{lang}.json';dictionary=json.loads(dictionary_path.read_text())
    for i,original in enumerate(FRENCH):dictionary[hashlib.sha256(original.encode()).hexdigest()[:16]]=DATA[lang][i]
    dictionary_path.write_text(json.dumps(dictionary,ensure_ascii=False,separators=(',',':')))
(ROOT/f'i18n/catalogs/{SLUG}.json').write_text(json.dumps({hashlib.sha256(t.encode()).hexdigest()[:16]:t for t in FRENCH},ensure_ascii=False))
sitemap=ROOT/'sitemap.xml';xml=sitemap.read_text()
if BASE+'/'+SLUG not in xml:xml=xml.replace('</urlset>',''.join('<url><loc>'+BASE+url(lang,SLUG)+'</loc></url>' for lang in LANGS)+'</urlset>')
sitemap.write_text(xml)
for filename in ['i18n-page.php','tools/rebuild.py']:
    path=ROOT/filename;text=path.read_text()
    text=text.replace('20261022-night1',VERSION)
    if filename.endswith('rebuild.py') and "if slug in ('"+SLUG not in text:
        needle=" if slug=='automne-haut-de-cagnes':"
        text=text.replace(needle," if slug in ('"+SLUG+"','"+OLD+"'):head+='<link rel=\"stylesheet\" href=\"/assets/css/halloween-event.css?v="+VERSION+"\">'\n"+needle)
    path.write_text(text)
print('Updated campaign, new event page and all 13 locales.')

# Reapply shared article imagery after regenerating the event or locale pages.
from article_thumbnails import refresh
refresh()
