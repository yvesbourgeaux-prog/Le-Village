<?php
declare(strict_types=1);
session_start();
header('X-Robots-Tag: noindex, nofollow, noarchive', true);
header('Cache-Control: no-store, private');
const LV_DEMO_HASH = '$2y$12$cW9qCIpLu.ZnONv42fAp7erp/yXw8z/oOYauBaifRS14txSswdieC';

if (isset($_GET['logout'])) {
  $_SESSION = [];
  if (ini_get('session.use_cookies')) {
    $p=session_get_cookie_params();
    setcookie(session_name(),'',time()-42000,$p['path'],$p['domain'],$p['secure'],$p['httponly']);
  }
  session_destroy();
  header('Location: /demo-reservation');
  exit;
}

$error='';
if ($_SERVER['REQUEST_METHOD']==='POST' && isset($_POST['password'])) {
  if (password_verify((string)$_POST['password'], LV_DEMO_HASH)) {
    $_SESSION['lv_demo_ok']=true;
    header('Location: /demo-reservation');
    exit;
  }
  $error='Mot de passe incorrect.';
}
$ok=!empty($_SESSION['lv_demo_ok']);

if (!$ok) {
?><!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Accès privé — Démo réservation Le Village</title><link href="/assets/css/demo-reservation.css?v=20261008-1" rel="stylesheet"></head><body>
<main class="demo-lock">
  <form method="post" class="demo-lock-card" autocomplete="off">
    <img src="https://assets.zyrosite.com/gnKoPAn3rxzY53IR/chatgpt-image-22-nov.-2025-00_40_31-YvUWBeCav31wXD3h.png" alt="Le Grimaldi by Le Village">
    <p class="eyebrow">Prototype privé</p>
    <h1>Réservation Le Village</h1>
    <p>Accès réservé à la présentation du futur module de réservation.</p>
    <label>Mot de passe<input name="password" type="password" required autofocus></label>
    <?php if ($error): ?><p class="form-error"><?=htmlspecialchars($error,ENT_QUOTES,'UTF-8')?></p><?php endif; ?>
    <button type="submit">Accéder à la démo</button>
  </form>
</main>
</body></html><?php
  exit;
}
// Render the actual restaurant page, never an iframe or a second marketing page.
// The static source is local and remains in sync with the production restaurant design.
$site = file_get_contents(__DIR__ . '/le-village-restaurant-haut-de-cagnes-sur-mer.html');
if ($site === false) { http_response_code(503); exit('Page temporairement indisponible'); }
// Do not initialize Zenchef, the language redirect, or the seasonal modal on this demo.
$site = preg_replace('~<script\\b[^>]*\\bsrc=["\\x27][^"\\x27]*/assets/js/(?:zenchef|languages|language-route|automne-popup)\\.js[^"\\x27]*["\\x27][^>]*>\\s*</script>~i', '', $site);
$site = preg_replace('~<script\\b[^>]*\\bsrc=["\\x27]https://sdk\\.zenchef\\.com/[^"\\x27]*["\\x27][^>]*>\\s*</script>~i', '', $site);
$site = preg_replace('~<div\\b[^>]*\\bclass=["\\x27][^"\\x27]*\\bzc-widget-config\\b[^"\\x27]*["\\x27][^>]*>\\s*</div>~i', '', $site);
$site = preg_replace('~<link\\b[^>]*\\bhref=["\\x27][^"\\x27]*(?:automne-popup|languages)\\.css[^"\\x27]*["\\x27][^>]*>~i', '', $site);
$site = preg_replace('~<link\\b[^>]*\\brel=["\\x27]canonical["\\x27][^>]*>~i', '', $site);
$site = preg_replace('~<meta\\b[^>]*\\bname=["\\x27]robots["\\x27][^>]*>~i', '', $site);
$site = preg_replace('~<title\\b[^>]*>.*?</title>~is', '', $site);
$head = '<meta name="robots" content="noindex,nofollow,noarchive"/><title>Démo privée — Le Village</title>'
 . '<link href="/assets/css/demo-reservation-admin.css?v=20261008-video-audit2" rel="stylesheet"/>'
 . '<link href="/assets/css/demo-reservation-v2.css?v=20261008-video-audit2" rel="stylesheet"/>'
 . '<link href="/assets/css/demo-reservation-refine.css?v=20261008-video-audit2" rel="stylesheet"/>'
 . '<link href="/assets/css/demo-reservation-experience.css?v=20261009-opening3" rel="stylesheet"/>'
 . '<link rel="stylesheet" href="/assets/css/demo-backoffice.css?v=20261008-rts2"/>'
 . '<link rel="stylesheet" href="/assets/css/demo-village-friendly.css?v=20261009-ux3"/>'
 . '<link rel="stylesheet" href="/assets/css/demo-village-schedule.css?v=20261009-weekly2"/>'
 . '<link rel="stylesheet" href="/assets/css/demo-reputation.css?v=20261010-rep1"/>'
 . '<link rel="stylesheet" href="/assets/css/demo-meta.css?v=20261011-meta1"/>'
 . '<script defer src="/assets/js/demo-reservation.js?v=20261009-opening3"></script>'
 . '<script defer src="/assets/js/demo-backoffice-core.js?v=20261010-rep1"></script>'
 . '<script defer src="/assets/js/demo-backoffice-comms.js?v=20261009-ux3"></script>'
 . '<script defer src="/assets/js/demo-reputation.js?v=20261010-google-clean"></script>'
 . '<script defer src="/assets/js/demo-meta.js?v=20261011-meta1"></script>'
 . '<script defer src="/assets/js/demo-booking-launcher.js?v=20261009-ux3"></script>';// Update the consent panel copy: the private demo never uses Zenchef.
$site = str_replace('La carte et le module de réservation utilisent les services Google Maps et Zenchef.', 'La carte utilise Google Maps. La réservation est simulée localement sur cette page.', $site);
$site = str_replace('</head>', $head . '</head>', $site);
$demo = <<<'DEMO_HTML'
<div id="lv-demo-app" class="demo-app">
  <div class="demo-switchbar" role="navigation" aria-label="Navigation du prototype">
    <span class="demo-private-tag">PROTOTYPE PRIVÉ</span>
    <button type="button" data-go="showcase" class="is-active">Site restaurant</button>
    <button type="button" data-go="admin">Back-office</button>
    <a href="/demo-reservation?logout=1" aria-label="Se déconnecter">Quitter</a>
  </div>
  <div id="showcase" class="view is-active" aria-hidden="true"></div>
    <section id="admin" class="view admin-shell" hidden>
      <aside class="admin-nav">
        <div class="admin-logo"><span>LV</span><div><b>Le Village</b><small>Espace réservations</small></div></div>
        <button type="button" data-admin-tab="planning" class="is-active">Planning & réservations</button>
        <button type="button" data-admin-tab="clients">Fichier clients</button>
        <button type="button" data-admin-tab="settings">Paramètres</button>
        <button data-go="showcase">Voir le module client</button>
      </aside>
      <div class="admin-main">
        <div id="admin-planning" class="admin-tab is-active">
          <div class="admin-head">
            <div><p class="eyebrow">BONJOUR ET BIENVENUE</p><h1>Vos réservations</h1><p class="admin-head-caption" id="admin-date-title">Aujourd’hui</p></div>
            <div class="admin-head-actions"><button type="button" class="day-nav" data-day-shift="-1" aria-label="Jour précédent">‹</button><input id="admin-date" type="date" aria-label="Date du planning"><button type="button" class="day-nav" data-day-shift="1" aria-label="Jour suivant">›</button><button type="button" class="today-link" data-admin-today>Aujourd’hui</button><button type="button" class="primary small" data-new-reservation>Nouvelle réservation</button></div>
          </div>
          <div id="admin-week-strip" class="admin-week-strip" aria-label="Choisir un jour de la semaine"></div>
          <div class="kpi-row">
            <article><span>Couverts</span><strong id="kpi-covers">0</strong></article>
            <article><span>Réservations</span><strong id="kpi-bookings">0</strong></article>
            <article><span>Déjeuner</span><strong id="kpi-lunch">0</strong></article>
            <article><span>Dîner</span><strong id="kpi-dinner">0</strong></article>
          </div>
          <div class="admin-grid">
            <section class="calendar-panel">
              <div class="panel-title"><h2>Calendrier du mois</h2><button type="button" class="calendar-toggle" data-toggle-admin-calendar aria-expanded="false">Voir le mois</button><div><button data-month="-1">‹</button><strong id="month-title"></strong><button data-month="1">›</button></div></div>
              <div class="calendar-week"><span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span></div>
              <div id="admin-calendar" class="admin-calendar"></div><p class="admin-calendar-help">Touchez une date pour afficher les réservations du jour.</p>
            </section>
            <section class="reservations-panel">
              <div class="panel-title"><h2>Réservations du jour</h2><div class="service-filter" aria-label="Filtrer par service"><button data-service-filter="all" class="is-active">Tous</button><button data-service-filter="lunch">Déjeuner</button><button data-service-filter="dinner">Dîner</button></div></div>
              <div id="service-summary" class="service-summary"></div><label class="admin-search-wrap"><span>Rechercher dans les réservations</span><input type="search" id="reservation-search" placeholder="Nom ou téléphone…" autocomplete="off"></label><div id="reservation-list" class="reservation-list"></div>
            </section>
          </div>
        </div>

        <div id="admin-clients" class="admin-tab" hidden>
          <div class="admin-head"><div><p class="eyebrow">RELATION CLIENT</p><h1>Fichier clients</h1><p class="admin-head-caption">Retrouvez les habitudes et l’historique de vos habitués.</p></div><input id="client-search" class="search" placeholder="Rechercher un client…"></div>
          <div id="client-list" class="client-list"></div>
        </div>

        <div id="admin-settings" class="admin-tab" hidden>
          <div class="admin-head"><div><p class="eyebrow">CONFIGURATION DES SERVICES</p><h1>Paramètres de réservation</h1><p class="admin-head-caption">Choisissez quand vous accueillez vos clients, en toute simplicité.</p></div><button id="save-settings" class="primary small">Enregistrer</button></div>
          <div class="settings-grid">
            <section class="settings-card"><h2>Capacité & règles</h2>
              <label>Maximum en ligne par réservation<input id="set-max-party" type="number" min="1" max="6"></label>
              <label>Délai minimum avant réservation<select id="set-notice"><option value="0">Immédiat</option><option value="60">1 heure</option><option value="120">2 heures</option><option value="240">4 heures</option><option value="1440">24 heures</option></select></label>
              <label><span>Message 7 personnes et +</span><textarea id="set-large-message" rows="3"></textarea></label>
            </section>
            <section class="settings-card"><h2>Déjeuner</h2><label>Horaires disponibles<textarea id="set-lunch-times" rows="5" placeholder="12:00, 12:30, 13:00…"></textarea></label><label>Capacité par créneau<input id="set-lunch-cap" type="number" min="1"></label></section>
            <section class="settings-card"><h2>Dîner</h2><label>Horaires disponibles<textarea id="set-dinner-times" rows="5" placeholder="19:00, 19:30, 20:00…"></textarea></label><label>Capacité par créneau<input id="set-dinner-cap" type="number" min="1"></label></section>
            <section class="settings-card"><h2>Jours d’ouverture</h2><div id="weekday-settings" class="weekday-settings"></div></section>
          </div>
        </div>
      </div>
      <p class="demo-admin-warning">Démonstration privée · Données fictives enregistrées dans ce navigateur uniquement.</p>
    </section>

  <button type="button" class="booking-float" data-open-booking>Réserver une table</button>
  <dialog id="booking-dialog" class="booking-dialog" aria-label="Réserver une table au Village">
    <div class="booking-card">
      <header class="booking-top">
        <img src="https://assets.zyrosite.com/gnKoPAn3rxzY53IR/chatgpt-image-22-nov.-2025-00_40_31-YvUWBeCav31wXD3h.png" alt="Le Village"/>
        <span>FR</span><button type="button" data-close-booking aria-label="Fermer la réservation">×</button>
      </header>
      <div id="booking-content" class="booking-content"></div>
    </div>
  </dialog>
  <dialog id="detail-dialog" class="detail-dialog" aria-label="Détail de la réservation"><div id="detail-content"></div></dialog>
</div>
DEMO_HTML;
$site = str_replace('</body>', $demo . '</body>', $site);
echo $site;
