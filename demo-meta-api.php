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

$timezone = new DateTimeZone('Europe/Paris');

function validDate(string $value, DateTimeZone $timezone): ?DateTimeImmutable {
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value, $timezone);
    return $date && $date->format('Y-m-d') === $value ? $date : null;
}

function requestedRange(DateTimeZone $timezone): array {
    $today = new DateTimeImmutable('today', $timezone);
    $tomorrow = $today->add(new DateInterval('P1D'));
    $preset = (string)($_GET['preset'] ?? '');
    $legacyDays = (int)($_GET['days'] ?? 0);
    if ($preset === '' && in_array($legacyDays, [7, 28, 30, 90, 180, 365], true)) $preset = (string)$legacyDays;
    if ($preset === '') $preset = '28';

    if ($preset === 'ytd') {
        $sinceDate = new DateTimeImmutable($today->format('Y').'-01-01', $timezone);
        $untilDate = $tomorrow;
        $label = 'Cette année';
    } elseif ($preset === 'last_year') {
        $year = (int)$today->format('Y') - 1;
        $sinceDate = new DateTimeImmutable($year.'-01-01', $timezone);
        $untilDate = new DateTimeImmutable(($year + 1).'-01-01', $timezone);
        $label = 'Année '.$year;
    } elseif ($preset === 'custom') {
        $sinceDate = validDate((string)($_GET['since'] ?? ''), $timezone);
        $endDate = validDate((string)($_GET['until'] ?? ''), $timezone);
        if (!$sinceDate || !$endDate || $endDate < $sinceDate || $endDate > $today) {
            respond(422, ['status' => 'invalid_range', 'message' => 'La période choisie est invalide.']);
        }
        $untilDate = $endDate->add(new DateInterval('P1D'));
        $label = 'Période personnalisée';
    } else {
        $days = (int)$preset;
        if (!in_array($days, [7, 28, 30, 90, 180, 365], true)) $days = 28;
        $preset = (string)$days;
        $sinceDate = $tomorrow->sub(new DateInterval('P'.$days.'D'));
        $untilDate = $tomorrow;
        $label = $days.' derniers jours';
    }

    $days = (int)$sinceDate->diff($untilDate)->format('%a');
    if ($days < 1 || $days > 366) {
        respond(422, ['status' => 'invalid_range', 'message' => 'Choisissez une période comprise entre 1 et 366 jours.']);
    }
    return [
        'preset' => $preset,
        'label' => $label,
        'days' => $days,
        'sinceDate' => $sinceDate,
        'untilDate' => $untilDate,
        'since' => $sinceDate->format('Y-m-d'),
        'until' => $untilDate->format('Y-m-d'),
        'end' => $untilDate->sub(new DateInterval('P1D'))->format('Y-m-d'),
    ];
}

function comparisonRange(array $range, string $mode): ?array {
    if (!in_array($mode, ['previous', 'year'], true)) return null;
    $interval = new DateInterval('P'.$range['days'].'D');
    if ($mode === 'year') {
        $sinceDate = $range['sinceDate']->sub(new DateInterval('P1Y'));
        $untilDate = $range['untilDate']->sub(new DateInterval('P1Y'));
        $label = 'Même période l’an dernier';
    } else {
        $untilDate = $range['sinceDate'];
        $sinceDate = $untilDate->sub($interval);
        $label = 'Période précédente';
    }
    return [
        'mode' => $mode,
        'label' => $label,
        'days' => $range['days'],
        'sinceDate' => $sinceDate,
        'untilDate' => $untilDate,
        'since' => $sinceDate->format('Y-m-d'),
        'until' => $untilDate->format('Y-m-d'),
        'end' => $untilDate->sub(new DateInterval('P1D'))->format('Y-m-d'),
    ];
}

$range = requestedRange($timezone);
$compareMode = (string)($_GET['compare'] ?? 'none');
$comparisonRange = comparisonRange($range, $compareMode);
$days = $range['days'];
$since = $range['since'];
$until = $range['until'];

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

function graphGetMany(array $requests, string $token, array $config): array {
    if (!$requests) return [];
    if (count($requests) > 5) {
        $responses = [];
        foreach (array_chunk($requests, 5) as $batch) {
            $responses = array_merge($responses, graphGetMany($batch, $token, $config));
        }
        return $responses;
    }
    if ($token === '' || !function_exists('curl_multi_init')) {
        return array_map(static fn(array $request) => graphGet($request['path'], $request['params'], $token, $config), $requests);
    }
    $multi = curl_multi_init();
    $handles = [];
    foreach ($requests as $index => $request) {
        $base = 'https://graph.facebook.com/'.rawurlencode((string)$config['api_version']).'/'.ltrim((string)$request['path'], '/');
        $url = $base.'?'.http_build_query($request['params'], '', '&', PHP_QUERY_RFC3986);
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_MAXREDIRS => 0,
            CURLOPT_HTTPHEADER => ['Accept: application/json', 'Authorization: Bearer '.$token],
            CURLOPT_USERAGENT => 'LeVillage-Meta-Insights/1.0',
            CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
        ]);
        curl_multi_add_handle($multi, $curl);
        $handles[$index] = $curl;
    }
    do {
        $status = curl_multi_exec($multi, $running);
        if ($running) curl_multi_select($multi, 1.0);
    } while ($running && $status === CURLM_OK);
    $responses = [];
    foreach ($handles as $index => $curl) {
        $body = curl_multi_getcontent($curl);
        $httpStatus = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $json = is_string($body) && strlen($body) <= 1500000 ? json_decode($body, true) : null;
        $responses[$index] = $httpStatus >= 200 && $httpStatus < 300 && is_array($json)
            ? ['ok' => true, 'data' => $json]
            : ['ok' => false, 'code' => $httpStatus ?: 503];
        curl_multi_remove_handle($multi, $curl);
        curl_close($curl);
    }
    curl_multi_close($multi);
    ksort($responses);
    return array_values($responses);
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

function chunkedInsightSeries(string $path, string $metric, array $params, array $range, string $token, array $config, int $chunkDays = 90): array {
    $series = [];
    $cursor = $range['sinceDate'];
    while ($cursor < $range['untilDate']) {
        $chunkEnd = $cursor->add(new DateInterval('P'.$chunkDays.'D'));
        if ($chunkEnd > $range['untilDate']) $chunkEnd = $range['untilDate'];
        $response = graphGet($path, $params + [
            'metric' => $metric,
            'period' => 'day',
            'since' => $cursor->format('Y-m-d'),
            'until' => $chunkEnd->format('Y-m-d'),
        ], $token, $config);
        if (!($response['ok'] ?? false)) return ['ok' => false, 'code' => (int)($response['code'] ?? 0), 'series' => $series];
        $series = array_replace($series, insightSeries($response['data'], $metric));
        $cursor = $chunkEnd;
    }
    ksort($series);
    return ['ok' => true, 'series' => $series];
}

function facebookRangeData(array $range, string $token, array $config): array {
    $cached = readRangeCache('facebook', $range);
    if ($cached !== null) return $cached;
    $views = chunkedInsightSeries((string)$config['page_id'].'/insights', 'page_media_view', [], $range, $token, $config);
    $interactions = chunkedInsightSeries((string)$config['page_id'].'/insights', 'page_post_engagements', [], $range, $token, $config);
    $viewSeries = $views['series'] ?? [];
    $interactionSeries = $interactions['series'] ?? [];
    $result = [
        'ok' => ($views['ok'] ?? false) || ($interactions['ok'] ?? false),
        'code' => (int)($views['code'] ?? $interactions['code'] ?? 0),
        'views' => array_sum($viewSeries),
        'interactions' => array_sum($interactionSeries),
        'series' => array_map(static fn(array $row) => [
            'date' => $row['date'], 'views' => $row['m0'], 'interactions' => $row['m1'],
        ], mergeSeries($viewSeries, $interactionSeries)),
    ];
    writeRangeCache('facebook', $range, $result);
    return $result;
}

function instagramRangeData(array $range, string $token, array $config): array {
    $cached = readRangeCache('instagram', $range);
    if ($cached !== null) return $cached;
    $totals = ['reach' => 0, 'total_interactions' => 0, 'profile_views' => 0];
    $windowSeries = [];
    $cursor = $range['sinceDate'];
    $totalsOk = true;
    $totalsCode = 0;
    $requests = [];
    $windowDates = [];
    while ($cursor < $range['untilDate']) {
        $chunkEnd = $cursor->add(new DateInterval('P28D'));
        if ($chunkEnd > $range['untilDate']) $chunkEnd = $range['untilDate'];
        $requests[] = [
            'path' => (string)$config['instagram_id'].'/insights',
            'params' => [
                'metric' => 'reach,total_interactions,profile_views',
                'period' => 'day',
                'metric_type' => 'total_value',
                'since' => $cursor->format('Y-m-d'),
                'until' => $chunkEnd->format('Y-m-d'),
            ],
        ];
        $windowDates[] = $chunkEnd->sub(new DateInterval('P1D'))->format('Y-m-d');
        $cursor = $chunkEnd;
    }
    foreach (graphGetMany($requests, $token, $config) as $index => $response) {
        if (!($response['ok'] ?? false)) {
            $totalsOk = false;
            $totalsCode = (int)($response['code'] ?? 0);
            break;
        }
        foreach (array_keys($totals) as $metric) $totals[$metric] += numberOrNull(insightTotal($response['data'], $metric)) ?? 0;
        $windowSeries[$windowDates[$index]] = numberOrNull(insightTotal($response['data'], 'reach')) ?? 0;
    }
    $reach = $range['days'] > 90
        ? ['ok' => $totalsOk, 'code' => $totalsCode, 'series' => $windowSeries]
        : chunkedInsightSeries((string)$config['instagram_id'].'/insights', 'reach', [
            'metric_type' => 'time_series',
        ], $range, $token, $config, 28);
    $result = [
        'ok' => $totalsOk,
        'code' => $totalsCode ?: (int)($reach['code'] ?? 0),
        'reach' => $totalsOk ? $totals['reach'] : null,
        'interactions' => $totalsOk ? $totals['total_interactions'] : null,
        'profileViews' => $totalsOk ? $totals['profile_views'] : null,
        'cumulativeWindows' => $range['days'] > 90,
        'series' => array_map(static fn(array $row) => ['date' => $row['date'], 'reach' => $row['m0']], mergeSeries($reach['series'] ?? [])),
    ];
    writeRangeCache('instagram', $range, $result);
    return $result;
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

function rangeCacheFile(string $namespace, array $range): string {
    $dir = dirname(__DIR__) . '/lv-meta-cache';
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    return $dir.'/range-'.preg_replace('/[^a-z0-9_-]/i', '', $namespace).'-'.hash('sha256', $range['since'].'|'.$range['until']).'.json';
}

function readRangeCache(string $namespace, array $range): ?array {
    if (($GLOBALS['metaForceRanges'] ?? false) === true) return null;
    $file = rangeCacheFile($namespace, $range);
    if (!is_file($file) || filemtime($file) <= time() - 600) return null;
    $cached = json_decode((string)file_get_contents($file), true);
    return is_array($cached) ? $cached : null;
}

function writeRangeCache(string $namespace, array $range, array $payload): void {
    if (!($payload['ok'] ?? false)) return;
    $file = rangeCacheFile($namespace, $range);
    if (is_dir(dirname($file)) && is_writable(dirname($file))) {
        @file_put_contents($file, json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
    }
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
        'range' => array_diff_key($range, ['sinceDate' => true, 'untilDate' => true]),
        'comparisonRange' => $comparisonRange ? array_diff_key($comparisonRange, ['sinceDate' => true, 'untilDate' => true]) : null,
        'facebook' => ['status' => 'not_connected'],
        'instagram' => ['status' => 'not_connected'],
    ]);
}

$cacheDir = dirname(__DIR__) . '/lv-meta-cache';
$cacheKey = hash('sha256', implode('|', [$range['since'], $range['until'], $compareMode]));
$cacheFile = $cacheDir.'/insights-'.$cacheKey.'.json';
$force = ($_GET['refresh'] ?? '') === '1';
$GLOBALS['metaForceRanges'] = $force && $compareMode === 'none';
if (!$force && is_file($cacheFile) && filemtime($cacheFile) > time() - 600) {
    $cached = json_decode((string)file_get_contents($cacheFile), true);
    if (is_array($cached)) respond(200, $cached + ['cached' => true]);
}

$facebook = ['status' => 'not_connected'];
if ($pageToken !== '') {
    $pageInfo = graphGet((string)$config['page_id'], [
        'fields' => 'id,name,fan_count,followers_count,instagram_business_account',
    ], $pageToken, $config);
    $facebookRange = facebookRangeData($range, $pageToken, $config);
    $facebookComparison = $comparisonRange ? facebookRangeData($comparisonRange, $pageToken, $config) : null;
    if ($pageInfo['ok'] ?? false) {
        $facebook = [
            'status' => $facebookRange['ok'] ? 'connected' : 'partial',
            'name' => (string)($pageInfo['data']['name'] ?? 'Restaurant Le Village'),
            'followers' => numberOrNull($pageInfo['data']['followers_count'] ?? $pageInfo['data']['fan_count'] ?? null),
            'views' => $facebookRange['views'],
            'interactions' => $facebookRange['interactions'],
            'series' => $facebookRange['series'],
            'comparison' => $facebookComparison,
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
    $instagramRange = instagramRangeData($range, $instagramToken, $config);
    $instagramComparison = $comparisonRange ? instagramRangeData($comparisonRange, $instagramToken, $config) : null;
    if (($igInfo['ok'] ?? false) && $instagramRange['ok']) {
        $instagram = [
            'status' => 'connected',
            'name' => '@'.ltrim((string)($igInfo['data']['username'] ?? 'restaurantlevillagehdc'), '@'),
            'followers' => numberOrNull($igInfo['data']['followers_count'] ?? null),
            'posts' => numberOrNull($igInfo['data']['media_count'] ?? null),
            'reach' => $instagramRange['reach'],
            'interactions' => $instagramRange['interactions'],
            'profileViews' => $instagramRange['profileViews'],
            'cumulativeWindows' => $instagramRange['cumulativeWindows'],
            'series' => $instagramRange['series'],
            'comparison' => $instagramComparison,
        ];
    } else {
        $code = (int)($instagramRange['code'] ?? $igInfo['code'] ?? 0);
        $instagram = ['status' => 'connection_error', 'message' => upstreamMessage($code)];
    }
}

$connected = array_filter([$facebook, $instagram], static fn(array $item) => in_array($item['status'] ?? '', ['connected', 'partial'], true));
$payload = [
    'status' => count($connected) === 2 ? 'connected' : (count($connected) ? 'partial' : 'connection_error'),
    'updatedAt' => (new DateTimeImmutable('now', $timezone))->format(DateTimeInterface::ATOM),
    'range' => array_diff_key($range, ['sinceDate' => true, 'untilDate' => true]),
    'comparisonRange' => $comparisonRange ? array_diff_key($comparisonRange, ['sinceDate' => true, 'untilDate' => true]) : null,
    'facebook' => $facebook,
    'instagram' => $instagram,
];
if (!is_dir($cacheDir)) @mkdir($cacheDir, 0700, true);
if (is_dir($cacheDir) && is_writable($cacheDir)) @file_put_contents($cacheFile, json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
respond(200, $payload);
