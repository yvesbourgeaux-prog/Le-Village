<?php
declare(strict_types=1);

session_start();
header('Cache-Control: no-store, private');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; img-src https://assets.zyrosite.com data:; form-action 'self'; base-uri 'none'; frame-ancestors 'self'");

if (empty($_SESSION['lv_demo_ok'])) {
    header('Location: /demo-reservation');
    exit;
}

const LV_META_PAGE_ID = '160182247439170';
const LV_META_INSTAGRAM_ID = '17841416623964515';
const LV_META_API_VERSION = 'v26.0';

function e(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function graphPage(string $token): array {
    if (!function_exists('curl_init')) {
        return ['ok' => false, 'message' => 'La connexion sécurisée à Meta n’est pas disponible sur ce serveur.'];
    }
    $url = 'https://graph.facebook.com/'.LV_META_API_VERSION.'/'.LV_META_PAGE_ID.'?'.http_build_query([
        'fields' => 'id,name,instagram_business_account',
    ], '', '&', PHP_QUERY_RFC3986);
    $curl = curl_init($url);
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_CONNECTTIMEOUT => 7,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_MAXREDIRS => 0,
        CURLOPT_HTTPHEADER => ['Accept: application/json', 'Authorization: Bearer '.$token],
        CURLOPT_USERAGENT => 'LeVillage-Meta-Setup/1.0',
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
    ]);
    $body = curl_exec($curl);
    $status = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    $json = is_string($body) ? json_decode($body, true) : null;
    if ($status < 200 || $status >= 300 || !is_array($json)) {
        return ['ok' => false, 'message' => 'Meta n’a pas accepté ce jeton. Vérifiez qu’il s’agit bien du jeton de la Page Le Village.'];
    }
    if (($json['id'] ?? '') !== LV_META_PAGE_ID) {
        return ['ok' => false, 'message' => 'Ce jeton ne correspond pas à la Page Facebook du Village.'];
    }
    $instagramId = (string)($json['instagram_business_account']['id'] ?? '');
    if ($instagramId !== LV_META_INSTAGRAM_ID) {
        return ['ok' => false, 'message' => 'Le compte Instagram relié ne correspond pas à @restaurantlevillagehdc.'];
    }
    return ['ok' => true, 'name' => (string)($json['name'] ?? 'Restaurant Le Village')];
}

function savePrivateConfig(string $token): bool {
    $directory = dirname(__DIR__).'/private';
    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) return false;
    @chmod($directory, 0700);
    $target = $directory.'/le-village-meta.php';
    $contents = "<?php\n// Configuration Meta privée générée depuis le back-office.\nreturn ".var_export([
        'access_token' => '',
        'page_access_token' => $token,
        'page_id' => LV_META_PAGE_ID,
        'instagram_id' => LV_META_INSTAGRAM_ID,
        'api_version' => LV_META_API_VERSION,
    ], true).";\n";
    $temporary = tempnam($directory, 'meta-');
    if ($temporary === false) return false;
    $written = file_put_contents($temporary, $contents, LOCK_EX);
    if ($written === false) { @unlink($temporary); return false; }
    @chmod($temporary, 0600);
    if (!rename($temporary, $target)) { @unlink($temporary); return false; }
    @chmod($target, 0600);
    return true;
}

if (empty($_SESSION['lv_meta_csrf'])) $_SESSION['lv_meta_csrf'] = bin2hex(random_bytes(24));
$message = '';
$success = false;

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    $attempts = (int)($_SESSION['lv_meta_setup_attempts'] ?? 0);
    if ($attempts >= 8) {
        $message = 'Trop de tentatives. Fermez puis rouvrez votre session avant de réessayer.';
    } elseif (!hash_equals((string)$_SESSION['lv_meta_csrf'], (string)($_POST['csrf'] ?? ''))) {
        $message = 'La session a expiré. Rechargez la page puis réessayez.';
    } else {
        $_SESSION['lv_meta_setup_attempts'] = $attempts + 1;
        $token = trim((string)($_POST['page_token'] ?? ''));
        if ($token === '' || strlen($token) < 40 || strlen($token) > 1000) {
            $message = 'Collez le jeton de la Page Facebook Le Village.';
        } else {
            $verification = graphPage($token);
            if (!($verification['ok'] ?? false)) {
                $message = (string)($verification['message'] ?? 'Connexion Meta impossible.');
            } elseif (!savePrivateConfig($token)) {
                $message = 'Le jeton est valide, mais le serveur n’a pas pu enregistrer la configuration privée.';
            } else {
                $_SESSION['lv_meta_setup_attempts'] = 0;
                $success = true;
                $message = 'Facebook et Instagram sont maintenant reliés au back-office.';
            }
        }
        unset($token);
    }
}
?>
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <title>Connecter Meta — Le Village</title>
  <style>
    *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#f6f1eb;color:#514438;font-family:Arial,sans-serif}.card{width:min(100%,620px);padding:38px;border:1px solid #e5dbd0;border-radius:22px;background:#fff;box-shadow:0 24px 70px #53381e17}.logo{display:block;width:90px;height:90px;object-fit:contain;margin:0 auto 22px}.eyebrow{margin:0 0 7px;color:#a08d7b;font-size:11px;font-weight:700;letter-spacing:.13em;text-align:center}.card h1{margin:0 0 13px;text-align:center;font:600 32px Georgia,serif}.intro{max-width:480px;margin:0 auto 25px;color:#84766a;font-size:14px;line-height:1.6;text-align:center}.notice{margin:0 0 20px;padding:13px 15px;border-radius:11px;background:#f4f7f4;color:#47705a;font-size:13px;line-height:1.5}.notice.error{background:#fff5e9;color:#885f36}.card label{display:grid;gap:8px;margin:0 0 15px;color:#625346;font-size:12px;font-weight:700}.card input{width:100%;border:1px solid #d8cbbf;border-radius:11px;padding:14px;background:#fff;font:14px Arial,sans-serif}.card input:focus{outline:2px solid #b98c62;outline-offset:2px}.actions{display:flex;gap:11px;flex-wrap:wrap}.button{display:inline-flex;align-items:center;justify-content:center;min-height:45px;padding:0 18px;border:1px solid #76583f;border-radius:10px;background:#76583f;color:#fff;font-size:13px;font-weight:700;text-decoration:none;cursor:pointer}.button.secondary{background:#fff;color:#76583f}.help{margin:18px 0 0;color:#9b8e82;font-size:11px;line-height:1.55}@media(max-width:540px){.card{padding:27px 21px}.card h1{font-size:27px}.actions{display:grid}.button{width:100%}}
  </style>
</head>
<body>
  <main class="card">
    <img class="logo" src="https://assets.zyrosite.com/gnKoPAn3rxzY53IR/chatgpt-image-22-nov.-2025-00_40_31-YvUWBeCav31wXD3h.png" alt="Le Grimaldi × Le Village">
    <p class="eyebrow">PARAMÉTRAGE PRIVÉ</p>
    <h1>Connecter les statistiques Meta</h1>
    <p class="intro">Ajoutez une seule fois le jeton de la Page Facebook. Il donnera au back-office un accès en lecture aux statistiques Facebook et Instagram.</p>
    <?php if ($message !== ''): ?><p class="notice <?=$success ? '' : 'error'?>"><?=e($message)?></p><?php endif; ?>
    <?php if (!$success): ?>
      <form method="post" autocomplete="off">
        <input type="hidden" name="csrf" value="<?=e((string)$_SESSION['lv_meta_csrf'])?>">
        <label>Jeton de la Page Facebook
          <input type="password" name="page_token" required autofocus autocomplete="new-password" spellcheck="false" aria-describedby="token-help">
        </label>
        <div class="actions"><button class="button" type="submit">Vérifier et connecter</button><a class="button secondary" href="/demo-reservation">Annuler</a></div>
      </form>
      <p id="token-help" class="help">Le jeton est envoyé directement à Meta pour vérification, puis enregistré dans un dossier privé du serveur. Il n’est jamais affiché dans le navigateur ni ajouté au dépôt GitHub.</p>
    <?php else: ?>
      <div class="actions"><a class="button" href="/demo-reservation#admin-meta">Voir les statistiques</a></div>
    <?php endif; ?>
  </main>
</body>
</html>
