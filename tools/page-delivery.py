"""Responsive delivery of existing images and reviewed historical page headings."""
import html, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / 'tools/page-adjustments.json').read_text())

def apply(document, lang='fr', slug=''):
    def image(match):
        tag = match.group()
        source = re.search(r'\bsrc="(https://assets\.zyrosite\.com/gnKoPAn3rxzY53IR/[^"?]+\.(?:png|jpg|jpeg|webp))"', tag, re.I)
        if not source or 'srcset=' in tag: return tag
        original = html.unescape(source.group(1))
        path = original.removeprefix('https://assets.zyrosite.com/')
        logo = '/chatgpt-image-22-nov.' in original
        widths = [200, 400] if logo else [480, 960, 1440, 1920, 2560]
        def url(width):
            return 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,width=' + str(width) + ',quality=85,fit=scale-down/' + path
        tag = tag.replace(source.group(), 'src="' + html.escape(url(400 if logo else 1440), quote=True) + '"', 1)
        sizes = '190px' if logo else '(min-width: 1200px) 1200px, 100vw'
        if re.search(r'\bsizes="', tag):
            tag = re.sub(r'\bsizes="[^"]*"', 'sizes="' + sizes + '"', tag)
        else: tag = tag[:-2] + ' sizes="' + sizes + '"/>' if tag.endswith('/>') else tag[:-1] + ' sizes="' + sizes + '">'
        attrs = ' srcset="' + ', '.join(url(w) + ' ' + str(w) + 'w' for w in widths) + '" data-lv-original-src="' + html.escape(original, quote=True) + '"'
        return tag[:-2] + attrs + '/>' if tag.endswith('/>') else tag[:-1] + attrs + '>'
    document = re.sub(r'<img\b[^>]*>', image, document, flags=re.I)
    heading = CONFIG.get('headings', {}).get(slug, {}).get(lang)
    if heading:
        def h1(match):
            opening = re.sub(r'\sdata-i18n=(?:\'[^\']*\'|"[^"]*")', '', match.group(1))
            return opening + html.escape(heading) + '</h1>'
        document, count = re.subn(r'(<h1\b[^>]*>).*?</h1>', h1, document, count=1, flags=re.S)
        assert count == 1, (lang, slug, 'Missing heading')
    return document.replace("/assets/js/site.js?v=20261005-ga1", "/assets/js/site.js?v=20261006-perf1")

if __name__ == '__main__':
    for path in ROOT.glob('*.html'):
        path.write_text(apply(path.read_text(), 'fr', '' if path.stem == 'index' else path.stem))
