# Le Village — Statistiques Facebook et Instagram

La rubrique **Statistiques Meta** de `/demo-reservation` lit les indicateurs Facebook et Instagram via l’API Graph Meta. Elle est strictement en lecture seule.

## Ce qui apparaît dans le back-office

- période de 7, 30 ou 90 jours ;
- Facebook : vues des contenus, interactions et abonnés ;
- Instagram : comptes touchés, interactions, visites du profil et abonnés ;
- courbes quotidiennes avec lecture au survol ;
- actualisation à l’ouverture, cache serveur de dix minutes et nouvelle vérification automatique après quinze minutes.

## Configuration privée

Les secrets ne doivent jamais être placés dans GitHub, le HTML ou JavaScript. Utiliser des variables d’environnement :

- `LV_META_ACCESS_TOKEN` : jeton utilisateur longue durée pour Instagram Insights ;
- `LV_META_PAGE_ACCESS_TOKEN` : jeton de la Page Facebook pour Page Insights ;
- `LV_META_PAGE_ID` : `160182247439170` ;
- `LV_META_INSTAGRAM_ID` : `17841416623964515` ;
- `LV_META_API_VERSION` : `v26.0`.

Sur l’hébergement actuel, il est aussi possible de copier `tools/le-village-meta.example.php` vers `private/le-village-meta.php`, dans le dossier **au-dessus** de `public_html`, puis d’y saisir les jetons. Ce fichier privé ne doit jamais être ajouté au dépôt.

## Sécurité

- `demo-meta-api.php` exige la session privée de `/demo-reservation`.
- L’endpoint accepte uniquement GET et ne publie rien sur Facebook ou Instagram.
- Les jetons sont envoyés à Meta dans l’en-tête HTTPS `Authorization`, jamais dans les réponses au navigateur.
- Le cache ne contient que les statistiques normalisées et reste au-dessus de `public_html`.
- Pour un usage durable, renouveler les jetons avant expiration ou mettre en place un flux OAuth serveur contrôlé.
