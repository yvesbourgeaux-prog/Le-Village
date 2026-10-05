<?php
declare(strict_types=1);
// Localized HTML is built offline; visitors never pay for a translation here.
$path = rawurldecode((string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));
$parts = explode('/', trim($path, '/'), 2);
$lang = $parts[0] ?? '';
$allowed = ['en','sv','da','nl','de','it','es','ja','zh-CN','nb','ru','pl'];
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
$bookingLabels = ["en" => "Book", "sv" => "Boka", "da" => "Book", "nl" => "Reserveer", "de" => "Reservieren", "it" => "Prenota", "es" => "Reservar", "ja" => "予約", "zh-CN" => "预订", "nb" => "Reserver", "ru" => "Забронировать", "pl" => "Zarezerwuj"];
$document = preg_replace_callback('~(<span\b[^>]*data-i18n=[^>]*c9f6b527c374d720[^>]*>)[^<]*(</span>)~u', static fn($m) => $m[1] . ($bookingLabels[$lang] ?? 'Réserver') . $m[2], $document);
define('LV_PRESS_PAGE', true);
require_once __DIR__ . '/press-downloads.php';
$document = lvPressDownloadButtons($document, $slug, $lang);
// Older prepared packs predate the three new languages; expose their page equivalents.
if (!str_contains($document, 'hreflang="nb"')) {
    $newLanguages = ['nb' => 'Norsk', 'ru' => 'Русский', 'pl' => 'Polski'];
    $alternates = '';
    $choices = '';
    foreach ($newLanguages as $code => $name) {
        $path = '/' . $code . ($slug !== '' ? '/' . $slug : '/');
        $alternates .= '<link href="https://legrimaldibylevillage.com' . $path . '" hreflang="' . $code . '" rel="alternate"/>';
        $choices .= '<a href="' . $path . '" lang="' . $code . '" hreflang="' . $code . '" data-language="' . $code . '">' . $name . '</a>';
    }
    $document = str_replace('</head>', $alternates . '</head>', $document);
    $document = preg_replace('~(<button\b[^>]*\bdata-language-auto\b[^>]*>)~', $choices . '$1', $document, 1);
}
$document = preg_replace('~/assets/css/languages\.css\?v=[^"\s<>]*~', '/assets/css/languages.css?v=20261004-13', $document);
$document = preg_replace('~/assets/js/(language-route|languages)\.js\?v=[^"\s<>]*~', '/assets/js/$1.js?v=20261004-13', $document);
$document = preg_replace('~/assets/js/site\.js(?:\?v=[^"\s<>]*)?~', '/assets/js/site.js?v=20261005-ga1', $document);
echo preg_replace('~/assets/css/navigation\.css\?v=[^"\s<>]*~', '/assets/css/navigation.css?v=20261003-mobile-video1', $document);
