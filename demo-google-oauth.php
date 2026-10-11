<?php
declare(strict_types=1);
session_start();
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
if (empty($_SESSION['lv_demo_ok'])) {
  http_response_code(403);
  exit('Connexion au back-office requise.');
}
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  http_response_code(405);
  exit('Méthode non autorisée.');
}

$redirect = 'https://legrimaldibylevillage.com/demo-google-oauth.php';
$configPath = getenv('LV_GOOGLE_OAUTH_CLIENT') ?: dirname(__DIR__) . '/private/le-village-oauth-client.json';
$source = is_readable($configPath) ? json_decode((string) file_get_contents($configPath), true) : null;
$client = is_array($source) ? ($source['web'] ?? null) : null;
if (!is_array($client) || empty($client['client_id']) || empty($client['client_secret']) || !in_array($redirect, $client['redirect_uris'] ?? [], true)) {
  http_response_code(503);
  exit('Installez le JSON du client OAuth dans le dossier private sous le nom le-village-oauth-client.json.');
}

if (isset($_GET['error'])) {
  http_response_code(400);
  exit('Autorisation Google refusée ou interrompue. Revenez au back-office pour réessayer.');
}
if (!isset($_GET['code'])) {
  $state = bin2hex(random_bytes(24));
  $_SESSION['lv_google_oauth_state'] = $state;
  $params = [
    'client_id' => $client['client_id'],
    'redirect_uri' => $redirect,
    'response_type' => 'code',
    'scope' => 'https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly',
    'access_type' => 'offline',
    'prompt' => 'consent',
    'state' => $state,
  ];
  header('Location: https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params, '', '&', PHP_QUERY_RFC3986), true, 302);
  exit;
}
$expected = $_SESSION['lv_google_oauth_state'] ?? '';
unset($_SESSION['lv_google_oauth_state']);
if (!is_string($expected) || $expected === '' || !hash_equals($expected, (string)($_GET['state'] ?? ''))) {
  http_response_code(400);
  exit('État OAuth invalide. Revenez au back-office pour réessayer.');
}
$handle = curl_init('https://oauth2.googleapis.com/token');
curl_setopt_array($handle, [
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => http_build_query([
    'code' => (string)$_GET['code'],
    'client_id' => $client['client_id'],
    'client_secret' => $client['client_secret'],
    'redirect_uri' => $redirect,
    'grant_type' => 'authorization_code',
  ]),
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CONNECTTIMEOUT => 5,
  CURLOPT_TIMEOUT => 18,
]);
$raw = curl_exec($handle);
$status = (int)curl_getinfo($handle, CURLINFO_HTTP_CODE);
curl_close($handle);
$token = is_string($raw) ? json_decode($raw, true) : null;
if ($status !== 200 || !is_array($token) || empty($token['refresh_token'])) {
  error_log('Le Village OAuth exchange failed, HTTP ' . $status);
  http_response_code(502);
  exit('Google n’a pas fourni d’autorisation durable. Revenez au back-office et réessayez.');
}
$tokenPath = dirname($configPath) . '/le-village-google-token.json';
$tempPath = tempnam(dirname($configPath), '.lv-google-');
if ($tempPath === false) {
  http_response_code(500);
  exit('Dossier privé non accessible en écriture.');
}
chmod($tempPath, 0600);
$saved = file_put_contents($tempPath, json_encode(['refresh_token' => $token['refresh_token']], JSON_THROW_ON_ERROR), LOCK_EX);
if ($saved === false || !rename($tempPath, $tokenPath)) {
  @unlink($tempPath);
  http_response_code(500);
  exit('Impossible de conserver l’autorisation Google dans le dossier privé.');
}
header('Location: /demo-reservation.php', true, 303);
exit;
