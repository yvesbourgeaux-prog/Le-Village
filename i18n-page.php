<?php
declare(strict_types=1);
// Localized HTML is built offline; visitors never pay for a translation here.
$path = rawurldecode((string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));
$parts = explode('/', trim($path, '/'), 2);
$lang = $parts[0] ?? '';
$allowed = ['en','sv','da','nl','de','it','es','ja','zh-CN'];
if (!in_array($lang, $allowed, true)) { http_response_code(404); exit; }
$slug = trim($parts[1] ?? '', '/');
$slug = preg_replace('/\.html$/', '', $slug);
if ($slug === 'index') $slug = '';
$file = __DIR__ . '/i18n/pages/' . $lang . '.json.gz';
if (!is_file($file)) { http_response_code(503); exit('Temporarily unavailable'); }
$data = json_decode(gzdecode(file_get_contents($file)), true);
if (!is_array($data)) { http_response_code(503); exit('Temporarily unavailable'); }
if (!isset($data[$slug])) { http_response_code(404); $slug = '404'; }
header('Content-Type: text/html; charset=UTF-8');
header('Content-Language: ' . $lang);
header('Cache-Control: public, max-age=300');
// Refresh the shared stylesheet in existing language packs as well as new builds.
$document = $data[$slug] ?? '';
// Keep the short booking label in prebuilt translations.
$bookingLabels = ["en" =>  "Book", "sv" =>  "Boka", "da" =>  "Book", "nl" =>  "Reserveer", "de" =>  "Reservieren", "it" =>  "Prenota", "es" =>  "Reservar", "ja" =>  "予約", "zh-CN" =>  "预订"];
$document = preg_replace_callback('~(<span\b[^>]*data-i18n=[^>]*c9f6b527c374d720[^>]*>)[^<]*(</span>)~u', static fn($m) => $m[1] . ($bookingLabels[$lang] ?? 'Réserver') . $m[2], $document);
define('LV_PRESS_PAGE', true);
require_once __DIR__ . '/press-downloads.php';
$document = lvPressDownloadButtons($document, $slug, $lang);
echo preg_replace('~/assets/css/navigation\.css\?v=[^"\s<>]*~', '/assets/css/navigation.css?v=20261003-mobile-video1', $document);
