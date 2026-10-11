<?php
declare(strict_types=1);

// Read-only content performance for the private Le Village prototype.
session_start(['read_and_close' => true]);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow, noarchive');

function reply(int $code, array $body): never {
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
if (empty($_SESSION['lv_demo_ok'])) reply(401, ['status' => 'unauthorized']);
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    header('Allow: GET');
    reply(405, ['status' => 'method_not_allowed']);
}

$config = [
    'access_token' => getenv('LV_META_ACCESS_TOKEN') ?: '',
    'page_access_token' => getenv('LV_META_PAGE_ACCESS_TOKEN') ?: '',
    'page_id' => getenv('LV_META_PAGE_ID') ?: '160182247439170',
    'instagram_id' => getenv('LV_META_INSTAGRAM_ID') ?: '17841416623964515',
    'api_version' => getenv('LV_META_API_VERSION') ?: 'v26.0',
];
$privateFile = dirname(__DIR__).'/private/le-village-meta.php';
if (is_file($privateFile)) {
    $private = require $privateFile;
    if (is_array($private)) $config = array_merge($config, $private);
}
if (!ctype_digit((string)$config['page_id']) || !ctype_digit((string)$config['instagram_id'])
    || !preg_match('/^v\d+\.\d+$/', (string)$config['api_version'])) {
    reply(503, ['status' => 'configuration_error']);
}
$pageToken = trim((string)$config['page_access_token']);
$igToken = trim((string)$config['access_token']) ?: $pageToken;
if ($pageToken === '' && $igToken === '') reply(200, ['status' => 'not_connected', 'items' => []]);

function graph(string $path, array $query, string $token, array $config): array {
    if ($token === '' || !function_exists('curl_init')) return ['ok' => false, 'code' => 503];
    $url = 'https://graph.facebook.com/'.$config['api_version'].'/'.$path.'?'.http_build_query($query, '', '&', PHP_QUERY_RFC3986);
    $curl = curl_init($url);
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 12,
        CURLOPT_FOLLOWLOCATION => false, CURLOPT_MAXREDIRS => 0,
        CURLOPT_HTTPHEADER => ['Accept: application/json', 'Authorization: Bearer '.$token],
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
    ]);
    $raw = curl_exec($curl);
    $code = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    $json = is_string($raw) && strlen($raw) < 1500000 ? json_decode($raw, true) : null;
    return $code >= 200 && $code < 300 && is_array($json)
        ? ['ok' => true, 'data' => $json]
        : ['ok' => false, 'code' => $code ?: 503];
}
function countValue(mixed $value): ?int {
    return is_numeric($value) ? max(0, (int)$value) : null;
}
function safeUrl(mixed $value): string {
    if (!is_string($value) || !filter_var($value, FILTER_VALIDATE_URL)) return '';
    return parse_url($value, PHP_URL_SCHEME) === 'https' ? $value : '';
}
function shortText(mixed $value): string {
    $text = (string)($value ?? '');
    return function_exists('mb_substr') ? mb_substr($text, 0, 240) : substr($text, 0, 240);
}
function insightValue(array $response, string $metric): ?int {
    if (!($response['ok'] ?? false)) return null;
    foreach (($response['data']['data'] ?? []) as $entry) {
        if (($entry['name'] ?? '') !== $metric) continue;
        $value = $entry['values'][0]['value'] ?? $entry['total_value']['value'] ?? null;
        return countValue($value);
    }
    return null;
}
function facebookContents(array $config, string $token): array {
    if ($token === '') return ['status' => 'not_connected', 'items' => []];
    $path = $config['page_id'].'/posts';
    $fields = 'id,message,created_time,permalink_url,shares,comments.limit(1).summary(true),reactions.limit(1).summary(true)';
    $response = graph($path, ['fields' => $fields, 'limit' => 12], $token, $config);
    $enriched = (bool)($response['ok'] ?? false);
    if (!$enriched) {
        // Some Pages reject nested engagement fields even when the posts
        // themselves are readable. Keep the comparison usable with null values.
        $response = graph($path, ['fields' => 'id,message,created_time,permalink_url', 'limit' => 12], $token, $config);
    }
    if (!$response['ok']) return ['status' => 'connection_error', 'items' => []];
    $items = [];
    foreach (($response['data']['data'] ?? []) as $row) {
        $id = (string)($row['id'] ?? '');
        if (!preg_match('/^\d+_\d+$/', $id)) continue;
        $clicks = insightValue(graph($id.'/insights', ['metric' => 'post_clicks'], $token, $config), 'post_clicks');
        $items[] = [
            'id' => $id, 'platform' => 'facebook', 'type' => 'Publication',
            'date' => (string)($row['created_time'] ?? ''),
            'text' => shortText($row['message'] ?? ''),
            'url' => safeUrl($row['permalink_url'] ?? ''),
            'reactions' => countValue($row['reactions']['summary']['total_count'] ?? null),
            'comments' => countValue($row['comments']['summary']['total_count'] ?? null),
            'shares' => countValue($row['shares']['count'] ?? null),
            'clicks' => $clicks,
            'views' => null, 'reach' => null,
        ];
    }
    // Reels and Stories may not be available to every Page/app combination.
    foreach ([['video_reels', 'Reel'], ['stories', 'Story']] as [$edge, $type]) {
        $extra = graph($config['page_id'].'/'.$edge, ['fields' => 'id,created_time,permalink_url,description', 'limit' => 15], $token, $config);
        if (!($extra['ok'] ?? false)) continue;
        foreach (($extra['data']['data'] ?? []) as $row) {
            $id = (string)($row['id'] ?? '');
            if (!ctype_digit($id)) continue;
            $items[] = [
                'id' => $id, 'platform' => 'facebook', 'type' => $type,
                'date' => (string)($row['created_time'] ?? ''),
                'text' => shortText($row['description'] ?? ''),
                'url' => safeUrl($row['permalink_url'] ?? ''),
                'reactions' => null, 'comments' => null, 'shares' => null,
                'clicks' => null, 'views' => null, 'reach' => null,
            ];
        }
    }
    return ['status' => $enriched ? 'connected' : 'partial', 'items' => $items];
}
function instagramContents(array $config, string $token): array {
    if ($token === '') return ['status' => 'not_connected', 'items' => []];
    $fields = 'id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count';
    $response = graph($config['instagram_id'].'/media', ['fields' => $fields, 'limit' => 12], $token, $config);
    if (!$response['ok']) return ['status' => 'connection_error', 'items' => []];
    $items = [];
    foreach (($response['data']['data'] ?? []) as $row) {
        $id = (string)($row['id'] ?? '');
        if (!ctype_digit($id)) continue;
        $product = strtoupper((string)($row['media_product_type'] ?? ''));
        $type = $product === 'REELS' ? 'Reel' : ($product === 'STORY' ? 'Story' : 'Publication');
        $views = insightValue(graph($id.'/insights', ['metric' => 'views'], $token, $config), 'views');
        $reach = insightValue(graph($id.'/insights', ['metric' => 'reach'], $token, $config), 'reach');
        $shares = insightValue(graph($id.'/insights', ['metric' => 'shares'], $token, $config), 'shares');
        $items[] = [
            'id' => $id, 'platform' => 'instagram', 'type' => $type,
            'date' => (string)($row['timestamp'] ?? ''),
            'text' => shortText($row['caption'] ?? ''),
            'url' => safeUrl($row['permalink'] ?? ''),
            'reactions' => countValue($row['like_count'] ?? null),
            'comments' => countValue($row['comments_count'] ?? null),
            'shares' => $shares, 'clicks' => null, 'views' => $views, 'reach' => $reach,
        ];
    }
    // The /media edge omits active Stories; older Stories may no longer have insights.
    $stories = graph($config['instagram_id'].'/stories', ['fields' => 'id,timestamp,permalink,caption', 'limit' => 12], $token, $config);
    if ($stories['ok']) {
        foreach (($stories['data']['data'] ?? []) as $row) {
            $id = (string)($row['id'] ?? '');
            if (!ctype_digit($id)) continue;
            $items[] = [
                'id' => $id, 'platform' => 'instagram', 'type' => 'Story',
                'date' => (string)($row['timestamp'] ?? ''),
                'text' => shortText($row['caption'] ?? ''),
                'url' => safeUrl($row['permalink'] ?? ''),
                'reactions' => null, 'comments' => null, 'shares' => null, 'clicks' => null,
                'views' => insightValue(graph($id.'/insights', ['metric' => 'views'], $token, $config), 'views'),
                'reach' => insightValue(graph($id.'/insights', ['metric' => 'reach'], $token, $config), 'reach'),
            ];
        }
    }
    return ['status' => 'connected', 'items' => array_values(array_unique($items, SORT_REGULAR))];
}

$cacheDir = dirname(__DIR__).'/lv-meta-cache';
$cacheFile = $cacheDir.'/content-v2-'.hash('sha256', $pageToken.'|'.$igToken).'.json';
if (($_GET['refresh'] ?? '') !== '1' && is_file($cacheFile) && filemtime($cacheFile) > time() - 600) {
    $cached = json_decode((string)file_get_contents($cacheFile), true);
    if (is_array($cached)) reply(200, $cached);
}
$facebook = facebookContents($config, $pageToken);
$instagram = instagramContents($config, $igToken);
$payload = [
    'status' => $facebook['status'] === 'connected' || $instagram['status'] === 'connected' ? 'connected' : 'not_connected',
    'updatedAt' => gmdate('c'), 'facebook' => $facebook, 'instagram' => $instagram,
];
if (!is_dir($cacheDir)) @mkdir($cacheDir, 0700, true);
if ($payload['status'] === 'connected' && is_dir($cacheDir) && is_writable($cacheDir)) {
    @file_put_contents($cacheFile, json_encode($payload, JSON_INVALID_UTF8_SUBSTITUTE), LOCK_EX);
}
reply(200, $payload);
