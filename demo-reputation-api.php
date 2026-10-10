<?php
declare(strict_types=1);

/**
 * Private, read-only reputation adapter for the Le Village demonstration.
 *
 * Credentials are read from server environment variables only. Never place
 * OAuth tokens or API keys in HTML, JavaScript, Git, or localStorage.
 * The demo uses a shared-password session and MUST NOT be used as a production
 * authentication mechanism for publishing owner responses.
 */
session_start(['read_and_close' => true]);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('X-Content-Type-Options: nosniff');

function reply(int $status, array $payload): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
if (empty($_SESSION['lv_demo_ok'])) {
    reply(401, ['status' => 'unauthorized', 'message' => 'Accès privé requis.']);
}
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    header('Allow: GET');
    reply(405, ['status' => 'method_not_allowed', 'message' => 'Lecture seule dans cette démonstration.']);
}
$source = (string)($_GET['source'] ?? '');
$entity = (string)($_GET['entity'] ?? '');
if ($source !== 'google' || $entity !== 'restaurant') {
    reply(400, ['status' => 'invalid_request', 'message' => 'Fiche inconnue.']);
}

function envValue(string $key): string {
    $value = getenv($key);
    return is_string($value) ? trim($value) : '';
}
function asNumber(mixed $v): ?float {
    return is_numeric($v) ? (float)$v : null;
}
function safeDate(mixed $value): ?string {
    if (!is_string($value) || $value === '') return null;
    return substr($value, 0, 10);
}
function firstText(mixed $value): string {
    if (is_string($value)) return $value;
    if (is_array($value)) {
        foreach (['value', 'text', 'name', 'title', 'original', 'display_name'] as $field) {
            if (isset($value[$field]) && is_string($value[$field])) return $value[$field];
        }
    }
    return '';
}
function requestJson(string $url, array $headers): array {
    if (!function_exists('curl_init')) {
        return ['error' => 'server_unavailable', 'http' => 503];
    }
    $handle = curl_init($url);
    curl_setopt_array($handle, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_CONNECTTIMEOUT => 4,
        CURLOPT_TIMEOUT => 9,
        CURLOPT_MAXREDIRS => 0,
        CURLOPT_HTTPHEADER => array_merge(['Accept: application/json'], $headers),
        CURLOPT_USERAGENT => 'LeVillage-Reputation-Demo/1.0',
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
    ]);
    $body = curl_exec($handle);
    $http = (int)curl_getinfo($handle, CURLINFO_HTTP_CODE);
    curl_close($handle);
    if (!is_string($body) || strlen($body) > 1200000) {
        return ['error' => 'network_error', 'http' => 503];
    }
    $json = json_decode($body, true);
    if ($http < 200 || $http >= 300 || !is_array($json)) {
        return ['error' => 'upstream_error', 'http' => $http ?: 503];
    }
    return ['data' => $json, 'http' => 200];
}
function upstreamError(array $result, string $source, string $entity): never {
    $code = (int)($result['http'] ?? 503);
    // Do not forward provider responses: they can contain credentials or internal details.
    reply(502, [
        'status' => 'connection_error',
        'source' => $source,
        'entity' => $entity,
        'message' => $code === 403 ? 'Accès API refusé : vérifiez les droits et la formule souscrite.' :
            ($code === 429 ? 'Limite API atteinte. Réessayez plus tard.' :
             ($code === 401 ? 'Autorisation expirée ou invalide.' : 'Impossible de récupérer les avis actuellement.')),
    ]);
}

if ($source === 'google') {
    $account = envValue('LV_GBP_ACCOUNT_ID');
    $location = envValue('LV_GBP_LOCATION_ID');
    $token = envValue('LV_GBP_ACCESS_TOKEN');
    // A short-lived access token is supported for a technical preview only.
    // Production requires a secure server-side OAuth 2.0 authorization flow.
    if ($account === '' || $location === '' || $token === '') {
        reply(200, [
            'status' => 'not_connected', 'source' => 'google', 'entity' => 'restaurant',
            'message' => 'Connexion Google Business Profile à configurer.',
            'rating' => null, 'total' => null, 'reviews' => [],
        ]);
    }
    if (!ctype_digit($account) || !ctype_digit($location)) {
        reply(503, ['status' => 'configuration_error', 'message' => 'Identifiants Google non valides.']);
    }
    $url = 'https://mybusiness.googleapis.com/v4/accounts/'.$account.'/locations/'.$location.'/reviews?pageSize=30';
    $result = requestJson($url, ['Authorization: Bearer '.$token]);
    if (!isset($result['data'])) upstreamError($result, 'google', 'restaurant');
    $data = $result['data'];
    $stars = ['ONE'=>1, 'TWO'=>2, 'THREE'=>3, 'FOUR'=>4, 'FIVE'=>5];
    $reviews = [];
    foreach (array_slice($data['reviews'] ?? [], 0, 30) as $r) {
        if (!is_array($r)) continue;
        $reviews[] = [
            'id' => (string)($r['reviewId'] ?? ''),
            'author' => (string)($r['reviewer']['displayName'] ?? 'Visiteur Google'),
            'rating' => $stars[$r['starRating'] ?? ''] ?? asNumber($r['starRating'] ?? null),
            'date' => safeDate($r['createTime'] ?? null),
            'title' => '',
            'text' => (string)($r['comment'] ?? ''),
            'reply' => (string)($r['reviewReply']['comment'] ?? ''),
            'replyUrl' => (string)($r['reviewReplyUrl'] ?? ''),
        ];
    }
    reply(200, [
        'status' => 'connected', 'source' => 'google', 'entity' => 'restaurant',
        'rating' => asNumber($data['averageRating'] ?? null),
        'total' => isset($data['totalReviewCount']) ? (int)$data['totalReviewCount'] : null,
        'reviews' => $reviews, 'readOnly' => true,
    ]);
}

// Only Google Business Profile is currently supported by this demo endpoint.
reply(400, ['status' => 'unsupported_source', 'message' => 'Cette source de réputation n’est pas disponible.']);
