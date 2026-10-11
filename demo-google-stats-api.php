<?php
declare(strict_types=1);
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $data): void {
  http_response_code($status);
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
  exit;
}
if (empty($_SESSION['lv_demo_ok'])) respond(401, ['error' => 'Connexion au back-office requise.']);
if ($_SERVER['REQUEST_METHOD'] !== 'GET') respond(405, ['error' => 'Méthode non autorisée.']);

$days = filter_input(INPUT_GET, 'days', FILTER_VALIDATE_INT);
if (!in_array($days, [7, 28, 90, 180], true)) $days = 28;
$configPath = getenv('LV_GOOGLE_OAUTH_CLIENT') ?: dirname(__DIR__) . '/private/le-village-oauth-client.json';
$rawConfig = is_readable($configPath) ? json_decode((string) file_get_contents($configPath), true) : null;
$config = is_array($rawConfig) ? ($rawConfig['web'] ?? null) : null;
if (!is_array($config) || empty($config['client_id']) || empty($config['client_secret']) || !in_array('https://legrimaldibylevillage.com/demo-google-oauth.php', $config['redirect_uris'] ?? [], true)) {
  respond(503, ['error' => 'Le client OAuth Google doit être installé dans l’espace privé de l’hébergement.', 'code' => 'not_configured']);
}
$tokenPath = dirname($configPath) . '/le-village-google-token.json';
$storedToken = is_readable($tokenPath) ? json_decode((string) file_get_contents($tokenPath), true) : null;
if (!is_array($storedToken) || empty($storedToken['refresh_token'])) {
  respond(503, ['error' => 'Autorisez la lecture de Google Analytics et Search Console avec votre compte Google.', 'code' => 'not_authorized', 'connect_url' => '/demo-google-oauth.php']);
}
$config['property_id'] = '557530408';
$config['site_url'] = 'sc-domain:legrimaldibylevillage.com';

function googlePost(string $url, array $body, string $token): array {
  $handle = curl_init($url);
  curl_setopt_array($handle, [
    CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode($body), CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $token, 'Content-Type: application/json'],
    CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 18,
  ]);
  $raw = curl_exec($handle);
  $status = (int) curl_getinfo($handle, CURLINFO_HTTP_CODE);
  curl_close($handle);
  $json = is_string($raw) ? json_decode($raw, true) : null;
  if ($status < 200 || $status >= 300 || !is_array($json)) throw new RuntimeException('Google API ' . $status);
  return $json;
}
function accessToken(array $config): string {
  $handle = curl_init('https://oauth2.googleapis.com/token');
  curl_setopt_array($handle, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => http_build_query(['grant_type' => 'refresh_token', 'refresh_token' => $GLOBALS['storedToken']['refresh_token'], 'client_id' => $config['client_id'], 'client_secret' => $config['client_secret']]), CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 18]);
  $raw = curl_exec($handle);
  $status = (int)curl_getinfo($handle, CURLINFO_HTTP_CODE);
  curl_close($handle);
  $json = is_string($raw) ? json_decode($raw, true) : null;
  if ($status === 400 && is_array($json) && ($json['error'] ?? '') === 'invalid_grant') throw new RuntimeException('google_refresh_expired');
  if ($status !== 200 || !is_array($json) || empty($json['access_token'])) throw new RuntimeException('Autorisation Google indisponible');
  return (string)$json['access_token'];
}
function rows(array $report): array {
  return array_map(static fn($row) => [
    'dimensions' => array_map(static fn($v) => (string)($v['value'] ?? ''), $row['dimensionValues'] ?? []),
    'metrics' => array_map(static fn($v) => (float)($v['value'] ?? 0), $row['metricValues'] ?? []),
  ], $report['rows'] ?? []);
}

try {
  $token = accessToken($config);
  $timezone = new DateTimeZone('Europe/Paris');
  $end = (new DateTimeImmutable('today', $timezone))->modify('-1 day');
  $start = $end->modify('-' . ($days - 1) . ' days');
  $gaUrl = 'https://analyticsdata.googleapis.com/v1beta/properties/' . $config['property_id'] . ':runReport';
  $range = ['startDate' => $start->format('Y-m-d'), 'endDate' => $end->format('Y-m-d')];
  $ga = fn(array $body): array => googlePost($gaUrl, ['dateRanges' => [$range]] + $body, $token);
  $gaTotals = $ga(['metrics' => array_map(static fn($v) => ['name' => $v], ['activeUsers', 'sessions', 'screenPageViews', 'engagementRate'])]);
  $gaDaily = $ga(['dimensions' => [['name' => 'date']], 'metrics' => [['name' => 'screenPageViews'], ['name' => 'activeUsers']], 'limit' => 200]);
  $gaPages = $ga(['dimensions' => [['name' => 'pagePath']], 'metrics' => [['name' => 'screenPageViews'], ['name' => 'activeUsers']], 'orderBys' => [['metric' => ['metricName' => 'screenPageViews'], 'desc' => true]], 'limit' => 8]);
  $gaEvents = $ga(['dimensions' => [['name' => 'eventName']], 'metrics' => [['name' => 'eventCount']], 'limit' => 200]);
  $allowedEvents = ['restaurant_booking_click', 'hotel_booking_click', 'phone_click', 'email_click', 'menu_click', 'directions_click'];
  $events = [];
  foreach (rows($gaEvents) as $row) if (in_array($row['dimensions'][0] ?? '', $allowedEvents, true)) $events[$row['dimensions'][0]] = (int)($row['metrics'][0] ?? 0);
  $gscEnd = (new DateTimeImmutable('today', $timezone))->modify('-3 days');
  $gscStart = $gscEnd->modify('-' . ($days - 1) . ' days');
  $gscUrl = 'https://www.googleapis.com/webmasters/v3/sites/' . rawurlencode($config['site_url']) . '/searchAnalytics/query';
  $gscRange = ['startDate' => $gscStart->format('Y-m-d'), 'endDate' => $gscEnd->format('Y-m-d'), 'type' => 'web'];
  $search = fn(array $body): array => googlePost($gscUrl, $gscRange + $body, $token);
  $gscTotals = $search(['rowLimit' => 1]);
  $gscDaily = $search(['dimensions' => ['date'], 'rowLimit' => 200]);
  $gscPages = $search(['dimensions' => ['page'], 'rowLimit' => 8]);
  $gscQueries = $search(['dimensions' => ['query'], 'rowLimit' => 8]);
  $metric = static fn(array $row): array => ['clicks' => (int)($row['clicks'] ?? 0), 'impressions' => (int)($row['impressions'] ?? 0), 'ctr' => (float)($row['ctr'] ?? 0), 'position' => (float)($row['position'] ?? 0)];
  $mapSearch = static fn(array $report): array => array_map(static fn($row) => ['label' => (string)($row['keys'][0] ?? '')] + $metric($row), $report['rows'] ?? []);
  respond(200, [
    'period' => $days, 'analyticsRange' => $range, 'searchRange' => ['startDate' => $gscRange['startDate'], 'endDate' => $gscRange['endDate']],
    'analytics' => ['totals' => rows($gaTotals)[0]['metrics'] ?? [0,0,0,0], 'daily' => rows($gaDaily), 'pages' => rows($gaPages), 'events' => $events],
    'search' => ['totals' => $metric($gscTotals['rows'][0] ?? []), 'daily' => $mapSearch($gscDaily), 'pages' => $mapSearch($gscPages), 'queries' => $mapSearch($gscQueries)],
    'tagManager' => ['container' => 'GTM-NCL2235Z', 'status' => 'Configuré sur le site, après consentement'],
  ]);
} catch (Throwable $error) {
  if ($error->getMessage() === 'google_refresh_expired') {
    respond(503, ['error' => 'L’autorisation Google a expiré. Reconnectez votre compte pour rétablir les statistiques.', 'code' => 'not_authorized', 'connect_url' => '/demo-google-oauth.php']);
  }
  error_log('Le Village Google stats: ' . $error->getMessage());
  respond(502, ['error' => 'Les données Google ne sont pas accessibles pour le moment. Vérifiez les accès Analytics et Search Console.', 'code' => 'google_unavailable']);
}
