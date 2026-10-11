<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('X-Content-Type-Options: nosniff');
if (empty($_SESSION['lv_demo_ok'])) { http_response_code(401); echo json_encode(['message'=>'Accès privé requis.']); exit; }
if (empty($_SESSION['lv_meta_action_csrf'])) $_SESSION['lv_meta_action_csrf'] = bin2hex(random_bytes(24));
function answer(int $code, array $value): never {
    http_response_code($code);
    echo json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
$config = ['page_id'=>'160182247439170', 'instagram_id'=>'17841416623964515', 'api_version'=>'v26.0', 'page_access_token'=>''];
$private = dirname(__DIR__).'/private/le-village-meta.php';
if (is_file($private)) { $settings = require $private; if (is_array($settings)) $config = array_merge($config, $settings); }
$token = trim((string)$config['page_access_token']);
if ($token === '') answer(503, ['message'=>'Reconnectez Meta depuis le back-office.']);
function graph(string $path, array $params=[], string $method='GET'): array {
    global $config, $token;
    if (!preg_match('~^[A-Za-z0-9_]+(?:/[a-z_]+)?$~', $path) || !function_exists('curl_init')) return ['error'=>'Requête Meta indisponible.'];
    $url = 'https://graph.facebook.com/'.$config['api_version'].'/'.$path;
    if ($method === 'GET') $url .= '?'.http_build_query($params, '', '&', PHP_QUERY_RFC3986);
    $curl = curl_init($url);
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER=>true, CURLOPT_CONNECTTIMEOUT=>5, CURLOPT_TIMEOUT=>18,
        CURLOPT_FOLLOWLOCATION=>false, CURLOPT_PROTOCOLS=>CURLPROTO_HTTPS,
        CURLOPT_HTTPHEADER=>['Accept: application/json', 'Authorization: Bearer '.$token]]);
    if ($method === 'POST') { curl_setopt($curl, CURLOPT_POST, true); curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($params, '', '&', PHP_QUERY_RFC3986)); }
    $raw = curl_exec($curl); $code=(int)curl_getinfo($curl, CURLINFO_HTTP_CODE); curl_close($curl);
    $data=is_string($raw) && strlen($raw)<2000000 ? json_decode($raw, true) : null;
    if ($code<200 || $code>=300 || !is_array($data)) return ['error'=>'Meta a refusé cette opération (HTTP '.($code ?: 503).'). Vérifiez les droits de l’application et du jeton.'];
    return $data;
}
function rows(array $response): array { return array_values(array_filter((array)($response['data'] ?? []), 'is_array')); }
function clean(string $s, int $max=5000): string { $s=trim($s); return function_exists('mb_substr') ? mb_substr($s,0,$max) : substr($s,0,$max); }
$mode=(string)($_GET['mode'] ?? '');
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
    if ($mode === 'comments') {
        $out=[]; $status=[];
        foreach (['facebook','instagram'] as $network) {
            $source=$network==='facebook' ? graph($config['page_id'].'/posts',['fields'=>'id,message,created_time,permalink_url','limit'=>12]) : graph($config['instagram_id'].'/media',['fields'=>'id,caption,timestamp,permalink,media_type','limit'=>12]);
            if (isset($source['error'])) { $status[$network]=$source['error']; continue; }
            foreach (rows($source) as $post) {
                $id=(string)($post['id'] ?? ''); if (!preg_match('/^\d+(?:_\d+)?$/',$id)) continue;
                $commentFields=$network==='facebook' ? 'id,message,from,created_time' : 'id,text,username,timestamp';
                $comments=graph($id.'/comments',['fields'=>$commentFields,'limit'=>25]);
                if (isset($comments['error'])) { $status[$network]=$comments['error']; continue; }
                foreach (rows($comments) as $comment) $out[]=['network'=>$network,'post_id'=>$id,
                    'post_text'=>clean((string)($post['message'] ?? $post['caption'] ?? ''),120),
                    'post_url'=>(string)($post['permalink_url'] ?? $post['permalink'] ?? ''),
                    'id'=>(string)($comment['id'] ?? ''),'author'=>(string)($comment['username'] ?? $comment['from']['name'] ?? 'Compte Meta'),
                    'text'=>clean((string)($comment['text'] ?? $comment['message'] ?? '')),
                    'date'=>(string)($comment['timestamp'] ?? $comment['created_time'] ?? '')];
            }
            $status[$network]=$status[$network] ?? 'ok';
        }
        usort($out, static fn($a,$b)=>strcmp($b['date'],$a['date']));
        answer(200,['items'=>array_slice($out,0,100),'status'=>$status,'csrf'=>$_SESSION['lv_meta_action_csrf']]);
    }
    if ($mode === 'inbox') {
        $out=[]; $status=[];
        foreach (['messenger','instagram'] as $network) {
            $account=$network==='instagram' ? $config['instagram_id'] : $config['page_id'];
            $response=graph($account.'/conversations',['platform'=>$network,'fields'=>'id,updated_time,participants,messages.limit(3){id,message,from,created_time}','limit'=>20]);
            if (isset($response['error'])) { $status[$network]=$response['error']; continue; }
            foreach (rows($response) as $thread) {
                $participants=rows((array)($thread['participants'] ?? []));
                $other=''; $person='Contact';
                foreach ($participants as $p) if ((string)($p['id'] ?? '') !== (string)$account) { $other=(string)($p['id'] ?? ''); $person=(string)($p['name'] ?? $p['username'] ?? 'Contact'); break; }
                $messages=rows((array)($thread['messages'] ?? []));
                $out[]=['network'=>$network,'id'=>(string)($thread['id'] ?? ''),'person'=>$person,'recipient'=>$other,
                    'updated'=>(string)($thread['updated_time'] ?? ''),
                    'messages'=>array_map(static fn($v)=>['id'=>(string)($v['id'] ?? ''),'text'=>clean((string)($v['message'] ?? '')),
                        'date'=>(string)($v['created_time'] ?? ''),'from'=>(string)($v['from']['name'] ?? '')], $messages)];
            }
            $status[$network]='ok';
        }
        usort($out,static fn($a,$b)=>strcmp($b['updated'],$a['updated']));
        answer(200,['items'=>$out,'status'=>$status,'csrf'=>$_SESSION['lv_meta_action_csrf']]);
    }
    answer(400,['message'=>'Vue inconnue.']);
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') answer(405,['message'=>'Méthode non autorisée.']);
$raw=file_get_contents('php://input'); if (!is_string($raw) || strlen($raw)>12000) answer(413,['message'=>'Contenu trop long.']);
$input=json_decode($raw,true);
if (!is_array($input) || !hash_equals($_SESSION['lv_meta_action_csrf'],(string)($input['csrf'] ?? ''))) answer(403,['message'=>'Session expirée. Rechargez la page.']);
$message=clean((string)($input['message'] ?? ''));
if ($message==='' || strlen($message)>5000) answer(422,['message'=>'Saisissez un texte de 1 à 5 000 caractères.']);
$action=(string)($input['action'] ?? ''); $id=(string)($input['id'] ?? '');
if ($action==='reply_comment' && preg_match('/^\d+(?:_\d+)?$/',$id)) {
    $network=(string)($input['network'] ?? '');
    if (!in_array($network,['facebook','instagram'],true)) answer(422,['message'=>'Réseau inconnu.']);
    $result=graph($id.($network==='instagram'?'/replies':'/comments'),['message'=>$message],'POST');
    if (isset($result['error'])) answer(502,['message'=>$result['error']]);
    answer(200,['message'=>'Réponse envoyée.','id'=>(string)($result['id'] ?? '')]);
}
if ($action==='reply_message' && preg_match('/^[A-Za-z0-9_]{1,120}$/',$id)) {
    $network=(string)($input['network'] ?? '');
    if (!in_array($network,['messenger','instagram'],true)) answer(422,['message'=>'Réseau inconnu.']);
    $thread=graph($id,['fields'=>'id,participants']);
    if (isset($thread['error'])) answer(502,['message'=>$thread['error']]);
    $recipient='';
    $account=$network==='instagram' ? $config['instagram_id'] : $config['page_id'];
    foreach (rows((array)($thread['participants'] ?? [])) as $p) if ((string)($p['id'] ?? '') !== (string)$account) { $recipient=(string)($p['id'] ?? ''); break; }
    if (!preg_match('/^\d+$/',$recipient)) answer(422,['message'=>'Destinataire introuvable.']);
    $result=graph($account.'/messages',['recipient'=>json_encode(['id'=>$recipient]),'messaging_type'=>'RESPONSE','message'=>json_encode(['text'=>$message])],'POST');
    if (isset($result['error'])) answer(502,['message'=>$result['error']]);
    answer(200,['message'=>'Message envoyé.']);
}
answer(422,['message'=>'Action inconnue.']);
