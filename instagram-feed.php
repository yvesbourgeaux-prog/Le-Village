<?php
declare(strict_types=1);

// Public, read-only view of the restaurant's own Instagram publications.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300, stale-while-revalidate=600');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex');

function answer(array $posts, string $state = 'ok', int $received = 0): never {
    echo json_encode(['posts' => $posts, 'state' => $state, 'received' => $received], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    header('Allow: GET');
    http_response_code(405);
    answer([]);
}

$privateDirectory = dirname(__DIR__).'/private';
$cacheFile = $privateDirectory.'/le-village-instagram-feed.json';
$cached = is_file($cacheFile) ? json_decode((string)@file_get_contents($cacheFile), true) : null;
if (is_array($cached) && isset($cached['updated'], $cached['posts']) && is_array($cached['posts'])
    && time() - (int)$cached['updated'] < 900) answer($cached['posts'], 'cached');

$config = [
    'page_access_token' => getenv('LV_META_PAGE_ACCESS_TOKEN') ?: '',
    'access_token' => getenv('LV_META_ACCESS_TOKEN') ?: '',
    'instagram_id' => getenv('LV_META_INSTAGRAM_ID') ?: '17841416623964515',
    'api_version' => getenv('LV_META_API_VERSION') ?: 'v26.0',
];
$configFile = $privateDirectory.'/le-village-meta.php';
if (is_file($configFile)) {
    $private = require $configFile;
    if (is_array($private)) $config = array_merge($config, $private);
}
$token = trim((string)($config['access_token'] ?: $config['page_access_token']));
if ($token === '' || !ctype_digit((string)$config['instagram_id'])
    || !preg_match('/^v\d+\.\d+$/', (string)$config['api_version']) || !function_exists('curl_init')) {
    answer(is_array($cached['posts'] ?? null) ? $cached['posts'] : [], 'configuration');
}

$url = 'https://graph.facebook.com/'.$config['api_version'].'/'.$config['instagram_id'].'/media?'.http_build_query([
    'fields' => 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
    'limit' => 12,
], '', '&', PHP_QUERY_RFC3986);
$curl = curl_init($url);
curl_setopt_array($curl, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 12,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_HTTPHEADER => ['Accept: application/json', 'Authorization: Bearer '.$token],
    CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
]);
$raw = curl_exec($curl);
$status = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);
$response = is_string($raw) ? json_decode($raw, true) : null;
if ($status !== 200 || !is_array($response['data'] ?? null)) {
    $errorCode = (int)($response['error']['code'] ?? 0);
    $errorSubcode = (int)($response['error']['error_subcode'] ?? 0);
    answer(is_array($cached['posts'] ?? null) ? $cached['posts'] : [], 'upstream_'.$status.'_'.$errorCode.'_'.$errorSubcode);
}

$posts = [];
foreach ($response['data'] as $row) {
    if (!is_array($row)) continue;
    $type = (string)($row['media_type'] ?? '');
    $image = $type === 'VIDEO' ? ($row['thumbnail_url'] ?? '') : ($row['media_url'] ?? '');
    $permalink = (string)($row['permalink'] ?? '');
    if (!is_string($image) || !filter_var($image, FILTER_VALIDATE_URL)
        || parse_url($image, PHP_URL_SCHEME) !== 'https'
        || !preg_match('/(^|\.)(fbcdn\.net|facebook\.com|instagram\.com)$/i', (string)parse_url($image, PHP_URL_HOST))
        || !preg_match('~^https://(www\.)?instagram\.com/(p|reel|tv)/[A-Za-z0-9_-]+/?~i', $permalink)) continue;
    $caption = trim((string)($row['caption'] ?? ''));
    $posts[] = [
        'image' => $image,
        'url' => $permalink,
        'caption' => mb_substr($caption, 0, 140, 'UTF-8'),
        'type' => $type === 'VIDEO' ? 'video' : 'image',
    ];
    if (count($posts) === 8) break;
}

if ($posts && is_dir($privateDirectory) && is_writable($privateDirectory)) {
    $tmp = tempnam($privateDirectory, 'ig-feed-');
    if ($tmp !== false) {
        if (@file_put_contents($tmp, json_encode(['updated' => time(), 'posts' => $posts], JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE), LOCK_EX) !== false) {
            @chmod($tmp, 0600);
            @rename($tmp, $cacheFile);
        } else @unlink($tmp);
    }
}
answer($posts ?: (is_array($cached['posts'] ?? null) ? $cached['posts'] : []), 'ok', count($response['data']));
