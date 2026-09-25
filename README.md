# Le Grimaldi by Le Village — site autonome

Site HTML/CSS/JavaScript pour Hostinger Apache/LiteSpeed. Le contenu est rendu dans les pages HTML, sans iframe de mise en page ni dépendance au constructeur Hostinger. Les 26 pages transmises sont conservées, avec un index d'articles, une page de réservation et une page 404.

## Déploiement

Déployer la branche `main` à la racine `public_html` du domaine `lightgoldenrodyellow-ant-571258.hostingersite.com`. Aucun npm ni Python n'est nécessaire sur l'hébergement. `.htaccess` dessert les URL sans extension et bloque l'accès aux sources de construction. Ne pas placer le dépôt dans un sous-dossier de public_html.

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

Le site de préproduction porte `noindex,follow` dans chaque page. Ses URL canoniques et son sitemap ciblent le domaine officiel actuel pour éviter la duplication. Lors du basculement définitif : remplacer la valeur robots dans `tools/rebuild.py` par `index,follow`, reconstruire, vérifier les redirections et déclarer le sitemap officiel dans Search Console. Conserver le noindex conditionnel du domaine provisoire dans `.htaccess`.

## Périmètre

Les pages de chambres individuelles n'étaient pas dans l'archive. Le widget hôtel présente les disponibilités existantes. Les contenus historiques datés sont conservés comme archives ; leurs dates ne sont pas artificiellement actualisées.
