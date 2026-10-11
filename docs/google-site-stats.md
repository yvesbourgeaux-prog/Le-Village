# Statistiques du site dans le back-office

L’onglet **Statistiques > Site** lit les rapports GA4 et Search Console. Google Tag Manager (`GTM-NCL2235Z`) est déjà chargé sur le site après consentement et transmet les événements à GA4 (`G-1F6HPCJ4JL`). GTM gère les balises : ses API ne sont pas une source de chiffres de fréquentation.

## Accès en lecture

1. Dans le projet Google Cloud du propriétaire, activer **Google Analytics Data API** et **Search Console API**. Créer un compte de service réservé à ces rapports et télécharger sa clé JSON.
2. Ajouter l’adresse e-mail de ce compte de service comme **Lecteur** à la propriété GA4 et comme **Utilisateur complet** ou **Utilisateur limité** à la propriété Search Console. N’accorder aucun accès d’édition. Une propriété `sc-domain:legrimaldibylevillage.com` est préférable si elle est vérifiée ; sinon utiliser l’URL exacte de la propriété Search Console.
3. Déposer un fichier `le-village-google-stats.json` **au-dessus de `public_html`**, hors GitHub, avec les valeurs de la clé du compte de service et les deux identifiants ci-dessous :

```json
{
  "client_email": "compte-de-service@projet.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "property_id": "557530408",
  "site_url": "sc-domain:legrimaldibylevillage.com"
}
```

La propriété GA4 `557530408` (Le Village — Le Grimaldi) et la propriété Search Console de type Domaine `legrimaldibylevillage.com` ont été vérifiées dans Analytics le 11 octobre 2026. `property_id` est différent de l’ID de mesure `G-...`. Le chemin peut aussi être fourni dans la variable serveur `LV_GOOGLE_STATS_CONFIG`. Ne jamais placer la clé sous `public_html` ni dans le dépôt GitHub.

Le point d’accès `/demo-google-stats-api.php` utilise la session privée du back-office et ne renvoie que les statistiques agrégées. Il refuse les visiteurs non connectés. Si les accès Google manquent, l’interface indique clairement que la connexion reste à faire et n’affiche pas de chiffres fictifs.

Les vues, visiteurs, sessions, engagement, pages et clics d’actions viennent de GA4. Les clics, impressions, taux de clic, position, pages et requêtes viennent de Search Console. Les clics d’actions mesurent les interactions sur le site, et non des réservations confirmées. La période GA4 se termine hier ; la période Search Console se termine il y a trois jours pour tenir compte de sa latence. Les dates sont affichées séparément.
