"""Apply reviewed descriptions without changing page bodies or translations."""
import gzip, html, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
METADATA = json.loads((ROOT / 'tools/seo-metadata.json').read_text())

def apply(document, description):
    head, separator, body = document.partition('</head>')
    assert separator, 'Missing head'
    old_match = re.search(r'<meta\b[^>]*\bname="description"[^>]*>', head)
    assert old_match, 'Missing description'
    old = html.unescape(re.search(r'\bcontent=(["\'])(.*?)\1', old_match.group()).group(2))
    def meta(match):
        tag = match.group()
        if not re.search(r'\b(?:name="(?:description|twitter:description)"|property="og:description")', tag):
            return tag
        tag = re.sub(r'\sdata-i18n=(?:\'[^\']*\'|"[^"]*")', '', tag)
        return re.sub(r'\bcontent=(["\'])(.*?)\1', lambda _: 'content="' + html.escape(description, quote=True) + '"', tag)
    head = re.sub(r'<meta\b[^>]*>', meta, head)
    def schema(match):
        graph = json.loads(match.group(2))
        def visit(value):
            if isinstance(value, list):
                for item in value: visit(item)
            elif isinstance(value, dict):
                kinds = value.get('@type', [])
                if isinstance(kinds, str): kinds = [kinds]
                if set(kinds) & {'WebPage', 'Article', 'NewsArticle', 'BlogPosting'} and value.get('description') == old:
                    value['description'] = description
                for child in value.values():
                    if isinstance(child, (list, dict)): visit(child)
        visit(graph)
        return match.group(1) + json.dumps(graph, ensure_ascii=False) + match.group(3)
    head = re.sub(r'(<script\b[^>]*type="application/ld\+json"[^>]*>)(.*?)(</script>)', schema, head, flags=re.S)
    updated = head + separator + body
    assert updated.partition('</head>')[2] == document.partition('</head>')[2]
    return updated

def main():
    count = 0
    for slug, translations in METADATA.items():
        if 'fr' not in translations: continue
        path = ROOT / ((slug or 'index') + '.html')
        path.write_text(apply(path.read_text(), translations['fr']))
        count += 1
    for path in sorted((ROOT / 'i18n/pages').glob('*.json.gz')):
        lang = path.name.removesuffix('.json.gz')
        pages = json.loads(gzip.decompress(path.read_bytes()))
        for slug, translations in METADATA.items():
            if lang not in translations: continue
            assert slug in pages, (lang, slug)
            pages[slug] = apply(pages[slug], translations[lang])
            count += 1
        payload = json.dumps(pages, ensure_ascii=False, separators=(',', ':')).encode()
        path.write_bytes(gzip.compress(payload, compresslevel=9, mtime=0))
    print('Updated', count, 'reviewed page descriptions; body content unchanged.')

if __name__ == '__main__': main()
