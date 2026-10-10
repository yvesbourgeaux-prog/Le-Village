<?php
declare(strict_types=1);

/**
 * Read-only Meta Insights adapter for the protected Le Village back-office demo.
 * Secrets live in the host environment or in a private file above public_html.
 */
session_start(['read_and_close' => true]);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $payload): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

if (empty($_SESSION['lv_demo_ok'])) {
    respond(401, ['status' => 'unauthorized', 'message' => 'Accès privé requis.']);
}
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    header('Allow: GET');
    respond(405, ['status' => 'method_not_allowed', 'message' => 'Lecture seule.']);
}

function envString(string $name): string {
    $value = getenv($name);
    return is_string($value) ? trim($value) : '';
}

$config = [
    'access_token' => envString('LV_META_ACCESS_TOKEN'),
    'page_access_token' => envString('LV_META_PAGE_ACCESS_TOKEN'),
    'page_id' => envString('LV_META_PAGE_ID') ?: '160182247439170',
    'instagram_id' => envString('LV_META_INSTAGRAM_ID') ?: '17841416623964515',
    'api_version' => envString('LV_META_API_VERSION') ?: 'v26.0',
];
$privateFile = dirname(__DIR__) . '/private/le-village-meta.php';
if (is_file($privateFile)) {
    $private = require $privateFile;
    if (is_array($private)) $config = array_merge($config, $private);
}
foreach (['page_id', 'instagram_id'] as $idKey) {
    if (!ctype_digit((string)$config[$idKey])) {
        respond(503, ['status' => 'configuration_error', 'message' => 'Identifiant Meta invalide.']);
    }
}
if (!preg_match('/^v\d+\.\d+$/', (string)$config['api_version'])) {
    respond(503, ['status' => 'configuration_error', 'message' => 'Version Meta invalide.']);
}

$days = (int)($_GET['days'] ?? 30);
if (!in_array($days, [7, 30, 90], true)) $days = 30;
$timezone = new DateTimeZone('Europe/Paris');
$untilDate = new DateTimeImmutable('tomorrow', $timezone);
$sinceDate = $untilDate->sub(new DateInterval('P'.$days.'D'));
$since = $sinceDate->format('Y-m-d');
$until = $untilDate->format('Y-m-d');

function graphGet(string $path, array $params, string $token, array $config): array {
    if ($token === '' || !function_exists('curl_init')) return ['ok' => false, 'code' => 0];
    $base = 'https://graph.facebook.com/'.rawurlencode((string)$config['api_version']).'/'.ltrim($path, '/');
    $url = $base.($params ? '?'.http_build_query($params, '', '&', PHP_QUERY_RFC3986) : '');
    $curl = curl_init($url);
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 12,
        CURLOPT_MAXREDIRS => 0,
        CURLOPT_HTTPHEADER => ['Accept: application/json', 'Authorization: Bearer '.$token],
        CURLOPT_USERAGENT => 'LeVillage-Meta-Insights/1.0',
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
    ]);
    $body = curl_exec($curl);
    $status = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    if (!is_string($body) || strlen($body) > 1500000) return ['ok' => false, 'code' => $status ?: 503];
    $json = json_decode($body, true);
    if ($status < 200 || $status >= 300 || !is_array($json)) return ['ok' => false, 'code' => $status ?: 503];
    return ['ok' => true, 'data' => $json];
}

function numberOrNull(mixed $value): int|float|null {
    return is_numeric($value) ? $value + 0 : null;
}

function insightSeries(array $payload, string $metric): array {
    foreach (($payload['data'] ?? []) as $row) {
        if (!is_array($row) || ($row['name'] ?? '') !== $metric) continue;
        $series = [];
        foreach (($row['values'] ?? []) as $point) {
            if (!is_array($point) || !isset($point['end_time'])) continue;
            $date = substr((string)$point['end_time'], 0, 10);
            $value = numberOrNull($point['value'] ?? null);
            if ($date !== '' && $value !== null) $series[$date] = $value;
        }
        ksort($series);
        return $series;
    }
    return [];
}

function insightTotal(array $payload, string $metric): int|float|null {
    foreach (($payload['data'] ?? []) as $row) {
        if (!is_array($row) || ($row['name'] ?? '') !== $metric) continue;
        return numberOrNull($row['total_value']['value'] ?? null);
    }
    return null;
}

function mergeSeries(array ...$metrics): array {
    $dates = [];
    foreach ($metrics as $series) foreach ($series as $date => $_) $dates[$date] = true;
    ksort($dates);
    $rows = [];
    foreach (array_keys($dates) as $date) {
        $row = ['date' => $date];
        foreach ($metrics as $index => $series) $row['m'.$index] = numberOrNull($series[$date] ?? 0) ?? 0;
        $rows[] = $row;
    }
    return $rows;
}

function upstreamMessage(int $code): string {
    return match ($code) {
        401 => 'Autorisation Meta expirée ou invalide.',
        403 => 'Meta refuse cet accès : vérifiez les droits de la Page.',
        429 => 'Limite Meta atteinte. Réessayez dans quelques minutes.',
        default => 'Les statistiques Meta sont momentanément indisponibles.',
    };
}

$userToken = trim((string)$config['access_token']);
$pageToken = trim((string)$config['page_access_token']);
$instagramToken = $userToken !== '' ? $userToken : $pageToken;
if ($userToken === '' && $pageToken === '') {
    respond(200, [
        'status' => 'not_connected',
        'message' => 'Connexion Meta à finaliser sur le serveur.',
        'range' => compact('days', 'since', 'until'),
        'facebook' => ['status' => 'not_connected'],
        'instagram' => ['status' => 'not_connected'],
    ]);
}

$cacheDir = dirname(__DIR__) . '/lv-meta-cache';
$cacheFile = $cacheDir.'/insights-'.$days.'.json';
$force = ($_GET['refresh'] ?? '') === '1';
if (!$force && is_file($cacheFile) && filemtime($cacheFile) > time() - 600) {
    $cached = json_decode((string)file_get_contents($cacheFile), true);
    if (is_array($cached)) respond(200, $cached + ['cached' => true]);
}

$facebook = ['status' => 'not_connected'];
if ($pageToken !== '') {
    $pageInfo = graphGet((string)$config['page_id'], [
        'fields' => 'id,name,fan_count,followers_count,instagram_business_account',
    ], $pageToken, $config);
    $views = graphGet((string)$config['page_id'].'/insights', [
        'metric' => 'page_media_view', 'period' => 'day', 'since' => $since, 'until' => $until,
    ], $pageToken, $config);
    $interactions = graphGet((string)$config['page_id'].'/insights', [
        'metric' => 'page_post_engagements', 'period' => 'day', 'since' => $since, 'until' => $until,
    ], $pageToken, $config);
    if ($pageInfo['ok'] ?? false) {
        $viewSeries = ($views['ok'] ?? false) ? insightSeries($views['data'], 'page_media_view') : [];
        $interactionSeries = ($interactions['ok'] ?? false) ? insightSeries($interactions['data'], 'page_post_engagements') : [];
        $facebook = [
            'status' => ($views['ok'] ?? false) || ($interactions['ok'] ?? false) ? 'connected' : 'partial',
            'name' => (string)($pageInfo['data']['name'] ?? 'Restaurant Le Village'),
            'followers' => numberOrNull($pageInfo['data']['followers_count'] ?? $pageInfo['data']['fan_count'] ?? null),
            'views' => array_sum($viewSeries),
            'interactions' => array_sum($interactionSeries),
            'series' => array_map(static fn(array $row) => [
                'date' => $row['date'], 'views' => $row['m0'], 'interactions' => $row['m1'],
            ], mergeSeries($viewSeries, $interactionSeries)),
        ];
        if ($facebook['status'] === 'partial') $facebook['message'] = 'La Page est reliée, mais certains indicateurs ne sont pas disponibles.';
    } else {
        $facebook = ['status' => 'connection_error', 'message' => upstreamMessage((int)($pageInfo['code'] ?? 0))];
    }
} else {
    $facebook = ['status' => 'not_connected', 'message' => 'Jeton de Page Facebook à ajouter sur le serveur.'];
}

$instagram = ['status' => 'not_connected'];
if ($instagramToken !== '') {
    $igInfo = graphGet((string)$config['instagram_id'], [
        'fields' => 'id,username,followers_count,media_count',
    ], $instagramToken, $config);
    $igTotals = graphGet((string)$config['instagram_id'].'/insights', [
        'metric' => 'reach,total_interactions,profile_views', 'period' => 'day',
        'metric_type' => 'total_value', 'since' => $since, 'until' => $until,
    ], $instagramToken, $config);
    $igReach = graphGet((string)$config['instagram_id'].'/insights', [
        'metric' => 'reach', 'period' => 'day', 'metric_type' => 'time_series',
        'since' => $since, 'until' => $until,
    ], $instagramToken, $config);
    if (($igInfo['ok'] ?? false) && ($igTotals['ok'] ?? false)) {
        $reachSeries = ($igReach['ok'] ?? false) ? insightSeries($igReach['data'], 'reach') : [];
        $instagram = [
            'status' => 'connected',
            'name' => '@'.ltrim((string)($igInfo['data']['username'] ?? 'restaurantlevillagehdc'), '@'),
            'followers' => numberOrNull($igInfo['data']['followers_count'] ?? null),
            'posts' => numberOrNull($igInfo['data']['media_count'] ?? null),
            'reach' => insightTotal($igTotals['data'], 'reach'),
            'interactions' => insightTotal($igTotals['data'], 'total_interactions'),
            'profileViews' => insightTotal($igTotals['data'], 'profile_views'),
            'series' => array_map(static fn(array $row) => ['date' => $row['date'], 'reach' => $row['m0']], mergeSeries($reachSeries)),
        ];
    } else {
        $code = (int)($igTotals['code'] ?? $igInfo['code'] ?? 0);
        $instagram = ['status' => 'connection_error', 'message' => upstreamMessage($code)];
    }
}

$connected = array_filter([$facebook, $instagram], static fn(array $item) => in_array($item['status'] ?? '', ['connected', 'partial'], true));
$payload = [
    'status' => count($connected) === 2 ? 'connected' : (count($connected) ? 'partial' : 'connection_error'),
    'updatedAt' => (new DateTimeImmutable('now', $timezone))->format(DateTimeInterface::ATOM),
    'range' => compact('days', 'since', 'until'),
    'facebook' => $facebook,
    'instagram' => $instagram,
];
if (!is_dir($cacheDir)) @mkdir($cacheDir, 0700, true);
if (is_dir($cacheDir) && is_writable($cacheDir)) @file_put_contents($cacheFile, json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
respond(200, $payload);
