"""Build the isolated, French review page; never adds news cards or sitemap URLs."""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SLUG = 'demo-dimanches-musicaux-8-novembre-2026'
BASE = 'https://legrimaldibylevillage.com'
SOURCE = 'https://tourisme.cagnes.fr/agenda/les-dimanches-musicaux-au-haut-de-cagnes-8-novembre-2026/'
TICKETS = 'https://billetterie.cagnes.fr/cgi-bin/ProgATS/eCommerce?licence=ville&prest=0811&typprest=1'
TITLE = 'Dimanches musicaux : concert du 8 novembre 2026 au Haut-de-Cagnes'
DESCRIPTION = 'Le Duo des Muses au Château-musée Grimaldi le 8 novembre 2026 à 15h30 : artistes, tarifs, accès et repas au Village, place du Château.'
IMAGE = '/assets/images/enhanced/original-0.webp'
E = html.escape

body = f'''
<div class="music-preview-note" role="note">Aperçu de l’article · Version de travail avant publication</div>
<article class="music-article">
<header class="music-hero">
<img src="{IMAGE}" width="1877" height="1873" alt="Le Château Grimaldi et les toits du Haut-de-Cagnes" fetchpriority="high" decoding="async"/>
<div class="music-hero-shade"></div><div class="music-hero-title">
<p class="music-eyebrow">Carnet de bord · Culture au Haut-de-Cagnes</p>
<h1>Les Dimanches musicaux<br/>au Haut-de-Cagnes</h1>
<p class="music-subtitle">Le Duo des Muses au Château-musée Grimaldi</p>
<p class="music-date"><time datetime="2026-11-08T15:30:00+01:00">Dimanche 8 novembre 2026 · 15h30</time></p>
</div></header>
<div class="music-copy">
<nav class="music-breadcrumb" aria-label="Fil d’Ariane"><a href="/">Accueil</a><span> / </span><a href="/blog-list">Actualités</a><span> / </span><span>Dimanches musicaux</span></nav>
<p class="music-intro">Une voix de soprano, une harpe et les pierres du Château-musée Grimaldi : le dimanche 8 novembre 2026, le Haut-de-Cagnes accueille une nouvelle édition des Dimanches musicaux. À 15h30, le Duo des Muses donne rendez-vous aux amateurs de musique sur la place du Château, pour une sortie culturelle à partager à deux, entre amis ou en famille.</p>
<section><h2>Le Duo des Muses : la rencontre de la voix et de la harpe</h2>
<p>La programmation annoncée par la Ville de Cagnes-sur-Mer réunit <strong>Valérie Marret, soprano</strong>, et <strong>Emeline Chatelin, harpiste</strong>. Sous le nom de Duo des Muses, les deux artistes associent le chant lyrique aux sonorités de la harpe.</p>
<p>Formée au chant au conservatoire de Nice, Valérie Marret se produit en récital, à l’opéra et dans l’opérette. Emeline Chatelin a étudié la harpe notamment à Cannes, Antibes et Nice ; son parcours fait aussi une place à la composition et à l’improvisation. Ce rendez-vous offre l’occasion de découvrir leur duo dans le cadre du Château-musée Grimaldi.</p></section>
<section class="music-practical" aria-labelledby="music-practical-title"><p class="music-eyebrow">Votre rendez-vous</p><h2 id="music-practical-title">Le concert en pratique</h2>
<dl><div><dt>Quand ?</dt><dd>Dimanche 8 novembre 2026 à 15h30</dd></div><div><dt>Où ?</dt><dd>Château-musée Grimaldi<br/>Place du Château, Haut-de-Cagnes<br/>06800 Cagnes-sur-Mer</dd></div><div><dt>Tarifs du concert</dt><dd>12 € en plein tarif · 9 € en tarif réduit</dd></div><div><dt>Billetterie</dt><dd>Sur place et sur la billetterie en ligne de la Ville</dd></div><div><dt>Accès conseillé</dt><dd>Navette gratuite n° 44 depuis le square Bourdet</dd></div></dl>
<a class="music-button music-button-outline" href="{E(TICKETS,quote=True)}" target="_blank" rel="noopener noreferrer">Billetterie du concert <span aria-hidden="true">↗</span></a>
<p class="music-small">Les conditions du tarif réduit et les éventuelles mises à jour sont à consulter auprès de la Ville. <a href="{SOURCE}" target="_blank" rel="noopener noreferrer">Voir l’annonce officielle</a>.</p></section>
<section><h2>Prendre le temps de découvrir le Haut-de-Cagnes</h2>
<p>Avec un concert à 15h30, la journée laisse aussi du temps pour une promenade dans le village. Avant de rejoindre le château, on peut s’attarder dans les ruelles, retrouver la place et profiter de ce quartier historique de Cagnes-sur-Mer à son rythme.</p>
<p>Pour préparer votre venue, retrouvez nos idées de balade dans notre <a href="/visiter-haut-de-cagnes">guide du Haut-de-Cagnes</a>. La navette gratuite n° 44, conseillée par l’office de tourisme au départ du square Bourdet, permet de rejoindre le village depuis le centre-ville. Pensez à consulter ses horaires pour organiser votre trajet.</p></section>
<section class="music-restaurant"><p class="music-eyebrow">À quelques pas du château</p><h2>Un repas au Village pour compléter la sortie</h2>
<p>Au <strong>4 place du Château</strong>, le <a href="/le-village-restaurant-haut-de-cagnes-sur-mer">restaurant Le Village</a> se trouve à proximité immédiate du lieu du concert. Vous pouvez déjeuner sur la place avant de rejoindre le Château-musée à 15h30, ou prolonger votre dimanche par un dîner au cœur du village.</p>
<p>Ouvert le dimanche, Le Village propose une cuisine de saison dans un cadre chaleureux. Consultez la carte et choisissez votre créneau lors de la réservation en ligne : une façon simple de réunir promenade, musique et plaisir de la table au même endroit.</p>
<div class="music-actions"><a class="music-button" href="/reserver">Réserver une table au Village</a><a class="music-text-link" href="/la-carte">Découvrir la carte</a></div>
<p class="music-small">Le concert est proposé par la Ville de Cagnes-sur-Mer. La réservation au restaurant et l’achat des billets du concert se font séparément.</p></section>
<aside class="music-hotel"><img src="/assets/images/articles-hd/chambre-grimaldi-4-hd-480.webp" alt="Une chambre de l’Hôtel Le Grimaldi au Haut-de-Cagnes" width="480" height="320" loading="lazy"/><div><p class="music-eyebrow">Un week-end au village</p><h2>Et si vous restiez un peu plus longtemps ?</h2><p>Pour découvrir le Haut-de-Cagnes au-delà du concert, l’Hôtel Le Grimaldi vous accueille sur la place du Château.</p><a href="/hotel-cagnes-sur-mer-le-grimaldi">Découvrir l’hôtel et ses chambres <span aria-hidden="true">→</span></a></div></aside>
<p class="music-source">Informations pratiques vérifiées le 30 octobre 2026 auprès de <a href="{SOURCE}" target="_blank" rel="noopener noreferrer">Cagnes-sur-Mer Tourisme</a>. Programmation susceptible d’être modifiée par l’organisateur.</p>
</div></article>'''

css = '''
.music-preview-note{padding:10px 20px;text-align:center;background:#eee8df;color:#713506;font:12px/1.5 Lato,sans-serif;letter-spacing:.06em}
.music-article{background:#fcf9f3;color:#713506}.music-hero{position:relative;min-height:540px;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:72px 24px 84px}.music-hero>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 35%}.music-hero-shade{position:absolute;inset:0;background:linear-gradient(0deg,#fcf9f3 0%,#2d1f12a8 32%,#211b169c 100%)}.music-hero-title{position:relative;max-width:1000px;text-align:center;color:white}.music-eyebrow{font:12px/1.6 Lato,sans-serif;text-transform:uppercase;letter-spacing:.18em;margin:0 0 18px}.music-hero h1{font:400 clamp(48px,6vw,78px)/1.12 'Great Vibes',cursive;margin:0 0 22px;text-shadow:0 2px 20px #0006}.music-subtitle{font:400 clamp(19px,2vw,25px)/1.5 'Playfair Display',serif;margin:0 0 18px}.music-date{font:600 13px/1.5 Lato,sans-serif;letter-spacing:.1em;text-transform:uppercase}.music-copy{max-width:900px;padding:0 28px 64px;margin:0 auto}.music-breadcrumb{font:12px/1.8 Lato,sans-serif;display:flex;gap:7px;flex-wrap:wrap;margin:12px 0 38px;color:#9d623d}.music-copy p{font:400 18px/1.85 Lato,sans-serif;margin-bottom:22px}.music-copy .music-intro{font:400 22px/1.75 'Playfair Display',serif;margin-bottom:48px}.music-intro:first-letter{float:left;font:76px/.9 'Great Vibes',cursive;color:#9d623d;padding:8px 9px 0 0}.music-copy h2{font:400 31px/1.35 'Playfair Display',serif;margin:0 0 26px}.music-copy section{margin:56px 0}.music-copy a{text-underline-offset:4px}.music-copy p a,.music-source a{text-decoration:underline}.music-copy strong{font-weight:600}.music-copy .music-eyebrow{font:12px/1.6 Lato,sans-serif;margin-bottom:14px}.music-practical{padding:40px;background:white;border:1px solid #71350626;box-shadow:0 10px 30px #7135060a}.music-practical dl{margin:0 0 28px}.music-practical dl>div{display:grid;grid-template-columns:150px 1fr;gap:20px;padding:15px 0;border-bottom:1px solid #7135061a;font:16px/1.65 Lato,sans-serif}.music-practical dt{font-weight:600}.music-practical dd{margin:0}.music-button{display:inline-flex;align-items:center;justify-content:center;gap:10px;background:#713506;color:white!important;padding:16px 24px;border:1px solid #713506;font:500 12px/1.5 Lato,sans-serif;letter-spacing:.08em;text-transform:uppercase;text-decoration:none!important;text-align:center;transition:background .2s}.music-button:hover{background:#9d623d}.music-button-outline{background:transparent;color:#713506!important}.music-button-outline:hover{background:#f5f0ea}.music-copy .music-small{font:13px/1.75 Lato,sans-serif;margin:22px 0 0;color:#765941}.music-actions{display:flex;align-items:center;gap:24px;flex-wrap:wrap;margin-top:30px}.music-text-link{font:500 12px/1.5 Lato,sans-serif;text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid #9d623d;padding-bottom:4px}.music-restaurant{border-top:1px solid #71350626;border-bottom:1px solid #71350626;padding:40px 0}.music-hotel{display:grid;grid-template-columns:180px 1fr;gap:32px;background:#713506;color:#fcf9f3;padding:36px;align-items:center}.music-hotel>img{width:180px;height:180px;border-radius:50%;object-fit:cover}.music-hotel h2{font-size:25px}.music-hotel p{font-size:16px}.music-hotel a{font:14px/1.6 Lato,sans-serif;text-decoration:underline}.music-copy .music-source{font:12px/1.8 Lato,sans-serif;margin:30px 0 0;color:#765941}
@media(max-width:600px){.music-hero{min-height:480px;padding:62px 20px 80px}.music-hero h1{font-size:49px}.music-subtitle{font-size:19px}.music-copy{padding:0 22px 45px}.music-copy .music-intro{font-size:20px}.music-copy h2{font-size:26px}.music-copy p{font-size:17px}.music-copy section{margin:40px 0}.music-practical{padding:26px 22px}.music-practical dl>div{grid-template-columns:1fr;gap:4px}.music-actions{gap:20px}.music-button{width:100%;padding:15px 16px}.music-hotel{grid-template-columns:1fr;padding:28px;text-align:center;gap:24px}.music-hotel>img{margin:auto;width:150px;height:150px}.music-date{font-size:11px}.music-preview-note{font-size:11px}}
'''

template = (ROOT/'halloween-31-octobre-haut-de-cagnes-soupe-citrouille.html').read_text()
head, rest = template.split('</head>', 1)
head = re.sub(r'<title>.*?</title>', '<title>'+E(TITLE)+' | Le Village — Aperçu</title>', head, flags=re.S)
head = re.sub(r'<script\b[^>]*type="application/ld\+json"[^>]*>.*?</script>', '', head, flags=re.S)
head = re.sub(r'<link\b(?=[^>]*\bhreflang=)[^>]*>', '', head)
head = re.sub(r'<script\b[^>]*data-lv-language-resource[^>]*>.*?</script>', '', head, flags=re.S)
head = re.sub(r'<link\b[^>]*halloween-event\.css[^>]*>', '', head)
for key,val in [('description',DESCRIPTION),('robots','noindex,follow'),('og:title',TITLE),('og:description',DESCRIPTION),('og:url',BASE+'/'+SLUG),('og:image',BASE+IMAGE)]:
    head = re.sub(r'<meta\b(?=[^>]*(?:name|property)="'+re.escape(key)+r'")[^>]*>', '<meta '+('property' if key.startswith('og:') else 'name')+'="'+key+'" content="'+E(val,quote=True)+'"/>', head)
head = re.sub(r'<link\b(?=[^>]*rel="canonical")[^>]*>', '<link rel="canonical" href="'+BASE+'/'+SLUG+'"/>', head)
head = re.sub(r'data-page-slug="[^"]*"', 'data-page-slug="'+SLUG+'"', head)
head += '<style>'+css+'</style>'
rest = re.sub(r'<main\b[^>]*>.*?</main>', '<main id="main">'+body+'</main>', rest, count=1, flags=re.S)
# This review-only page has no translated routes; keep the normal site's language system untouched.
rest = re.sub(r'<div class="language-footer">.*?</details></div>', '', rest, flags=re.S)
page = head+'</head>'+rest
(ROOT/(SLUG+'.html')).write_text(page)
print('Built '+SLUG+'.html')
