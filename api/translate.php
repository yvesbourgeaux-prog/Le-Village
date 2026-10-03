<?php
declare(strict_types=1);
// Optional Google Cloud Translation integration. No key is shipped in this repository.
// Configure LV_TRANSLATION_API_KEY in the host environment, or the private file below.
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
$config = ['api_key' => getenv('LV_TRANSLATION_API_KEY') ?: ''];
$private = dirname(__DIR__, 2) . '/private/le-village-i18n.php';
if (is_file($private)) { $settings = require $private; if (is_array($settings)) $config = array_merge($config, $settings); }
$enabled = $config['api_key'] !== '' && function_exists('curl_init');
function result(array $data, int $status = 200): never { http_response_code($status); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }
if (!$enabled) {
    if (($_GET['mode'] ?? '') === 'languages') result(['enabled' => false, 'languages' => []]);
    result(['error' => 'Translation unavailable'], 503);
}
$cache = dirname(__DIR__, 2) . '/lv-i18n-cache';
if (!is_dir($cache) && !@mkdir($cache, 0700, true)) result(['error' => 'Translation unavailable'], 503);
function google(string $route, array $data = []): array {
    global $config;
    $url = 'https://translation.googleapis.com/language/translate/v2' . $route . '?key=' . rawurlencode($config['api_key']);
    $curl = curl_init($url);
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 25, CURLOPT_FOLLOWLOCATION => false]);
    if ($data) curl_setopt_array($curl, [CURLOPT_POST => true, CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => json_encode($data)]);
    $body = curl_exec($curl); $status = curl_getinfo($curl, CURLINFO_HTTP_CODE); curl_close($curl);
    if ($body === false || $status !== 200) result(['error' => 'Translation unavailable'], 503);
    $json = json_decode($body, true);
    if (!is_array($json) || !isset($json['data'])) result(['error' => 'Translation unavailable'], 503);
    return $json['data'];
}
$languageFile = $cache . '/languages.json';
if (is_file($languageFile) && filemtime($languageFile) > time() - 86400) $languages = json_decode(file_get_contents($languageFile), true);
else { $data = google('/languages'); $languages = array_column($data['languages'] ?? [], 'language'); file_put_contents($languageFile, json_encode($languages), LOCK_EX); }
if (($_GET['mode'] ?? '') === 'languages') result(['enabled' => true, 'languages' => $languages]);
$lang = (string) ($_GET['lang'] ?? ''); $page = (string) ($_GET['page'] ?? 'index');
if (!in_array($lang, $languages, true) || !preg_match('/^[a-zA-Z0-9-]+$/', $page)) result(['error' => 'Unsupported language or page'], 400);
$file = dirname(__DIR__) . '/i18n/catalogs/' . $page . '.json';
if (!is_file($file)) result(['error' => 'Unknown page'], 404);
$source = file_get_contents($file); $texts = json_decode($source, true);
$name = $cache . '/' . hash('sha256', $lang . "\n" . $source) . '.json';
if (is_file($name)) result(json_decode(file_get_contents($name), true));
$lock = fopen($name . '.lock', 'c');
if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) result(['error' => 'Translation in progress'], 503);
if (is_file($name)) result(json_decode(file_get_contents($name), true));
// Bound spending: a fresh language/page is cached once. Raise only after reviewing usage.
$limit = (int) ($config['daily_character_limit'] ?? 100000);
$usageFile = $cache . '/usage-' . date('Y-m-d') . '.json';
$usage = fopen($usageFile, 'c+');
if (!$usage || !flock($usage, LOCK_EX)) result(['error' => 'Translation unavailable'], 503);
$spent = (int) stream_get_contents($usage);
$needed = array_sum(array_map('strlen', $texts));
if ($spent + $needed > $limit) result(['error' => 'Translation unavailable'], 503);
ftruncate($usage, 0); rewind($usage); fwrite($usage, (string) ($spent + $needed)); fflush($usage); flock($usage, LOCK_UN); fclose($usage);
$translations = []; $brands = ['Le Grimaldi by Le Village','Le Grimaldi','Le Village','Haut-de-Cagnes','Cagnes-sur-Mer'];
foreach (array_chunk($texts, 80, true) as $chunk) {
    $protected = array_map(static function($text) use ($brands) { foreach ($brands as $i => $brand) $text = str_replace($brand, '[[BRAND' . ($i+1) . ']]', $text); return $text; }, array_values($chunk));
    $translated = google('', ['q' => $protected, 'source' => 'fr', 'target' => $lang, 'format' => 'text']);
    $values = $translated['translations'] ?? [];
    if (count($values) !== count($chunk)) result(['error' => 'Translation unavailable'], 503);
    foreach (array_keys($chunk) as $i => $key) {
        $text = html_entity_decode($values[$i]['translatedText'], ENT_QUOTES | ENT_HTML5, 'UTF-8');
        foreach ($brands as $j => $brand) $text = str_replace('[[BRAND' . ($j+1) . ']]', $brand, $text);
        if (str_contains($text, '[[BRAND')) result(['error' => 'Translation unavailable'], 503);
        $translations[$key] = $text;
    }
}
$output = ['language' => $lang, 'translations' => $translations];
file_put_contents($name, json_encode($output, JSON_UNESCAPED_UNICODE), LOCK_EX);
flock($lock, LOCK_UN); fclose($lock); result($output);
