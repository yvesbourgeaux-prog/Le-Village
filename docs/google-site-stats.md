# Statistiques du site dans le back-office

L’onglet Statistiques > Site utilise GA4 et Search Console. Tag Manager transmet les événements à GA4 après consentement et ne fournit pas de rapports de fréquentation.

## Connexion Google OAuth

Google bloque la création de clés de compte de service pour ce projet. Le back-office utilise un client OAuth Web et des autorisations en lecture seule.

1. Activer Google Analytics Data API et Search Console API dans Google Cloud.
2. Créer un client OAuth Application Web avec l’URI exacte https://legrimaldibylevillage.com/demo-google-oauth.php.
3. En mode test, ajouter le compte ayant accès aux propriétés GA4 et Search Console dans Audience > Utilisateurs tests. Les jetons de renouvellement des applications externes en mode test expirent généralement après sept jours ; le passage en production et les exigences de vérification Google doivent être étudiés pour une connexion durable.
4. Renommer le JSON téléchargé du client OAuth en le-village-oauth-client.json et le placer dans le dossier private situé au même niveau que public_html, hors GitHub et hors URL publique. Le chemin peut aussi être indiqué par LV_GOOGLE_OAUTH_CLIENT. Le dossier doit être accessible en écriture par PHP pour y enregistrer le-village-google-token.json.
5. Depuis une session du back-office, ouvrir Statistiques > Site et cliquer sur Connecter Google Analytics et Search Console. Google demande analytics.readonly et webmasters.readonly. Vérifier les chiffres affichés.

La propriété GA4 est 557530408 et la propriété Search Console est sc-domain:legrimaldibylevillage.com. L’API exige une session privée du back-office et ne renvoie pas de chiffres fictifs sans autorisation. Les clics d’actions ne sont pas des réservations confirmées.