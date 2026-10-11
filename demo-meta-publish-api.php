<?php
declare(strict_types=1);
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('X-Content-Type-Options: nosniff');
function respond(int $code,array $data): never { http_response_code($code); echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_INVALID_UTF8_SUBSTITUTE); exit; }
if (empty($_SESSION['lv_demo_ok'])) respond(401,['message'=>'Accès privé requis.']);
if (($_SERVER['REQUEST_METHOD'] ?? '')!=='POST') respond(405,['message'=>'Méthode non autorisée.']);
$raw=file_get_contents('php://input');
if (!is_string($raw) || strlen($raw)>3000) respond(413,['message'=>'Requête trop longue.']);
$input=json_decode($raw,true);
if (!is_array($input) || empty($_SESSION['lv_editorial_csrf']) || !hash_equals($_SESSION['lv_editorial_csrf'],(string)($input['csrf'] ?? ''))) respond(403,['message'=>'Session expirée. Rechargez le calendrier.']);
$id=(string)($input['id'] ?? ''); if (!preg_match('/^[a-f0-9]{24}$/',$id)) respond(422,['message'=>'Contenu introuvable.']);
$file=dirname(__DIR__).'/private/le-village-editorial.json';
$handle=@fopen($file,'c+'); if (!$handle || !flock($handle,LOCK_EX)) respond(503,['message'=>'Calendrier indisponible.']);
function saveItems($handle,array $items): void {
    $json=json_encode(array_values($items),JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_INVALID_UTF8_SUBSTITUTE);
    if ($json===false) throw new RuntimeException('Enregistrement impossible.');
    rewind($handle); if (!ftruncate($handle,0) || fwrite($handle,$json)===false) throw new RuntimeException('Enregistrement impossible.'); fflush($handle);
}
$items=json_decode((string)stream_get_contents($handle),true);if (!is_array($items)) $items=[];
$position=null;foreach ($items as $key=>$entry) if (($entry['id'] ?? '')===$id) { $position=$key;break; }
if ($position===null) { flock($handle,LOCK_UN);fclose($handle);respond(404,['message'=>'Contenu introuvable.']); }
$item=$items[$position];
if (($item['status'] ?? '')==='publishing' || ($item['status'] ?? '')==='published') { flock($handle,LOCK_UN);fclose($handle);respond(409,['message'=>'Ce contenu est déjà en cours de publication ou publié.']); }
$networks=array_values(array_intersect((array)($item['networks'] ?? []),['facebook','instagram']));
$published=(array)($item['published'] ?? []);
$pending=array_values(array_diff($networks,array_keys($published)));
if (!$pending) { flock($handle,LOCK_UN);fclose($handle);respond(409,['message'=>'Déjà publié sur tous les réseaux.']); }
$item['status']='publishing';$items[$position]=$item;
try { saveItems($handle,$items); } catch (Throwable $e) { flock($handle,LOCK_UN);fclose($handle);respond(503,['message'=>$e->getMessage()]); }
flock($handle,LOCK_UN);fclose($handle);
$config=['page_id'=>'160182247439170','instagram_id'=>'17841416623964515','api_version'=>'v26.0','page_access_token'=>''];
$private=dirname(__DIR__).'/private/le-village-meta.php';
if (is_file($private)) { $settings=require $private;if(is_array($settings))$config=array_merge($config,$settings); }
$token=trim((string)$config['page_access_token']);
function graph(string $path,array $fields=[],string $method='POST'): array {
    global $config,$token;
    if (!$token || !preg_match('~^\d+(?:/[a-z_]+)?$~',$path) || !function_exists('curl_init')) return ['error'=>'Connexion Meta indisponible.'];
    $url='https://graph.facebook.com/'.$config['api_version'].'/'.$path;
    if ($method==='GET')$url.='?'.http_build_query($fields,'','&',PHP_QUERY_RFC3986);
    $curl=curl_init($url);curl_setopt_array($curl,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_CONNECTTIMEOUT=>5,CURLOPT_TIMEOUT=>20,CURLOPT_FOLLOWLOCATION=>false,CURLOPT_PROTOCOLS=>CURLPROTO_HTTPS,CURLOPT_HTTPHEADER=>['Accept: application/json','Authorization: Bearer '.$token]]);
    if ($method==='POST'){curl_setopt($curl,CURLOPT_POST,true);curl_setopt($curl,CURLOPT_POSTFIELDS,http_build_query($fields,'','&',PHP_QUERY_RFC3986));}
    $raw=curl_exec($curl);$code=(int)curl_getinfo($curl,CURLINFO_HTTP_CODE);curl_close($curl);
    $data=is_string($raw) && strlen($raw)<1000000 ? json_decode($raw,true) : null;
    if($code<200||$code>=300||!is_array($data))return ['error'=>'Meta a refusé la publication (HTTP '.($code ?: 503).', code '.(int)($data['error']['code'] ?? 0).').'];
    return $data;
}
$caption=trim((string)($item['caption'] ?? ''));
$media=trim((string)($item['media'] ?? ''));
$format=(string)($item['format'] ?? 'Publication');
$errors=[];
foreach ($pending as $network) {
    if ($network==='facebook') {
        if ($format!=='Publication') { $errors[$network]='Ce format Facebook nécessite un flux de publication spécifique. Utilisez une publication classique.';continue; }
        if ($media==='')$result=graph($config['page_id'].'/feed',['message'=>$caption]);
        else $result=graph($config['page_id'].'/photos',['url'=>$media,'caption'=>$caption]);
        if (isset($result['error']))$errors[$network]=$result['error'];else $published[$network]=(string)($result['post_id'] ?? $result['id'] ?? '');
        continue;
    }
    if ($media==='' || !filter_var($media,FILTER_VALIDATE_URL) || parse_url($media,PHP_URL_SCHEME)!=='https') { $errors[$network]='Instagram exige une URL HTTPS publique du média.';continue; }
    $isVideo=(bool)preg_match('~\.(mp4|mov)(?:\?|$)~i',$media);
    $fields=['caption'=>$caption];
    if ($format==='Reel') { if (!$isVideo) { $errors[$network]='Un Reel nécessite une vidéo MP4 ou MOV.';continue; }$fields+=['media_type'=>'REELS','video_url'=>$media]; }
    elseif ($format==='Story')$fields+=['media_type'=>'STORIES',($isVideo?'video_url':'image_url')=>$media];
    else {if ($isVideo)$fields+=['media_type'=>'VIDEO','video_url'=>$media];else $fields+=['image_url'=>$media];}
    $container=graph($config['instagram_id'].'/media',$fields);
    if (isset($container['error']) || empty($container['id'])) { $errors[$network]=$container['error'] ?? 'Meta n’a pas créé le média.';continue; }
    $containerId=(string)$container['id'];
    if ($isVideo) {for($attempt=0;$attempt<6;$attempt++){sleep(2);$check=graph($containerId,['fields'=>'status_code'],'GET');if(($check['status_code'] ?? '')==='FINISHED')break;if(in_array(($check['status_code'] ?? ''),['ERROR','EXPIRED'],true))break;}}
    $result=graph($config['instagram_id'].'/media_publish',['creation_id'=>$containerId]);
    if (isset($result['error']))$errors[$network]=$result['error'];else $published[$network]=(string)($result['id'] ?? '');
}
$handle=@fopen($file,'c+');if (!$handle || !flock($handle,LOCK_EX)) respond(503,['message'=>'Publication envoyée à Meta, mais suivi du calendrier indisponible.']);
$items=json_decode((string)stream_get_contents($handle),true);if(!is_array($items))$items=[];
foreach($items as &$entry)if(($entry['id'] ?? '')===$id){$entry['published']=$published;$entry['errors']=$errors;$entry['status']=count($published)===count($networks)?'published':(count($published)?'partial':'planned');$entry['published_at']=gmdate('c');break;}unset($entry);
try{saveItems($handle,$items);}catch(Throwable $e){flock($handle,LOCK_UN);fclose($handle);respond(503,['message'=>'Meta a répondu, mais le calendrier n’a pas pu être mis à jour.']);}
flock($handle,LOCK_UN);fclose($handle);
respond($errors?207:200,['message'=>$errors?'Publication partielle ou refusée par Meta.':'Publication effectuée.','published'=>$published,'errors'=>$errors]);
