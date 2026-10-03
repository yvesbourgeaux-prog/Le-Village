"""Check published language packs, booking configuration and internal links."""
import gzip, json
from pathlib import Path
from urllib.parse import urlsplit
from bs4 import BeautifulSoup
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'tools/manifest.json').read_text())
langs=['fr','en','sv','da','nl','de','it','es','ja','zh-CN']
fr={p['path'].lstrip('/'):BeautifulSoup((root/p['file']).read_text(),'html.parser') for p in manifest}
for lang in langs:
    pages=fr if lang=='fr' else {k:BeautifulSoup(v,'html.parser') for k,v in json.loads(gzip.decompress((root/f'i18n/pages/{lang}.json.gz').read_bytes())).items()}
    assert pages.keys()==fr.keys()
    for slug,soup in pages.items():
        assert soup.html['lang']==lang
        assert len(soup.select('.zc-widget-config'))==1
        assert soup.select_one('.zc-widget-config')['data-restaurant']=='361354'
        assert len(soup.select('script[src*="sdk.zenchef.com"]'))==1
        assert len(soup.select('link[hreflang]'))==11
        assert len(soup.select('.language-footer'))==1
        image_signature=lambda s:[{k:i.get(k) for k in ['src','srcset','width','height','class']} for i in s.select('img')]
        assert image_signature(soup)==image_signature(fr[slug]),(lang,slug,'photo changed')
        for a in soup.select('a[href]'):
            path=urlsplit(a['href']).path
            if not path.startswith('/') or path.startswith('//'):continue
            parts=path.strip('/').split('/')
            if parts[0] in langs[1:] and not a.has_attr('data-language'):
                assert parts[0]==lang,(lang,slug,path)
                assert '/'.join(parts[1:]).removesuffix('.html') in pages,(lang,slug,path)
    print(lang, len(pages), 'pages: links, images and booking OK')
