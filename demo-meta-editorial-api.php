<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('X-Content-Type-Options: nosniff');

function reply(int $status, array $data): never {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
if (empty($_SESSION['lv_demo_ok'])) reply(401, ['message' => 'Accès privé requis.']);
if (empty($_SESSION['lv_editorial_csrf'])) $_SESSION['lv_editorial_csrf'] = bin2hex(random_bytes(24));

$directory = dirname(__DIR__).'/private';
$file = $directory.'/le-village-editorial.json';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'GET') {
    $items = is_file($file) ? json_decode((string)file_get_contents($file), true) : [];
    reply(200, ['items' => is_array($items) ? array_values($items) : [], 'csrf' => $_SESSION['lv_editorial_csrf']]);
}
if ($method !== 'POST') {
    header('Allow: GET, POST');
    reply(405, ['message' => 'Méthode non autorisée.']);
}
$raw = file_get_contents('php://input');
if (!is_string($raw) || strlen($raw) > 20000) reply(413, ['message' => 'Contenu trop long.']);
$input = json_decode($raw, true);
if (!is_array($input) || !hash_equals($_SESSION['lv_editorial_csrf'], (string)($input['csrf'] ?? ''))) {
    reply(403, ['message' => 'Session expirée. Rechargez la page.']);
}
if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
    reply(503, ['message' => 'Enregistrement indisponible.']);
}
$handle = fopen($file, 'c+');
if ($handle === false || !flock($handle, LOCK_EX)) reply(503, ['message' => 'Enregistrement indisponible.']);
rewind($handle);
$existing = stream_get_contents($handle);
$items = is_string($existing) && $existing !== '' ? json_decode($existing, true) : [];
if (!is_array($items)) $items = [];
$action = (string)($input['action'] ?? '');
$id = (string)($input['id'] ?? '');
if ($action === 'delete') {
    foreach ($items as $previous) if (($previous['id'] ?? '') === $id && in_array(($previous['status'] ?? ''), ['published','publishing','scheduled'], true)) {
        flock($handle, LOCK_UN); fclose($handle);
        reply(409, ['message' => 'Ce contenu est publié ou en cours. Il ne peut pas être supprimé du suivi.']);
    }
    $items = array_values(array_filter($items, static fn($item) => ($item['id'] ?? '') !== $id));
} elseif ($action === 'save') {
    $title = trim((string)($input['title'] ?? ''));
    $caption = trim((string)($input['caption'] ?? ''));
    $date = (string)($input['date'] ?? '');
    $format = (string)($input['format'] ?? 'Publication');
    $networks = array_values(array_intersect((array)($input['networks'] ?? []), ['facebook', 'instagram']));
    $media = trim((string)($input['media'] ?? ''));
    $validDate = DateTimeImmutable::createFromFormat('!Y-m-d\TH:i', $date, new DateTimeZone('Europe/Paris'));
    if ($title === '' || strlen($title) > 140 || strlen($caption) > 5000 || !$validDate || $validDate->format('Y-m-d\TH:i') !== $date ||
        !in_array($format, ['Publication', 'Reel', 'Story'], true) || !$networks ||
        ($media !== '' && (!filter_var($media, FILTER_VALIDATE_URL) || parse_url($media, PHP_URL_SCHEME) !== 'https'))) {
        flock($handle, LOCK_UN); fclose($handle);
        reply(422, ['message' => 'Vérifiez la date, les réseaux et les champs du contenu.']);
    }
    if ($id === '') $id = bin2hex(random_bytes(12));
    $item = ['id' => $id, 'title' => $title, 'caption' => $caption, 'date' => $date,
        'format' => $format, 'networks' => $networks, 'media' => $media, 'status' => 'planned'];
    $found = false;
    foreach ($items as $index => $previous) {
        if (($previous['id'] ?? '') !== $id) continue;
        if (in_array(($previous['status'] ?? ''), ['published','publishing','scheduled'], true)) {
            flock($handle, LOCK_UN); fclose($handle);
            reply(409, ['message' => 'Un contenu publié ne peut pas être modifié ici.']);
        }
        $items[$index] = array_merge($previous, $item);
        if (!empty($previous['published'])) $items[$index]['status'] = 'partial';
        $found = true;
        break;
    }
    if (!$found) $items[] = $item;
} else {
    flock($handle, LOCK_UN); fclose($handle);
    reply(422, ['message' => 'Action inconnue.']);
}
usort($items, static fn($a, $b) => strcmp((string)($a['date'] ?? ''), (string)($b['date'] ?? '')));
$json = json_encode(array_values($items), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
rewind($handle);
if ($json === false || !ftruncate($handle, 0) || fwrite($handle, $json) === false) {
    flock($handle, LOCK_UN); fclose($handle);
    reply(503, ['message' => 'Enregistrement impossible.']);
}
fflush($handle);
flock($handle, LOCK_UN);
fclose($handle);
@chmod($file, 0600);
reply(200, ['items' => array_values($items), 'csrf' => $_SESSION['lv_editorial_csrf']]);
