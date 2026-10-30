"""Small editorial additions; preserve the existing layout, prices and metadata.

Reapply after an unrelated full site rebuild if needed. No network or translation API.
"""
import gzip
import hashlib
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESTAURANT = 'le-village-restaurant-haut-de-cagnes-sur-mer'
GUIDE = 'visiter-haut-de-cagnes'
ARTICLES = {
    'automne-halloween-haut-de-cagnes': None,
    'halloween-31-octobre-haut-de-cagnes-soupe-citrouille': 'e55cae8ecae6bf42',
    'brunch-musical-cagnes-sur-mer-restaurant-le-village': '59b2e2d0c5ae6b36',
}
DATA = json.loads((ROOT/'tools/restaurant-seo-locales.json').read_text())
KEYS = [hashlib.sha256(t.encode()).hexdigest()[:16] for t in DATA['fr']]
E = lambda s: html.escape(s, quote=True)

def text_attr(index):
    return "data-i18n='"+json.dumps({'t': {'0': KEYS[index]}, 'a': {}}, separators=(',', ':'))+"'"

def link(lang, index, destination, marker):
    prefix = '' if lang == 'fr' else '/'+lang
    if index == 1:
        return f'<p {marker} class="font-sans text-village-dark/80" style="margin:1rem 0 0;font-size:13px;line-height:1.6;max-width:320px"><a href="{prefix}/{destination}" style="color:inherit;text-decoration:underline;text-underline-offset:3px" {text_attr(index)}>{E(DATA[lang][index])}</a></p>'
    return f'<p {marker} class="font-sans text-base text-village-dark/80 leading-relaxed" style="margin:1.25rem 0"><a href="{prefix}/{destination}" style="color:inherit;text-decoration:underline;text-underline-offset:4px" {text_attr(index)}>{E(DATA[lang][index])}</a></p>'

def edit(doc, slug, lang):
    """Only change the targeted paragraphs inside main (or a source block)."""
    if '<main' in doc:
        m = re.search(r'(<main\b[^>]*>)(.*?)(</main>)', doc, re.S)
        if not m:
            raise ValueError('No main: '+slug)
        body = edit(m[2], slug, lang)
        return doc[:m.start(2)]+body+doc[m.end(2):]
    if slug == RESTAURANT:
        if lang == 'fr':
            # Original source blocks predate the generated data-i18n attributes.
            def source_keys(m):
                if 'data-i18n=' in m[1]:
                    return m[0]
                key = '07df47afbb1af983' if 'Des produits de qualité, une carte vivante' in m[2] else 'e57473e8f92172bb' if 'Au Village, sur la place du Château' in m[2] else None
                if not key:
                    return m[0]
                attr = " data-i18n='"+json.dumps({'t': {'0': key}, 'a': {}}, separators=(',', ':'))+"'"
                return m[1][:-1]+attr+'>'+m[2]+m[3]
            doc = re.sub(r'(<p\b[^>]*>)(.*?)(</p>)', source_keys, doc, flags=re.S)
        pattern = r'(<p\b[^>]*07df47afbb1af983[^>]*>)(.*?)(</p>)'
        def describe(m):
            return m[1].replace('07df47afbb1af983', KEYS[0])+E(DATA[lang][0])+m[3]
        doc = re.sub(pattern, describe, doc, count=1, flags=re.S)
        # Keep practical information with the address, away from the introduction.
        doc = re.sub(r'<p\b[^>]*data-restaurant-access-link[^>]*>.*?</p>', '', doc, flags=re.S)
        doc = re.sub(r'(<a\b[^>]*\bclass="[^"]*\bbtn-itineraire\b[^"]*"[^>]*>.*?</a>)', lambda m: m[0]+link(lang,1,GUIDE,'data-restaurant-access-link'), doc, count=1, flags=re.S)
    elif slug == GUIDE or slug in ARTICLES:
        marker = 'data-restaurant-context-link'
        if marker in doc:
            return doc
        key = '93ebada029b86505' if slug == GUIDE else ARTICLES[slug]
        for m in re.finditer(r'<p\b[^>]*>.*?</p>', doc, re.S):
            source_intro = lang == 'fr' and ((slug == GUIDE and 'Après votre balade dans les ruelles' in m[0]) or (slug == 'brunch-musical-cagnes-sur-mer-restaurant-le-village' and 'Pour célébrer ce renouveau printanier' in m[0]))
            if (key and key in m[0]) or source_intro or (not key and 'Le Village' in html.unescape(re.sub('<[^>]+>', '', m[0])) and len(m[0])>150):
                return doc[:m.end()]+link(lang,2,RESTAURANT,marker)+doc[m.end():]
    return doc

TARGETS = [RESTAURANT, GUIDE, *ARTICLES]
for slug in TARGETS:
    p = ROOT/(slug+'.html')
    p.write_text(edit(p.read_text(), slug, 'fr'))
    source = ROOT/'tools/source-pages'/(slug+'.json')
    obj = json.loads(source.read_text())
    added = False
    for block in obj['blocks']:
        if 'content' not in block:
            continue
        # Article sources may have several blocks; add the contextual link once.
        before = block['content']
        if added and slug in ARTICLES:
            continue
        block['content'] = edit(before, slug, 'fr')
        added |= 'data-restaurant-context-link' in block['content']
    source.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
    p = ROOT/'i18n/catalogs'/(slug+'.json')
    catalogue=json.loads(p.read_text())
    for index in ([0,1] if slug == RESTAURANT else [2]):
        catalogue[KEYS[index]]=DATA['fr'][index]
    p.write_text(json.dumps(catalogue,ensure_ascii=False,separators=(',',':')))

for lang in DATA:
    if lang != 'fr':
        p=ROOT/f'i18n/pages/{lang}.json.gz'
        pages=json.loads(gzip.decompress(p.read_bytes()))
        for slug in TARGETS:
            pages[slug]=edit(pages[slug],slug,lang)
        p.write_bytes(gzip.compress(json.dumps(pages,ensure_ascii=False,separators=(',',':')).encode(),compresslevel=9,mtime=0))
    p=ROOT/f'assets/i18n/{lang}.json'
    dictionary=json.loads(p.read_text())
    dictionary.update(dict(zip(KEYS,DATA[lang])))
    p.write_text(json.dumps(dictionary,ensure_ascii=False,separators=(',',':')))

p=ROOT/'tools/i18n/catalogue.json'
catalogue=json.loads(p.read_text())
for i,original in enumerate(DATA['fr']):
    catalogue[original]={lang:values[i] for lang,values in DATA.items() if lang!='fr'}
p.write_text(json.dumps(catalogue,ensure_ascii=False,indent=2)+'\n')
print('Updated five existing pages and their 13 language versions. Layout, URLs, prices and metadata retained.')
