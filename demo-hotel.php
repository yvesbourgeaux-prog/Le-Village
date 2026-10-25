<?php
declare(strict_types=1);
session_start();
header('Cache-Control: private, no-store');header('X-Robots-Tag: noindex, nofollow, noarchive');
if(empty($_SESSION['lv_demo_ok'])){header('Location: /demo-reservation?next=hotel');exit;}
require __DIR__.'/hotel-demo-lib.php';
$catalog=hd_catalog();$room=null;
if(isset($_GET['room'])){foreach($catalog['rooms'] as $r)if($r['slug']===$_GET['room'])$room=$r;if(!$room){http_response_code(404);exit('Chambre introuvable');}}
function esc(string $s):string{return htmlspecialchars($s,ENT_QUOTES,'UTF-8');}
ob_start(); ?>
<section class="hd-section" id="reservation" data-room="<?=esc($room['id']??'')?>">
 <div class="hd-heading"><p class="hd-eyebrow">Le Grimaldi · 6 place du Château</p><h1><?=esc($room['name']??'Votre séjour au Haut-de-Cagnes')?></h1><p>Cinq chambres de charme, une réservation directement sur notre site.</p></div>
 <p class="hd-notice">Démonstration privée · aucun paiement, aucune réservation réelle. Les disponibilités proviennent des calendriers Holidu.</p>
 <?php if($room): ?>
 <div class="hd-gallery"><?php foreach(array_slice($room['photos'],0,5) as $i=>$photo): ?><a href="<?=esc($photo)?>" target="_blank" rel="noopener"><img src="<?=esc($photo)?>" alt="<?=esc($room['name'])?> — photo <?=$i+1?>" <?=$i?'loading="lazy"':''?>></a><?php endforeach; ?></div>
 <div class="hd-room-layout"><article class="hd-details"><a href="/demo-hotel#reservation">← Toutes les chambres</a><h2>Un séjour à votre rythme</h2><p><?=esc($room['description'])?></p><p><?=esc((string)$room['area'])?> m² · jusqu’à <?=$room['capacity']?> personnes · <?=$room['floor']?><?=($room['floor']===1?'er':'e')?> étage</p><h3>Les équipements</h3><ul class="hd-features"><?php foreach($room['features'] as $f): ?><li><?=esc($f)?></li><?php endforeach; ?></ul><p><?=esc($room['bed'])?></p><h3>Bon à savoir</h3><p>Arrivée : <?=esc($catalog['checkin'])?> · Départ avant <?=esc($catalog['checkout'])?>.</p><p><?=esc($catalog['cancellation'])?></p><p>Ménage : 45 € par séjour. Petit-déjeuner facultatif : 18 € par personne et par nuit. Linge de lit et serviettes inclus. Animaux non admis.</p><p><?=esc($catalog['taxNote'])?></p></article><div id="hd-booking" class="hd-panel"></div></div>
 <?php else: ?>
 <form id="hd-search" class="hd-search"><label>Arrivée<input type="date" name="arrival" required></label><label>Départ<input type="date" name="departure" required></label><label>Voyageurs<select name="guests"><option value="1">1 personne</option><option value="2" selected>2 personnes</option><option value="3">3 personnes</option></select></label><button>Voir les disponibilités</button></form><p id="hd-search-status" role="status"></p><div id="hd-rooms" class="hd-rooms"></div>
 <?php endif; ?>
 <details class="hd-source"><summary>Tarifs, calendriers et conditions de cet essai</summary><p>Informations relevées dans Holidu le 25 octobre 2026. Les tarifs ne sont pas synchronisés par iCal : seules les périodes renseignées peuvent être chiffrées. Les événements iCal bloquent les nuits entre l’arrivée incluse et le départ exclu. Une synchronisation indisponible empêche la réservation d’essai. La taxe de séjour reste à confirmer. Les essais sont conservés dans cette session de démonstration uniquement.</p></details>
 <section class="hd-trials"><h2>Mes réservations d’essai</h2><div id="hd-trials"></div></section>
</section>
<?php $content=ob_get_clean();
$site=(string)file_get_contents(__DIR__.'/hotel-cagnes-sur-mer-le-grimaldi.html');
$site=preg_replace('~<script\b[^>]*src=["\x27][^"\x27]*/assets/js/(?:language-route|languages|automne-popup|zenchef)\.js[^"\x27]*["\x27][^>]*>\s*</script>~i','',$site);
$site=preg_replace('~<link\b[^>]*(?:rel=["\x27](?:canonical|alternate)["\x27]|href=["\x27][^"\x27]*(?:languages|automne-popup)\.css)[^>]*>~i','',$site);
$site=preg_replace('~<meta\b[^>]*name=["\x27]robots["\x27][^>]*>~i','',$site);
$site=preg_replace('~<script type="application/ld\+json">.*?</script>~s','',$site);
$site=preg_replace('~<title[^>]*>.*?</title>~s','<title>Démo hôtel — '.esc($room['name']??'Le Grimaldi').'</title>',$site);
$site=str_replace('</head>','<meta name="robots" content="noindex,nofollow,noarchive"><link rel="stylesheet" href="/assets/css/demo-hotel.css?v=1"><script defer src="/assets/js/demo-hotel.js?v=1"></script></head>',$site);
if($room){$site=preg_replace('~<main id="main">.*?</main>~s','<main id="main">'.$content.'</main>',$site);}else{$site=preg_replace('~<section\b[^>]*id="reservation"[^>]*>.*?</section>~s',$content,$site);}
$site=preg_replace('~href="(?:https://legrimaldibylevillage\.com)?/reserver(?:#[^"]*)?"~','href="#reservation"',$site);
$site=str_replace('href="/hotel-cagnes-sur-mer-le-grimaldi"','href="/demo-hotel"',$site);
$site=str_replace('href="/le-village-restaurant-haut-de-cagnes-sur-mer"','href="/demo-reservation"',$site);
$bar='<nav class="hd-toolbar" aria-label="Navigation démo"><strong>Démo privée · Hôtel</strong><a href="/demo-hotel">Chambres</a><a href="/demo-reservation">Restaurant</a><a href="/demo-hotel-config.php">Calendriers</a><a href="/demo-reservation?logout=1">Quitter</a></nav>';
$site=preg_replace('~(<body[^>]*>)~','$1'.$bar,$site,1);
$site=str_replace('class="home-page hotel-page common-header-page"','class="home-page hotel-page common-header-page hd-demo'.($room?' hd-room-page':'').'"',$site);
echo $site;
