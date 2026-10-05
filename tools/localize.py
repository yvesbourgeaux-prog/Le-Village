"""Build localized pages from the same French HTML and a checked translation catalogue."""
import copy, gzip, hashlib, html, json, os, re
from pathlib import Path
from bs4 import BeautifulSoup, Comment, Doctype, NavigableString

ROOT = Path(__file__).resolve().parents[1]
LANGS = ['fr', 'en', 'sv', 'da', 'nl', 'de', 'it', 'es', 'ja', 'zh-CN', 'nb', 'ru', 'pl']
NAMES = ['Français', 'English', 'Svenska', 'Dansk', 'Nederlands', 'Deutsch', 'Italiano', 'Español', '日本語', '中文', 'Norsk', 'Русский', 'Polski']
LABELS = dict(zip(LANGS, ['Langue', 'Language', 'Språk', 'Sprog', 'Taal', 'Sprache', 'Lingua', 'Idioma', '言語', '语言', 'Språk', 'Язык', 'Język']))
AUTO = dict(zip(LANGS, ['Automatique (navigateur)', 'Automatic (browser)', 'Automatiskt (webbläsare)', 'Automatisk (browser)', 'Automatisch (browser)', 'Automatisch (Browser)', 'Automatico (browser)', 'Automático (navegador)', '自動（ブラウザ）', '自动（浏览器）', 'Automatisk (nettleser)', 'Автоматически (браузер)', 'Automatycznie (przeglądarka)']))
BRANDS = ['Le Grimaldi by Le Village', 'Le Grimaldi', 'Le Village', 'Haut-de-Cagnes', 'Cagnes-sur-Mer']

def key(text):
    return hashlib.sha256(text.encode()).hexdigest()[:16]

def url(lang, slug):
    return ('/' + lang if lang != 'fr' else '') + ('/' + slug if slug else '/')

def restore(text):
    for i, brand in enumerate(BRANDS, 1):
        text = re.sub(r'\[\[\s*BRAND\s*' + str(i) + r'\s*\]\]', lambda _: brand, text, flags=re.I)
    return text

def is_text(node):
    return isinstance(node, NavigableString) and not isinstance(node, (Comment, Doctype))

def footer(lang, slug):
    options = ''.join('<a href="' + url(code, slug) + '" lang="' + code + '" hreflang="' + code + '" data-language="' + code + '"' + (' aria-current="true"' if lang == code else '') + '>' + name + '</a>' for code, name in zip(LANGS, NAMES))
    return '<div class="language-footer"><details><summary>' + LABELS[lang] + '</summary><div class="language-options">' + options + '<button type="button" data-language-auto>' + AUTO[lang] + '</button></div><div data-extra-languages hidden></div></details></div>'

def build(manifest, base):
    catalog = json.loads((ROOT / 'tools/i18n/catalogue.json').read_text())
    # Keep reviewed SEO descriptions across rebuilds, independently of the text catalogue.
    from importlib.util import spec_from_file_location, module_from_spec
    seo_spec = spec_from_file_location('lv_seo_metadata', ROOT / 'tools/apply-seo-metadata.py')
    seo = module_from_spec(seo_spec)
    seo_spec.loader.exec_module(seo)
    selected = set(filter(None, os.environ.get('LV_ONLY_LANGS', '').split(',')))
    prepared = {lang: {} for lang in LANGS[1:] if not selected or lang in selected}
    (ROOT / 'i18n/pages').mkdir(parents=True, exist_ok=True)
    (ROOT / 'i18n/catalogs').mkdir(parents=True, exist_ok=True)
    (ROOT / 'assets/i18n').mkdir(parents=True, exist_ok=True)
    manifest_slugs = {m['path'].lstrip('/') for m in manifest}
    for page in manifest:
        slug = page['path'].lstrip('/')
        s = BeautifulSoup((ROOT / page['file']).read_text(), 'html.parser')
        for existing in s.select('.language-footer, [data-lv-language-resource]'):
            existing.decompose()
        s.html['data-page-slug'] = slug
        source = {}
        # Preserve every element and text node; no wrappers or layout changes.
        for tag in s.find_all(True):
            if tag.name in ('script', 'style', 'svg', 'path'): continue
            mapping = {'t': {}, 'a': {}}
            texts = [n for n in tag.children if is_text(n)]
            for index, node in enumerate(texts):
                text = str(node).strip()
                if text in catalog:
                    source[key(text)] = text
                    mapping['t'][str(index)] = key(text)
            for attr in ('alt', 'title', 'aria-label', 'placeholder'):
                text = tag.get(attr, '').strip()
                if text in catalog:
                    source[key(text)] = text
                    mapping['a'][attr] = key(text)
            if tag.name == 'meta' and (tag.get('name') == 'description' or tag.get('property') in ('og:title', 'og:description')):
                text = tag.get('content', '')
                if text in catalog:
                    source[key(text)] = text
                    mapping['a']['content'] = key(text)
            if mapping['t'] or mapping['a']:
                tag['data-i18n'] = json.dumps(mapping, separators=(',', ':'))
        if not selected:
            (ROOT / 'i18n/catalogs' / ((slug or 'index') + '.json')).write_text(json.dumps(source, ensure_ascii=False))
        # Run before deferred embeds to avoid loading them once in the wrong language.
        routing = s.new_tag('script', src='/assets/js/language-route.js?v=20261004-13')
        routing['data-lv-language-resource'] = ''
        viewport = s.select_one('meta[name="viewport"]')
        viewport.insert_after(routing)
        style = s.new_tag('link', rel='stylesheet', href='/assets/css/languages.css?v=20261004-13')
        style['data-lv-language-resource'] = ''
        s.head.append(style)
        behavior = s.new_tag('script', src='/assets/js/languages.js?v=20261004-13', defer='')
        behavior['data-lv-language-resource'] = ''
        s.head.append(behavior)
        for old in s.select('link[rel="alternate"][hreflang]'): old.decompose()
        for lang in LANGS:
            s.head.append(s.new_tag('link', rel='alternate', hreflang=lang, href=base + url(lang, slug)))
        s.head.append(s.new_tag('link', rel='alternate', hreflang='x-default', href=base + url('fr', slug)))
        for lang in LANGS:
            if selected and lang != 'fr' and lang not in selected:
                continue
            localized = copy.deepcopy(s)
            localized.html['lang'] = lang
            localized.html['data-site-locale'] = lang
            for tag in localized.select('[data-i18n]'):
                mapping = json.loads(tag['data-i18n'])
                texts = [n for n in tag.children if is_text(n)]
                for index, identifier in mapping['t'].items():
                    node = texts[int(index)]; original = source[identifier]
                    translated = original if lang == 'fr' else catalog[original][lang]
                    value = str(node); node.replace_with(value[:len(value)-len(value.lstrip())] + translated + value[len(value.rstrip()):])
                for attr, identifier in mapping['a'].items():
                    original = source[identifier]
                    tag[attr] = original if lang == 'fr' else catalog[original][lang]
            localized.select_one('link[rel="canonical"]')['href'] = base + url(lang, slug)
            for tag in localized.select('meta[property="og:url"]'): tag['content'] = base + url(lang, slug)
            for tag in localized.select('meta[property="og:locale"]'): tag['content'] = {'fr':'fr_FR', 'en':'en_GB', 'sv':'sv_SE', 'da':'da_DK', 'nl':'nl_NL', 'de':'de_DE', 'it':'it_IT', 'es':'es_ES', 'ja':'ja_JP', 'zh-CN':'zh_CN', 'nb':'nb_NO', 'ru':'ru_RU', 'pl':'pl_PL'}[lang]
            widget = localized.select_one('.zc-widget-config')
            if widget: widget['data-lang'] = lang.split('-')[0]
            for tag in localized.select('a[href]'):
                href = tag['href']
                if not href.startswith('/') or href.startswith('//'): continue
                raw, sep, fragment = href.partition('#')
                path, qsep, query = raw.partition('?')
                target_slug = path.strip('/').removesuffix('.html')
                if target_slug == 'index': target_slug = ''
                if target_slug in manifest_slugs:
                    tag['href'] = url(lang, target_slug) + (qsep + query if qsep else '') + (sep + fragment if sep else '')
            for script in localized.select('script[type="application/ld+json"]'):
                graph = json.loads(script.string)
                def translate_schema(value, field=''):
                    if isinstance(value, dict): return {k: translate_schema(v, k) for k, v in value.items()}
                    if isinstance(value, list): return [translate_schema(v, field) for v in value]
                    if isinstance(value, str):
                        if field == 'inLanguage': return lang
                        if field in ('headline','description','name') and value in catalog: return value if lang == 'fr' else catalog[value][lang]
                        if value.startswith(base) and field in ('url','@id','item','mainEntityOfPage'):
                            relative=value[len(base):]; path, sep, fragment=relative.partition('#'); target=path.strip('/')
                            if target in manifest_slugs and fragment not in ('restaurant','hotel','website'): return base + url(lang,target) + (sep+fragment if sep else '')
                    return value
                script.string=json.dumps(translate_schema(graph), ensure_ascii=False)
            localized.body.append(BeautifulSoup(footer(lang, slug), 'html.parser'))
            document=str(localized)
            description = seo.METADATA.get(slug, {}).get(lang)
            if description:
                document = seo.apply(document, description)
            if lang == 'fr':
                if not selected: (ROOT / page['file']).write_text(document)
            else: prepared[lang][slug] = document
    for lang, pages in prepared.items():
        payload=json.dumps(pages, ensure_ascii=False, separators=(',', ':')).encode()
        (ROOT / 'i18n/pages' / (lang + '.json.gz')).write_bytes(gzip.compress(payload, compresslevel=9, mtime=0))
        dictionary={key(original): translated[lang] for original, translated in catalog.items()}
        (ROOT / 'assets/i18n' / (lang + '.json')).write_text(json.dumps(dictionary, ensure_ascii=False, separators=(',', ':')))
    # French strings are the authoritative source for dynamic visitor translations.
    if not selected:
        (ROOT / 'assets/i18n/fr.json').write_text(json.dumps({key(t):t for t in catalog}, ensure_ascii=False, separators=(',', ':')))
    sitemap='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+base+url(lang,m['path'].lstrip('/'))+'</loc></url>' for m in manifest if m['path']!='/404' for lang in LANGS)+'</urlset>'
    (ROOT/'sitemap.xml').write_text(sitemap)
    print('Localized', len(manifest), 'pages in', len(LANGS), 'languages.')
