"""Apply reviewed local SEO without rewriting dated editorial content.

Run directly after a focused edit, or automatically after tools/localize.py.
Only head metadata and one contextual restaurant link can change per article.
The separate configuration preserves these improvements across full rebuilds.
"""
import gzip, hashlib, html, importlib.util, json, re
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / 'tools/editorial-seo.json').read_text())
TARGET = 'le-village-restaurant-haut-de-cagnes-sur-mer'
LINK_KEY = hashlib.sha256(CONFIG['links']['fr'].encode()).hexdigest()[:16]
spec = importlib.util.spec_from_file_location('reviewed_metadata', ROOT / 'tools/apply-seo-metadata.py')
metadata = importlib.util.module_from_spec(spec)
spec.loader.exec_module(metadata)


def apply(document, slug, lang):
    original = document
    head, sep, body = document.partition('</head>')
    assert sep
    if slug in CONFIG['titles']:
        title = CONFIG['titles'][slug][lang]
        head = re.sub(r'<title\b[^>]*>.*?</title>', '<title>' + html.escape(title) + '</title>', head, count=1, flags=re.S)
        def social_title(match):
            tag = match.group()
            if not re.search(r'(?:property="og:title"|name="twitter:title")', tag): return tag
            tag = re.sub(r'\sdata-i18n=(?:\'[^\']*\'|"[^"]*")', '', tag)
            return re.sub(r'content=(["\'])(.*?)\1', lambda _: 'content="' + html.escape(title, quote=True) + '"', tag)
        head = re.sub(r'<meta\b[^>]*>', social_title, head)
    document = head + sep + body
    if slug in CONFIG['descriptions']:
        document = metadata.apply(document, CONFIG['descriptions'][slug][lang])
    soup = BeautifulSoup(document, 'html.parser')
    main = soup.select_one('main')
    assert main, slug
    # Menu/footer links do not count as an editorial recommendation.
    href = ('/' + lang if lang != 'fr' else '') + '/' + TARGET
    if not main.select(f'a[href="{href}"]'):
        candidates = [p for p in main.select('p') if len(p.get_text(strip=True)) > 100 and not p.find_parent(['nav', 'footer'])]
        assert candidates, (slug, lang)
        # Prefer a narrative paragraph already discussing the restaurant.
        ranked = sorted(enumerate(candidates), key=lambda pair: (
            'Le Village' not in pair[1].get_text(),
            not re.search(r'restaurant|terrass|cuisine', pair[1].get_text(), re.I), pair[0]))
        paragraph = ranked[0][1]
        before = str(paragraph)
        anchor = soup.new_tag('a', href=href)
        anchor['class'] = 'editorial-restaurant-link'
        anchor['style'] = 'text-decoration:underline;text-underline-offset:3px'
        anchor['data-i18n'] = json.dumps({'t': {'0': LINK_KEY}, 'a': {}}, separators=(',', ':'))
        anchor.string = CONFIG['links'][lang]
        paragraph.append(' ')
        paragraph.append(anchor)
        paragraph.append('.')
        assert document.count(before) == 1, (slug, lang, 'paragraph not unique')
        document = document.replace(before, str(paragraph), 1)
    # Existing content, including dates, headings and event schema, must survive.
    after = BeautifulSoup(document, 'html.parser')
    assert [str(x) for x in soup.select('h1')] == [str(x) for x in after.select('h1')]
    assert [str(x) for x in soup.select('time')] == [str(x) for x in after.select('time')]
    for tag in after.select('script[type="application/ld+json"]'): json.loads(tag.string)
    assert after.select_one('link[rel="canonical"]')['href'] == soup.select_one('link[rel="canonical"]')['href']
    return document


def main():
    changed = []
    for slug in CONFIG['reviewed']:
        path = ROOT / (slug + '.html')
        before = path.read_text(); after = apply(before, slug, 'fr')
        if before != after:
            path.write_text(after); changed.append(slug)
        if 'editorial-restaurant-link' in after:
            path = ROOT / 'i18n/catalogs' / (slug + '.json')
            catalog = json.loads(path.read_text())
            catalog[LINK_KEY] = CONFIG['links']['fr']
            path.write_text(json.dumps(catalog, ensure_ascii=False))
    for path in sorted((ROOT / 'i18n/pages').glob('*.json.gz')):
        lang = path.name.removesuffix('.json.gz')
        pages = json.loads(gzip.decompress(path.read_bytes()))
        before = dict(pages)
        for slug in CONFIG['reviewed']:
            assert slug in pages, (slug, lang)
            pages[slug] = apply(pages[slug], slug, lang)
        if pages != before:
            payload = json.dumps(pages, ensure_ascii=False, separators=(',', ':')).encode()
            path.write_bytes(gzip.compress(payload, compresslevel=9, mtime=0))
    for lang, label in CONFIG['links'].items():
        path = ROOT / 'assets/i18n' / (lang + '.json')
        dictionary = json.loads(path.read_text())
        if dictionary.get(LINK_KEY) != label:
            dictionary[LINK_KEY] = label
            path.write_text(json.dumps(dictionary, ensure_ascii=False, separators=(',', ':')))
    print('Reviewed', len(CONFIG['reviewed']), 'editorial pages in 13 languages;', len(changed), 'French pages improved.')

if __name__ == '__main__': main()
