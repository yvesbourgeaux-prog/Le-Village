# Le Village — Connexion Google Business Profile (démo privée)

> Les statistiques Facebook et Instagram sont documentées séparément dans `docs/meta-insights.md`.

Cette intégration prépare la rubrique **Avis & réputation** dans `/demo-reservation`. Elle concerne uniquement la fiche Google Business Profile du restaurant Le Village.

## Écran

- **Google** : fiche du restaurant, note, avis et brouillons locaux de réponse.
- Aucune note ou aucun avis fictif n'est injecté. Tant que le compte n'est pas connecté, l'interface affiche **À connecter**.

Les URL publiques et l'ID saisis dans le formulaire de la démo sont des repères stockés localement dans le navigateur, pas des paramètres serveur. Ne jamais saisir de clé API ou de mot de passe dans ce formulaire.

## Backend

`demo-reputation-api.php` est un endpoint **GET uniquement**, protégé par la session `lv_demo_ok` de la page privée. Aucune action de publication n'est disponible depuis cette démo.

Les identifiants API doivent être injectés par la configuration privée du serveur (variables d'environnement, jamais dans Git ou dans le navigateur).

### Google Business Profile

Variables prévues :

- `LV_GBP_ACCOUNT_ID` : identifiant numérique du compte Google Business Profile.
- `LV_GBP_LOCATION_ID` : identifiant numérique de la fiche.
- `LV_GBP_ACCESS_TOKEN` : jeton OAuth temporaire **pour test technique uniquement**.

**Pour un véritable usage quotidien**, implémenter un flux OAuth 2.0 serveur avec consentement explicite du propriétaire, gestion sécurisée des jetons de renouvellement, contrôle des rôles et audit des réponses. Le projet Google Cloud doit être autorisé à utiliser les Business Profile APIs.

Référence : https://developers.google.com/my-business/content/basic-setup

## Sécurité et périmètre

- Les secrets ne sont jamais exposés dans les fichiers JavaScript ou dans le HTML.
- Les appels à l'API passent exclusivement par le serveur, avec des URL fixes et des identifiants numériques validés.
- Le backend n'accepte que GET. Aucune publication de réponse Google n'est possible depuis cette version.
- Les brouillons de réponse restent sur le navigateur utilisé ; ils ne sont pas synchronisés entre appareils.
- Le mot de passe partagé de la démo n'est **pas** une authentification suffisante pour la gestion réelle des comptes. Prévoir des comptes nominatifs, permissions, protection CSRF, audit, journalisation et stockage sécurisé avant toute action d'écriture.
- Le site public et le module Holidu ne sont pas modifiés.

## Avant de brancher le compte

1. Obtenir l'accord du propriétaire et l'accès gestionnaire à la fiche Google.
2. Faire approuver l'accès Google Business Profile API, puis mettre en place OAuth.
3. Confirmer l'identifiant de la fiche et stocker les secrets dans la configuration privée du serveur.
4. Tester la synchronisation des avis sur un environnement sécurisé.
5. Remplacer la connexion par mot de passe partagé par un back-office à comptes individuels avant toute publication réelle.
