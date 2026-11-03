# Vérification JSON-LD — 3 novembre 2026

## Périmètre et limites

Alerte Ahrefs du 2 novembre : « Structured data has Google rich results validation error », 13 URL. Cette analyse est distincte de l'alerte du 26 octobre sur huit pages sans Article.

L'API Site Audit renvoie `Insufficient plan`. L'interface du rapport reste derrière une vérification Cloudflare après une tentative de rechargement. La liste officielle et les libellés détaillés Ahrefs n'ont donc pas été récupérés. Les 13 URL ci-dessous sont celles sur lesquelles le défaut a été démontré indépendamment, et non une exportation du rapport. Leur correspondance exacte avec l'alerte reste à confirmer lors du prochain crawl.

## Défaut démontré

Chemin JSON : `@graph[2].organizer[1]` sur la page Halloween. L'organisateur Le Village est déclaré comme `Restaurant` avec seulement `name` et `url`. Google traite ce sous-type comme un établissement local : `address` et `name` sont obligatoires. L'adresse du lieu de l'événement, dans `Event.location.address`, ne complète pas automatiquement l'adresse de cet autre objet. Le schéma Restaurant principal sur la page restaurant est déjà complet sur ce point.

Vérification publique avant correction : les 13 URL répondent HTTP 200, et leur objet organisateur est identique à celui du dépôt et dépourvu d'adresse.

| Langue | URL vérifiée |
| --- | --- |
| fr | https://legrimaldibylevillage.com/halloween-31-octobre-haut-de-cagnes-soupe-citrouille |
| ja | https://legrimaldibylevillage.com/ja/halloween-31-octobre-haut-de-cagnes-soupe-citrouille |
| pl | https://legrimaldibylevillage.com/pl/halloween-31-octobre-haut-de-cagnes-soupe-citrouille |
| en | https://legrimaldibylevillage.com/en/halloween-31-octobre-haut-de-cagnes-soupe-citrouille |
| sv | https://legrimaldibylevillage.com/sv/halloween-31-octobre-haut-de-cagnes-soupe-citrouille |
| nb | https://legrimaldibylevillage.com/nb/halloween-31-octobre-haut-de-cagnes-soupe-citrouille |
| zh-CN | https://legrimaldibylevillage.com/zh-CN/halloween-31-octobre-haut-de-cagnes-soupe-citrouille |
| ru | https://legrimaldibylevillage.com/ru/halloween-31-octobre-haut-de-cagnes-soupe-citrouille |
| nl | https://legrimaldibylevillage.com/nl/halloween-31-octobre-haut-de-cagnes-soupe-citrouille |
| de | https://legrimaldibylevillage.com/de/halloween-31-octobre-haut-de-cagnes-soupe-citrouille |
| da | https://legrimaldibylevillage.com/da/halloween-31-octobre-haut-de-cagnes-soupe-citrouille |
| it | https://legrimaldibylevillage.com/it/halloween-31-octobre-haut-de-cagnes-soupe-citrouille |
| es | https://legrimaldibylevillage.com/es/halloween-31-octobre-haut-de-cagnes-soupe-citrouille |

## Correction ciblée

Ajout au Restaurant imbriqué de l'adresse existante du restaurant (4 Place du Château, 06800 Cagnes-sur-Mer, FR), de son identifiant stable `https://legrimaldibylevillage.com/#restaurant` et de son image existante. L'image conserve également les informations utiles à la validation du type Restaurant. Aucun remplacement par un type moins précis et aucune suppression du schéma.

Modification de la page française, des douze packs linguistiques compressés et des deux générateurs `tools/rebuild.py` et `tools/update-halloween-2026.py`. Le localiseur conserve déjà l'identifiant global `#restaurant` ; les URL et identifiants de l'article/événement restent propres à chaque langue. L'adresse et la photo sont communes à l'établissement et restent identiques entre langues. Les traductions de l'événement sont préservées.

## Erreurs, recommandations et faux positifs

- L'adresse absente de l'organisateur Restaurant est un défaut réel d'éligibilité Google LocalBusiness, même si le JSON est syntaxiquement valide.
- Les propriétés obligatoires Event (`name`, `startDate`, `location` avec nom et adresse) sont présentes. Date du 31 octobre à 19 h avec décalage +01:00 cohérent ; événement passé conservé comme archive, sans inventer de nouvelle date.
- `endDate` est recommandé pour Event ; aucune heure de fin inconnue n'a été inventée. Aucun artiste ni billetterie fictifs ajoutés.
- `priceRange`, `geo` et autres enrichissements LocalBusiness recommandés ne sont pas des champs obligatoires justifiant à eux seuls une erreur bloquante.
- `Monday`, etc. sans préfixe schema.org, ainsi que les horaires `09:00`/`21:15`, sont acceptés dans les exemples Google ; pas de réécriture des horaires valides.
- `BlogPosting` est explicitement accepté pour les articles Google. Il ne faut pas le remplacer par Article pour satisfaire un contrôle qui ne reconnaîtrait que le nom littéral Article. Ce constat ne prouve pas que l'ancienne alerte Ahrefs était un faux positif : ses huit URL n'ont pas été réanalysées ici.
- Aucun autre faux positif de la nouvelle alerte ne peut être affirmé sans le détail Ahrefs. Pas de certification globale Google Rich Results Test : les contrôles effectués ici sont des vérifications du JSON et des exigences documentées.

## Validation

Lecture JSON-LD de 431 documents HTML du dépôt (pages racines et pages des packs, y compris archives/démos : périmètre différent des 414 URL internes Ahrefs). Avant modification : exactement 13 objets Restaurant sans adresse, tous sur cette page. Après modification : aucun Restaurant/Hotel/LocalBusiness déclaré ne manque de nom ou d'adresse.

Comparaison structurelle avant/après : seuls les trois champs de cet organisateur changent sur les 13 pages. Tous les autres objets JSON-LD, le HTML hors JSON-LD, les autres pages des packs, les textes, les canonical, les hreflang et les horaires restent inchangés. Compilation Python des deux générateurs et `git diff --check` réussis.

Références officielles :
- https://developers.google.com/search/docs/appearance/structured-data/local-business
- https://developers.google.com/search/docs/appearance/structured-data/event
- https://developers.google.com/search/docs/appearance/structured-data/article

La disparition de l'alerte doit être confirmée par un nouveau crawl Ahrefs après déploiement. Une modification du dépôt ne met pas à jour le rapport historique du 2 novembre.
