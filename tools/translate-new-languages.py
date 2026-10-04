"""Generate checked static catalogue entries with locally installed Argos models.

Run with Argos Translate and the en_nb, en_pl and en_ru packages installed.
The existing English catalogue is the source for those models. No paid API is used.
"""
import json
import os
import re
from pathlib import Path
import ctranslate2
from argostranslate import package

ROOT = Path(__file__).resolve().parents[1]
CATALOGUE = ROOT / 'tools/i18n/catalogue.json'
TARGETS = {'nb': 'nb', 'ru': 'ru', 'pl': 'pl'}
BRANDS = [
    'Le Grimaldi by Le Village', 'Le Grimaldi', 'Le Village',
    'Haut-de-Cagnes', 'Cagnes-sur-Mer', 'Place du Château',
    'Château Grimaldi', 'Zenchef', 'Holidu',
]
TOKENS = ['AAA111', 'BBB222', 'CCC333', 'DDD444', 'EEE555', 'FFF666', 'GGG777', 'HHH888', 'III999']


def protect(text):
    for name, token in zip(BRANDS, TOKENS):
        text = text.replace(name, token)
    return text


def restore(text, original):
    for name, token in zip(BRANDS, TOKENS):
        if token in original:
            # A model occasionally inserts a space between letters and digits.
            pattern = r'\b' + re.escape(token[:3]) + r'\s*' + re.escape(token[3:]) + r'\b'
            if not re.search(pattern, text, re.I):
                raise ValueError(f'Lost brand marker {token}: {text[:150]}')
            text = re.sub(pattern, lambda _: name, text, flags=re.I)
    return text


def split(text):
    # Short segments are more reliable for the compact offline translation models.
    sentences = re.split(r'(?<=[.!?])\s+(?=[«“"A-ZÀ-Ÿ0-9])', text)
    out = []
    for sentence in sentences:
        if len(sentence) <= 260:
            out.append(sentence)
            continue
        pieces = re.split(r'(?<=[;:])\s+', sentence)
        for piece in pieces:
            if len(piece) <= 260:
                out.append(piece)
            else:
                words = piece.split(' ')
                part = ''
                for word in words:
                    if len(part) + len(word) > 240 and part:
                        out.append(part); part = ''
                    part += (' ' if part else '') + word
                if part: out.append(part)
    return out


def main():
    catalogue = json.loads(CATALOGUE.read_text())
    models = {p.to_code:p for p in package.get_installed_packages()}
    for lang in TARGETS:
        model = models[lang]
        translator = ctranslate2.Translator(str(model.package_path / 'model'), device='cpu', intra_threads=4)
        sources = list(catalogue)
        chunks = []
        ownership = []
        for source in sources:
            english = catalogue[source]['en']
            prepared = protect(english)
            for segment in split(prepared):
                chunks.append(segment)
                ownership.append(source)
        output = []
        for offset in range(0,len(chunks),48):
            batch = chunks[offset:offset+48]
            tokens = [model.tokenizer.encode(value) for value in batch]
            results = translator.translate_batch(tokens, beam_size=4, max_batch_size=48, batch_type='tokens')
            for result in results:
                output.append(model.tokenizer.decode(result.hypotheses[0]).strip())
            if offset % 384 == 0: print(lang,offset,'/',len(chunks),flush=True)
        combined = {}
        for original, translated in zip(ownership, output):
            combined.setdefault(original, []).append(translated)
        failures = []
        for source in sources:
            prepared = protect(catalogue[source]['en'])
            result = ' '.join(combined[source])
            try:
                catalogue[source][lang] = restore(result, prepared)
            except ValueError as error:
                failures.append((source[:100], str(error)))
                catalogue[source][lang] = result
        if failures:
            path = Path('/tmp/lv-translation-failures-' + lang + '.json')
            path.write_text(json.dumps(failures, ensure_ascii=False, indent=2))
            print(lang, len(failures), 'brand marker failures; see', path,flush=True)
        else:
            print(lang, 'all markers preserved',flush=True)
        # Write a checkpoint after each target language.
        CATALOGUE.write_text(json.dumps(catalogue, ensure_ascii=False, indent=2) + '\n')
        del translator

if __name__ == '__main__': main()
