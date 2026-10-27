"""Keep the three news carousels aligned with each article's opening image."""
import gzip,json,re
from html.parser import HTMLParser
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TARGETS=['','hotel-cagnes-sur-mer-le-grimaldi','le-village-restaurant-haut-de-cagnes-sur-mer']
class Tag(HTMLParser):
 def handle_starttag(self,tag,attrs):self.attrs=dict(attrs)
def attrs(raw):
 p=Tag();p.feed(raw);return p.attrs

def refresh_document(doc,articles):
 match=re.search(r'<div\b[^>]*\bid="blog-track"[^>]*>',doc)
 if not match:return doc
 depth=1;end=None
 for token in re.finditer(r'</?div\b[^>]*>',doc[match.end():]):
  depth+= -1 if token[0].startswith('</') else 1
  if depth==0:end=match.end()+token.start();break
 if end is None:raise ValueError('Unclosed blog carousel')
 fragment=doc[match.end():end]
 def card(m):
  a=m[0];opening=re.match(r'<a\b[^>]*>',a)[0];href=attrs(opening).get('href','');slug=href.rstrip('/').split('/')[-1]
  source=articles.get(slug)
  if not source:return a
  main=re.search(r'<main\b[^>]*>(.*?)</main>',source,re.S)
  hero=re.search(r'<img\b[^>]*>',main[1]) if main else None
  current=re.search(r'<img\b[^>]*>',a)
  if not hero or not current:return a
  image=attrs(current[0]);original=attrs(hero[0])
  for key in ['src','srcset','width','height','data-lv-original-src']:
   if key in original:image[key]=original[key]
   else:image.pop(key,None)
  # Use the visible card's existing localized description; never replace it with French.
  image['class']='village-img w-full h-full'
  image['style']='object-fit:cover;object-position:center'
  image['loading']='lazy';image['decoding']='async'
  image.pop('fetchpriority',None);image.pop('data-i18n',None)
  if 'srcset' in image:image['sizes']='(min-width:768px) 380px, 280px'
  import html
  new='<img '+' '.join(k+'="'+html.escape(v or '',quote=True)+'"' for k,v in image.items())+'/>'
  return a[:current.start()]+new+a[current.end():]
 updated=re.sub(r'<a\b[^>]*>.*?</a>',card,fragment,flags=re.S)
 return doc[:match.end()]+updated+doc[end:]

def refresh():
 articles={p.stem:p.read_text() for p in ROOT.glob('*.html')}
 for slug in TARGETS:
  path=ROOT/((slug or 'index')+'.html');doc=path.read_text();path.write_text(refresh_document(doc,articles))
  path=ROOT/'tools/source-pages'/((slug or 'index')+'.json')
  if not path.exists() and slug=='':path=ROOT/'tools/source-pages'/'.json'
  if path.exists():
   source=json.loads(path.read_text())
   for block in source['blocks']:
    if 'content' in block:block['content']=refresh_document(block['content'],articles)
   path.write_text(json.dumps(source,ensure_ascii=False,indent=2)+'\n')
 for path in (ROOT/'i18n/pages').glob('*.json.gz'):
  pages=json.loads(gzip.decompress(path.read_bytes()))
  for slug in TARGETS:pages[slug]=refresh_document(pages[slug],pages)
  path.write_bytes(gzip.compress(json.dumps(pages,ensure_ascii=False,separators=(',',':')).encode(),compresslevel=9,mtime=0))
if __name__=='__main__':refresh()
