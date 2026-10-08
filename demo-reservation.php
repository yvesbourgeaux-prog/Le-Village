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
?><!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow,noarchive">
<meta name="theme-color" content="#713506">
<title>Prototype réservation — Le Village</title>
<link rel="icon" href="https://assets.zyrosite.com/gnKoPAn3rxzY53IR/chatgpt-image-22-nov.-2025-00_40_31-YvUWBeCav31wXD3h.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;600;700&family=Playfair+Display:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/demo-reservation.css?v=20261008-1">
</head>
<body>
<?php if (!$ok): ?>
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
<?php else: ?>
<div id="lv-demo-app" class="demo-app">
  <header class="demo-topbar">
    <a class="demo-brand" href="#" data-go="showcase"><img src="https://assets.zyrosite.com/gnKoPAn3rxzY53IR/chatgpt-image-22-nov.-2025-00_40_31-YvUWBeCav31wXD3h.png" alt=""><span><strong>Le Village</strong><small>Prototype réservation</small></span></a>
    <nav><button data-go="showcase" class="is-active">Côté client</button><button data-go="admin">Back-office</button><a href="?logout=1">Quitter</a></nav>
  </header>

  <main>
    <section id="showcase" class="view is-active demo-showcase">
      <div class="showcase-copy">
        <p class="eyebrow">Expérience de réservation maison</p>
        <h1>Réserver au Village,<br>simplement.</h1>
        <p>Une expérience directe, élégante et pensée pour le restaurant. Sans intermédiaire, avec les mêmes repères que le module actuel mais un parcours plus clair.</p>
        <button class="primary" data-open-booking>Réserver une table</button>
        <button class="secondary" data-go="admin">Voir le back-office</button>
      </div>
      <div class="showcase-card">
        <p>Place du Château · Haut-de-Cagnes</p>
        <h2>Le Village</h2>
        <span>Déjeuner & dîner</span>
      </div>
    </section>

    <section id="admin" class="view admin-shell" hidden>
      <aside class="admin-nav">
        <div class="admin-logo"><span>LV</span><b>Réservations</b></div>
        <button data-admin-tab="planning" class="is-active">Planning</button>
        <button data-admin-tab="clients">Clients</button>
        <button data-admin-tab="settings">Paramètres</button>
        <button data-go="showcase">Voir le module client</button>
      </aside>
      <div class="admin-main">
        <div id="admin-planning" class="admin-tab is-active">
          <div class="admin-head">
            <div><p class="eyebrow">Planning & réservations</p><h1 id="admin-date-title">Aujourd’hui</h1></div>
            <div class="admin-head-actions"><input id="admin-date" type="date"><button class="primary small" data-new-reservation>+ Réservation</button></div>
          </div>
          <div class="kpi-row">
            <article><span>Couverts</span><strong id="kpi-covers">0</strong></article>
            <article><span>Réservations</span><strong id="kpi-bookings">0</strong></article>
            <article><span>Déjeuner</span><strong id="kpi-lunch">0</strong></article>
            <article><span>Dîner</span><strong id="kpi-dinner">0</strong></article>
          </div>
          <div class="admin-grid">
            <section class="calendar-panel">
              <div class="panel-title"><h2>Calendrier</h2><div><button data-month="-1">‹</button><strong id="month-title"></strong><button data-month="1">›</button></div></div>
              <div class="calendar-week"><span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span></div>
              <div id="admin-calendar" class="admin-calendar"></div>
            </section>
            <section class="reservations-panel">
              <div class="panel-title"><h2>Réservations du jour</h2><div class="service-filter"><button data-service-filter="all" class="is-active">Tous</button><button data-service-filter="lunch">Déjeuner</button><button data-service-filter="dinner">Dîner</button></div></div>
              <div id="reservation-list" class="reservation-list"></div>
            </section>
          </div>
        </div>

        <div id="admin-clients" class="admin-tab" hidden>
          <div class="admin-head"><div><p class="eyebrow">Fichier clients</p><h1>Clients</h1></div><input id="client-search" class="search" placeholder="Rechercher un client…"></div>
          <div id="client-list" class="client-list"></div>
        </div>

        <div id="admin-settings" class="admin-tab" hidden>
          <div class="admin-head"><div><p class="eyebrow">Configuration</p><h1>Paramètres de réservation</h1></div><button id="save-settings" class="primary small">Enregistrer</button></div>
          <div class="settings-grid">
            <section class="settings-card"><h2>Capacité & règles</h2>
              <label>Maximum en ligne par réservation<input id="set-max-party" type="number" min="1" max="20"></label>
              <label>Délai minimum avant réservation<select id="set-notice"><option value="0">Immédiat</option><option value="60">1 heure</option><option value="120">2 heures</option><option value="240">4 heures</option><option value="1440">24 heures</option></select></label>
              <label><span>Message 7 personnes et +</span><textarea id="set-large-message" rows="3"></textarea></label>
            </section>
            <section class="settings-card"><h2>Déjeuner</h2><label>Horaires disponibles<textarea id="set-lunch-times" rows="5" placeholder="12:00, 12:30, 13:00…"></textarea></label><label>Capacité par créneau<input id="set-lunch-cap" type="number" min="1"></label></section>
            <section class="settings-card"><h2>Dîner</h2><label>Horaires disponibles<textarea id="set-dinner-times" rows="5" placeholder="19:00, 19:30, 20:00…"></textarea></label><label>Capacité par créneau<input id="set-dinner-cap" type="number" min="1"></label></section>
            <section class="settings-card"><h2>Jours d’ouverture</h2><div id="weekday-settings" class="weekday-settings"></div></section>
          </div>
        </div>
      </div>
    </section>
  </main>

  <button class="booking-float" data-open-booking><span>Réserver</span></button>

  <dialog id="booking-dialog" class="booking-dialog">
    <form method="dialog" class="booking-card">
      <header><img src="https://assets.zyrosite.com/gnKoPAn3rxzY53IR/chatgpt-image-22-nov.-2025-00_40_31-YvUWBeCav31wXD3h.png" alt=""><button value="cancel" aria-label="Fermer">×</button></header>
      <div id="booking-progress" class="booking-progress"></div>
      <div id="booking-content" class="booking-content"></div>
    </form>
  </dialog>

  <dialog id="detail-dialog" class="detail-dialog"><div id="detail-content"></div></dialog>
</div>
<script defer src="/assets/js/demo-reservation.js?v=20261008-1"></script>
<?php endif; ?>
</body></html>