# Le Grimaldi by Le Village — site autonome

### Livraison des images — 6 octobre 2026
Les images sources Zyrosite sont conservées, avec variantes responsives (480–2560 px, qualité 85 et format automatique). Le logo utilise des variantes de 200/400 px. La même règle est appliquée hors ligne par `tools/page-delivery.py` et aux packs existants par `page-delivery.php`. En cas d’échec du CDN, le script partagé réessaie l’image originale. Le générateur des langues réapplique ces règles. Le titre du communiqué de brunch est corrigé au 24 mai 2026 d’après les textes fournis fin avril et en mai ; les titres revus sont dans `tools/page-adjustments.json`.

### Audit Ahrefs — 5 octobre 2026
Les descriptions revues sont dans `tools/seo-metadata.json`. Le générateur de langues les applique après traduction aux descriptions HTML, Open Graph et aux descriptions de page des données structurées. `python tools/apply-seo-metadata.py` met à jour les pages existantes sans reconstruire leur corps. Les dates historiques sont conservées ; les descriptions chinoises et japonaises ne sont pas allongées pour atteindre un seuil occidental. La variante www redirige en 301 vers le domaine canonique, en conservant chemins et paramètres.

Site HTML/CSS/JavaScript pour Hostinger Apache/LiteSpeed. Le contenu est rendu dans les pages HTML, sans iframe de mise en page ni dépendance au constructeur Hostinger. Les 26 pages transmises sont conservées, avec un index d'articles, une page de réservation et une page 404.

## Déploiement

Déployer la branche `main` à la racine `public_html` du domaine `legrimaldibylevillage.com`. Aucun npm ni Python n'est nécessaire sur l'hébergement. `.htaccess` dessert les URL sans extension et bloque l'accès aux sources de construction. Ne pas placer le dépôt dans un sous-dossier de public_html.

## Reconstruction

Les contenus éditables sont dans `tools/source-pages/*.json`. Ils proviennent des blocs HTML originaux et conservent leur ordre. Installer Python 3 + beautifulsoup4 et Node + tailwindcss@3.4.17, postcss, postcss-selector-parser.

```sh
python tools/rebuild.py
LV_BUILD_MODULES=/chemin/absolu/vers/node_modules node tools/scope-css.cjs
npx tailwindcss -i tools/input.css -o assets/css/tailwind.css --minify
```

Les CSS des anciens blocs sont isolés par composant. Les scripts sélectionnent leurs propres carrousels pour éviter les doubles initialisations. Les liens internes restent sur le domaine visité. Le menu mobile et les liens de réservation fonctionnent sans le constructeur.

## Images

Les ressources Cloudinary manquantes ont été remplacées par des photos déjà utilisées sur le site, avec correction des textes alternatifs. Les images et vidéos Hostinger/Holidu restent hébergées chez leurs fournisseurs d'origine : conserver ces ressources lors de la migration. Une sauvegarde locale de ces médias est recommandée avant de supprimer l'ancien site. La carte précise des remplacements se trouve dans `tools/image-replacements.json`.

## Réservations et Instagram

La réservation restaurant ouvre un dialogue Zenchef pour le restaurant 361354, avec liens externes et téléphone en alternative. La page /reserver reste accessible sans JavaScript. La réservation hôtel conserve le widget Holidu existant. Aucune réservation d'essai n'a été envoyée. Les services externes se chargent sur demande du visiteur.

Instagram est remplacé par une galerie de photos du restaurant et un lien vers le profil. Cette galerie n'est pas un flux automatique. L'actualisation des dernières publications nécessite une connexion Instagram autorisée ou un fournisseur de widget, à configurer séparément ; aucun identifiant n'est stocké dans le dépôt.

## Passage au domaine définitif

Le domaine définitif `legrimaldibylevillage.com` est raccordé depuis le 3 octobre 2026. Les pages publiques portent `index,follow`, sauf la page 404. Les URL canoniques, les variantes de langue et le sitemap ciblent ce domaine. Le domaine provisoire garde sa protection HTTP noindex conditionnelle dans `.htaccess`. Le sitemap est annoncé dans robots.txt ; sa déclaration dans Search Console reste à réaliser depuis le compte du propriétaire.

## Périmètre

Les pages de chambres individuelles n'étaient pas dans l'archive. Le widget hôtel présente les disponibilités existantes. Les contenus historiques datés sont conservés comme archives ; leurs dates ne sont pas artificiellement actualisées.

## Accueil — octobre 2026
Les cinq blocs fournis sont conservés dans `tools/source-pages/index.json`. L’en-tête et les ajustements propres à l’accueil sont dans `tools/home-header.html`, `assets/css/home.css` et `assets/js/home.js`. La largeur de contenu est limitée à 1240 px ; la classe `hero-media` permet une future image/vidéo de couverture pleine largeur. Le bloc « Nous retrouver » constitue le pied de page de l’accueil, sans duplication. Les autres pages restent inchangées.

SEO : un H1, sections H2, liens descriptifs vers la page restaurant, entités Restaurant et Hotel reliées à la page. Le domaine provisoire reste en noindex ; activer l’indexation uniquement lors de la mise en production sur le domaine canonique. L’article Halloween est intégré au site et les cartes d’actualités pointent vers les pages locales.

Vérification : `NODE_PATH=/chemin/vers/node_modules node tools/check-home.cjs` (jsdom requis).

### Corrections du 1er octobre
Le pied de page fourni est restauré dans `tools/home-footer.html`. Le carrousel Haut-de-Cagnes contient sept photos, sans vidéo Facebook. Google Maps se charge directement sur l’accueil. Le SDK Zenchef officiel gère le flotteur et les actions de réservation sur l’accueil ; les autres pages gardent leur module actuel. Le bouton du menu reprend une bordure brune avec un remplissage animé au survol.

### Articles et actualités — 3 octobre 2026
Les quinze blocs d’articles fournis sont intégrés aux sources et aux pages, dont la nouvelle page `/automne-halloween-haut-de-cagnes`. Le même bloc actualités, avec quinze cartes et leurs liens internes sans extension, est utilisé sur l’accueil, le restaurant et l’hôtel. Le brunch conserve son URL `/brunch-musical-cagnes-sur-mer-restaurant-le-village`. Les restaurations de photos existantes sont conservées. L’index des actualités et le sitemap incluent la nouvelle page. Les dates historiques restent celles des sources ; Halloween est classé en octobre 2026 sans inventer un jour de publication.

### Qualité des images — 3 octobre 2026
Dix sources d’images existantes disposent de versions améliorées dans `assets/images/articles-hd/` : affiches Automne, Art en Fête, Familles en Fête et Boules Carrées, photo de la visite princière, montage de la chapelle et quatre sources de photos de chambres (mêmes photographies en définition supérieure). La restauration conserve les visuels et peut reconstruire les détails fins absents. Les sources d’origine restent dans `tools/article-image-upgrades.json` et les contenus éditoriaux. Des variantes WebP 480/960 px et la version HD sont servies via srcset selon l’affichage. Le contenu, l’ordre, les cadres et les réglages de recadrage restent identiques.

### Menu commun et Zenchef — 3 octobre 2026
Toutes les pages publiques partagent `tools/home-header.html`, sauf l’espace presse, le dossier presse et les communiqués qui conservent leurs en-têtes spécifiques. Les réseaux sociaux du menu s’ouvrent dans un nouvel onglet. Le bouton de réservation desktop est plus compact avec la même taille de texte. Sur mobile, le logo est centré, le menu se ferme avec une croix et présente les trois liens principaux, les icônes sociales/téléphone et la réservation. Le SDK Zenchef et sa configuration restaurant 361354 sont présents une seule fois sur chaque page ; `assets/js/zenchef.js` conserve l’ouverture locale et les anciens liens `?zc=open`.

### Langues — 3 octobre 2026
Le français conserve ses URL. Douze versions sont disponibles sous `/en/`, `/sv/`, `/da/`, `/nl/`, `/de/`, `/it/`, `/es/`, `/ja/`, `/zh-CN/`, `/nb/` (norvégien bokmål), `/ru/` et `/pl/`. La langue du navigateur est choisie à la première visite ; une préférence enregistrée depuis le lien discret en bas de page prend priorité. Une URL localisée explicitement ouverte conserve sa langue. Les autres langues utilisent l’anglais en secours. Les traductions sont préparées à la construction et peuvent être corrigées dans `tools/i18n/catalogue.json`. Le norvégien, le russe et le polonais ont été générés avec des modèles hors ligne, sans facturation par visite ou par caractère, puis leurs titres et libellés principaux ont été revus. Une relecture linguistique complète par des locuteurs natifs reste souhaitable. Les photos et les sources françaises restent identiques.

`tools/localize.py`, lancé par `python tools/rebuild.py`, génère les catalogues, les métadonnées et les pages localisées compressées. `i18n-page.php` et la règle Apache servent ces pages ; PHP avec zlib est requis. Zenchef conserve son restaurant et son flotteur, avec la langue du widget transmise au SDK. Le sitemap contient les versions linguistiques ; le domaine provisoire reste en noindex.

La traduction des autres langues est préparée dans `api/translate.php` mais désactivée sans clé Google Cloud Translation. Pour l’activer, configurer `LV_TRANSLATION_API_KEY` côté serveur ou copier `tools/le-village-i18n.example.php` vers le dossier privé situé au-dessus de `public_html`. Ne jamais publier une clé dans GitHub. PHP cURL et un dossier de cache privé inscriptible sont requis. Les textes de pages publiées seuls sont acceptés ; les résultats sont mis en cache, avec une limite quotidienne de 100 000 caractères par défaut. En cas d’indisponibilité, les traductions préparées restent utilisables.

### Langue Holidu — 3 octobre 2026
Le module hôtel reçoit `?language=` correspondant à la langue affichée sur le site, y compris après un choix manuel qui diffère de la langue du navigateur. `assets/js/languages.js` conserve les autres paramètres de l’iframe et réagit aussi aux changements de langue sans navigation. Le module actuel prend en charge en/de/es/pt/fr/it/el/nl/hr ; les autres langues du site utilisent l’anglais pour la réservation hôtel. Paramètre vérifié sur le module réel avec un en-tête navigateur espagnol et des réponses anglaise, française et allemande.

### Communiqués en PDF

Les six communiqués proposent un dossier presse et un téléchargement PDF A4. Les PDF français sont dans `assets/pdf/communiques/`. Les pages traduites précisent la langue du PDF. `press-downloads.php` adapte les boutons des packs de traduction existants.

Régénération : `python tools/build-press-pdfs.py` (ReportLab, BeautifulSoup, Pillow). Les polices Lato et Playfair sont embarquées avec leurs licences OFL dans `tools/pdf-fonts/`.
