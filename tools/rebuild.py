"""Rebuild the native static pages. Python 3 + beautifulsoup4 required."""
import json,re,hashlib,html,os
from pathlib import Path
from bs4 import BeautifulSoup,Comment
ROOT=Path(__file__).resolve().parents[1]
BASE='https://legrimaldibylevillage.com'
ASSET='https://assets.zyrosite.com/gnKoPAn3rxzY53IR/'
LOGO=ASSET+'chatgpt-image-22-nov.-2025-00_40_31-YvUWBeCav31wXD3h.png'
FALLBACK=ASSET+'548927768_18110917903554133_6103352769976099505_n-tx4bw2LvKuuQwaTd.jpg'
FOOD=ASSET+'683541319_18135204442554133_6532477583514750940_n-1---copie-uvBmAV0Bzjs06QXw.jpg'
PLACE=ASSET+'place-de-gaulle-haut-de-cagnes-YQfrbt7x9UtvMi0u.png'
HOTEL='https://img.holidu.com/images/da29199d-ce71-4bc4-9ebc-179b92ee3630/l.avif'
PAGES=[json.loads(p.read_text()) for p in sorted((ROOT/'tools/source-pages').glob('*.json'))]
SEO_OVERRIDES={'': ('Le Grimaldi by Le Village | Hôtel & Restaurant à Cagnes', 'Restaurant bistronomique et hôtel de charme au Haut-de-Cagnes. Découvrez Le Grimaldi by Le Village, sur la place du Château à Cagnes-sur-Mer.'), 'le-village-restaurant-haut-de-cagnes-sur-mer': ('Restaurant Le Village | Haut-de-Cagnes, Cagnes-sur-Mer', 'Cuisine bistronomique méditerranéenne et terrasse sur la place du Château. Réservez votre table au restaurant Le Village, au Haut-de-Cagnes.'), 'hotel-cagnes-sur-mer-le-grimaldi': ('Hôtel Le Grimaldi | 5 chambres au Haut-de-Cagnes', 'Séjournez dans l’une des cinq chambres de charme du Grimaldi by Le Village, place du Château au Haut-de-Cagnes. Consultez les disponibilités en ligne.'), 'visiter-haut-de-cagnes': ('Visiter le Haut-de-Cagnes | Restaurant Le Village', None), 'espace-presse': ('Espace presse | Le Grimaldi by Le Village, Cagnes', 'Communiqués, dossier de presse et actualités du Grimaldi by Le Village : restaurant et hôtel de charme sur la place du Château au Haut-de-Cagnes.'), 'dossier-presse': ('Dossier de presse | Le Grimaldi by Le Village', 'Découvrez l’histoire, la cuisine et l’hôtellerie du Grimaldi by Le Village au Haut-de-Cagnes : présentation de la maison et informations pour la presse.'), 'jazz-gatsby-frankie-rochester-haut-de-cagnes': ('Soirée Gatsby au Haut-de-Cagnes | Restaurant Le Village', None), 'week-end-1er-mai-hotel-restaurant-cagnes-sur-mer': ('1er Mai au Haut-de-Cagnes | Presse Le Village', None), 'paques-2026-haut-de-cagnes-art-en-fete-dejeuner-le-village': ('Pâques & Art en Fête au Haut-de-Cagnes | Le Village', None), 'sunsets-chateau-haut-de-cagnes-dimanches-ete': ('Sunsets du Château au Haut-de-Cagnes | Le Village', None), 'haut-de-cagnes-art-en-fete-dejeuner-restaurant-le-village': ('Art en Fête au Haut-de-Cagnes | Déjeuner au Village', None), 'fete-sainte-lucie-haut-de-cagnes-cagnes-sur-mer': ('Sainte-Lucie au Haut-de-Cagnes | Restaurant Le Village', None), 'saint-valentin-2026-cagnes-sur-mer-concert-diner-hotel-le-grimaldi': ('Saint-Valentin à Cagnes-sur-Mer | Dîner & Hôtel Le Village', None), 'visite-prince-albert-2-monaco-restaurant-le-village-cagnes': ('Le Prince Albert II au restaurant Le Village | Cagnes', None), 'noel-haut-de-cagnes-restaurant-le-village': ('Noël au Haut-de-Cagnes | Restaurant Le Village', None)}
for page in PAGES:
 if page["slug"] in SEO_OVERRIDES:
  title,description=SEO_OVERRIDES[page["slug"]];page["meta"]["title"]=title
  if description:page["meta"]["description"]=description
css_blocks={}; replacements=[]; scripts={};used_js={}
def choose_image(alt):
 a=alt.lower()
 if any(w in a for w in ['chambre','suite','hôtel','hotel','lit']):return HOTEL,"Chambre de l’Hôtel Le Grimaldi au Haut-de-Cagnes"
 if any(w in a for w in ['plat','assiette','cuisine','gastronom','carte','chef']):return FOOD,'Cuisine du restaurant Le Village à Cagnes-sur-Mer'
 if any(w in a for w in ['château','village médiéval','vue','ruelle','patrimoine']):return PLACE,'Place de Gaulle au Haut-de-Cagnes'
 return FALLBACK,'Terrasse du restaurant Le Village au Haut-de-Cagnes'
def linkfix(raw):
 return raw.replace(BASE+'/','/').replace(BASE,"/")
def process(raw,page):
 raw=linkfix(raw)
 # Remove unavailable Cloudinary references, including CSS and JS galleries.
 for u in set(re.findall(r'https?://res\.cloudinary\.com/[^\s\"\'<>\\)]+',raw)):
  raw=raw.replace(u,FALLBACK)
 uid='lv-'+hashlib.sha256(raw.encode()).hexdigest()[:12]
 s=BeautifulSoup(raw,'html.parser'); external=[]; js=[]; styles=[]
 for n in s.find_all(string=lambda t:isinstance(t,Comment)):n.extract()
 for n in s.select('script'):
  if n.get('src'):
   if 'tailwind' not in n['src']:external.append(n['src'])
  elif n.get('type')!='application/ld+json' and 'tailwind.config' not in n.get_text():js.append(n.get_text())
  n.decompose()
 for n in s.select('style'):styles.append(n.get_text());n.decompose()
 for n in s.select('link,meta,title,base'):n.decompose()
 bodyclass=''
 if s.body:bodyclass=' '.join(s.body.get('class',[]))
 for n in s.select('html,head,body'):n.unwrap()
 # Restore normal in-page navigation, no frame escape code is needed anymore.
 for a in s.select('a[href]'):
  href=a['href']
  if href.startswith('/'):
   a.attrs.pop('target',None)
   if not href.startswith('//'):a.attrs.pop('onclick',None)
  if '?zc=open' in href or '#zc-action-open' in href:
   a['href']='/reserver';a.attrs.pop('onclick',None);a.attrs.pop('target',None)
  if a.get('target')=='_blank':a['rel']='noopener noreferrer'
 for i in s.select('img'):
  src=i.get('src','')
  # Existing descriptions of missing photos must not describe a replacement inaccurately.
  if src==FALLBACK:
   src,alt=choose_image(i.get('alt',''));i['src']=src;i['alt']=alt;replacements.append({'page':page,'replacement':src})
  if not i.get('alt'):i['alt']='Le Grimaldi by Le Village au Haut-de-Cagnes'
  i['decoding']='async';i['loading']='lazy'
  i.attrs.pop('onerror',None)
 for n in s.select('iframe'):
  n['loading']='lazy'
  if not n.get('title'):n['title']='Localisation du restaurant' if 'google' in n.get('src','') else 'Contenu intégré'
 for n in s.select('video'):n['preload']='metadata';n['poster']=n.get('poster',FALLBACK)
 handlers=[]
 for n in s.find_all():
  for attr in list(n.attrs):
   if attr.startswith('on'):
    val=n.attrs.pop(attr);key='h'+str(len(handlers));n['data-lv-event']=key
    handlers.append(f'document.querySelector(\'[data-lv-event="{key}"]\')?.addEventListener({json.dumps(attr[2:])},function(event){{const result=(function(event){{{val}}}).call(this,event);if(result===false)event.preventDefault();}});')
 if styles:css_blocks[uid]='\n'.join(styles)
 if js or handlers:
  code='\n'.join(js+handlers)
  scripts[uid]=f'(function(){{const root=document.getElementById({json.dumps(uid)});if(!root)return;const document=window.lvScopedDocument(root);\n'+code+'\n})();'
  # Avoid temporal dead zone: root must use the real document before scoped document binding.
  scripts[uid]=scripts[uid].replace('const root=document.getElementById','const root=window.document.getElementById')
  used_js.setdefault(page,[]).append(uid)
 return '<div id="'+uid+'" class="lv-block '+bodyclass+'">'+str(s)+'</div>',external
HEADER=f'''<a class="skip-link" href="#main">Aller au contenu</a><header class="site-header"><div class="header-inner"><button class="menu-toggle" aria-controls="site-nav" aria-expanded="false" aria-label="Ouvrir le menu"><span></span><span></span><span></span></button><nav id="site-nav" aria-label="Navigation principale"><a href="/">Le Grimaldi by Le Village</a><a href="/le-village-restaurant-haut-de-cagnes-sur-mer">Le Restaurant Le Village</a><a href="/hotel-cagnes-sur-mer-le-grimaldi">L’Hôtel Le Grimaldi</a><div class="mobile-extra"><a href="/la-carte">La Carte</a><a href="/blog-list">Actualités</a><a href="/espace-presse">Espace Presse</a></div></nav><a class="brand" href="/" aria-label="Le Grimaldi by Le Village — accueil"><img src="{LOGO}" alt="Le Grimaldi by Le Village" width="150" height="150" fetchpriority="high"></a><div class="header-actions"><a class="social" href="https://www.facebook.com/restaurantlevillagehdc" aria-label="Facebook">f</a><a class="social" href="https://www.instagram.com/restaurantlevillagehdc/" aria-label="Instagram">◎</a><a class="phone" href="tel:+33493200886" aria-label="Appeler le restaurant">☎</a><a class="book-button" href="/reserver">Réserver</a></div></div></header>'''
EXTRA_FOOT='<nav class="footer-extra" aria-label="Informations complémentaires"><a href="/blog-list">Toutes les actualités</a><a href="/visiter-haut-de-cagnes">Visiter le Haut-de-Cagnes</a><a href="/espace-presse">Espace presse</a><button type="button" data-cookie-settings>Préférences de confidentialité</button></nav>'
def instagram():
 photos=[FALLBACK,FOOD,ASSET+'572928136_18117010441554133_1923760437050638675_n-TvrQ6sg8lBtejgDd.jpg',ASSET+'551078697_18111392815554133_227775813467422912_n-Si2wTcuvWMJoKJbj.jpg',ASSET+'582793372_18118705186554133_7027943419963072274_n-6UgIiwaTzcedSzpl.jpg',ASSET+'559846321_18113516263554133_4733225079968164517_n-WVwm5HBlhXahGJZh.jpg']
 return '<section class="instagram-wall"><p class="eyebrow">La vie du Village</p><h2>Retrouvons-nous sur Instagram</h2><p>Une sélection de moments à partager. Retrouvez nos dernières publications sur Instagram.</p><div class="instagram-grid">'+''.join(f'<a href="https://www.instagram.com/restaurantlevillagehdc/" target="_blank" rel="noopener noreferrer" aria-label="Voir le compte Instagram du Village"><img src="{u}" alt="Un aperçu du restaurant Le Village" loading="lazy" decoding="async"></a>' for u in photos)+'</div><a class="book-button" href="https://www.instagram.com/restaurantlevillagehdc/" target="_blank" rel="noopener noreferrer">Suivre @restaurantlevillagehdc</a></section>'
footer,_=process(PAGES[0]['footer'],'footer')
FONT='https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lato:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Poppins:wght@300;400;500;600&display=swap'
manifest=[]
def writepage(slug,meta,content,external=None,kind='default',date=None):
 s=BeautifulSoup(content,'html.parser')
 h=s.select('h1')
 if not h:
  h1=s.new_tag('h1');h1['class']='native-page-title';h1.string=meta['title'];s.insert(0,h1)
 else:
  for n in h[1:]:n.name='h2'
 if slug=='hotel-cagnes-sur-mer-le-grimaldi':s.h1.append(' Le Grimaldi');sub=s.new_tag('span');sub['class']='h1-location';sub.string='Hôtel de charme au Haut-de-Cagnes';s.h1.append(sub)
 if slug=='le-village-restaurant-haut-de-cagnes-sur-mer':
  s.h1.append(' Le Village')
  sub=s.new_tag('span');sub['class']='h1-location';sub.string='Restaurant au Haut-de-Cagnes, Cagnes-sur-Mer';s.h1.append(sub)
 # Progressively load embeds only after consent; a plain link remains usable.
 for iframe in s.select('iframe[src]'):
  src=iframe['src']
  if 'widget.holiduhost.com' in src:continue
  iframe['data-consent-src']=src;del iframe['src']
  parent=s.new_tag('div');parent['class']='embed-consent';iframe.wrap(parent)
  info=s.new_tag('div');info['class']='embed-notice'
  p=s.new_tag('p');p.string='Ce contenu est fourni par '+('Holidu' if 'holidu' in src else 'Google Maps' if 'google' in src else 'YouTube' if 'youtube' in src else 'un service externe')+'.';info.append(p)
  b=s.new_tag('button');b['type']='button';b['data-load-embed']='';b['class']='book-button';b.string='Afficher ce contenu';info.append(b)
  a=s.new_tag('a',href=src,target='_blank',rel='noopener noreferrer');a.string='Ouvrir dans un nouvel onglet';info.append(a);parent.insert(0,info)
  iframe['hidden']=''
 for img in s.select('img')[:1]:img['loading']='eager';img['fetchpriority']='high'
 title=meta['title'];description=meta.get('description','')
 canonical=BASE+('/'+slug if slug else '/')
 address={'@type':'PostalAddress','streetAddress':'4 Place du Château','addressLocality':'Cagnes-sur-Mer','postalCode':'06800','addressCountry':'FR'}
 restaurant={'@type':'Restaurant','@id':BASE+'/#restaurant','name':'Restaurant Le Village','url':BASE+'/le-village-restaurant-haut-de-cagnes-sur-mer','telephone':'+33493200886','address':address,'servesCuisine':['Française','Méditerranéenne'],'hasMenu':BASE+'/la-carte','image':FALLBACK,'sameAs':['https://www.facebook.com/restaurantlevillagehdc','https://www.instagram.com/restaurantlevillagehdc/']}
 hotel={'@type':'Hotel','@id':BASE+'/#hotel','name':'Le Grimaldi by Le Village','url':BASE+'/hotel-cagnes-sur-mer-le-grimaldi','address':address,'numberOfRooms':5,'image':HOTEL}
 page={'@type':'WebPage','@id':canonical+'#webpage','url':canonical,'name':title,'description':description,'inLanguage':'fr-FR'}
 graph=[page]
 if not slug:graph.extend([restaurant,hotel,{'@type':'WebSite','@id':BASE+'/#website','url':BASE+'/','name':'Le Grimaldi by Le Village','inLanguage':'fr-FR'}])
 elif slug=='hotel-cagnes-sur-mer-le-grimaldi':graph.append(hotel)
 elif slug in ['la-carte','le-village-restaurant-haut-de-cagnes-sur-mer']:graph.append(restaurant)
 if kind=='blog':
  article={'@type':'BlogPosting','headline':title,'description':description,'mainEntityOfPage':canonical,'author':{'@type':'Organization','name':'Le Grimaldi by Le Village'},'publisher':{'@type':'Organization','name':'Le Grimaldi by Le Village','logo':{'@type':'ImageObject','url':LOGO}}}
  if date:article['datePublished']=date
  if s.find('img'):article['image']=s.find('img').get('src',FALLBACK)
  graph.append(article)
 if slug:graph.append({'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Accueil','item':BASE+'/'},{'@type':'ListItem','position':2,'name':title,'item':canonical}]})
 jsids=list(dict.fromkeys(used_js.get(slug,[])+used_js.get('footer',[])))
 es=''.join(f'<script defer src="{html.escape(u,quote=True)}"></script>' for u in dict.fromkeys(external or []))
 head=f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)}</title><meta name="description" content="{html.escape(description,quote=True)}"><link rel="canonical" href="{canonical}"><meta name="robots" content="noindex,follow"><meta name="theme-color" content="#fcf9f3"><meta property="og:type" content="{'article' if kind=='blog' else 'website'}"><meta property="og:title" content="{html.escape(title,quote=True)}"><meta property="og:description" content="{html.escape(description,quote=True)}"><meta property="og:url" content="{canonical}"><meta property="og:image" content="{s.find('img').get('src',FALLBACK) if s.find('img') else FALLBACK}"><meta property="og:locale" content="fr_FR"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="{LOGO}"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="{html.escape(FONT,quote=True)}"><link rel="stylesheet" href="/assets/css/tailwind.css"><link rel="stylesheet" href="/assets/css/blocks.css"><link rel="stylesheet" href="/assets/css/site.css"><script type="application/ld+json">{json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False)}</script>{es}<script defer src="/assets/js/site.js"></script>'''
 head+=''.join(f'<script defer src="/assets/js/{uid}.js"></script>' for uid in jsids)
 full=head+'</head><body>'+HEADER+'<main id="main">'+str(s)+'</main>'+footer+EXTRA_FOOT+'<div id="privacy-panel" class="privacy-panel" hidden><p>Les contenus externes (carte, vidéos et réservations) ne sont chargés qu’à votre demande.</p><button type="button" data-reset-consent>Réinitialiser mes choix</button><button type="button" data-close-privacy>Fermer</button></div></body></html>'
 path=ROOT/((slug+'.html') if slug else 'index.html');path.write_text(full)
 manifest.append({'path':'/'+slug,'file':path.name,'title':title,'kind':kind})
for p in PAGES:
 slug=p['slug'];parts=[];ext=[]
 for b in p['blocks']:
  if b['type']=='GridInstagramFeed':parts.append(instagram())
  else:
   body,e=process(b['content'],slug);parts.append(body);ext+=e
 writepage(slug,p['meta'],''.join(parts),ext,p['type'],p.get('date'))
# Accessible index of all blog articles, preserving their existing URLs.
articles=[p for p in PAGES if p['type']=='blog'];articles.sort(key=lambda p:p.get('date',''),reverse=True)
cards=''
for p in articles:
 soup=BeautifulSoup(''.join(b.get('content','') for b in p['blocks']),'html.parser');img=soup.find('img');src=img.get('src',FALLBACK) if img else FALLBACK
 if 'cloudinary' in src:src=FALLBACK
 cards+=f'<article><a href="/{p["slug"]}"><img src="{src}" alt="" loading="lazy"><h2>{html.escape(p["meta"]["title"])}</h2></a><p>{html.escape(p["meta"].get("description",""))}</p><a href="/{p["slug"]}">Lire l’article →</a></article>'
writepage('blog-list',{'title':'Actualités du Village | Restaurant au Haut-de-Cagnes','description':'Concerts, événements et vie du Haut-de-Cagnes : les actualités du restaurant Le Village et de l’Hôtel Le Grimaldi à Cagnes-sur-Mer.'},'<section class="native-section"><p class="eyebrow">Le journal du Village</p><h1>Actualités & événements</h1><div class="article-grid">'+cards+'</div></section>')
writepage('reserver',{'title':'Réserver | Restaurant Le Village et Hôtel Le Grimaldi','description':'Réservez votre table au restaurant Le Village ou votre séjour à l’Hôtel Le Grimaldi sur la place du Château au Haut-de-Cagnes.'},'''<section class="native-section reservation-page"><p class="eyebrow">Nous serons heureux de vous accueillir</p><h1>Réserver au Village</h1><div class="reservation-grid"><article><h2>Une table au restaurant</h2><p>Déjeuner ou dîner sur la place du Château, au cœur du Haut-de-Cagnes.</p><a class="book-button" href="https://bookings.zenchef.com/results?rid=361354&amp;pid=1001" target="_blank" rel="noopener noreferrer">Réserver une table avec Zenchef</a><p>Vous pouvez aussi nous appeler au <a href="tel:+33493200886">04 93 20 08 86</a>.</p></article><article><h2>Un séjour à l’hôtel</h2><p>Cinq chambres de charme pour prolonger l’expérience au Grimaldi.</p><a class="book-button" href="/hotel-cagnes-sur-mer-le-grimaldi#reservation">Voir les disponibilités de l’hôtel</a></article></div></section>''')
writepage('404',{'title':'Page introuvable | Le Grimaldi by Le Village','description':'Retrouvez le restaurant, l’hôtel et les actualités du Village.'},'<section class="native-section"><h1>Cette page est introuvable</h1><p>Retrouvez notre restaurant et notre hôtel au Haut-de-Cagnes.</p><a class="book-button" href="/">Retour à l’accueil</a></section>')
for uid,code in scripts.items():(ROOT/'assets/js'/f'{uid}.js').write_text(code)
(ROOT/'tools/styles.json').write_text(json.dumps(css_blocks))
(ROOT/'tools/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
(ROOT/'tools/image-replacements.json').write_text(json.dumps(replacements,indent=2))
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+BASE+m['path']+'</loc></url>' for m in manifest if m['path']!='/404')+'</urlset>')
print('Built',len(manifest),'pages;',len(css_blocks),'scoped styles;',len(scripts),'scripts; replaced',len(replacements),'image references.')
