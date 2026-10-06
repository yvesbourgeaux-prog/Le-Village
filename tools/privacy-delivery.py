"""Consent gating applied before the browser parses HTML. Keep aligned with privacy-delivery.php."""
import re

def apply(document):
    document=re.sub(r'<script\b[^>]*\bsrc=[\"\x27]https://sdk\.zenchef\.com/[^\"\x27]*[\"\x27][^>]*>\s*</script>', '', document, flags=re.I)
    def iframe(m):
        tag=m.group()
        if 'data-consent-src=' not in tag:
            tag=re.sub(r'\bsrc=("https://[^" ]+")',r'data-consent-src=\1',tag,count=1)
        if 'data-consent-src=' in tag and not re.search(r'\bhidden(?:=|\s|>)',tag):tag=tag[:-1]+' hidden="">'
        return tag
    document=re.sub(r'<iframe\b[^>]*>',iframe,document,flags=re.I)
    for script in ['site','zenchef']:
        document=re.sub(r'/assets/js/'+script+r'\.js(?:\?v=[^"\s<>]*)?', '/assets/js/'+script+'.js?v=20261006-privacy1',document)
    if 'data-privacy-style' not in document:document=document.replace('</head>','<link data-privacy-style="" rel="stylesheet" href="/assets/css/analytics.css?v=20261006-privacy1"/></head>')
    if 'data-privacy-policy' not in document:document=document.replace('</body>','<nav data-privacy-policy="" class="lv-privacy-footer"><a href="/confidentialite">Cookies &amp; Privacy — FR / EN</a></nav></body>')
    return document

if __name__=='__main__':
    from pathlib import Path
    for path in Path(__file__).resolve().parents[1].glob('*.html'):path.write_text(apply(path.read_text()))
