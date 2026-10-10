# Le Village — Connexions Google et Tripadvisor (démo privée)

Cette intégration prépare le nouvel onglet **Avis & réputation** dans `/demo-reservation`. Elle ne modifie pas les fiches publiques, le site restaurant ni les réservations.

## Écrans

- **Google** : fiche Google Business Profile du Village (restaurant), note, avis, brouillons locaux de réponse.
- **Tripadvisor / Restaurant** : fiche restaurant et ses propres avis.
- **Tripadvisor / Hôtel** : fiche hôtel distincte, avec son propre identifiant Tripadvisor.

Aucune note ou avis fictif n'est injecté. Tant que les comptes ne sont pas connectés, l'interface affiche **À connecter** ou **Accès à autoriser**.

Les URL publiques et les ID saisis dans le formulaire de la démo sont des **repères stockés localement dans le navigateur**, pas des paramètres serveur. Ne jamais saisir de clé API ou de mot de passe dans ce formulaire.

## Backend

`demo-reputation-api.php` : endpoint **GET uniquement**, protégé par la session `lv_demo_ok` de la page privée. Aucune action de publication n'est disponible depuis cette démo.

Les identifiants API doivent être injectés par la configuration privée du serveur (variables d'environnement, jamais dans Git ou dans le navigateur).

### Google Business Profile

Variables prévues :

- `LV_GBP_ACCOUNT_ID` : identifiant numérique du compte Google Business Profile.
- `LV_GBP_LOCATION_ID` : identifiant numérique de la fiche.
- `LV_GBP_ACCESS_TOKEN` : jeton OAuth temporaire **pour test technique uniquement**.

**Pour un véritable usage quotidien**, implémenter un flux OAuth 2.0 serveur avec consentement explicite du propriétaire, gestion sécurisée des jetons de renouvellement, contrôle des rôles et audit des réponses. Le projet Google Cloud doit être autorisé à utiliser les Business Profile APIs.

Référence : https://developers.google.com/my-business/content/basic-setup

### Tripadvisor

Variables prévues :

- `LV_TRIPADVISOR_API_KEY` : clé côté serveur.
- `LV_TRIPADVISOR_API_MODE` : `terra` (par défaut) ou `content` si un contrat ancien l'autorise.
- `LV_TRIPADVISOR_RESTAURANT_ID` : ID numérique de la fiche restaurant.
- `LV_TRIPADVISOR_HOTEL_ID` : ID numérique de la fiche hôtel.
- `LV_TRIPADVISOR_REPUTATION_APPROVED=1` : **verrou explicite**, à activer seulement après confirmation contractuelle du droit d'utiliser les avis dans un outil de gestion de réputation.

Attention : la Content API standard vise les sites et applications B2C ; elle ne donne pas automatiquement les droits pour un back-office de réputation B2B. Les offres Terra et les éventuels modules de réputation ont des conditions spécifiques. Vérifier également les exigences de marque, attribution, affichage des notes et liens vers Tripadvisor **avant d'activer la restitution de données réelles**.

Références :
- https://www.tripadvisor.com/developers
- https://docs.terra.tripadvisor.com/docs/overview
- https://developer-tripadvisor.com/content-api/FAQ/
- https://www.tripadvisor.com/Owners

## Sécurité et périmètre

- Les secrets ne sont jamais exposés dans les fichiers JavaScript ou dans le HTML.
- Les appels à l'API passent exclusivement par le serveur, avec des URL fixes et des identifiants numériques validés.
- Le backend n'accepte que GET. Aucune publication de réponse Google ou Tripadvisor n'est possible depuis cette version.
- Les brouillons Google restent sur le navigateur utilisé ; ils ne sont pas synchronisés entre appareils.
- Le mot de passe partagé de la démo n'est **pas** une authentification suffisante pour la gestion réelle des comptes. Prévoir comptes nominatifs, permissions, CSRF, audit, journalisation et stockage sécurisé avant toute action d'écriture.
- Éviter les synchronisations trop fréquentes pour respecter quotas et facturation Tripadvisor.
- Le site public et le module Holidu ne sont pas modifiés.

## Avant de brancher les comptes

1. Obtenir l'accord de la restauratrice et l'accès gestionnaire à la fiche Google.
2. Demander l'accès Google Business Profile API, puis mettre en place OAuth.
3. Identifier précisément les deux pages Tripadvisor (restaurant et hôtel) et leurs deux ID.
4. Vérifier l'offre API Tripadvisor et les droits spécifiques pour la gestion de réputation.
5. Préparer l'attribution conforme Tripadvisor et tester les résultats sur un environnement sécurisé.
6. Remplacer la connexion par mot de passe partagé par un back-office à comptes individuels avant toute publication réelle.
